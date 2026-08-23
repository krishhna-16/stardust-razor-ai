// APEX 1.0 - Threat Diagnostician Module
// Analyzes threat payloads to diagnose root causes and recovery vectors.
// Pure JS: Decoupled and modular logic.

const DIAGNOSIS_MATRIX = {
  PAYMENT_FAILED: {
    INSUFFICIENT_FUNDS: {
      diagnosis: "insufficient_funds",
      explanation: "Customer account balance is too low to settle this transaction.",
      recoverability: "high",
      recommendedStrategy: "smart_retry",
    },
    CARD_EXPIRED: {
      diagnosis: "expired_payment_method",
      explanation: "The customer card method has expired and card updates are required.",
      recoverability: "medium",
      recommendedStrategy: "payment_method_update",
    },
    NETWORK_ERROR: {
      diagnosis: "network_gateway_decline",
      explanation: "Temporary connection error between merchant processor and acquiring bank.",
      recoverability: "high",
      recommendedStrategy: "immediate_retry_secondary_route",
    },
    PAYMENT_DECLINED: {
      diagnosis: "issuer_decline",
      explanation: "Card issuer declined transaction without specifying details (security trigger/limits).",
      recoverability: "low",
      recommendedStrategy: "customer_support_dunning",
    },
    UNKNOWN: {
      diagnosis: "unknown_payment_decline",
      explanation: "General decline code reported by the processing gateway.",
      recoverability: "medium",
      recommendedStrategy: "smart_retry",
    },
  },
  SUBSCRIPTION_FAILED: {
    CARD_EXPIRED: {
      diagnosis: "subscription_payment_method_expired",
      explanation: "Subscription renewal failed due to expired payment method.",
      recoverability: "medium",
      recommendedStrategy: "account_updater",
    },
    INSUFFICIENT_FUNDS: {
      diagnosis: "subscription_insufficient_funds",
      explanation: "Insufficient balance for subscription recurring charge.",
      recoverability: "high",
      recommendedStrategy: "optimal_hour_retry",
    },
    UNKNOWN: {
      diagnosis: "subscription_billing_error",
      explanation: "Failed recurring subscription payment process.",
      recoverability: "medium",
      recommendedStrategy: "smart_retry_sequence",
    },
  },
  CHECKOUT_ABANDONED: {
    ALL: {
      diagnosis: "shopping_cart_abandonment",
      explanation: "Customer left the checkout flow before finalizing the order.",
      recoverability: "medium",
      recommendedStrategy: "abandonment_dunning",
    },
  },
  INVOICE_OVERDUE: {
    ALL: {
      diagnosis: "receivables_overdue",
      explanation: "Invoice payment terms have passed with outstanding balances.",
      recoverability: "high",
      recommendedStrategy: "receivables_chase",
    },
  },
};

/**
 * Returns structured diagnosis metrics based on type and reason
 */
export const diagnoseRisk = (event) => {
  if (!event || typeof event !== "object") {
    throw new Error("Event payload must be a non-null object for diagnosis");
  }

  const { type, reason } = event;
  const upperType = type ? type.toUpperCase() : "";
  const upperReason = reason ? reason.toUpperCase() : "UNKNOWN";

  const typeMap = DIAGNOSIS_MATRIX[upperType];
  if (!typeMap) {
    throw new Error(`Unsupported event type for diagnosis: "${type}"`);
  }

  // Handle generalized category mapping vs. reason mapping
  let diagnosisData = null;

  if (typeMap.ALL) {
    diagnosisData = typeMap.ALL;
  } else {
    // Falls back to UNKNOWN if specific payment/subscription reason isn't tracked
    diagnosisData = typeMap[upperReason] || typeMap.UNKNOWN;
  }

  if (!diagnosisData) {
    throw new Error(`Unable to resolve diagnosis metrics for type "${type}" and reason "${reason}"`);
  }

  // Return a cloned, structured diagnostic payload
  return {
    diagnosis: diagnosisData.diagnosis,
    explanation: diagnosisData.explanation,
    recoverability: diagnosisData.recoverability,
    recommendedStrategy: diagnosisData.recommendedStrategy,
  };
};
