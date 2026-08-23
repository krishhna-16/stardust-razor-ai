// STARDUST Central Derived Metrics Engine

/**
 * Validates whether a case is active based on APEX rules.
 * Genuinely unresolved cases.
 * RECOVERED and CLOSED are not active.
 * FAILED cases are active only if attempts are under 3.
 * ESCALATED is active.
 */
export const isActiveCase = (c) => {
  const status = (c.finalStatus || "PENDING").toUpperCase();
  if (status === "RECOVERED" || status === "CLOSED") return false;
  if (status === "FAILED") {
    const attempts = c.stoppingRules ? c.stoppingRules.previousAttempts : 0;
    return attempts < 3;
  }
  return true; // PENDING, ESCALATED, IN_RECOVERY, INTERVENED, etc.
};

/**
 * Calculates derived metrics for a set of cases.
 * 
 * @param {Array} cases 
 * @returns {Object} Metric collections
 */
export const calculateMetrics = (cases = []) => {
  // 1. Map transaction stats
  let totalRevenueAtRisk = 0;
  let recoveredRevenue = 0;
  let activeCases = 0;
  let terminalFailures = 0;
  let escalatedCases = 0;

  // Payments
  let paymentFailures = 0;
  let paymentRecovered = 0;
  let paymentRevenueAtRisk = 0;
  let paymentUnrecoveredRisk = 0;

  // Subscriptions
  let subscriptionFailures = 0;
  let subscriptionRecovered = 0;
  let subscriptionRevenueAtRisk = 0;
  let subscriptionUnrecoveredRisk = 0;

  // Invoices
  let overdueInvoices = 0;
  let invoiceRecovered = 0;
  let invoiceOutstandingAmount = 0;
  let invoiceUnrecoveredRisk = 0;

  // Checkout
  let abandonedCarts = 0;
  let checkoutRecovered = 0;
  let abandonedValueRisk = 0;
  let checkoutUnrecoveredRisk = 0;

  // Recovery & Strategy counts
  let activeRecoveryCases = 0;
  let recoveredCasesCount = 0;
  let failedCasesCount = 0;
  let escalatedCasesCount = 0;
  const strategyCounts = {};

  // Analytics strategy breakdown
  const strategyStats = {};

  cases.forEach((c) => {
    const amount = c.amount || 0;
    const status = (c.finalStatus || "PENDING").toUpperCase();
    const strategy = c.strategy || "SMART_RETRY";

    // Recovered result amount
    const recoveredAmount = status === "RECOVERED" ? amount : 0;

    // Unrecovered risk
    const unrecoveredRisk = status === "RECOVERED" ? 0 : amount;

    // Active status
    const active = isActiveCase(c);

    // Global Accumulations
    recoveredRevenue += recoveredAmount;
    totalRevenueAtRisk += unrecoveredRisk; // Sum unrecoveredRisk across applicable cases
    
    if (active) activeCases++;
    if (status === "FAILED" && !active) terminalFailures++;
    if (status === "ESCALATED") escalatedCases++;

    // Category mappings
    if (c.category === "payment_failure") {
      paymentFailures++;
      paymentRecovered += recoveredAmount;
      paymentUnrecoveredRisk += unrecoveredRisk;
      if (active) paymentRevenueAtRisk += amount;
    } else if (c.category === "subscription_failure") {
      subscriptionFailures++;
      subscriptionRecovered += recoveredAmount;
      subscriptionUnrecoveredRisk += unrecoveredRisk;
      if (active) subscriptionRevenueAtRisk += amount;
    } else if (c.category === "invoice_overdue") {
      overdueInvoices++;
      invoiceRecovered += recoveredAmount;
      invoiceUnrecoveredRisk += unrecoveredRisk;
      if (active) invoiceOutstandingAmount += amount;
    } else if (c.category === "checkout_abandonment") {
      abandonedCarts++;
      checkoutRecovered += recoveredAmount;
      checkoutUnrecoveredRisk += unrecoveredRisk;
      if (active) abandonedValueRisk += amount;
    }

    // Recovery counts
    if (active) {
      activeRecoveryCases++;
      strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
    }
    if (status === "RECOVERED") recoveredCasesCount++;
    if (status === "FAILED") failedCasesCount++;
    if (status === "ESCALATED") escalatedCasesCount++;

    // Strategy stats
    if (!strategyStats[strategy]) {
      strategyStats[strategy] = { total: 0, recovered: 0 };
    }
    strategyStats[strategy].total += 1;
    if (status === "RECOVERED") {
      strategyStats[strategy].recovered += 1;
    }
  });

  // Rates calculation helper
  const calcRate = (rec, unrec) => {
    const den = rec + unrec;
    return den > 0 ? (rec / den) * 100 : 0;
  };

  const globalRecoveryRate = calcRate(recoveredRevenue, totalRevenueAtRisk);
  const paymentRecoveryRate = calcRate(paymentRecovered, paymentUnrecoveredRisk);
  const subscriptionRecoveryRate = calcRate(subscriptionRecovered, subscriptionUnrecoveredRisk);
  const invoiceRecoveryRate = calcRate(invoiceRecovered, invoiceUnrecoveredRisk);
  const checkoutRecoveryRate = calcRate(checkoutRecovered, checkoutUnrecoveredRisk);

  return {
    global: {
      totalRevenueAtRisk,
      recoveredRevenue,
      activeCases,
      terminalFailures,
      escalatedCases,
      recoveryRate: globalRecoveryRate,
    },
    payments: {
      failuresIngested: paymentFailures,
      recovered: paymentRecovered,
      revenueAtRisk: paymentRevenueAtRisk,
      recoveryRate: paymentRecoveryRate,
    },
    subscriptions: {
      renewalsFailed: subscriptionFailures,
      recovered: subscriptionRecovered,
      revenueAtRisk: subscriptionRevenueAtRisk,
      recoveryRate: subscriptionRecoveryRate,
    },
    invoices: {
      invoicesOverdue: overdueInvoices,
      recovered: invoiceRecovered,
      revenueAtRisk: invoiceOutstandingAmount,
      recoveryRate: invoiceRecoveryRate,
    },
    checkout: {
      cartsAbandoned: abandonedCarts,
      recovered: checkoutRecovered,
      revenueAtRisk: abandonedValueRisk,
      recoveryRate: checkoutRecoveryRate,
    },
    recovery: {
      activeRecoveryCases,
      recoveredCases: recoveredCasesCount,
      failedCases: failedCasesCount,
      escalatedCases: escalatedCasesCount,
      strategyCounts,
    },
    analytics: {
      strategyStats,
      paymentFailuresCount: paymentFailures,
      subscriptionFailuresCount: subscriptionFailures,
      checkoutAbandonmentCount: abandonedCarts,
      overdueInvoicesCount: overdueInvoices,
    }
  };
};
