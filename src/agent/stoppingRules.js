// APEX 1.0 - Stopping Rules Safety Module
// Enforces hard execution guardrails, preventing recursive retries or duplicate billing.
// Pure JS: Decoupled and modular logic.

/**
 * Checks safety bounds and returns whether the pipeline should stop execution.
 * 
 * @param {object} event The original event payload
 * @param {object} decision The resolved decision object from decisionEngine
 * @param {number} previousAttempts Count of past recovery retries
 * @param {string} currentStatus Current status of the collection case (e.g. "Recovered", "Escalated")
 * @returns {object} { shouldStop: boolean, reason: string }
 */
export const checkStoppingRules = (event, decision, previousAttempts = 0, currentStatus = "") => {
  // 1. Contract Validation Gates
  if (!event || typeof event !== "object") {
    return {
      shouldStop: true,
      reason: "Invalid event payload format",
    };
  }

  if (!decision || typeof decision !== "object" || !decision.strategy) {
    return {
      shouldStop: true,
      reason: "Invalid or missing recovery decision",
    };
  }

  const normalizedStatus = (currentStatus || event.status || "").toLowerCase();

  // 2. Already Recovered Gate
  if (normalizedStatus === "recovered" || normalizedStatus === "recovering_success") {
    return {
      shouldStop: true,
      reason: "Payment is already recovered",
    };
  }

  // Already Closed Gate
  if (normalizedStatus === "closed") {
    return {
      shouldStop: true,
      reason: "Case is closed and finalized",
    };
  }

  // 3. Maximum retry limit gate
  if (previousAttempts >= 3) {
    return {
      shouldStop: true,
      reason: "Maximum retry attempts exceeded (limit 3)",
    };
  }

  // 4. Manual Escalation Gate
  // If the case is already escalated or has transitioned to a customer support/manual dunning strategy,
  // we must halt automated engine execution immediately.
  if (
    normalizedStatus === "escalated" ||
    decision.strategy === "CUSTOMER_SUPPORT_DUNNING" ||
    decision.strategy === "RECEIVABLES_CHASE"
  ) {
    return {
      shouldStop: true,
      reason: "Case is escalated to manual account management",
    };
  }

  // 5. Baseline Safe Execution Gate
  return {
    shouldStop: false,
    reason: "Safe for automated execution",
  };
};
