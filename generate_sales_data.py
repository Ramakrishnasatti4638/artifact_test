"""
generate_sales_data.py
----------------------
Generates a synthetic sales dataset with 200 rows and saves it to sales_data.csv.

Intentionally injects:
  - ~5 % missing values across numeric and string columns
  - ~3 duplicate order_ids (to test deduplication)
  - 1 malformed order_date (to test date validation)
"""

import csv
import random
import json
from datetime import date, timedelta

SEED = 42
random.seed(SEED)

# ── Reference data ──────────────────────────────────────────────────────────
PRODUCTS = {
    "Electronics": ["Laptop Pro", "Wireless Mouse", "USB-C Hub", "4K Monitor", "Mechanical Keyboard"],
    "Office Supplies": ["Sticky Notes", "Ballpoint Pens", "Stapler", "Binder Clips", "Whiteboard Markers"],
    "Furniture": ["Ergonomic Chair", "Standing Desk", "Monitor Stand", "Filing Cabinet", "Bookshelf"],
    "Software": ["CRM Suite", "Analytics Platform", "Project Manager", "Cloud Storage", "Security Suite"],
    "Peripherals": ["Webcam HD", "Noise-Cancel Headset", "Numeric Keypad", "USB Hub", "Docking Station"],
}

REGIONS = ["North", "South", "East", "West", "Central"]

SALES_REPS = [
    "Alice Johnson", "Bob Martinez", "Carol White", "David Kim",
    "Eva Patel", "Frank Chen", "Grace O'Brien", "Henry Brooks",
    "Isla Reed", "James Walker",
]

FIRST_NAMES = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia",
               "Lucas", "Mia", "Mason", "Isabella", "Logan", "Charlotte", "Ethan"]
LAST_NAMES  = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson",
               "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"]

START_DATE = date(2023, 1, 1)
END_DATE   = date(2023, 12, 31)

UNIT_PRICES = {
    "Laptop Pro": 1299.99, "Wireless Mouse": 29.99, "USB-C Hub": 49.99,
    "4K Monitor": 549.99, "Mechanical Keyboard": 89.99,
    "Sticky Notes": 4.99, "Ballpoint Pens": 7.99, "Stapler": 14.99,
    "Binder Clips": 3.49, "Whiteboard Markers": 9.99,
    "Ergonomic Chair": 449.99, "Standing Desk": 799.99, "Monitor Stand": 59.99,
    "Filing Cabinet": 199.99, "Bookshelf": 149.99,
    "CRM Suite": 299.99, "Analytics Platform": 499.99, "Project Manager": 199.99,
    "Cloud Storage": 99.99, "Security Suite": 149.99,
    "Webcam HD": 79.99, "Noise-Cancel Headset": 199.99, "Numeric Keypad": 24.99,
    "USB Hub": 34.99, "Docking Station": 149.99,
}


def random_date(start: date, end: date) -> str:
    delta = (end - start).days
    return (start + timedelta(days=random.randint(0, delta))).isoformat()


def generate_rows(n: int = 200) -> list[dict]:
    rows = []
    used_order_ids = set()

    for i in range(n):
        # order_id — occasionally reuse one to create duplicates
        if i in (50, 100, 150) and rows:
            order_id = rows[random.randint(0, len(rows) - 1)]["order_id"]
        else:
            while True:
                oid = f"ORD-{random.randint(10000, 99999)}"
                if oid not in used_order_ids:
                    used_order_ids.add(oid)
                    order_id = oid
                    break

        category = random.choice(list(PRODUCTS.keys()))
        product  = random.choice(PRODUCTS[category])

        row = {
            "order_id":     order_id,
            "customer_id":  f"CUST-{random.randint(1000, 9999)}",
            "customer_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "product":      product,
            "category":     random.choice(             # occasionally lower/upper-case noise
                [category, category.lower(), category.upper()]
            ),
            "quantity":     random.randint(1, 20),
            "unit_price":   UNIT_PRICES[product],
            "discount_pct": round(random.uniform(0, 30), 2),
            "order_date":   random_date(START_DATE, END_DATE),
            "region":       random.choice(REGIONS),
            "sales_rep":    random.choice(SALES_REPS),
        }

        # Inject ~5 % missing values
        miss_field = random.choices(
            [None, "customer_name", "category", "quantity", "discount_pct", "region", "sales_rep"],
            weights=[80, 3, 3, 3, 3, 3, 3],
        )[0]
        if miss_field:
            row[miss_field] = ""

        rows.append(row)

    # Inject one malformed date
    rows[75]["order_date"] = "not-a-date"

    return rows


def main():
    rows = generate_rows(200)
    fieldnames = [
        "order_id", "customer_id", "customer_name", "product", "category",
        "quantity", "unit_price", "discount_pct", "order_date", "region", "sales_rep",
    ]

    output_path = "sales_data.csv"
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Also emit a small metadata sidecar so the pipeline can read generation params
    meta = {
        "rows_generated": len(rows),
        "duplicates_injected": 3,
        "bad_dates_injected": 1,
        "missing_value_rate_approx": "~5%",
        "date_range": [START_DATE.isoformat(), END_DATE.isoformat()],
    }
    with open("sales_data_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[generator] Wrote {len(rows)} rows → {output_path}")
    print(f"[generator] Metadata → sales_data_meta.json")


if __name__ == "__main__":
    main()
