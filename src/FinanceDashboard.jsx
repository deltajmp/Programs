import { useState, useEffect, useReducer } from "react";

// ═══════════════════════════════════════════════════════════════
// FINANCIAL DATA & CONSTANTS (2026 Tax Year)
// ═══════════════════════════════════════════════════════════════

const FINANCIAL_CONSTANTS = {
  rothIRA: {
    limit: 7500,
    catchUp50: 8600,
    singlePhaseOut: [153000, 168000],
    marriedPhaseOut: [242000, 252000],
    deadline: "April 15, 2027 (for tax year 2026)",
  },
  four01k: {
    limit: 24500,
    catchUp50: 32500,
    catchUp60_63: 35750,
  },
  ira: {
    limit: 7500,
    catchUp: 8600,
  },
};

const STATIC_TIPS = {
  general: [
    { id: 1, category: "Budgeting", tip: "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings & debt repayment.", source: "General financial advisor consensus" },
    { id: 2, category: "Emergency Fund", tip: "Build an emergency fund covering 3-6 months of essential expenses before aggressive investing.", source: "General financial advisor consensus" },
    { id: 3, category: "Debt", tip: "Pay off high-interest debt (credit cards) before focusing on lower-interest obligations.", source: "General financial advisor consensus" },
    { id: 4, category: "Retirement", tip: "Financial advisors generally recommend saving 15% of gross income toward retirement, including any employer match.", source: "General financial advisor consensus" },
    { id: 5, category: "Roth IRA", tip: `For 2026, the Roth IRA contribution limit is $7,500 ($8,600 if 50+). Single filers phase out between $153K-$168K MAGI. Deadline: April 15, 2027.`, source: "IRS / Vanguard" },
    { id: 6, category: "401(k)", tip: `The 2026 401(k) contribution limit is $24,500. Always contribute enough to get the full employer match — that's free money.`, source: "IRS" },
    { id: 7, category: "Compound Interest", tip: "Starting to invest even small amounts early leverages compound interest. Time in the market beats timing the market.", source: "General financial advisor consensus" },
    { id: 8, category: "Tax Strategy", tip: "Contribute to a Roth IRA when your income is low (e.g., during training) and traditional accounts when your income is high to optimize tax brackets.", source: "General financial advisor consensus" },
  ],
  residentPhysician: [
    { id: 101, category: "Student Loans", tip: "Get your student loans organized as a PGY-1. Understand whether PSLF or refinancing makes more sense for your situation.", source: "Money Meets Medicine / WealthKeel" },
    { id: 102, category: "Roth IRA", tip: "Residency is a prime time to fund a Roth IRA — you're in a low tax bracket now compared to attending income. Max it out if possible.", source: "Money Meets Medicine / AMA" },
    { id: 103, category: "Employer Match", tip: "If your program offers a 401(k)/403(b) with employer match (typically 3-6%), contribute at least enough to capture the full match.", source: "AMA / Laurel Road" },
    { id: 104, category: "Disability Insurance", tip: "Buy own-occupation disability insurance during residency while you're young and healthy. Consider guaranteed standard issue (GSI) policies if available.", source: "Money Meets Medicine" },
    { id: 105, category: "Lifestyle Creep", tip: "When you become an attending, try to live on your resident budget for 2-3 more years. Use the salary jump to eliminate debt and build wealth.", source: "Money Meets Medicine / The Physician Philosopher" },
    { id: 106, category: "Housing", tip: "Most financial advisors recommend renting during residency. Physician mortgage loans (0% down, no PMI) are tempting but come with hidden costs.", source: "WealthKeel / Money Meets Medicine" },
    { id: 107, category: "Life Insurance", tip: "If you have a spouse, kids, or family who depend on you financially, get affordable term life insurance during training.", source: "Money Meets Medicine" },
    { id: 108, category: "PSLF", tip: "If you work at a nonprofit hospital, you may qualify for Public Service Loan Forgiveness. Use income-driven repayment to minimize payments during training while payments count toward the 120 required.", source: "StudentAid.gov / Money Meets Medicine" },
    { id: 109, category: "Contract Review", tip: "Before signing your first attending contract, have it reviewed by a physician contract attorney. Look at compensation structure, non-compete clauses, and tail coverage.", source: "Money Meets Medicine" },
    { id: 110, category: "Investing", tip: "Keep investing simple — low-cost index funds are broadly recommended by financial advisors for physicians. Avoid complex products pitched by insurance salespeople.", source: "Money Meets Medicine / Physician Philosopher" },
    { id: 111, category: "Hidden Fees", tip: "Check your 401(k) for hidden fees. High expense ratios can cost thousands over a career. Look for funds with expense ratios under 0.20%.", source: "Money Meets Medicine" },
    { id: 112, category: "Budgeting", tip: "The average resident nets around $4,000/month after taxes and deductions. Create a budget from day one — it's the foundation for everything else.", source: "AMA / CFP Chad Chubb" },
  ],
  loanForgiveness: [
    { id: 201, category: "PSLF", tip: "Public Service Loan Forgiveness requires 120 qualifying payments while working full-time for a qualifying employer (government or nonprofit). Forgiveness under PSLF is not taxable.", source: "StudentAid.gov" },
    { id: 202, category: "IDR Forgiveness", tip: "Income-driven repayment plans forgive remaining balances after 20-25 years, but starting in 2026, this forgiveness may be taxable income. PSLF forgiveness remains tax-free.", source: "NASFAA / IRS" },
    { id: 203, category: "New Rules July 2026", tip: "Starting July 1, 2026, new borrowers will only have two repayment options: Standard Repayment Plan and the new Repayment Assistance Plan (RAP). Existing borrowers must switch to valid plans by July 1, 2028.", source: "Dept. of Education / OBBBA" },
    { id: 204, category: "PSLF Changes", tip: "New PSLF rules effective July 1, 2026 may change which employers qualify. Submit Employment Certification Forms regularly to track your progress.", source: "Dept. of Education" },
    { id: 205, category: "Tax Refund Strategy", tip: "Applying your tax refund as a lump sum payment early in the year reduces principal faster, saving more on interest compared to spreading payments throughout the year.", source: "General financial advisor consensus" },
    { id: 206, category: "Consolidation", tip: "If you have FFEL loans and want PSLF eligibility, consolidate into a Direct Consolidation Loan before July 1, 2026 to maintain access to income-driven repayment options.", source: "FinAid.org" },
  ],
};

