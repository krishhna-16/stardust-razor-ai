// APEX 1.0 - Recovery Simulation Engine
// Simulates billing interventions and calculates deterministic recovery outcomes.
// Pure JS: Decoupled and modular logic.

const STRATEGY_ACTION_MAPS = {
  SMART_RETRY: {
    action: "RETRIED_PAYMENT",
    status: "success",
    message: "Simulated charge retried during customer's optimal payment window.",
  },
  RETRY: {
    action: "RETRIED_PAYMENT_SECONDARY",
    status: "success",
    message: "Simulated immediate charge retried on secondary acquirer routing.",
  },
  PAYMENT_METHOD_UPDATE: {
    action: "UPDATER_LINK_DISPATCHED",
    status: "pending",
    message: "Simulated secure credit card updater link sent via SMS and email channels.",
  },
  CUSTOMER_SUPPORT_DUNNING: {
    action: "ESCALATED_SUPPORT_TICKET",
    status: "pending",
    message: "Simulated support alert created. Case details transferred to merchant finance desk.",
  },
  SUBSCRIPTION_RETRY: {
    action: "SUBSCRIPTION_RETRY_TRIGGERED",
    status: "success",
    message: "Simulated subscription renewal charge triggered.",
  },
  CHECKOUT_RECOVERY: {
    action: "CHECKOUT_LINK_DISPATCHED",
    status: "pending",
    message: "Simulated dunning checkout link dispatched to consumer profile.",
  },
  RECEIVABLES_CHASE: {
    action: "INVOICE_DUNNING_DISPATCHED",
    status: "pending",
    message: "Simulated accounts receivable notice sent to corporate billing contact.",
  },
};

/**
 * Executes the selected strategy in a SAFE SIMULATION layer only.
 * Returns structured information.
 */
export const simulateIntervention = (strategy, attemptNumber = 1) => {
  const mapping = STRATEGY_ACTION_MAPS[strategy] || {
    action: "GENERIC_INTERVENTION",
    status: "pending",
    message: "Simulated generic recovery intervention action triggered.",
  };

  return {
    action: mapping.action,
    status: mapping.status,
    attemptNumber: attemptNumber,
    simulated: true,
    message: mapping.message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Simulates a recovery outcome using deterministic mock behavior.
 * Low recoverability cases fail, high/medium succeed.
 */
export const simulateRecovery = (strategy, recoverability, amount) => {
  // Deterministic checks
  const isHigh = recoverability === "high";
  const isMedium = recoverability === "medium";
  const isLow = recoverability === "low";

  let isRecovered = false;
  let finalStatus = "Failed";
  let resolvedAmount = 0;
  let reasonDetails = "";

  if (strategy === "CUSTOMER_SUPPORT_DUNNING") {
    // If escalated to support, the automated layer lists it as Escalated, not recovered yet
    isRecovered = false;
    finalStatus = "Escalated";
    resolvedAmount = 0;
    reasonDetails = "Automated retry bounds reached. Transferred case to support queue.";
  } else if (isHigh) {
    isRecovered = true;
    finalStatus = "Recovered";
    resolvedAmount = amount;
    reasonDetails = "Simulated automated transaction cleared acquirer gateway successfully.";
  } else if (isMedium) {
    isRecovered = true;
    finalStatus = "Recovered";
    resolvedAmount = amount;
    reasonDetails = "Simulated dunning notification updated. Customer paid via fallback checkout.";
  } else {
    // Low recoverability
    isRecovered = false;
    finalStatus = "Failed";
    resolvedAmount = 0;
    reasonDetails = "Simulated acquirer return code: decline code reported by issuer.";
  }

  return {
    recovered: isRecovered,
    recoveredAmount: resolvedAmount,
    status: finalStatus,
    reason: reasonDetails,
  };
};
