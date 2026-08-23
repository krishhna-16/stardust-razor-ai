// APEX 1.0 - Core Decision Engine
// Evaluates risk vectors, assesses attempt count histories, and decides recovery strategies.
// Pure JS: Decoupled and modular logic.

const STRATEGY_MAPS = {
  insufficient_funds: {
    strategy: "SMART_RETRY",
    nextAction: "schedule_optimal_window_retry",
  },
  subscription_insufficient_funds: {
    strategy: "SMART_RETRY",
    nextAction: "schedule_optimal_window_retry",
  },
  expired_payment_method: {
    strategy: "PAYMENT_METHOD_UPDATE",
    nextAction: "send_updater_link",
  },
  subscription_payment_method_expired: {
    strategy: "PAYMENT_METHOD_UPDATE",
    nextAction: "send_updater_link",
  },
  issuer_decline: {
    strategy: "CUSTOMER_SUPPORT_DUNNING",
    nextAction: "escalate_to_account_manager",
  },
  network_gateway_decline: {
    strategy: "RETRY",
    nextAction: "retry_secondary_gateway",
  },
  subscription_billing_error: {
    strategy: "SUBSCRIPTION_RETRY",
    nextAction: "trigger_subscription_dunning",
  },
  shopping_cart_abandonment: {
    strategy: "CHECKOUT_RECOVERY",
    nextAction: "dispatch_abandoned_cart_link",
  },
  receivables_overdue: {
    strategy: "RECEIVABLES_CHASE",
    nextAction: "dispatch_invoice_chaser",
  },
};

const RECOVERABILITY_CONFIDENCE = {
  high: 85,
  medium: 60,
  low: 25,
};

/**
 * Recommends the safest recovery strategy based on event diagnosis and history
 */
export const decideRecoveryAction = (threatReport, previousAttempts = 0) => {
  if (!threatReport || typeof threatReport !== "object") {
    throw new Error("Threat report payload must be a non-null object for decision analysis");
  }

  const { diagnosis, recoverability, priority, category } = threatReport;

  if (!diagnosis || !recoverability) {
    throw new Error("Threat report must contain valid diagnosis and recoverability tags");
  }

  let finalStrategy = "";
  let finalNextAction = "";
  let confidenceVal = RECOVERABILITY_CONFIDENCE[recoverability] || 50;
  let reasonRationale = "";

  // 1. ATTEMPT LIMIT ESCALATION RULE
  // If we have retried 2 or more times (representing attempt 3+), escalate the case to manual account management
  if (previousAttempts >= 2) {
    finalStrategy = "CUSTOMER_SUPPORT_DUNNING";
    finalNextAction = "escalate_to_account_manager";
    confidenceVal = 10; // confidence drops after multiple failed retries
    reasonRationale = `Escalation triggered: ${previousAttempts} failed recovery attempts detected. Transitioning case from automated retry to manual account manager review.`;
  } else {
    // Determine strategy from direct diagnosis mappings
    const resolved = STRATEGY_MAPS[diagnosis];
    if (resolved) {
      finalStrategy = resolved.strategy;
      finalNextAction = resolved.nextAction;
    } else {
      // Fallback strategies based on broad categories
      if (category === "payment_failure") {
        finalStrategy = "SMART_RETRY";
        finalNextAction = "schedule_optimal_window_retry";
      } else if (category === "invoice_overdue") {
        finalStrategy = "RECEIVABLES_CHASE";
        finalNextAction = "dispatch_invoice_chaser";
      } else {
        finalStrategy = "CUSTOMER_SUPPORT_DUNNING";
        finalNextAction = "escalate_to_account_manager";
      }
    }

    // Adjust confidence values based on previous retry attempts
    if (previousAttempts > 0) {
      confidenceVal = Math.max(15, confidenceVal - previousAttempts * 15);
      reasonRationale = `Automated ${finalStrategy} proposed. Confidence degraded to ${confidenceVal}% due to ${previousAttempts} previous failed attempt(s).`;
    } else {
      reasonRationale = `Automated ${finalStrategy} scheduled. Clean transaction profile with high recovery potential.`;
    }
  }

  return {
    strategy: finalStrategy,
    reason: reasonRationale,
    priority: priority, // Propagate incoming priority level
    confidence: `${confidenceVal}%`,
    nextAction: finalNextAction,
  };
};
