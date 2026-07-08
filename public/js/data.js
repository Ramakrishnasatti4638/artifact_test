// ─── Monthly Finance Data (Jan–Dec 2026) ───────────────────────────────────
const MONTHLY_DATA = {
  1: {
    income: 5800,
    expenses: 3920,
    weeks: {
      income:   [1400, 1450, 1500, 1450],
      expenses: [980,  1020, 960,  960]
    },
    categories: [
      { label: 'Housing',       pct: 35, color: '#6366f1' },
      { label: 'Food',          pct: 22, color: '#f59e0b' },
      { label: 'Transport',     pct: 15, color: '#10b981' },
      { label: 'Entertainment', pct: 12, color: '#ef4444' },
      { label: 'Healthcare',    pct:  8, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-01-02', desc: 'Salary Deposit',        cat: 'Income',        amt:  2900 },
      { date: '2026-01-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1372 },
      { date: '2026-01-05', desc: 'Grocery Store',         cat: 'Food',          amt:  -118 },
      { date: '2026-01-07', desc: 'Netflix Subscription',  cat: 'Entertainment', amt:   -15 },
      { date: '2026-01-10', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -42 },
      { date: '2026-01-12', desc: 'Uber Rides',            cat: 'Transport',     amt:   -58 },
      { date: '2026-01-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1400 },
      { date: '2026-01-17', desc: 'Restaurant Dinner',     cat: 'Food',          amt:   -74 },
      { date: '2026-01-20', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-01-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  2: {
    income: 5600,
    expenses: 3650,
    weeks: {
      income:   [1350, 1400, 1400, 1450],
      expenses: [920,  880,  960,  890]
    },
    categories: [
      { label: 'Housing',       pct: 35, color: '#6366f1' },
      { label: 'Food',          pct: 20, color: '#f59e0b' },
      { label: 'Transport',     pct: 14, color: '#10b981' },
      { label: 'Entertainment', pct: 14, color: '#ef4444' },
      { label: 'Healthcare',    pct:  9, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-02-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  2800 },
      { date: '2026-02-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1278 },
      { date: '2026-02-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -112 },
      { date: '2026-02-08', desc: 'Spotify + Netflix',     cat: 'Entertainment', amt:   -28 },
      { date: '2026-02-11', desc: 'Doctor Visit Copay',    cat: 'Healthcare',    amt:   -60 },
      { date: '2026-02-13', desc: 'Lyft Rides',            cat: 'Transport',     amt:   -45 },
      { date: '2026-02-14', desc: 'Valentine Dinner',      cat: 'Food',          amt:  -120 },
      { date: '2026-02-16', desc: 'Freelance Payment',     cat: 'Income',        amt:  1300 },
      { date: '2026-02-20', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-02-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  3: {
    income: 6100,
    expenses: 4050,
    weeks: {
      income:   [1500, 1550, 1550, 1500],
      expenses: [1020, 980, 1050, 1000]
    },
    categories: [
      { label: 'Housing',       pct: 34, color: '#6366f1' },
      { label: 'Food',          pct: 21, color: '#f59e0b' },
      { label: 'Transport',     pct: 16, color: '#10b981' },
      { label: 'Entertainment', pct: 11, color: '#ef4444' },
      { label: 'Healthcare',    pct:  9, color: '#3b82f6' },
      { label: 'Other',         pct:  9, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-03-02', desc: 'Salary Deposit',        cat: 'Income',        amt:  3100 },
      { date: '2026-03-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1377 },
      { date: '2026-03-05', desc: 'Grocery Store',         cat: 'Food',          amt:  -134 },
      { date: '2026-03-08', desc: 'Cinema Tickets',        cat: 'Entertainment', amt:   -36 },
      { date: '2026-03-10', desc: 'Gym Membership',        cat: 'Healthcare',    amt:   -45 },
      { date: '2026-03-14', desc: 'Gas Station',           cat: 'Transport',     amt:   -62 },
      { date: '2026-03-16', desc: 'Freelance Payment',     cat: 'Income',        amt:  1500 },
      { date: '2026-03-19', desc: 'Brunch Out',            cat: 'Food',          amt:   -55 },
      { date: '2026-03-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-03-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  4: {
    income: 5900,
    expenses: 4200,
    weeks: {
      income:   [1450, 1500, 1500, 1450],
      expenses: [1050, 1100, 1030, 1020]
    },
    categories: [
      { label: 'Housing',       pct: 35, color: '#6366f1' },
      { label: 'Food',          pct: 23, color: '#f59e0b' },
      { label: 'Transport',     pct: 14, color: '#10b981' },
      { label: 'Entertainment', pct: 13, color: '#ef4444' },
      { label: 'Healthcare',    pct:  7, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-04-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  2950 },
      { date: '2026-04-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1470 },
      { date: '2026-04-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -145 },
      { date: '2026-04-08', desc: 'Concert Tickets',       cat: 'Entertainment', amt:   -95 },
      { date: '2026-04-11', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -38 },
      { date: '2026-04-13', desc: 'Uber Rides',            cat: 'Transport',     amt:   -70 },
      { date: '2026-04-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1450 },
      { date: '2026-04-18', desc: 'Easter Dinner Out',     cat: 'Food',          amt:   -82 },
      { date: '2026-04-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-04-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  5: {
    income: 6200,
    expenses: 4100,
    weeks: {
      income:   [1550, 1600, 1550, 1500],
      expenses: [1000, 1050, 1020, 1030]
    },
    categories: [
      { label: 'Housing',       pct: 34, color: '#6366f1' },
      { label: 'Food',          pct: 22, color: '#f59e0b' },
      { label: 'Transport',     pct: 15, color: '#10b981' },
      { label: 'Entertainment', pct: 12, color: '#ef4444' },
      { label: 'Healthcare',    pct:  9, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-05-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3100 },
      { date: '2026-05-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1394 },
      { date: '2026-05-05', desc: 'Grocery Store',         cat: 'Food',          amt:  -130 },
      { date: '2026-05-08', desc: 'Streaming Services',    cat: 'Entertainment', amt:   -28 },
      { date: '2026-05-10', desc: 'Gym Membership',        cat: 'Healthcare',    amt:   -45 },
      { date: '2026-05-12', desc: 'Gas Station',           cat: 'Transport',     amt:   -60 },
      { date: '2026-05-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1600 },
      { date: '2026-05-20', desc: 'Restaurant',            cat: 'Food',          amt:   -68 },
      { date: '2026-05-23', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-05-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  6: {
    income: 6400,
    expenses: 4500,
    weeks: {
      income:   [1600, 1600, 1600, 1600],
      expenses: [1100, 1150, 1130, 1120]
    },
    categories: [
      { label: 'Housing',       pct: 33, color: '#6366f1' },
      { label: 'Food',          pct: 24, color: '#f59e0b' },
      { label: 'Transport',     pct: 16, color: '#10b981' },
      { label: 'Entertainment', pct: 14, color: '#ef4444' },
      { label: 'Healthcare',    pct:  7, color: '#3b82f6' },
      { label: 'Other',         pct:  6, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-06-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3200 },
      { date: '2026-06-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1485 },
      { date: '2026-06-05', desc: 'Grocery Store',         cat: 'Food',          amt:  -155 },
      { date: '2026-06-08', desc: 'Summer Festival',       cat: 'Entertainment', amt:  -120 },
      { date: '2026-06-10', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -32 },
      { date: '2026-06-12', desc: 'Lyft Rides',            cat: 'Transport',     amt:   -85 },
      { date: '2026-06-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1700 },
      { date: '2026-06-18', desc: 'Rooftop Bar',           cat: 'Entertainment', amt:   -65 },
      { date: '2026-06-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-06-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  7: {
    income: 6800,
    expenses: 5100,
    weeks: {
      income:   [1700, 1700, 1700, 1700],
      expenses: [1280, 1260, 1280, 1280]
    },
    categories: [
      { label: 'Housing',       pct: 32, color: '#6366f1' },
      { label: 'Food',          pct: 22, color: '#f59e0b' },
      { label: 'Transport',     pct: 18, color: '#10b981' },
      { label: 'Entertainment', pct: 16, color: '#ef4444' },
      { label: 'Healthcare',    pct:  6, color: '#3b82f6' },
      { label: 'Other',         pct:  6, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-07-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3400 },
      { date: '2026-07-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1632 },
      { date: '2026-07-04', desc: '4th July BBQ',          cat: 'Food',          amt:  -180 },
      { date: '2026-07-06', desc: 'Amusement Park',        cat: 'Entertainment', amt:  -150 },
      { date: '2026-07-09', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -28 },
      { date: '2026-07-11', desc: 'Car Rental',            cat: 'Transport',     amt:  -210 },
      { date: '2026-07-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1900 },
      { date: '2026-07-18', desc: 'Restaurant',            cat: 'Food',          amt:   -90 },
      { date: '2026-07-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-07-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  8: {
    income: 6500,
    expenses: 4800,
    weeks: {
      income:   [1620, 1630, 1620, 1630],
      expenses: [1200, 1210, 1200, 1190]
    },
    categories: [
      { label: 'Housing',       pct: 34, color: '#6366f1' },
      { label: 'Food',          pct: 21, color: '#f59e0b' },
      { label: 'Transport',     pct: 17, color: '#10b981' },
      { label: 'Entertainment', pct: 14, color: '#ef4444' },
      { label: 'Healthcare',    pct:  7, color: '#3b82f6' },
      { label: 'Other',         pct:  7, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-08-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3250 },
      { date: '2026-08-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1632 },
      { date: '2026-08-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -142 },
      { date: '2026-08-09', desc: 'Music Concert',         cat: 'Entertainment', amt:   -95 },
      { date: '2026-08-11', desc: 'Gym Membership',        cat: 'Healthcare',    amt:   -45 },
      { date: '2026-08-13', desc: 'Gas Station',           cat: 'Transport',     amt:   -70 },
      { date: '2026-08-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1750 },
      { date: '2026-08-19', desc: 'Beach Dinner',          cat: 'Food',          amt:   -88 },
      { date: '2026-08-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-08-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  9: {
    income: 6000,
    expenses: 3950,
    weeks: {
      income:   [1500, 1500, 1500, 1500],
      expenses: [980,  990, 1000,  980]
    },
    categories: [
      { label: 'Housing',       pct: 35, color: '#6366f1' },
      { label: 'Food',          pct: 22, color: '#f59e0b' },
      { label: 'Transport',     pct: 15, color: '#10b981' },
      { label: 'Entertainment', pct: 11, color: '#ef4444' },
      { label: 'Healthcare',    pct:  9, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-09-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3000 },
      { date: '2026-09-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1383 },
      { date: '2026-09-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -128 },
      { date: '2026-09-08', desc: 'Streaming Services',    cat: 'Entertainment', amt:   -28 },
      { date: '2026-09-10', desc: 'Doctor Visit Copay',    cat: 'Healthcare',    amt:   -60 },
      { date: '2026-09-12', desc: 'Lyft Rides',            cat: 'Transport',     amt:   -55 },
      { date: '2026-09-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1500 },
      { date: '2026-09-19', desc: 'Restaurant',            cat: 'Food',          amt:   -72 },
      { date: '2026-09-22', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-09-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  10: {
    income: 5950,
    expenses: 4300,
    weeks: {
      income:   [1480, 1490, 1490, 1490],
      expenses: [1070, 1080, 1080, 1070]
    },
    categories: [
      { label: 'Housing',       pct: 35, color: '#6366f1' },
      { label: 'Food',          pct: 21, color: '#f59e0b' },
      { label: 'Transport',     pct: 14, color: '#10b981' },
      { label: 'Entertainment', pct: 14, color: '#ef4444' },
      { label: 'Healthcare',    pct:  8, color: '#3b82f6' },
      { label: 'Other',         pct:  8, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-10-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  2975 },
      { date: '2026-10-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1505 },
      { date: '2026-10-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -135 },
      { date: '2026-10-08', desc: 'Halloween Party Prep',  cat: 'Entertainment', amt:   -85 },
      { date: '2026-10-10', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -40 },
      { date: '2026-10-13', desc: 'Gas Station',           cat: 'Transport',     amt:   -60 },
      { date: '2026-10-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1475 },
      { date: '2026-10-20', desc: 'Restaurant Dinner',     cat: 'Food',          amt:   -78 },
      { date: '2026-10-23', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-10-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  11: {
    income: 6100,
    expenses: 4600,
    weeks: {
      income:   [1520, 1530, 1530, 1520],
      expenses: [1140, 1160, 1160, 1140]
    },
    categories: [
      { label: 'Housing',       pct: 34, color: '#6366f1' },
      { label: 'Food',          pct: 22, color: '#f59e0b' },
      { label: 'Transport',     pct: 13, color: '#10b981' },
      { label: 'Entertainment', pct: 16, color: '#ef4444' },
      { label: 'Healthcare',    pct:  8, color: '#3b82f6' },
      { label: 'Other',         pct:  7, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-11-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3050 },
      { date: '2026-11-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1564 },
      { date: '2026-11-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -148 },
      { date: '2026-11-11', desc: 'Black Friday Preview',  cat: 'Entertainment', amt:  -180 },
      { date: '2026-11-12', desc: 'Gym Membership',        cat: 'Healthcare',    amt:   -45 },
      { date: '2026-11-13', desc: 'Lyft Rides',            cat: 'Transport',     amt:   -52 },
      { date: '2026-11-15', desc: 'Freelance Payment',     cat: 'Income',        amt:  1550 },
      { date: '2026-11-22', desc: 'Thanksgiving Dinner',   cat: 'Food',          amt:  -140 },
      { date: '2026-11-23', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-11-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  },
  12: {
    income: 7200,
    expenses: 5800,
    weeks: {
      income:   [1800, 1800, 1800, 1800],
      expenses: [1450, 1450, 1450, 1450]
    },
    categories: [
      { label: 'Housing',       pct: 30, color: '#6366f1' },
      { label: 'Food',          pct: 25, color: '#f59e0b' },
      { label: 'Transport',     pct: 12, color: '#10b981' },
      { label: 'Entertainment', pct: 20, color: '#ef4444' },
      { label: 'Healthcare',    pct:  6, color: '#3b82f6' },
      { label: 'Other',         pct:  7, color: '#8b5cf6' },
    ],
    transactions: [
      { date: '2026-12-01', desc: 'Salary Deposit',        cat: 'Income',        amt:  3600 },
      { date: '2026-12-03', desc: 'Rent Payment',          cat: 'Housing',       amt: -1740 },
      { date: '2026-12-06', desc: 'Grocery Store',         cat: 'Food',          amt:  -180 },
      { date: '2026-12-10', desc: 'Christmas Shopping',    cat: 'Entertainment', amt:  -380 },
      { date: '2026-12-12', desc: 'Pharmacy',              cat: 'Healthcare',    amt:   -32 },
      { date: '2026-12-13', desc: 'Taxi / Rideshare',      cat: 'Transport',     amt:   -65 },
      { date: '2026-12-15', desc: 'Year-end Bonus',        cat: 'Income',        amt:  2100 },
      { date: '2026-12-20', desc: 'Holiday Dinner',        cat: 'Food',          amt:  -220 },
      { date: '2026-12-23', desc: 'Monthly Bus Pass',      cat: 'Transport',     amt:   -88 },
      { date: '2026-12-28', desc: 'Dividend Income',       cat: 'Income',        amt:   500 },
    ]
  }
};
