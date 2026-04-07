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
    { id: 1, category: "Budgeting", tip: "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings & debt repayment.", relevance: "Everyone — especially those new to budgeting or living paycheck to paycheck.", why: "Without a framework, spending tends to expand to fill income. This rule gives a simple starting structure that balances living expenses with long-term wealth building.", source: "General financial advisor consensus", links: [{ label: "NerdWallet: 50/30/20 Rule Explained", url: "https://www.nerdwallet.com/article/finance/nerdwallet-budget-calculator" }, { label: "Investopedia: Budgeting Basics", url: "https://www.investopedia.com/terms/b/budget.asp" }] },
    { id: 2, category: "Emergency Fund", tip: "Build an emergency fund covering 3-6 months of essential expenses before aggressive investing.", relevance: "Everyone — critical for single-income households, freelancers, and those without strong job security.", why: "Unexpected expenses (medical bills, car repairs, job loss) can derail your finances. Without a cash buffer, you may be forced to sell investments at a loss or take on high-interest debt.", source: "General financial advisor consensus", links: [{ label: "Vanguard: Emergency Fund Guide", url: "https://investor.vanguard.com/investor-resources-education/emergency-fund" }, { label: "CFPB: Building an Emergency Fund", url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/" }] },
    { id: 3, category: "Debt", tip: "Pay off high-interest debt (credit cards) before focusing on lower-interest obligations.", relevance: "Anyone carrying credit card or high-interest personal loan debt.", why: "Credit cards often charge 20-30% APR. No investment reliably returns that much, so paying off high-interest debt first is mathematically the best guaranteed return on your money.", source: "General financial advisor consensus", links: [{ label: "Federal Reserve: Credit Card Interest Rates", url: "https://www.federalreserve.gov/releases/g19/current/" }, { label: "NerdWallet: Debt Avalanche vs. Snowball", url: "https://www.nerdwallet.com/article/finance/what-is-a-debt-avalanche" }] },
    { id: 4, category: "Retirement", tip: "Financial advisors generally recommend saving 15% of gross income toward retirement, including any employer match.", relevance: "All working adults — the earlier you start, the less you need to save monthly.", why: "At 15% savings rate starting in your mid-20s, most people can replace 70-80% of pre-retirement income. Starting later requires a significantly higher rate to catch up.", source: "General financial advisor consensus", links: [{ label: "Fidelity: How Much to Save for Retirement", url: "https://www.fidelity.com/viewpoints/retirement/how-much-do-i-need-to-retire" }, { label: "Vanguard: Retirement Planning", url: "https://investor.vanguard.com/investor-resources-education/retirement" }] },
    { id: 5, category: "Roth IRA", tip: "For 2026, the Roth IRA contribution limit is $7,500 ($8,600 if 50+). Single filers phase out between $153K-$168K MAGI. Deadline: April 15, 2027.", relevance: "Anyone with earned income under the MAGI limits — especially valuable for younger earners in lower tax brackets.", why: "Roth IRA contributions grow tax-free and withdrawals in retirement are tax-free. If your tax rate is lower now than it will be in retirement, Roth contributions are extremely efficient.", source: "IRS / Vanguard", links: [{ label: "IRS: Roth IRA Contribution Limits", url: "https://www.irs.gov/retirement-plans/plan-participant-employee/amount-of-roth-ira-contributions-that-you-can-make-for-2024" }, { label: "Vanguard: Roth vs. Traditional IRA", url: "https://investor.vanguard.com/ira/roth-vs-traditional-ira" }, { label: "Investopedia: Roth IRA Guide", url: "https://www.investopedia.com/terms/r/rothira.asp" }] },
    { id: 6, category: "401(k)", tip: "The 2026 401(k) contribution limit is $24,500. Always contribute enough to get the full employer match — that's free money.", relevance: "Anyone with an employer-sponsored 401(k) or 403(b) plan.", why: "An employer match is an instant 50-100% return on your contribution. Not capturing the full match is literally leaving part of your compensation on the table.", source: "IRS", links: [{ label: "IRS: 401(k) Contribution Limits", url: "https://www.irs.gov/newsroom/401k-limit-increases-to-23500-for-2025" }, { label: "NerdWallet: How to Maximize Your 401(k)", url: "https://www.nerdwallet.com/article/investing/how-to-maximize-your-401k" }] },
    { id: 7, category: "Compound Interest", tip: "Starting to invest even small amounts early leverages compound interest. Time in the market beats timing the market.", relevance: "Young adults and anyone who hasn't started investing yet.", why: "At a 7% average annual return, $500/month starting at age 25 grows to ~$1.2M by 65. Waiting until 35 to start yields only ~$567K — less than half — despite only 10 fewer years of contributions.", source: "General financial advisor consensus", links: [{ label: "Investor.gov: Compound Interest Calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" }, { label: "Investopedia: The Power of Compound Interest", url: "https://www.investopedia.com/terms/c/compoundinterest.asp" }] },
    { id: 8, category: "Tax Strategy", tip: "Contribute to a Roth IRA when your income is low (e.g., during training) and traditional accounts when your income is high to optimize tax brackets.", relevance: "Anyone whose income will change significantly over their career — students, residents, early-career professionals.", why: "Roth contributions are taxed now at your current rate. If you're in the 12% bracket today but will be in the 32% bracket later, you save 20 cents on every dollar by contributing to Roth now.", source: "General financial advisor consensus", links: [{ label: "Investopedia: Roth vs. Traditional", url: "https://www.investopedia.com/retirement/roth-vs-traditional-ira-which-is-right-for-you/" }, { label: "Fidelity: Tax-Smart Retirement Strategies", url: "https://www.fidelity.com/viewpoints/retirement/tax-savvy-withdrawals" }] },
  ],
  residentPhysician: [
    { id: 101, category: "Student Loans", tip: "Get your student loans organized as a PGY-1. Understand whether PSLF or refinancing makes more sense for your situation.", relevance: "All medical residents and fellows with student loan debt.", why: "The average medical school debt is $200K+. Choosing the wrong repayment strategy (e.g., refinancing when you qualify for PSLF) can cost tens of thousands of dollars over the life of your loans.", source: "Money Meets Medicine / WealthKeel", links: [{ label: "StudentAid.gov: Loan Simulator", url: "https://studentaid.gov/loan-simulator/" }, { label: "AAMC: Medical School Debt Data", url: "https://www.aamc.org/data-reports/students-residents/report/medical-student-education-debt-first-year-residency" }] },
    { id: 102, category: "Roth IRA", tip: "Residency is a prime time to fund a Roth IRA — you're in a low tax bracket now compared to attending income. Max it out if possible.", relevance: "Residents and fellows earning $55K-$75K who will earn $250K+ as attendings.", why: "A resident in the 22% bracket contributing to Roth now avoids paying 32-37% tax on those same dollars as an attending. Over a 30-year career, this tax arbitrage can be worth $100K+.", source: "Money Meets Medicine / AMA", links: [{ label: "White Coat Investor: Roth IRA for Residents", url: "https://www.whitecoatinvestor.com/roth-ira/" }, { label: "Money Meets Medicine Podcast", url: "https://moneymeetsmedicine.com/podcast/" }] },
    { id: 103, category: "Employer Match", tip: "If your program offers a 401(k)/403(b) with employer match (typically 3-6%), contribute at least enough to capture the full match.", relevance: "Residents at programs that offer retirement plans with matching.", why: "Even on a tight resident salary, not capturing the match means leaving $1,500-$4,000/year on the table. That employer match, invested over 30+ years, can grow to $150K-$400K.", source: "AMA / Laurel Road", links: [{ label: "AMA: Resident Financial Planning", url: "https://www.ama-assn.org/residents-students/resident-student-finance" }, { label: "Laurel Road: Physician Financial Tips", url: "https://www.laurelroad.com/resource-center/" }] },
    { id: 104, category: "Disability Insurance", tip: "Buy own-occupation disability insurance during residency while you're young and healthy. Consider guaranteed standard issue (GSI) policies if available.", relevance: "All residents and fellows — your ability to earn is your most valuable asset.", why: "Physicians have specialty-specific skills. 'Own-occupation' coverage pays if you can't practice your specialty, even if you could do other work. Premiums are 30-50% cheaper when purchased in your late 20s vs. late 30s.", source: "Money Meets Medicine", links: [{ label: "White Coat Investor: Disability Insurance", url: "https://www.whitecoatinvestor.com/what-you-need-to-know-about-disability-insurance/" }, { label: "AMA Insurance: Disability for Residents", url: "https://www.amainsure.com/disability-insurance/" }] },
    { id: 105, category: "Lifestyle Creep", tip: "When you become an attending, try to live on your resident budget for 2-3 more years. Use the salary jump to eliminate debt and build wealth.", relevance: "Senior residents and new attendings transitioning from ~$65K to $250K+ income.", why: "The jump from resident to attending pay is often 3-5x. Living on your resident budget and directing the difference toward loans and investments can eliminate $200K+ in debt in 2-3 years and set you up for financial independence decades earlier.", source: "Money Meets Medicine / The Physician Philosopher", links: [{ label: "Physician Philosopher: Live Like a Resident", url: "https://thephysicianphilosopher.com/" }, { label: "White Coat Investor: New Attending Guide", url: "https://www.whitecoatinvestor.com/new-to-the-site/" }] },
    { id: 106, category: "Housing", tip: "Most financial advisors recommend renting during residency. Physician mortgage loans (0% down, no PMI) are tempting but come with hidden costs.", relevance: "Residents considering buying a home during a 3-7 year training period.", why: "Residency is temporary, and buying a home has ~8-10% transaction costs (closing costs, agent fees, repairs). In a 3-5 year residency, you're unlikely to build enough equity to break even vs. renting.", source: "WealthKeel / Money Meets Medicine", links: [{ label: "Money Meets Medicine: Renting vs. Buying", url: "https://moneymeetsmedicine.com/" }, { label: "NY Times: Rent vs. Buy Calculator", url: "https://www.nytimes.com/interactive/2014/upshot/buy-rent-calculator.html" }] },
    { id: 107, category: "Life Insurance", tip: "If you have a spouse, kids, or family who depend on you financially, get affordable term life insurance during training.", relevance: "Residents with dependents — spouse, children, or family members who rely on their future income.", why: "Your future earning potential ($5M-$10M+ over a career) is what your family depends on. A 20-30 year term policy is very affordable in your 20s-30s and protects your family from financial devastation.", source: "Money Meets Medicine", links: [{ label: "NerdWallet: Term Life Insurance Guide", url: "https://www.nerdwallet.com/article/insurance/term-life-insurance" }, { label: "White Coat Investor: Life Insurance", url: "https://www.whitecoatinvestor.com/what-you-need-to-know-about-life-insurance/" }] },
    { id: 108, category: "PSLF", tip: "If you work at a nonprofit hospital, you may qualify for Public Service Loan Forgiveness. Use income-driven repayment to minimize payments during training while payments count toward the 120 required.", relevance: "Residents at nonprofit or government-affiliated hospitals (the majority of training programs).", why: "PSLF forgives the remaining balance tax-free after 120 qualifying payments. For a physician with $250K in debt, this can mean $100K-$200K+ forgiven. Residency years count toward the 120 payments.", source: "StudentAid.gov / Money Meets Medicine", links: [{ label: "StudentAid.gov: PSLF Overview", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service" }, { label: "PSLF Help Tool", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/public-service-loan-forgiveness-application" }] },
    { id: 109, category: "Contract Review", tip: "Before signing your first attending contract, have it reviewed by a physician contract attorney. Look at compensation structure, non-compete clauses, and tail coverage.", relevance: "Senior residents and fellows approaching their first attending position.", why: "Attending contracts involve complex terms (RVU-based pay, restrictive covenants, malpractice tail coverage) that can cost you $50K-$200K if unfavorable. A contract review ($500-$1,500) pays for itself many times over.", source: "Money Meets Medicine", links: [{ label: "Contract Diagnostics", url: "https://contractdiagnostics.com/" }, { label: "AMA: Physician Employment Contracts", url: "https://www.ama-assn.org/practice-management/physician-employment-contracts" }] },
    { id: 110, category: "Investing", tip: "Keep investing simple — low-cost index funds are broadly recommended by financial advisors for physicians. Avoid complex products pitched by insurance salespeople.", relevance: "All physicians, especially those approached by financial product salespeople targeting high earners.", why: "Whole life insurance, variable annuities, and actively managed funds often carry 1-3% annual fees. Over a career, that fee drag can cost $500K-$1M+ compared to simple index funds with 0.03-0.10% fees.", source: "Money Meets Medicine / Physician Philosopher", links: [{ label: "Bogleheads: Three-Fund Portfolio", url: "https://www.bogleheads.org/wiki/Three-fund_portfolio" }, { label: "White Coat Investor: Investing Basics", url: "https://www.whitecoatinvestor.com/investing/" }] },
    { id: 111, category: "Hidden Fees", tip: "Check your 401(k) for hidden fees. High expense ratios can cost thousands over a career. Look for funds with expense ratios under 0.20%.", relevance: "Everyone with a 401(k), especially at smaller employers or hospital systems with limited plan options.", why: "A 1% difference in expense ratios on a $1M portfolio costs $10,000/year. Over 30 years with compounding, high fees can reduce your retirement savings by 25-30%.", source: "Money Meets Medicine", links: [{ label: "NerdWallet: 401(k) Fee Checker", url: "https://www.nerdwallet.com/article/investing/401k-fees" }, { label: "DOL: Understanding Retirement Plan Fees", url: "https://www.dol.gov/sites/dolgov/files/EBSA/about-ebsa/our-activities/resource-center/publications/a-look-at-401k-plan-fees.pdf" }] },
    { id: 112, category: "Budgeting", tip: "The average resident nets around $4,000/month after taxes and deductions. Create a budget from day one — it's the foundation for everything else.", relevance: "Incoming PGY-1 residents starting their first real paycheck.", why: "After years of living on loans, a regular paycheck can feel like a lot — but $4K/month goes fast between rent, loan payments, insurance, and living expenses. A budget prevents lifestyle inflation and ensures you fund priorities like Roth IRA and emergency savings.", source: "AMA / CFP Chad Chubb", links: [{ label: "Medscape: Resident Salary Report", url: "https://www.medscape.com/slideshow/2024-residents-salary-debt-report-6017187" }, { label: "AMA: Resident Financial Planning", url: "https://www.ama-assn.org/residents-students/resident-student-finance" }] },
  ],
  loanForgiveness: [
    { id: 201, category: "PSLF", tip: "Public Service Loan Forgiveness requires 120 qualifying payments while working full-time for a qualifying employer (government or nonprofit). Forgiveness under PSLF is not taxable.", relevance: "Anyone with federal Direct Loans working for government or 501(c)(3) nonprofit employers.", why: "PSLF is the most powerful loan forgiveness program available. For borrowers with large balances ($150K+), the tax-free forgiveness can save $100K-$300K compared to standard repayment.", source: "StudentAid.gov", links: [{ label: "StudentAid.gov: PSLF Program", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service" }, { label: "PSLF Employer Search", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/employer-search" }] },
    { id: 202, category: "IDR Forgiveness", tip: "Income-driven repayment plans forgive remaining balances after 20-25 years, but starting in 2026, this forgiveness may be taxable income. PSLF forgiveness remains tax-free.", relevance: "Borrowers on IDR plans who won't qualify for PSLF and will rely on 20-25 year forgiveness.", why: "A $200K forgiven balance taxed as income could create a $50K-$70K 'tax bomb.' Planning ahead — by saving in a sinking fund or exploring PSLF eligibility — prevents a devastating surprise bill.", source: "NASFAA / IRS", links: [{ label: "IRS: Student Loan Forgiveness & Taxes", url: "https://www.irs.gov/newsroom/tax-relief-for-student-loan-forgiveness" }, { label: "NASFAA: IDR Forgiveness", url: "https://www.nasfaa.org/" }] },
    { id: 203, category: "New Rules July 2026", tip: "Starting July 1, 2026, new borrowers will only have two repayment options: Standard Repayment Plan and the new Repayment Assistance Plan (RAP). Existing borrowers must switch to valid plans by July 1, 2028.", relevance: "All federal student loan borrowers — especially those starting repayment after July 2026.", why: "The repayment landscape is being simplified but also restricted. Understanding the new RAP plan's terms (payment calculation, forgiveness timeline) is essential to making the right choice before legacy plans are phased out.", source: "Dept. of Education / OBBBA", links: [{ label: "Federal Student Aid: Repayment Plans", url: "https://studentaid.gov/manage-loans/repayment/plans" }, { label: "Dept. of Education: OBBBA Overview", url: "https://www.ed.gov/" }] },
    { id: 204, category: "PSLF Changes", tip: "New PSLF rules effective July 1, 2026 may change which employers qualify. Submit Employment Certification Forms regularly to track your progress.", relevance: "Current and future PSLF participants — especially those mid-way through their 120 payments.", why: "If employer qualification rules change, you need documentation proving your past employment qualified under the prior rules. Regular ECF submissions create a paper trail that protects your progress.", source: "Dept. of Education", links: [{ label: "PSLF Help Tool & ECF", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service/public-service-loan-forgiveness-application" }, { label: "Federal Student Aid: PSLF FAQ", url: "https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service" }] },
    { id: 205, category: "Tax Refund Strategy", tip: "Applying your tax refund as a lump sum payment early in the year reduces principal faster, saving more on interest compared to spreading payments throughout the year.", relevance: "Anyone with student loans or other debt who receives a tax refund.", why: "Interest accrues daily on your principal balance. A $3,000 lump sum payment in February reduces the principal that accrues interest for the remaining 10+ months, saving more than making $250/month extra payments.", source: "General financial advisor consensus", links: [{ label: "Investopedia: Should You Use Your Tax Refund to Pay Debt?", url: "https://www.investopedia.com/articles/personal-finance/tax-refund-pay-off-debt.asp" }] },
    { id: 206, category: "Consolidation", tip: "If you have FFEL loans and want PSLF eligibility, consolidate into a Direct Consolidation Loan before July 1, 2026 to maintain access to income-driven repayment options.", relevance: "Borrowers with older Federal Family Education Loan (FFEL) program loans seeking PSLF.", why: "FFEL loans don't qualify for PSLF. Consolidating into a Direct Loan makes them eligible — but after July 2026, consolidation rules may change under new regulations. Acting before the deadline preserves your options.", source: "FinAid.org", links: [{ label: "StudentAid.gov: Loan Consolidation", url: "https://studentaid.gov/manage-loans/consolidation" }, { label: "FinAid: Consolidation Guide", url: "https://finaid.org/loans/consolidation/" }] },
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
  const totalBudgeted = state.expenseCategories.reduce((s, c) => s + (parseFloat(c.budgeted) || 0), 0);
  const monthlySurplus = monthlyIncome - totalBudgeted;
  const savingsRate = monthlyIncome > 0 && totalBudgeted > 0 ? monthlySurplus / monthlyIncome : 0;
  const totalLoanBalance = state.loans.reduce((s, l) => s + (parseFloat(l.balance) || 0), 0);
  const avgLoanRate = state.loans.length > 0 ? state.loans.reduce((s, l) => s + (parseFloat(l.rate) || 0), 0) / state.loans.length : 0;
  const highInterestLoans = state.loans.filter((l) => (parseFloat(l.rate) || 0) >= 6);
  const age = state.profile.age || 28;
  const magi = state.profile.agi || annualIncome;
  const isResident = state.profile.isResident;
  const filingStatus = state.profile.filingStatus;
  const taxRefund = parseFloat(state.profile.taxRefund) || 0;

  // ── No data yet — prompt user to fill in info ──
  if (state.incomes.length === 0 && state.loans.length === 0 && state.expenseCategories.length === 0) {
    tips.push({ type: "info", category: "Get Started", message: "Add your income, expenses, and loans to get personalized financial guidance. The more information you provide, the more specific your action plan will be." });
    return tips;
  }

  // ── YOUR FINANCIAL SNAPSHOT ──
  if (monthlyIncome > 0) {
    let snapshot = `You're bringing in ${fmt(monthlyIncome)}/month (${fmt(annualIncome)}/year).`;
    if (totalBudgeted > 0) {
      snapshot += ` After your budgeted expenses of ${fmt(totalBudgeted)}/month, you have ${fmt(monthlySurplus)}/month (${pct(savingsRate)}) available for savings, investing, and debt payoff.`;
    }
    if (totalLoanBalance > 0) {
      snapshot += ` You're carrying ${fmt(totalLoanBalance)} in total loan debt at an average rate of ${avgLoanRate.toFixed(1)}%.`;
    }
    tips.push({ type: "info", category: "Your Snapshot", message: snapshot });
  }

  // ── PERSONALIZED ACTION PLAN ──
  // Build a priority-ordered plan based on actual finances
  if (monthlyIncome > 0) {
    const actions = [];
    const rothLimit = age >= 50 ? 8600 : 7500;
    const rothMonthly = Math.round(rothLimit / 12);
    const limits = filingStatus === "married" ? FINANCIAL_CONSTANTS.rothIRA.marriedPhaseOut : FINANCIAL_CONSTANTS.rothIRA.singlePhaseOut;
    const rothEligible = magi < limits[1];

    // Step 1: Emergency fund check
    const emergencyTarget = totalBudgeted > 0 ? totalBudgeted * 3 : monthlyIncome * 3;
    actions.push(`Build a ${fmt(emergencyTarget)} to ${fmt(emergencyTarget * 2)} emergency fund (3-6 months of expenses). Keep it in a high-yield savings account earning 4-5% APY.`);

    // Step 2: High-interest debt
    if (highInterestLoans.length > 0) {
      const hiBalance = highInterestLoans.reduce((s, l) => s + (parseFloat(l.balance) || 0), 0);
      const hiRate = Math.max(...highInterestLoans.map((l) => parseFloat(l.rate) || 0));
      actions.push(`Aggressively pay down your ${fmt(hiBalance)} in high-interest debt (${hiRate.toFixed(1)}%+). At these rates, every ${fmt(1000)} extra payment saves you ${fmt(Math.round(1000 * hiRate / 100))}/year in interest. Consider the avalanche method — target the highest rate first.`);
    }

    // Step 3: Employer match
    actions.push(`If your employer offers a 401(k) match, contribute at least enough to get the full match before doing anything else — it's an instant 50-100% return. Even 3% of ${fmt(annualIncome)} is ${fmt(Math.round(annualIncome * 0.03))}/year.`);

    // Step 4: Roth IRA
    if (rothEligible) {
      if (magi < limits[0]) {
        if (isResident) {
          actions.push(`You qualify for full Roth IRA contributions. As a resident, this is one of your best moves — you're in a low tax bracket now, but your attending salary will push you into a much higher one. Max out at ${fmt(rothLimit)}/year (${fmt(rothMonthly)}/month). Every dollar you put in now grows tax-free forever.`);
        } else if (age < 35) {
          actions.push(`You qualify for full Roth IRA contributions of ${fmt(rothLimit)}/year (${fmt(rothMonthly)}/month). At age ${age}, you have ${65 - age} years of tax-free growth ahead. If you max it out every year, at 7% average return that's roughly ${fmt(Math.round(rothLimit * (Math.pow(1.07, 65 - age) - 1) / 0.07))} by age 65.`);
        } else {
          actions.push(`You qualify for full Roth IRA contributions of ${fmt(rothLimit)}/year (${fmt(rothMonthly)}/month). At age ${age}, maximizing tax-free growth is important — prioritize this alongside your 401(k).`);
        }
      } else {
        actions.push(`Your income (${fmt(magi)}) falls in the Roth IRA phase-out range (${fmt(limits[0])} - ${fmt(limits[1])}). Your direct contribution is reduced, but you can use the backdoor Roth IRA strategy: contribute to a traditional IRA, then convert to Roth. Talk to a CPA to ensure you do this correctly.`);
      }
    } else if (annualIncome > 0) {
      actions.push(`Your income (${fmt(magi)}) exceeds the Roth IRA direct contribution limit. Use the backdoor Roth IRA strategy: contribute ${fmt(rothLimit)} to a traditional IRA, then convert to Roth. This is widely used and IRS-permitted, but consult a CPA about pro-rata rules if you have existing traditional IRA balances.`);
    }

    // Step 5: Max 401(k)
    const max401k = age >= 60 && age <= 63 ? FINANCIAL_CONSTANTS.four01k.catchUp60_63 : age >= 50 ? FINANCIAL_CONSTANTS.four01k.catchUp50 : FINANCIAL_CONSTANTS.four01k.limit;
    if (monthlySurplus > rothMonthly + 500) {
      actions.push(`After Roth IRA, push your 401(k) toward the ${fmt(max401k)} limit if possible. That's ${fmt(Math.round(max401k / 12))}/month. This reduces your taxable income by the full contribution amount, saving you ${fmt(Math.round(max401k * (annualIncome > 190000 ? 0.32 : annualIncome > 89000 ? 0.24 : annualIncome > 41000 ? 0.22 : 0.12)))}/year in taxes.`);
    }

    // Step 6: Loan strategy
    if (totalLoanBalance > 0 && highInterestLoans.length === 0) {
      if (isResident && totalLoanBalance > 100000) {
        actions.push(`With ${fmt(totalLoanBalance)} in loans at moderate rates (avg ${avgLoanRate.toFixed(1)}%), don't rush to pay them off during residency. If you're at a nonprofit hospital, enroll in an income-driven repayment plan and start PSLF qualification. Your low resident income means low payments, and every payment counts toward the 120 required for forgiveness.`);
      } else if (avgLoanRate < 5) {
        actions.push(`Your ${fmt(totalLoanBalance)} in loans at ${avgLoanRate.toFixed(1)}% average rate is relatively low-cost debt. Since the stock market historically returns 7-10%/year, you may benefit more from investing extra cash rather than aggressively paying down these loans. Make minimum payments and invest the difference.`);
      } else {
        actions.push(`Consider splitting extra cash between investing and accelerating your ${fmt(totalLoanBalance)} in loan payoff. At ${avgLoanRate.toFixed(1)}% average interest, paying an extra ${fmt(200)}/month would save you ${fmt(Math.round(totalLoanBalance * avgLoanRate / 100 * 0.15))} in interest over the life of the loans.`);
      }
    }

    // Step 7: Tax refund strategy
    if (taxRefund > 500) {
      if (totalLoanBalance > 0 && highInterestLoans.length > 0) {
        actions.push(`Your ${fmt(taxRefund)} tax refund should go directly toward your highest-interest debt. Applying it as a lump sum early in the year reduces the principal that accrues daily interest, saving more than spreading it out.`);
      } else if (rothEligible) {
        actions.push(`Consider putting your ${fmt(taxRefund)} tax refund directly into your Roth IRA. That's ${pct(taxRefund / rothLimit)} of your annual limit covered in one move, and every dollar starts compounding tax-free immediately.`);
      } else {
        actions.push(`Your ${fmt(taxRefund)} tax refund is a great lump sum for investing. Consider putting it into a brokerage account in a low-cost total market index fund.`);
      }
    }

    if (actions.length > 0) {
      tips.push({ type: "info", category: "Your Action Plan", message: `Based on your finances, here's your recommended priority order:\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join("\n\n")}` });
    }
  }

  // ── SPENDING ALERTS ──
  state.expenseCategories.forEach((cat) => {
    const budget = parseFloat(cat.budgeted) || 0;
    if (budget <= 0) return;
    const spent = currentTx.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const spendPct = spent / budget;

    if (spendPct > 1) {
      tips.push({ type: "warning", category: cat.name, message: `You've exceeded your ${cat.name} budget by ${fmt(spent - budget)}. That's ${fmt((spent - budget) * 12)}/year if this repeats monthly. Look for where to cut back — even small recurring expenses add up.` });
    } else if (spendPct > 0.8 && monthProgress < 0.7) {
      tips.push({ type: "caution", category: cat.name, message: `You've spent ${fmt(spent)} of your ${fmt(budget)} ${cat.name} budget (${pct(spendPct)}) but you're only ${pct(monthProgress)} through the month. You have about ${fmt(budget - spent)} left for the next ${Math.round((1 - monthProgress) * daysInMonth)} days — that's roughly ${fmt(Math.round((budget - spent) / Math.max(1, Math.round((1 - monthProgress) * daysInMonth))))} per day.` });
    } else if (spendPct < 0.5 && monthProgress > 0.7) {
      const surplus = budget - spent;
      tips.push({ type: "positive", category: cat.name, message: `Great job on ${cat.name}! You've only used ${pct(spendPct)} with ${Math.round((1 - monthProgress) * daysInMonth)} days left. That ${fmt(surplus)} surplus could go toward your savings goals or debt payoff.` });
    }
  });

  // ── SAVINGS RATE ASSESSMENT ──
  if (monthlyIncome > 0 && totalBudgeted > 0) {
    if (savingsRate < 0) {
      tips.push({ type: "warning", category: "Budget Gap", message: `Your expenses exceed your income by ${fmt(Math.abs(monthlySurplus))}/month (${fmt(Math.abs(monthlySurplus) * 12)}/year). This is unsustainable. Review your expense categories to find what you can cut. Start with the largest discretionary categories.` });
    } else if (savingsRate < 0.1) {
      const neededCut = Math.round(monthlyIncome * 0.2 - monthlySurplus);
      tips.push({ type: "warning", category: "Savings Rate", message: `Your savings rate is only ${pct(savingsRate)} — you're saving ${fmt(monthlySurplus)}/month. To reach the recommended 20%, you'd need to free up an additional ${fmt(neededCut)}/month. Look at your top 2-3 expense categories for potential cuts.` });
    } else if (savingsRate < 0.2) {
      const neededCut = Math.round(monthlyIncome * 0.2 - monthlySurplus);
      tips.push({ type: "caution", category: "Savings Rate", message: `Your savings rate is ${pct(savingsRate)} (${fmt(monthlySurplus)}/month). You're close to the 20% target — just ${fmt(neededCut)}/month more would get you there. Even small adjustments to dining out or subscriptions could close this gap.` });
    } else if (savingsRate >= 0.3) {
      tips.push({ type: "positive", category: "Savings Rate", message: `Excellent — your savings rate is ${pct(savingsRate)} (${fmt(monthlySurplus)}/month). You're well above the 20% target. At this rate, you're on a strong path toward financial independence. Make sure this surplus is actually being invested, not sitting idle in a checking account.` });
    } else {
      tips.push({ type: "positive", category: "Savings Rate", message: `Your savings rate is ${pct(savingsRate)} (${fmt(monthlySurplus)}/month) — you're meeting the 20% target. Keep it up, and make sure this money is working for you in retirement accounts or investments.` });
    }
  }

  // ── RESIDENT-SPECIFIC GUIDANCE ──
  if (isResident && monthlyIncome > 0) {
    if (totalLoanBalance > 150000) {
      tips.push({ type: "info", category: "Resident Strategy", message: `With ${fmt(totalLoanBalance)} in student loans on a resident salary, PSLF is likely your best path if you're at a qualifying nonprofit employer. Enroll in PAYE or REPAYE to minimize payments during training — your payments could be as low as ${fmt(Math.round((annualIncome - 26000) * 0.10 / 12))}/month on income-driven repayment. Every payment counts toward the 120 needed for tax-free forgiveness.` });
    }
    if (annualIncome < 90000) {
      tips.push({ type: "positive", category: "Resident Tax Advantage", message: `At ${fmt(annualIncome)}/year, you're in the ${annualIncome > 44725 ? "22%" : "12%"} federal tax bracket — likely the lowest bracket you'll ever be in as a physician. This makes Roth contributions extremely valuable right now. Once you're an attending at $250K+, you'll be in the 32-35% bracket and these Roth dollars would cost much more to contribute.` });
    }
  }

  // ── AGE-BASED GUIDANCE ──
  if (annualIncome > 0) {
    if (age < 30) {
      const yearsToRetire = 65 - age;
      tips.push({ type: "info", category: "Time Advantage", message: `At age ${age}, time is your greatest asset. Even ${fmt(300)}/month invested at 7% average return grows to roughly ${fmt(Math.round(300 * (Math.pow(1 + 0.07 / 12, yearsToRetire * 12) - 1) / (0.07 / 12)))} by age 65. Don't wait for the "perfect" time — start now and increase contributions as your income grows.` });
    } else if (age >= 50 && age < 60) {
      tips.push({ type: "info", category: "Catch-Up Contributions", message: `At age ${age}, you qualify for catch-up contributions: ${fmt(FINANCIAL_CONSTANTS.four01k.catchUp50)}/year in your 401(k) and ${fmt(8600)}/year in your IRA. These extra limits are designed for people in your situation — use them to accelerate your retirement savings in these final working years.` });
    } else if (age >= 60 && age <= 63) {
      tips.push({ type: "positive", category: "Super Catch-Up", message: `Ages 60-63 have the highest 401(k) catch-up limit: ${fmt(FINANCIAL_CONSTANTS.four01k.catchUp60_63)}/year. This is a limited window — maximize these contributions while you can. That's ${fmt(Math.round(FINANCIAL_CONSTANTS.four01k.catchUp60_63 / 12))}/month to shelter from taxes.` });
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
    padding: "16px 18px",
    marginBottom: "20px",
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
    padding: "14px 16px",
    background: colors.inputBg,
    borderRadius: "8px",
    marginBottom: "16px",
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
  const monthlyIncome = getMonthlyIncome(state.incomes);

  const RECOMMENDED_CATEGORIES = [
    { name: "Housing (Rent/Mortgage)", pct: 0.25, note: "Includes rent or mortgage, property tax, insurance" },
    { name: "Utilities", pct: 0.05, note: "Electric, gas, water, internet, phone" },
    { name: "Groceries", pct: 0.10, note: "Food and household essentials" },
    { name: "Transportation", pct: 0.10, note: "Car payment, gas, insurance, maintenance, or transit" },
    { name: "Health & Insurance", pct: 0.05, note: "Premiums, copays, prescriptions, dental" },
    { name: "Dining & Entertainment", pct: 0.05, note: "Restaurants, takeout, streaming, hobbies" },
    { name: "Personal & Clothing", pct: 0.05, note: "Clothing, haircuts, personal care" },
    { name: "Subscriptions & Misc", pct: 0.03, note: "Apps, memberships, miscellaneous" },
    { name: "Debt Payments", pct: 0.10, note: "Student loans, credit cards, personal loans" },
    { name: "Savings & Investing", pct: 0.20, note: "Emergency fund, Roth IRA, 401(k), brokerage" },
  ];

  // Check which recommended categories the user has already added (fuzzy match)
  const hasCategory = (recName) => {
    const keywords = recName.toLowerCase().split(/[\s/()&,]+/).filter((w) => w.length > 2);
    return state.expenseCategories.some((cat) => {
      const catLower = cat.name.toLowerCase();
      return keywords.some((kw) => catLower.includes(kw));
    });
  };

  return (
    <div>
      {monthlyIncome > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Recommended Monthly Budget</div>
          <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "16px", lineHeight: 1.6 }}>
            Based on your <strong style={{ color: colors.green }}>{fmt(monthlyIncome)}/month</strong> income, here's a suggested budget breakdown. These percentages follow standard financial planning guidelines — adjust to fit your situation.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px" }}>
            {RECOMMENDED_CATEGORIES.map((rec) => {
              const amount = Math.round(monthlyIncome * rec.pct);
              const alreadyAdded = hasCategory(rec.name);
              const isSavings = rec.pct >= 0.2;
              const bgColor = isSavings ? colors.greenDim : colors.inputBg;
              const borderColor = isSavings ? colors.green : alreadyAdded ? colors.accent : colors.border;
              return (
                <div key={rec.name} style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: "10px", padding: "14px 16px", position: "relative" }}>
                  {alreadyAdded && (
                    <span style={{ position: "absolute", top: "8px", right: "10px", fontSize: "10px", color: colors.green, fontWeight: 700 }}>ADDED</span>
                  )}
                  <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px", color: isSavings ? colors.green : colors.text }}>{rec.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: isSavings ? colors.green : colors.accent }}>{fmt(amount)}</span>
                    <span style={{ fontSize: "12px", color: colors.textDim }}>{Math.round(rec.pct * 100)}% of income</span>
                  </div>
                  <div style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.4 }}>{rec.note}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "12px", fontStyle: "italic", lineHeight: 1.5 }}>
            These add up to ~98% of income, leaving a small buffer. The 50/30/20 rule: ~50% for needs (housing, utilities, groceries, transport, health), ~30% for wants (dining, personal, subscriptions), ~20% for savings and debt. Adjust based on your priorities — if you have no debt, redirect that 10% to savings.
          </div>
        </div>
      )}

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
          <div style={styles.cardTitle}>Your Personalized Financial Guidance</div>
          <div style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "16px", fontStyle: "italic" }}>
            Based on the income, expenses, loans, and profile information you've entered. Update your data for more accurate recommendations.
          </div>
          {dynamicTips.map((tip, i) => (
            <div key={i} style={styles.tipCard(tip.type)}>
              <span style={{ ...styles.tag, background: tip.type === "warning" ? colors.red : tip.type === "caution" ? colors.yellow : tip.type === "positive" ? colors.green : colors.accent, color: colors.bg }}>
                {tip.category}
              </span>
              <div style={{ fontSize: "13px", lineHeight: 1.8, whiteSpace: "pre-line" }}>{tip.message}</div>
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
            {tip.relevance && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "6px" }}><strong style={{ color: colors.accent }}>Who this is for:</strong> {tip.relevance}</div>}
            {tip.why && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "4px" }}><strong style={{ color: colors.accent }}>Why it matters:</strong> {tip.why}</div>}
            {tip.links && tip.links.length > 0 && (
              <div style={{ fontSize: "11px", marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tip.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: "underline" }}>{link.label}</a>
                ))}
              </div>
            )}
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
            {tip.relevance && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "6px" }}><strong style={{ color: colors.accent }}>Who this is for:</strong> {tip.relevance}</div>}
            {tip.why && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "4px" }}><strong style={{ color: colors.accent }}>Why it matters:</strong> {tip.why}</div>}
            {tip.links && tip.links.length > 0 && (
              <div style={{ fontSize: "11px", marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tip.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: "underline" }}>{link.label}</a>
                ))}
              </div>
            )}
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
            {tip.relevance && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "6px" }}><strong style={{ color: colors.accent }}>Who this is for:</strong> {tip.relevance}</div>}
            {tip.why && <div style={{ fontSize: "12px", color: colors.textDim, marginTop: "4px" }}><strong style={{ color: colors.accent }}>Why it matters:</strong> {tip.why}</div>}
            {tip.links && tip.links.length > 0 && (
              <div style={{ fontSize: "11px", marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tip.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: "underline" }}>{link.label}</a>
                ))}
              </div>
            )}
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
