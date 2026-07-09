"""
pipeline.py
-----------
Data transformation pipeline for the synthetic sales dataset.

Steps
  1. Load         – read sales_data.csv
  2. Clean        – fill missing values, remove duplicate order_ids,
                    drop rows with invalid order_date
  3. Transform    – add total_revenue, month, normalise category to Title Case
  4. Aggregate    – monthly revenue by region, top-10 products, sales-rep KPIs
  5. Export       – write CSVs for all aggregates + cleaned dataset
  6. Summary      – print pipeline stats to stdout
"""

import json
import sys
from pathlib import Path

import pandas as pd


# ── 1. LOAD ──────────────────────────────────────────────────────────────────

def load(path: str | Path) -> pd.DataFrame:
    """Read the raw CSV and return a DataFrame."""
    df = pd.read_csv(path, dtype=str)   # read everything as str first
    print(f"[load] {len(df)} rows read from {path}")
    return df


# ── 2. CLEAN ─────────────────────────────────────────────────────────────────

NUMERIC_COLS = ["quantity", "unit_price", "discount_pct"]
STRING_COLS  = ["customer_name", "category", "region", "sales_rep",
                "product", "customer_id"]


def _coerce_numerics(df: pd.DataFrame) -> pd.DataFrame:
    """Cast numeric columns; values that cannot be converted become NaN."""
    for col in NUMERIC_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def _fill_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Fill NaN / empty strings: 0 for numerics, 'Unknown' for strings."""
    # Empty string → NaN so fillna catches them uniformly
    df[STRING_COLS] = df[STRING_COLS].replace("", pd.NA)

    for col in NUMERIC_COLS:
        df[col] = df[col].fillna(0)

    for col in STRING_COLS:
        df[col] = df[col].fillna("Unknown")

    return df


def _remove_duplicate_order_ids(df: pd.DataFrame) -> pd.DataFrame:
    """Keep first occurrence of each order_id; drop subsequent duplicates."""
    before = len(df)
    df = df.drop_duplicates(subset="order_id", keep="first")
    dropped = before - len(df)
    if dropped:
        print(f"[clean] Removed {dropped} duplicate order_id row(s)")
    return df


def _validate_dates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse order_date with errors='coerce' → NaT for unparseable values.
    Rows with NaT are logged and dropped.
    """
    df = df.copy()
    df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
    bad = df["order_date"].isna().sum()
    if bad:
        print(f"[clean] Dropped {bad} row(s) with invalid order_date")
    df = df.dropna(subset=["order_date"])
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Run all cleaning steps and return the cleaned DataFrame."""
    rows_in = len(df)
    df = _coerce_numerics(df)
    df = _fill_missing(df)
    df = _remove_duplicate_order_ids(df)
    df = _validate_dates(df)
    df = df.reset_index(drop=True)
    print(f"[clean] {rows_in} → {len(df)} rows after cleaning")
    return df


# ── 3. TRANSFORM ─────────────────────────────────────────────────────────────

def transform(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived columns to the cleaned DataFrame."""
    # total_revenue = quantity × unit_price × (1 - discount_pct / 100)
    df["total_revenue"] = (
        df["quantity"].astype(float)
        * df["unit_price"].astype(float)
        * (1 - df["discount_pct"].astype(float) / 100)
    ).round(2)

    # month extracted from order_date (integer 1-12)
    df["month"] = df["order_date"].dt.month

    # Normalise category to Title Case
    df["category"] = df["category"].str.title()

    print(f"[transform] Added total_revenue, month; normalised category")
    return df


# ── 4. AGGREGATE ─────────────────────────────────────────────────────────────

def aggregate(df: pd.DataFrame) -> dict[str, pd.DataFrame]:
    """
    Produce three summary DataFrames:
      monthly_revenue  – pivot: rows=month, cols=region, values=total_revenue (sum)
      top_products     – top-10 products by total_revenue (descending)
      rep_performance  – per sales_rep: total_revenue, order_count, avg_discount_pct
    """
    # Monthly revenue by region (pivot table)
    monthly_revenue = df.pivot_table(
        index="month",
        columns="region",
        values="total_revenue",
        aggfunc="sum",
        fill_value=0,
    ).round(2)
    monthly_revenue.columns.name = None   # tidy up column header label
    monthly_revenue = monthly_revenue.reset_index()

    # Top 10 products by total revenue
    top_products = (
        df.groupby("product", as_index=False)["total_revenue"]
        .sum()
        .rename(columns={"total_revenue": "total_revenue"})
        .sort_values("total_revenue", ascending=False)
        .head(10)
        .reset_index(drop=True)
    )
    top_products["total_revenue"] = top_products["total_revenue"].round(2)

    # Sales rep performance
    rep_performance = (
        df.groupby("sales_rep", as_index=False)
        .agg(
            total_revenue=("total_revenue", "sum"),
            order_count=("order_id", "count"),
            avg_discount_pct=("discount_pct", "mean"),
        )
        .sort_values("total_revenue", ascending=False)
        .reset_index(drop=True)
    )
    rep_performance["total_revenue"]   = rep_performance["total_revenue"].round(2)
    rep_performance["avg_discount_pct"] = rep_performance["avg_discount_pct"].round(2)

    print("[aggregate] Built monthly_revenue, top_products, rep_performance")
    return {
        "monthly_revenue": monthly_revenue,
        "top_products":    top_products,
        "rep_performance": rep_performance,
    }