const DEADLINE_TEMPLATES = [
  { month: 1, day: 1, title: "New Year Financial Review", description: "Review last year's spending, set new budget targets, and check retirement contribution limits for the new tax year." },
  { month: 1, day: 15, title: "Q4 Estimated Tax Payment Due", description: "If you have self-employment or side income, your Q4 estimated tax payment for the prior year is due." },
  { month: 3, day: 1, title: "PSLF Employment Certification", description: "Submit your annual Employment Certification Form (ECF) to track qualifying PSLF payments." },
  { month: 4, day: 15, title: "Tax Filing Deadline / Prior Year Roth IRA Deadline", description: "File your federal tax return. Last day to make Roth IRA contributions for the prior tax year." },
  { month: 6, day: 15, title: "Q2 Estimated Tax Payment Due", description: "Second quarter estimated tax payment due for self-employment/side income." },
  { month: 7, day: 1, title: "Student Loan Policy Changes Take Effect", description: "New federal student loan rules from OBBBA take effect. Review your repayment plan and PSLF status." },
  { month: 9, day: 15, title: "Q3 Estimated Tax Payment Due", description: "Third quarter estimated tax payment due." },
  { month: 10, day: 1, title: "Open Enrollment Prep", description: "Review employer benefits options before open enrollment begins. Compare health, dental, vision, and retirement plan options." },
  { month: 11, day: 1, title: "Open Enrollment / Maximize 401(k)", description: "Adjust 401(k) contributions to maximize by year-end. Review if you're on track to hit contribution limits." },
  { month: 12, day: 1, title: "Year-End Financial Moves", description: "Consider tax-loss harvesting, charitable donations, and last-minute retirement contributions before December 31." },
  { month: 12, day: 31, title: "401(k) Contribution Deadline", description: "Last day to make 401(k)/403(b) contributions for this tax year." },
];

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const initialState = {
  incomes: [],
  expenseCategories: [],
  transactions: [],
  savingsGoals: [],
  loans: [],
  profile: {
    filingStatus: "single",
    age: 28,
    agi: 0,
    taxRefund: 0,
    isResident: false,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_INCOME":
      return { ...state, incomes: [...state.incomes, { ...action.payload, id: Date.now() }] };
    case "REMOVE_INCOME":
      return { ...state, incomes: state.incomes.filter((i) => i.id !== action.payload) };
    case "ADD_CATEGORY":
      return { ...state, expenseCategories: [...state.expenseCategories, { ...action.payload, id: Date.now() }] };
    case "REMOVE_CATEGORY":
      return { ...state, expenseCategories: state.expenseCategories.filter((c) => c.id !== action.payload) };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, { ...action.payload, id: Date.now(), date: new Date().toISOString().split("T")[0] }] };
    case "REMOVE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case "ADD_LOAN":
      return { ...state, loans: [...state.loans, { ...action.payload, id: Date.now() }] };
    case "REMOVE_LOAN":
      return { ...state, loans: state.loans.filter((l) => l.id !== action.payload) };
    case "ADD_SAVINGS_GOAL":
      return { ...state, savingsGoals: [...state.savingsGoals, { ...action.payload, id: Date.now() }] };
    case "REMOVE_SAVINGS_GOAL":
      return { ...state, savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload) };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case "LOAD_STATE":
      return { ...action.payload };
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtDec = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const pct = (n) => `${Math.round(n * 100)}%`;

function getMonthlyIncome(incomes) {
  return incomes.reduce((sum, inc) => {
    const amt = parseFloat(inc.amount) || 0;
    switch (inc.frequency) {
      case "weekly": return sum + amt * 52 / 12;
      case "biweekly": return sum + amt * 26 / 12;
      case "monthly": return sum + amt;
      case "annually": return sum + amt / 12;
      default: return sum + amt;
    }
  }, 0);
}

function getAnnualIncome(incomes) {
  return getMonthlyIncome(incomes) * 12;
}

