"""
test_pipeline.py
----------------
Pytest test suite for the cleaning and transformation steps of pipeline.py.

Test structure
  TestClean*  – unit tests for each cleaning helper individually
  TestTransform* – unit tests for the transform step
  TestAggregate  – smoke tests for aggregate output shapes / values
  TestEndToEnd   – runs the full pipeline on a tiny fixture and checks outputs
"""

import json
from pathlib import Path
from io import StringIO

import pandas as pd
import pytest

# Import the functions we want to test
from pipeline import (
    _coerce_numerics,
    _fill_missing,
    _remove_duplicate_order_ids,
    _validate_dates,
    clean,
    transform,
    aggregate,
)


# ─── Shared fixtures ────────────────────────────────────────────────────────

@pytest.fixture
def raw_df():
    """Minimal raw DataFrame that mimics what load() returns (all strings)."""
    data = {
        "order_id":     ["ORD-001", "ORD-002", "ORD-003", "ORD-001"],  # ORD-001 duplicated
        "customer_id":  ["CUST-1", "CUST-2", "CUST-3", "CUST-1"],
        "customer_name": ["Alice Smith", "", "Carol White", "Alice Smith"],
        "product":      ["Laptop Pro", "Wireless Mouse", "USB-C Hub", "Laptop Pro"],
        "category":     ["electronics", "OFFICE SUPPLIES", "", "electronics"],
        "quantity":     ["2", "5", "", "2"],
        "unit_price":   ["1299.99", "29.99", "49.99", "1299.99"],
        "discount_pct": ["10", "not-a-number", "5", "10"],
        "order_date":   ["2023-03-15", "2023-06-01", "bad-date", "2023-03-15"],
        "region":       ["North", "South", "", "North"],
        "sales_rep":    ["Alice Johnson", "Bob Martinez", "Carol White", "Alice Johnson"],
    }
    return pd.DataFrame(data)


@pytest.fixture
def clean_df(raw_df):
    """A fully cleaned DataFrame derived from raw_df."""
    return clean(raw_df.copy())


@pytest.fixture
def transformed_df(clean_df):
    """A transformed DataFrame derived from the clean_df fixture."""
    return transform(clean_df.copy())


# ─── Clean: coerce numerics ──────────────────────────────────────────────────