# ── 5. EXPORT ─────────────────────────────────────────────────────────────────

def export(df_clean: pd.DataFrame, aggregates: dict[str, pd.DataFrame],
           out_dir: str | Path = ".") -> None:
    """Write the cleaned dataset and all three aggregate CSVs to out_dir."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    clean_path = out / "cleaned_sales.csv"
    df_clean.to_csv(clean_path, index=False)
    print(f"[export] cleaned_sales.csv  ({len(df_clean)} rows)")

    for name, df_agg in aggregates.items():
        path = out / f"{name}.csv"
        df_agg.to_csv(path, index=False)
        print(f"[export] {name}.csv  ({len(df_agg)} rows)")


# ── 6. SUMMARY ────────────────────────────────────────────────────────────────

def print_summary(df_raw: pd.DataFrame, df_clean: pd.DataFrame,
                  aggregates: dict[str, pd.DataFrame]) -> dict:
    """Print a human-readable pipeline summary and return it as a dict."""
    total_revenue = df_clean["total_revenue"].sum()
    date_min      = df_clean["order_date"].min().date()
    date_max      = df_clean["order_date"].max().date()

    summary = {
        "rows_in":            len(df_raw),
        "rows_after_cleaning": len(df_clean),
        "rows_dropped":       len(df_raw) - len(df_clean),
        "total_revenue":      round(float(total_revenue), 2),
        "date_range":         [str(date_min), str(date_max)],
        "unique_products":    int(df_clean["product"].nunique()),
        "unique_customers":   int(df_clean["customer_id"].nunique()),
        "regions":            sorted(df_clean["region"].unique().tolist()),
    }

    bar = "=" * 56
    print(f"\n{bar}")
    print("  PIPELINE SUMMARY")
    print(bar)
    print(f"  Rows in              : {summary['rows_in']}")
    print(f"  Rows after cleaning  : {summary['rows_after_cleaning']}")
    print(f"  Rows dropped         : {summary['rows_dropped']}")
    print(f"  Total revenue        : ${summary['total_revenue']:,.2f}")
    print(f"  Date range           : {summary['date_range'][0]}  →  {summary['date_range'][1]}")
    print(f"  Unique products      : {summary['unique_products']}")
    print(f"  Unique customers     : {summary['unique_customers']}")
    print(f"  Regions              : {', '.join(summary['regions'])}")
    print(bar)

    # Top-3 products teaser
    tp = aggregates["top_products"].head(3)
    print("\n  Top 3 products by revenue:")
    for _, row in tp.iterrows():
        print(f"    {row['product']:<30}  ${row['total_revenue']:>10,.2f}")

    # Top-3 reps teaser
    rp = aggregates["rep_performance"].head(3)
    print("\n  Top 3 sales reps:")
    for _, row in rp.iterrows():
        print(f"    {row['sales_rep']:<20}  ${row['total_revenue']:>10,.2f}  "
              f"({int(row['order_count'])} orders, "
              f"{row['avg_discount_pct']:.1f}% avg discount)")
    print(bar + "\n")

    # Persist summary as JSON alongside the CSVs
    with open("pipeline_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    return summary


# ── MAIN ──────────────────────────────────────────────────────────────────────

def run_pipeline(input_path: str = "sales_data.csv",
                 output_dir: str = ".") -> dict:
    """Execute the full pipeline end-to-end."""
    df_raw   = load(input_path)
    df_clean = clean(df_raw.copy())
    df_trans = transform(df_clean.copy())
    aggs     = aggregate(df_trans)
    export(df_trans, aggs, out_dir=output_dir)
    summary  = print_summary(df_raw, df_trans, aggs)
    return summary


if __name__ == "__main__":
    csv_input  = sys.argv[1] if len(sys.argv) > 1 else "sales_data.csv"
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "."
    run_pipeline(csv_input, output_dir)