function getCurrentMonthTransactions(transactions) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function getDynamicTips(state) {
  const tips = [];
  const monthlyIncome = getMonthlyIncome(state.incomes);
  const annualIncome = getAnnualIncome(state.incomes);
  const currentTx = getCurrentMonthTransactions(state.transactions);
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  // Check each category for overspending
  state.expenseCategories.forEach((cat) => {
    const budget = parseFloat(cat.budgeted) || 0;
    if (budget <= 0) return;
    const spent = currentTx.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const spendPct = spent / budget;

    if (spendPct > 1) {
      tips.push({ type: "warning", category: cat.name, message: `You've exceeded your ${cat.name} budget by ${fmt(spent - budget)}. Consider cutting back for the rest of the month.` });
    } else if (spendPct > 0.8 && monthProgress < 0.7) {
      tips.push({ type: "caution", category: cat.name, message: `You've used ${pct(spendPct)} of your ${cat.name} budget but you're only ${pct(monthProgress)} through the month. Pace yourself.` });
    } else if (spendPct < 0.5 && monthProgress > 0.7) {
      tips.push({ type: "positive", category: cat.name, message: `Great job on ${cat.name}! You've only used ${pct(spendPct)} of your budget with ${Math.round((1 - monthProgress) * daysInMonth)} days left.` });
    }
  });

  // Retirement contribution tip based on income
  if (annualIncome > 0) {
    const recommendedRetirement = annualIncome * 0.15;
    tips.push({ type: "info", category: "Retirement", message: `Based on your income, financial advisors generally recommend saving about ${fmt(recommendedRetirement)}/year (${fmt(recommendedRetirement / 12)}/month) toward retirement.` });

    // Roth IRA eligibility
    const magi = state.profile.agi || annualIncome;
    const limits = state.profile.filingStatus === "married" ? FINANCIAL_CONSTANTS.rothIRA.marriedPhaseOut : FINANCIAL_CONSTANTS.rothIRA.singlePhaseOut;
    if (magi < limits[0]) {
      tips.push({ type: "positive", category: "Roth IRA", message: `Your income qualifies for full Roth IRA contributions of ${fmt(state.profile.age >= 50 ? 8600 : 7500)}/year for 2026.` });
    } else if (magi < limits[1]) {
      tips.push({ type: "caution", category: "Roth IRA", message: `Your income falls in the Roth IRA phase-out range. Your contribution may be reduced. Consider a backdoor Roth IRA strategy.` });
    } else {
      tips.push({ type: "warning", category: "Roth IRA", message: `Your income exceeds the Roth IRA direct contribution limit. Look into the backdoor Roth IRA strategy.` });
    }
  }

  // Savings rate check
  const totalBudgeted = state.expenseCategories.reduce((s, c) => s + (parseFloat(c.budgeted) || 0), 0);
  if (monthlyIncome > 0 && totalBudgeted > 0) {
    const savingsRate = (monthlyIncome - totalBudgeted) / monthlyIncome;
    if (savingsRate < 0.1) {
      tips.push({ type: "warning", category: "Savings", message: `Your savings rate is only ${pct(savingsRate)}. Aim for at least 20% to build long-term wealth.` });
    } else if (savingsRate >= 0.2) {
      tips.push({ type: "positive", category: "Savings", message: `Your savings rate is ${pct(savingsRate)} — you're meeting or exceeding the recommended 20% target.` });
    }
  }

  return tips;
}