class TestCoerceNumerics:
    def test_valid_numbers_converted(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        assert df.loc[0, "quantity"] == 2.0
        assert df.loc[0, "unit_price"] == 1299.99

    def test_non_numeric_becomes_nan(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        assert pd.isna(df.loc[1, "discount_pct"])  # "not-a-number" → NaN

    def test_empty_string_becomes_nan(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        assert pd.isna(df.loc[2, "quantity"])  # "" → NaN

    def test_all_numeric_cols_are_float(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        for col in ["quantity", "unit_price", "discount_pct"]:
            assert pd.api.types.is_float_dtype(df[col]), f"{col} should be float"


# ─── Clean: fill missing ─────────────────────────────────────────────────────

class TestFillMissing:
    def test_numeric_nan_filled_with_zero(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        df = _fill_missing(df)
        assert df.loc[2, "quantity"] == 0
        assert df.loc[1, "discount_pct"] == 0

    def test_string_empty_filled_with_unknown(self, raw_df):
        df = _coerce_numerics(raw_df.copy())
        df = _fill_missing(df)
        assert df.loc[1, "customer_name"] == "Unknown"
        assert df.loc[2, "category"] == "Unknown"
        assert df.loc[2, "region"] == "Unknown"

    def test_no_remaining_nulls_in_target_cols(self, raw_df):
        from pipeline import NUMERIC_COLS, STRING_COLS
        df = _coerce_numerics(raw_df.copy())
        df = _fill_missing(df)
        for col in NUMERIC_COLS + STRING_COLS:
            assert df[col].isna().sum() == 0, f"Nulls remain in {col}"


# ─── Clean: duplicate removal ────────────────────────────────────────────────

class TestRemoveDuplicateOrderIds:
    def test_duplicate_rows_removed(self, raw_df):
        df = _remove_duplicate_order_ids(raw_df.copy())
        assert df["order_id"].duplicated().sum() == 0

    def test_correct_row_count_after_dedup(self, raw_df):
        # raw_df has 4 rows, 1 duplicate → 3 unique
        df = _remove_duplicate_order_ids(raw_df.copy())
        assert len(df) == 3

    def test_first_occurrence_kept(self, raw_df):
        df = _remove_duplicate_order_ids(raw_df.copy())
        # ORD-001 appears at index 0 and 3; index 0 (customer CUST-1) should survive
        dup_row = df[df["order_id"] == "ORD-001"]
        assert len(dup_row) == 1
        assert dup_row.iloc[0]["customer_id"] == "CUST-1"

    def test_no_duplicate_order_ids_in_output(self):
        df = pd.DataFrame({
            "order_id": ["A", "B", "A", "C", "B"],
            "value": [1, 2, 3, 4, 5],
        })
        result = _remove_duplicate_order_ids(df)
        assert list(result["order_id"]) == ["A", "B", "C"]


# ─── Clean: date validation ──────────────────────────────────────────────────

class TestValidateDates:
    def test_bad_date_row_dropped(self, raw_df):
        # raw_df row 2 has "bad-date"; after dedup it's still there
        df = _validate_dates(raw_df.copy())
        assert "bad-date" not in df["order_date"].astype(str).values

    def test_order_date_is_datetime(self, raw_df):
        df = _validate_dates(raw_df.copy())
        assert pd.api.types.is_datetime64_any_dtype(df["order_date"])

    def test_valid_dates_preserved(self, raw_df):
        df = _validate_dates(raw_df.copy())
        valid_dates = df["order_date"].dropna()
        # 2023-03-15 and 2023-06-01 should survive
        dates_str = [d.date().isoformat() for d in valid_dates]
        assert "2023-03-15" in dates_str
        assert "2023-06-01" in dates_str

    def test_all_nat_rows_dropped(self):
        df = pd.DataFrame({
            "order_id": ["X", "Y", "Z"],
            "order_date": ["2023-01-01", "garbage", "also-bad"],
        })
        result = _validate_dates(df)
        assert len(result) == 1
        assert result.iloc[0]["order_id"] == "X"


# ─── Clean: full clean pipeline ──────────────────────────────────────────────

class TestCleanIntegration:
    def test_clean_reduces_rows(self, raw_df):
        result = clean(raw_df.copy())
        # raw=4, dup removed=1, bad date=1 → should be ≤ 3
        assert len(result) <= 3

    def test_clean_resets_index(self, raw_df):
        result = clean(raw_df.copy())
        assert list(result.index) == list(range(len(result)))

    def test_clean_output_has_all_columns(self, raw_df):
        result = clean(raw_df.copy())
        for col in raw_df.columns:
            assert col in result.columns


# ─── Transform ───────────────────────────────────────────────────────────────

class TestTransform:
    def test_total_revenue_column_added(self, transformed_df):
        assert "total_revenue" in transformed_df.columns

    def test_month_column_added(self, transformed_df):
        assert "month" in transformed_df.columns

    def test_total_revenue_formula(self, clean_df):
        """total_revenue = quantity * unit_price * (1 - discount_pct/100)"""
        df = transform(clean_df.copy())
        for _, row in df.iterrows():
            expected = round(
                float(row["quantity"])
                * float(row["unit_price"])
                * (1 - float(row["discount_pct"]) / 100),
                2,
            )
            assert abs(row["total_revenue"] - expected) < 0.01, (
                f"Revenue mismatch on order {row['order_id']}: "
                f"got {row['total_revenue']}, expected {expected}"
            )

    def test_total_revenue_non_negative(self, transformed_df):
        assert (transformed_df["total_revenue"] >= 0).all()

    def test_month_values_in_valid_range(self, transformed_df):
        assert transformed_df["month"].between(1, 12).all()

    def test_month_matches_order_date(self, clean_df):
        df = transform(clean_df.copy())
        for _, row in df.iterrows():
            assert row["month"] == row["order_date"].month

    def test_category_title_case(self, transformed_df):
        for cat in transformed_df["category"].unique():
            assert cat == cat.title(), f"Category not title-cased: '{cat}'"

    def test_category_title_case_normalises_lower(self):
        """'electronics' → 'Electronics' after transform."""
        df = pd.DataFrame({
            "order_id": ["X"],
            "customer_id": ["C1"],
            "customer_name": ["Test User"],
            "product": ["Laptop Pro"],
            "category": ["electronics"],
            "quantity": [1.0],
            "unit_price": [100.0],
            "discount_pct": [10.0],
            "order_date": pd.to_datetime(["2023-05-01"]),
            "region": ["North"],
            "sales_rep": ["Alice"],
        })
        result = transform(df)
        assert result.loc[0, "category"] == "Electronics"

    def test_category_title_case_normalises_upper(self):
        """'OFFICE SUPPLIES' → 'Office Supplies' after transform."""
        df = pd.DataFrame({
            "order_id": ["Y"],
            "customer_id": ["C2"],
            "customer_name": ["Test User"],
            "product": ["Stapler"],
            "category": ["OFFICE SUPPLIES"],
            "quantity": [3.0],
            "unit_price": [14.99],
            "discount_pct": [0.0],
            "order_date": pd.to_datetime(["2023-07-15"]),
            "region": ["South"],
            "sales_rep": ["Bob"],
        })
        result = transform(df)
        assert result.loc[0, "category"] == "Office Supplies"

    def test_discount_zero_gives_full_price(self):
        df = pd.DataFrame({
            "order_id": ["Z"],
            "customer_id": ["C3"],
            "customer_name": ["Test"],
            "product": ["Stapler"],
            "category": ["Office Supplies"],
            "quantity": [2.0],
            "unit_price": [50.0],
            "discount_pct": [0.0],
            "order_date": pd.to_datetime(["2023-01-01"]),
            "region": ["East"],
            "sales_rep": ["Carol"],
        })
        result = transform(df)
        assert result.loc[0, "total_revenue"] == 100.0

    def test_full_discount_gives_zero_revenue(self):
        df = pd.DataFrame({
            "order_id": ["W"],
            "customer_id": ["C4"],
            "customer_name": ["Test"],
            "product": ["Stapler"],
            "category": ["Office Supplies"],
            "quantity": [5.0],
            "unit_price": [20.0],
            "discount_pct": [100.0],
            "order_date": pd.to_datetime(["2023-02-01"]),
            "region": ["West"],
            "sales_rep": ["Dave"],
        })
        result = transform(df)
        assert result.loc[0, "total_revenue"] == 0.0


# ─── Aggregate ───────────────────────────────────────────────────────────────

class TestAggregate:
    def test_returns_three_keys(self, transformed_df):
        aggs = aggregate(transformed_df)
        assert set(aggs.keys()) == {"monthly_revenue", "top_products", "rep_performance"}

    def test_monthly_revenue_has_month_column(self, transformed_df):
        aggs = aggregate(transformed_df)
        assert "month" in aggs["monthly_revenue"].columns

    def test_top_products_at_most_10_rows(self, transformed_df):
        aggs = aggregate(transformed_df)
        assert len(aggs["top_products"]) <= 10

    def test_top_products_sorted_descending(self, transformed_df):
        aggs = aggregate(transformed_df)
        revenues = aggs["top_products"]["total_revenue"].tolist()
        assert revenues == sorted(revenues, reverse=True)

    def test_rep_performance_columns(self, transformed_df):
        aggs = aggregate(transformed_df)
        expected_cols = {"sales_rep", "total_revenue", "order_count", "avg_discount_pct"}
        assert expected_cols.issubset(set(aggs["rep_performance"].columns))

    def test_rep_performance_order_count_positive(self, transformed_df):
        aggs = aggregate(transformed_df)
        assert (aggs["rep_performance"]["order_count"] > 0).all()

    def test_monthly_revenue_no_negative_values(self, transformed_df):
        aggs = aggregate(transformed_df)
        mr = aggs["monthly_revenue"].drop(columns=["month"])
        assert (mr >= 0).all().all()

    def test_top_products_total_revenue_positive(self, transformed_df):
        aggs = aggregate(transformed_df)
        assert (aggs["top_products"]["total_revenue"] >= 0).all()


# ─── End-to-end smoke test ───────────────────────────────────────────────────

class TestEndToEnd:
    """Run the full pipeline on the real generated CSV (if it exists)."""

    def test_pipeline_on_generated_data(self, tmp_path):
        """Generate → run pipeline → verify outputs exist and are non-empty."""
        import subprocess, sys

        # Generate the CSV into tmp_path
        gen_result = subprocess.run(
            [sys.executable, "generate_sales_data.py"],
            capture_output=True, text=True,
        )
        assert gen_result.returncode == 0, gen_result.stderr

        # Run the pipeline
        from pipeline import run_pipeline
        summary = run_pipeline("sales_data.csv", output_dir=str(tmp_path))

        # Verify summary fields
        assert summary["rows_in"] == 200
        assert summary["rows_after_cleaning"] > 0
        assert summary["rows_after_cleaning"] <= summary["rows_in"]
        assert summary["total_revenue"] > 0
        assert len(summary["date_range"]) == 2

        # Verify output files exist and are non-empty
        expected_files = [
            "cleaned_sales.csv",
            "monthly_revenue.csv",
            "top_products.csv",
            "rep_performance.csv",
        ]
        for fname in expected_files:
            fpath = tmp_path / fname
            assert fpath.exists(), f"{fname} not found"
            df = pd.read_csv(fpath)
            assert len(df) > 0, f"{fname} is empty"

    def test_cleaned_sales_has_required_columns(self, tmp_path):
        from pipeline import run_pipeline
        run_pipeline("sales_data.csv", output_dir=str(tmp_path))
        df = pd.read_csv(tmp_path / "cleaned_sales.csv")
        required = {
            "order_id", "customer_id", "customer_name", "product", "category",
            "quantity", "unit_price", "discount_pct", "order_date", "region",
            "sales_rep", "total_revenue", "month",
        }
        assert required.issubset(set(df.columns))

    def test_no_duplicate_order_ids_in_cleaned_output(self, tmp_path):
        from pipeline import run_pipeline
        run_pipeline("sales_data.csv", output_dir=str(tmp_path))
        df = pd.read_csv(tmp_path / "cleaned_sales.csv")
        assert df["order_id"].duplicated().sum() == 0

    def test_no_invalid_dates_in_cleaned_output(self, tmp_path):
        from pipeline import run_pipeline
        run_pipeline("sales_data.csv", output_dir=str(tmp_path))
        df = pd.read_csv(tmp_path / "cleaned_sales.csv", parse_dates=["order_date"])
        assert df["order_date"].isna().sum() == 0

    def test_total_revenue_all_non_negative(self, tmp_path):
        from pipeline import run_pipeline
        run_pipeline("sales_data.csv", output_dir=str(tmp_path))
        df = pd.read_csv(tmp_path / "cleaned_sales.csv")
        assert (df["total_revenue"] >= 0).all()