function getUpcomingDeadlines() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  return DEADLINE_TEMPLATES
    .map((d) => {
      let daysUntil;
      if (d.month > currentMonth || (d.month === currentMonth && d.day >= currentDay)) {
        const target = new Date(now.getFullYear(), d.month - 1, d.day);
        daysUntil = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      } else {
        const target = new Date(now.getFullYear() + 1, d.month - 1, d.day);
        daysUntil = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      }
      return { ...d, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const colors = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2235",
  border: "#1e293b",
  accent: "#22d3ee",
  accentDim: "#0e7490",
  accentGlow: "rgba(34,211,238,0.15)",
  green: "#34d399",
  greenDim: "#065f46",
  red: "#f87171",
  redDim: "#7f1d1d",
  yellow: "#fbbf24",
  yellowDim: "#78350f",
  text: "#e2e8f0",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  inputBg: "#0f172a",
};

const baseBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.2s",
};

const styles = {
  app: {
    fontFamily: "'DM Sans', sans-serif",
    background: colors.bg,
    color: colors.text,
    minHeight: "100vh",
    padding: 0,
  },
  header: {
    background: `linear-gradient(135deg, ${colors.card} 0%, #0f172a 100%)`,
    padding: "32px 24px 24px",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "0",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    color: colors.accent,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerSub: {
    fontSize: "14px",
    color: colors.textDim,
    margin: "6px 0 0",
    fontWeight: 400,
  },
  nav: {
    display: "flex",
    gap: "4px",
    padding: "12px 24px",
    background: colors.card,
    borderBottom: `1px solid ${colors.border}`,
    overflowX: "auto",
    flexWrap: "wrap",
  },
  navBtn: (active) => ({
    ...baseBtn,
    padding: "10px 16px",
    background: active ? colors.accentGlow : "transparent",
    color: active ? colors.accent : colors.textDim,
    border: active ? `1px solid ${colors.accentDim}` : `1px solid transparent`,
    fontSize: "12px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  }),
  content: {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    background: colors.card,
    borderRadius: "12px",
    border: `1px solid ${colors.border}`,
    padding: "24px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: colors.text,
    marginBottom: "16px",
    fontFamily: "'Playfair Display', serif",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: colors.textDim,
    marginBottom: "6px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  addBtn: {
    ...baseBtn,
    background: `linear-gradient(135deg, ${colors.accentDim}, ${colors.accent})`,
    color: "#0a0f1a",
  },
  removeBtn: {
    ...baseBtn,
    background: colors.redDim,
    color: colors.red,
    padding: "4px 10px",
    fontSize: "11px",
  },
  statBox: {
    background: colors.inputBg,
    borderRadius: "10px",
    padding: "16px",
    border: `1px solid ${colors.border}`,
    textAlign: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    fontFamily: "'DM Sans', sans-serif",
  },
  statLabel: {
    fontSize: "11px",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "4px",
  },
  progressBar: (pct, color) => ({
    height: "8px",
    borderRadius: "4px",
    background: colors.inputBg,
    overflow: "hidden",
    position: "relative",
  }),
  progressFill: (pctVal, color) => ({
    height: "100%",
    width: `${Math.min(pctVal * 100, 100)}%`,
    borderRadius: "4px",
    background: pctVal > 1 ? colors.red : pctVal > 0.8 ? colors.yellow : color || colors.green,
    transition: "width 0.5s ease",
  }),
  tipCard: (type) => ({
    background: type === "warning" ? colors.redDim : type === "caution" ? colors.yellowDim : type === "positive" ? colors.greenDim : colors.inputBg,
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "10px",
    borderLeft: `4px solid ${type === "warning" ? colors.red : type === "caution" ? colors.yellow : type === "positive" ? colors.green : colors.accent}`,
  }),
  tag: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginRight: "8px",
  },
  row: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  field: (flex = 1) => ({
    flex,
    minWidth: "120px",
  }),
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: colors.inputBg,
    borderRadius: "8px",
    marginBottom: "8px",
    border: `1px solid ${colors.border}`,
  },
  disclaimer: {
    fontSize: "11px",
    color: colors.textMuted,
    padding: "16px",
    borderTop: `1px solid ${colors.border}`,
    marginTop: "24px",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── MODULE 1: INCOME INPUT ─────────────────────────────────
function IncomeSection({ state, dispatch }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("biweekly");

  const addIncome = () => {
    if (!name || !amount) return;
    dispatch({ type: "ADD_INCOME", payload: { name, amount: parseFloat(amount), frequency } });
    setName(""); setAmount("");
  };

  const monthly = getMonthlyIncome(state.incomes);
  const annual = monthly * 12;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Income Sources</div>
        <div style={styles.row}>
          <div style={styles.field(2)}>
            <label style={styles.label}>Source Name</label>
            <input style={styles.input} placeholder="e.g. Primary Job" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Amount ($)</label>
            <input style={styles.input} type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Frequency</label>
            <select style={{ ...styles.select, width: "100%" }} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div><button style={styles.addBtn} onClick={addIncome}>+ Add</button></div>
        </div>

        {state.incomes.map((inc) => (
          <div key={inc.id} style={styles.listItem}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{inc.name}</div>
              <div style={{ fontSize: "12px", color: colors.textDim }}>{fmtDec(inc.amount)} / {inc.frequency}</div>
            </div>
            <button style={styles.removeBtn} onClick={() => dispatch({ type: "REMOVE_INCOME", payload: inc.id })}>Remove</button>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={styles.statBox}>
          <div style={{ ...styles.statValue, color: colors.green }}>{fmt(monthly)}</div>
          <div style={styles.statLabel}>Monthly Income</div>
        </div>
        <div style={styles.statBox}>
          <div style={{ ...styles.statValue, color: colors.accent }}>{fmt(annual)}</div>
          <div style={styles.statLabel}>Annual Income</div>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 2: EXPENSE TRACKER ──────────────────────────────
function ExpenseSection({ state, dispatch }) {
  const [catName, setCatName] = useState("");
  const [catBudget, setCatBudget] = useState("");
  const [catType, setCatType] = useState("variable");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txNote, setTxNote] = useState("");

  const addCategory = () => {
    if (!catName) return;
    dispatch({ type: "ADD_CATEGORY", payload: { name: catName, budgeted: parseFloat(catBudget) || 0, type: catType } });
    setCatName(""); setCatBudget("");
  };

  const addTransaction = () => {
    if (!txAmount || !txCategory) return;
    dispatch({ type: "ADD_TRANSACTION", payload: { amount: parseFloat(txAmount), categoryId: parseInt(txCategory), note: txNote } });
    setTxAmount(""); setTxNote("");
  };

  const currentTx = getCurrentMonthTransactions(state.transactions);

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Expense Categories</div>
        <div style={styles.row}>
          <div style={styles.field(2)}>
            <label style={styles.label}>Category Name</label>
            <input style={styles.input} placeholder="e.g. Groceries" value={catName} onChange={(e) => setCatName(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Monthly Budget ($)</label>
            <input style={styles.input} type="number" placeholder="0" value={catBudget} onChange={(e) => setCatBudget(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Type</label>
            <select style={{ ...styles.select, width: "100%" }} value={catType} onChange={(e) => setCatType(e.target.value)}>
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </div>
          <div><button style={styles.addBtn} onClick={addCategory}>+ Add</button></div>
        </div>

        {state.expenseCategories.map((cat) => {
          const spent = currentTx.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0);
          const budget = cat.budgeted || 0;
          const ratio = budget > 0 ? spent / budget : 0;

          return (
            <div key={cat.id} style={{ ...styles.listItem, flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{cat.name}</span>
                  <span style={{ ...styles.tag, background: cat.type === "fixed" ? colors.accentDim : colors.yellowDim, color: cat.type === "fixed" ? colors.accent : colors.yellow, marginLeft: "8px" }}>
                    {cat.type}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: colors.textDim }}>{fmt(spent)} / {fmt(budget)}</span>
                  <button style={styles.removeBtn} onClick={() => dispatch({ type: "REMOVE_CATEGORY", payload: cat.id })}>×</button>
                </div>
              </div>
              {budget > 0 && (
                <div style={styles.progressBar()}>
                  <div style={styles.progressFill(ratio)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.expenseCategories.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Log Expense</div>
          <div style={styles.row}>
            <div style={styles.field(1)}>
              <label style={styles.label}>Category</label>
              <select style={{ ...styles.select, width: "100%" }} value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                <option value="">Select...</option>
                {state.expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={styles.field(1)}>
              <label style={styles.label}>Amount ($)</label>
              <input style={styles.input} type="number" placeholder="0" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
            </div>
            <div style={styles.field(2)}>
              <label style={styles.label}>Note (optional)</label>
              <input style={styles.input} placeholder="e.g. Weekly run" value={txNote} onChange={(e) => setTxNote(e.target.value)} />
            </div>
            <div><button style={styles.addBtn} onClick={addTransaction}>+ Log</button></div>
          </div>

          {currentTx.slice().reverse().slice(0, 10).map((tx) => {
            const cat = state.expenseCategories.find((c) => c.id === tx.categoryId);
            return (
              <div key={tx.id} style={styles.listItem}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>{fmtDec(tx.amount)}</span>
                  <span style={{ color: colors.textDim, fontSize: "12px", marginLeft: "8px" }}>{cat?.name || "Unknown"}</span>
                  {tx.note && <span style={{ color: colors.textMuted, fontSize: "12px", marginLeft: "8px" }}>— {tx.note}</span>}
                </div>
                <button style={styles.removeBtn} onClick={() => dispatch({ type: "REMOVE_TRANSACTION", payload: tx.id })}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MODULE 3: BUDGET PROJECTOR ─────────────────────────────
function ProjectorSection({ state }) {
  const monthlyIncome = getMonthlyIncome(state.incomes);
  const annualIncome = monthlyIncome * 12;
  const totalBudgeted = state.expenseCategories.reduce((s, c) => s + (parseFloat(c.budgeted) || 0), 0);
  const currentTx = getCurrentMonthTransactions(state.transactions);
  const totalSpent = currentTx.reduce((s, t) => s + t.amount, 0);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / daysInMonth;
  const projectedSpend = totalSpent / monthProgress;

  const monthlyRemaining = monthlyIncome - totalBudgeted;
  const annualRemaining = monthlyRemaining * 12;
  const annualBudgeted = totalBudgeted * 12;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Monthly Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.green, fontSize: "20px" }}>{fmt(monthlyIncome)}</div>
            <div style={styles.statLabel}>Income</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.yellow, fontSize: "20px" }}>{fmt(totalBudgeted)}</div>
            <div style={styles.statLabel}>Budgeted</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.red, fontSize: "20px" }}>{fmt(totalSpent)}</div>
            <div style={styles.statLabel}>Spent (this month)</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: monthlyRemaining >= 0 ? colors.accent : colors.red, fontSize: "20px" }}>{fmt(monthlyRemaining)}</div>
            <div style={styles.statLabel}>Remaining</div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Projected vs Actual</div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: colors.textDim }}>Month Progress: {pct(monthProgress)} ({dayOfMonth}/{daysInMonth} days)</span>
            <span style={{ fontSize: "13px", color: colors.textDim }}>Budget Used: {totalBudgeted > 0 ? pct(totalSpent / totalBudgeted) : "N/A"}</span>
          </div>
          <div style={styles.progressBar()}>
            <div style={styles.progressFill(monthProgress, colors.accent)} />
          </div>
        </div>

        {totalSpent > 0 && (
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: projectedSpend > totalBudgeted ? colors.red : colors.green, fontSize: "20px" }}>
              {fmt(projectedSpend)}
            </div>
            <div style={styles.statLabel}>Projected month-end spending (at current pace)</div>
            <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "6px" }}>
              {projectedSpend > totalBudgeted
                ? `⚠ On track to overspend by ${fmt(projectedSpend - totalBudgeted)}`
                : `✓ On track to be ${fmt(totalBudgeted - projectedSpend)} under budget`}
            </div>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Annual Projection</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.green, fontSize: "18px" }}>{fmt(annualIncome)}</div>
            <div style={styles.statLabel}>Annual Income</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.yellow, fontSize: "18px" }}>{fmt(annualBudgeted)}</div>
            <div style={styles.statLabel}>Annual Expenses (proj.)</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: annualRemaining >= 0 ? colors.accent : colors.red, fontSize: "18px" }}>{fmt(annualRemaining)}</div>
            <div style={styles.statLabel}>Annual Surplus</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 4: FINANCIAL TIPS ───────────────────────────────
function TipsSection({ state }) {
  const [filter, setFilter] = useState("all");
  const dynamicTips = getDynamicTips(state);

  const staticFiltered = filter === "all" ? STATIC_TIPS.general : STATIC_TIPS.general.filter((t) => t.category.toLowerCase().includes(filter));

  return (
    <div>
      {dynamicTips.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Personalized Insights</div>
          {dynamicTips.map((tip, i) => (
            <div key={i} style={styles.tipCard(tip.type)}>
              <span style={{ ...styles.tag, background: tip.type === "warning" ? colors.red : tip.type === "caution" ? colors.yellow : tip.type === "positive" ? colors.green : colors.accent, color: colors.bg }}>
                {tip.category}
              </span>
              <span style={{ fontSize: "13px", lineHeight: 1.6 }}>{tip.message}</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>General Financial Guidance</div>
        <div style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "16px", fontStyle: "italic" }}>
          The following tips reflect general guidance from financial advisors and are for educational purposes only — not personalized financial advice.
        </div>
        {STATIC_TIPS.general.map((tip) => (
          <div key={tip.id} style={styles.tipCard("info")}>
            <span style={{ ...styles.tag, background: colors.accentDim, color: colors.accent }}>{tip.category}</span>
            <span style={{ fontSize: "13px", lineHeight: 1.6 }}>{tip.tip}</span>
            <div style={{ fontSize: "10px", color: colors.textMuted, marginTop: "4px" }}>Source: {tip.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 5: STUDENT LOAN FORGIVENESS ─────────────────────
function LoanSection({ state, dispatch }) {
  const [loanName, setLoanName] = useState("");
  const [loanBalance, setLoanBalance] = useState("");
  const [loanRate, setLoanRate] = useState("");
  const [loanType, setLoanType] = useState("direct");

  const addLoan = () => {
    if (!loanName || !loanBalance) return;
    dispatch({ type: "ADD_LOAN", payload: { name: loanName, balance: parseFloat(loanBalance), rate: parseFloat(loanRate) || 5, type: loanType } });
    setLoanName(""); setLoanBalance(""); setLoanRate("");
  };

  const totalDebt = state.loans.reduce((s, l) => s + l.balance, 0);
  const annualIncome = getAnnualIncome(state.incomes);
  const monthlyIncome = getMonthlyIncome(state.incomes);

  // Rough IDR estimate (10% of discretionary income)
  const discretionary = Math.max(0, annualIncome - 33975); // 150% FPL for single approx
  const idrMonthly = discretionary * 0.1 / 12;
  const standardMonthly = totalDebt > 0 ? (totalDebt * (0.05/12)) / (1 - Math.pow(1 + 0.05/12, -120)) : 0;

  // Tax refund impact
  const taxRefund = state.profile.taxRefund || 0;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Federal Student Loans</div>
        <div style={styles.row}>
          <div style={styles.field(2)}>
            <label style={styles.label}>Loan Name</label>
            <input style={styles.input} placeholder="e.g. Direct Unsubsidized" value={loanName} onChange={(e) => setLoanName(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Balance ($)</label>
            <input style={styles.input} type="number" placeholder="0" value={loanBalance} onChange={(e) => setLoanBalance(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Interest Rate (%)</label>
            <input style={styles.input} type="number" step="0.1" placeholder="5.0" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} />
          </div>
          <div><button style={styles.addBtn} onClick={addLoan}>+ Add</button></div>
        </div>

        {state.loans.map((loan) => (
          <div key={loan.id} style={styles.listItem}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{loan.name}</div>
              <div style={{ fontSize: "12px", color: colors.textDim }}>{fmt(loan.balance)} at {loan.rate}%</div>
            </div>
            <button style={styles.removeBtn} onClick={() => dispatch({ type: "REMOVE_LOAN", payload: loan.id })}>×</button>
          </div>
        ))}

        {state.loans.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: colors.red, fontSize: "18px" }}>{fmt(totalDebt)}</div>
              <div style={styles.statLabel}>Total Debt</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: colors.yellow, fontSize: "18px" }}>{fmt(standardMonthly)}</div>
              <div style={styles.statLabel}>Standard Payment (est.)</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: colors.green, fontSize: "18px" }}>{fmt(idrMonthly)}</div>
              <div style={styles.statLabel}>IDR Payment (est.)</div>
            </div>
          </div>
        )}
      </div>

      {taxRefund > 0 && totalDebt > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Tax Refund Impact</div>
          <div style={styles.tipCard("positive")}>
            <span style={{ fontSize: "13px", lineHeight: 1.6 }}>
              Applying your {fmt(taxRefund)} tax refund as a lump sum to your highest-interest loan could save you approximately {fmt(taxRefund * (state.loans.reduce((max, l) => Math.max(max, l.rate), 0) / 100) * 5)} in interest over 5 years.
            </span>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Forgiveness Program Guidance</div>
        {STATIC_TIPS.loanForgiveness.map((tip) => (
          <div key={tip.id} style={styles.tipCard("info")}>
            <span style={{ ...styles.tag, background: colors.accentDim, color: colors.accent }}>{tip.category}</span>
            <span style={{ fontSize: "13px", lineHeight: 1.6 }}>{tip.tip}</span>
            <div style={{ fontSize: "10px", color: colors.textMuted, marginTop: "4px" }}>Source: {tip.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODULE 6: DEADLINES & NOTIFICATIONS ────────────────────
function DeadlinesSection({ state }) {
  const deadlines = getUpcomingDeadlines();

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Upcoming Financial Deadlines</div>
        {deadlines.map((d, i) => (
          <div key={i} style={{ ...styles.tipCard(d.daysUntil <= 14 ? "warning" : d.daysUntil <= 30 ? "caution" : "info") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>{d.title}</span>
              <span style={{
                ...styles.tag,
                background: d.daysUntil <= 14 ? colors.red : d.daysUntil <= 30 ? colors.yellow : colors.accentDim,
                color: d.daysUntil <= 14 ? "#fff" : d.daysUntil <= 30 ? colors.bg : colors.accent,
              }}>
                {d.daysUntil === 0 ? "TODAY" : d.daysUntil === 1 ? "Tomorrow" : `${d.daysUntil} days`}
              </span>
            </div>
            <div style={{ fontSize: "13px", color: colors.textDim, lineHeight: 1.5 }}>{d.description}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Key 2026 Dates to Know</div>
        <div style={{ fontSize: "13px", color: colors.textDim, lineHeight: 1.8 }}>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>April 15, 2026</strong> — Tax filing deadline + last day for 2025 Roth IRA contributions</div>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>July 1, 2026</strong> — New PSLF employer rules take effect; new borrowers limited to Standard + RAP repayment plans</div>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>Dec 31, 2026</strong> — 401(k)/403(b) contribution deadline for tax year 2026</div>
          <div><strong style={{ color: colors.accent }}>April 15, 2027</strong> — Last day for 2026 Roth IRA contributions</div>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE 7: DISCRETIONARY SPENDING CALCULATOR ─────────────
function SpendingCalcSection({ state }) {
  const [vacationTarget, setVacationTarget] = useState("");
  const [bigPurchase, setBigPurchase] = useState("");
  const [monthlySaveRate, setMonthlySaveRate] = useState("");

  const monthlyIncome = getMonthlyIncome(state.incomes);
  const totalBudgeted = state.expenseCategories.reduce((s, c) => s + (parseFloat(c.budgeted) || 0), 0);
  const discretionary = Math.max(0, monthlyIncome - totalBudgeted);
  const weeklyAllowance = discretionary / 4.33;

  const vacTarget = parseFloat(vacationTarget) || 0;
  const purchaseTarget = parseFloat(bigPurchase) || 0;
  const saveRate = parseFloat(monthlySaveRate) || (discretionary * 0.3);

  const vacMonths = saveRate > 0 ? Math.ceil(vacTarget / saveRate) : 0;
  const purchaseMonths = saveRate > 0 ? Math.ceil(purchaseTarget / saveRate) : 0;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Your Discretionary Budget</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.green, fontSize: "22px" }}>{fmt(discretionary)}</div>
            <div style={styles.statLabel}>Monthly Discretionary</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.accent, fontSize: "22px" }}>{fmt(weeklyAllowance)}</div>
            <div style={styles.statLabel}>Weekly Allowance</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ ...styles.statValue, color: colors.yellow, fontSize: "22px" }}>{fmt(discretionary * 12)}</div>
            <div style={styles.statLabel}>Annual Fun Money</div>
          </div>
        </div>
        {monthlyIncome > 0 && (
          <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "12px", textAlign: "center" }}>
            This is what remains after all budgeted expenses ({fmt(totalBudgeted)}/mo) are subtracted from your income ({fmt(monthlyIncome)}/mo).
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Vacation & Big Purchase Planner</div>
        <div style={styles.row}>
          <div style={styles.field(1)}>
            <label style={styles.label}>Vacation Budget ($)</label>
            <input style={styles.input} type="number" placeholder="e.g. 3000" value={vacationTarget} onChange={(e) => setVacationTarget(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Big Purchase ($)</label>
            <input style={styles.input} type="number" placeholder="e.g. 1200" value={bigPurchase} onChange={(e) => setBigPurchase(e.target.value)} />
          </div>
          <div style={styles.field(1)}>
            <label style={styles.label}>Monthly Save Amount ($)</label>
            <input style={styles.input} type="number" placeholder={fmt(discretionary * 0.3)} value={monthlySaveRate} onChange={(e) => setMonthlySaveRate(e.target.value)} />
          </div>
        </div>

        {(vacTarget > 0 || purchaseTarget > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            {vacTarget > 0 && (
              <div style={styles.statBox}>
                <div style={{ fontSize: "14px", color: colors.accent, marginBottom: "4px" }}>Vacation: {fmt(vacTarget)}</div>
                <div style={{ ...styles.statValue, color: colors.green, fontSize: "20px" }}>{vacMonths} months</div>
                <div style={styles.statLabel}>saving {fmt(saveRate)}/mo</div>
              </div>
            )}
            {purchaseTarget > 0 && (
              <div style={styles.statBox}>
                <div style={{ fontSize: "14px", color: colors.accent, marginBottom: "4px" }}>Purchase: {fmt(purchaseTarget)}</div>
                <div style={{ ...styles.statValue, color: colors.green, fontSize: "20px" }}>{purchaseMonths} months</div>
                <div style={styles.statLabel}>saving {fmt(saveRate)}/mo</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODULE 8: RESIDENT PHYSICIAN GUIDE ──────────────────────
function ResidentSection({ state }) {
  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Resident Physician Financial Guide</div>
        <div style={{ fontSize: "13px", color: colors.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
          Curated financial guidance for physicians-in-training, drawing from resources like Money Meets Medicine, the AMA, and physician financial advisors. All tips are educational — not personalized financial advice.
        </div>

        {STATIC_TIPS.residentPhysician.map((tip) => (
          <div key={tip.id} style={styles.tipCard("info")}>
            <span style={{ ...styles.tag, background: colors.accentDim, color: colors.accent }}>{tip.category}</span>
            <span style={{ fontSize: "13px", lineHeight: 1.6 }}>{tip.tip}</span>
            <div style={{ fontSize: "10px", color: colors.textMuted, marginTop: "4px" }}>Source: {tip.source}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Resident Financial Priorities Checklist</div>
        {[
          "Get student loans organized — know your loan types, balances, and interest rates",
          "Determine PSLF eligibility (if at a nonprofit hospital, you likely qualify)",
          "Enroll in an income-driven repayment plan to minimize payments while loans count toward forgiveness",
          "Contribute to 401(k)/403(b) at least up to employer match",
          "Open and fund a Roth IRA (low tax bracket = ideal time)",
          "Build a 3-month emergency fund",
          "Get own-occupation disability insurance",
          "Get term life insurance if you have dependents",
          "Avoid buying a house during residency (rent is usually smarter)",
          "Create and stick to a monthly budget",
          "Plan to live on your resident budget for 2-3 years after becoming an attending",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: i < 10 ? `1px solid ${colors.border}` : "none", alignItems: "flex-start" }}>
            <span style={{ color: colors.accent, fontWeight: 700, fontSize: "14px", minWidth: "24px" }}>{i + 1}.</span>
            <span style={{ fontSize: "13px", lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Recommended Resources</div>
        <div style={{ fontSize: "13px", lineHeight: 1.8 }}>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>Money Meets Medicine</strong> — moneymeetsmedicine.com — Podcast, blog, and courses built for physicians by a physician. Covers disability insurance, investing, student loans, and more.</div>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>The Physician Philosopher's Guide to Personal Finance</strong> — Free book available at moneymeetsmedicine.com/freebook</div>
          <div style={{ marginBottom: "8px" }}><strong style={{ color: colors.accent }}>White Coat Investor</strong> — whitecoatinvestor.com — One of the largest physician finance communities</div>
          <div><strong style={{ color: colors.accent }}>StudentAid.gov</strong> — Official federal student loan management and PSLF tracking</div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SETTINGS ────────────────────────────────────────
function ProfileSection({ state, dispatch }) {
  const p = state.profile;
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Your Profile</div>
      <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "16px" }}>This information helps personalize tips, Roth IRA eligibility, and loan calculations.</div>
      <div style={styles.row}>
        <div style={styles.field(1)}>
          <label style={styles.label}>Filing Status</label>
          <select style={{ ...styles.select, width: "100%" }} value={p.filingStatus} onChange={(e) => dispatch({ type: "UPDATE_PROFILE", payload: { filingStatus: e.target.value } })}>
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
            <option value="head">Head of Household</option>
          </select>
        </div>
        <div style={styles.field(1)}>
          <label style={styles.label}>Age</label>
          <input style={styles.input} type="number" value={p.age} onChange={(e) => dispatch({ type: "UPDATE_PROFILE", payload: { age: parseInt(e.target.value) || 0 } })} />
        </div>
        <div style={styles.field(1)}>
          <label style={styles.label}>Adjusted Gross Income ($)</label>
          <input style={styles.input} type="number" placeholder="0" value={p.agi || ""} onChange={(e) => dispatch({ type: "UPDATE_PROFILE", payload: { agi: parseFloat(e.target.value) || 0 } })} />
        </div>
      </div>
      <div style={styles.row}>
        <div style={styles.field(1)}>
          <label style={styles.label}>Tax Refund ($)</label>
          <input style={styles.input} type="number" placeholder="0" value={p.taxRefund || ""} onChange={(e) => dispatch({ type: "UPDATE_PROFILE", payload: { taxRefund: parseFloat(e.target.value) || 0 } })} />
        </div>
        <div style={styles.field(1)}>
          <label style={styles.label}>Resident Physician?</label>
          <select style={{ ...styles.select, width: "100%" }} value={p.isResident ? "yes" : "no"} onChange={(e) => dispatch({ type: "UPDATE_PROFILE", payload: { isResident: e.target.value === "yes" } })}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const SECTIONS = [
  { key: "profile", label: "Profile", icon: "⚙" },
  { key: "income", label: "Income", icon: "💵" },
  { key: "expenses", label: "Expenses", icon: "📋" },
  { key: "projector", label: "Projector", icon: "📊" },
  { key: "tips", label: "Tips", icon: "💡" },
  { key: "loans", label: "Loans", icon: "🎓" },
  { key: "deadlines", label: "Deadlines", icon: "📅" },
  { key: "spending", label: "Fun Money", icon: "✈" },
  { key: "resident", label: "Residents", icon: "🩺" },
];

export default function FinanceDashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeSection, setActiveSection] = useState("profile");

  // Persist state to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("finance-dashboard-state");
      if (saved) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(saved) });
      }
    } catch (e) { /* no stored state yet */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("finance-dashboard-state", JSON.stringify(state));
    } catch (e) { /* storage unavailable */ }
  }, [state]);

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return <ProfileSection state={state} dispatch={dispatch} />;
      case "income": return <IncomeSection state={state} dispatch={dispatch} />;
      case "expenses": return <ExpenseSection state={state} dispatch={dispatch} />;
      case "projector": return <ProjectorSection state={state} />;
      case "tips": return <TipsSection state={state} />;
      case "loans": return <LoanSection state={state} dispatch={dispatch} />;
      case "deadlines": return <DeadlinesSection state={state} />;
      case "spending": return <SpendingCalcSection state={state} />;
      case "resident": return <ResidentSection state={state} />;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>FinPulse</h1>
        <p style={styles.headerSub}>Personal Finance Dashboard — Budget, Project, Optimize</p>
      </div>

      <nav style={styles.nav}>
        {SECTIONS.map((s) => (
          <button key={s.key} style={styles.navBtn(activeSection === s.key)} onClick={() => setActiveSection(s.key)}>
            {s.icon} {s.label}
          </button>
        ))}
      </nav>

      <div style={styles.content}>
        {renderSection()}

        <div style={styles.disclaimer}>
          <strong>Disclaimer:</strong> FinPulse is an educational budgeting and financial literacy tool. It does not provide personalized investment, tax, or legal advice.
          All financial guidance reflects general recommendations from financial professionals and publicly available resources.
          Retirement contribution limits, student loan forgiveness rules, and tax information are based on 2026 data and may change.
          Consult a licensed financial advisor, tax professional, or attorney for advice specific to your situation.
        </div>
      </div>
    </div>
  );
}
