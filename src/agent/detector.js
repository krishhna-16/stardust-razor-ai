// APEX 1.0 - Threat Detector Module
// Evaluates revenue events, validates inputs, and calculates risk indices.
// Pure JS execution: decoupled from UI rendering cycles and API runtimes.

const SUPPORTED_EVENTS = {
  PAYMENT_FAILED: {
    category: "payment_failure",
    severity: 3, // High initial impact (direct lost capture)
  },
  SUBSCRIPTION_FAILED: {
    category: "subscription_failure",
    severity: 2, // Medium-high impact (recurring churn threat)
  },
  CHECKOUT_ABANDONED: {
    category: "checkout_abandonment",
    severity: 1, // Medium initial impact (intent drop)
  },
  INVOICE_OVERDUE: {
    category: "invoice_overdue",
    severity: 2, // Medium collections threat
  },
};

/**
 * Enforces schema validation rules on incoming events
 * Throws structural errors if contracts are violated
 */
export const validateEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new Error("Event payload must be a non-null object");
  }

  const { type, customer, amount } = event;

  if (!type || !SUPPORTED_EVENTS[type]) {
    throw new Error(`Unsupported or missing event type: "${type}"`);
  }

  if (!customer || typeof customer !== "string" || !customer.trim()) {
    throw new Error("Invalid customer identifier: must be a non-empty string");
  }

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount: must be a positive number");
  }
};

/**
 * Calculates priority based on event severity weight and transaction amount
 * Returns low, medium, or high
 */
export const calculatePriority = (type, amount) => {
  const severityWeight = SUPPORTED_EVENTS[type].severity;

  // Calculate amount weight factor
  let amountWeight = 1;
  if (amount >= 30000) {
    amountWeight = 3; // high-value transaction
  } else if (amount >= 10000) {
    amountWeight = 2; // mid-value transaction
  }

  const compositeScore = severityWeight * amountWeight;

  if (compositeScore >= 6) return "high";
  if (compositeScore >= 4) return "medium";
  return "low";
};

/**
 * Evaluates event and returns a structured risk detection report
 */
export const detectRisk = (event) => {
  // Validate schema first
  validateEvent(event);

  const { type, customer, amount, reason } = event;
  const config = SUPPORTED_EVENTS[type];

  const priority = calculatePriority(type, amount);

  // Return predictable, structured threat assessment output
  return {
    detected: true,
    category: config.category,
    priority: priority,
    customer: customer.trim(),
    amount: amount,
    reason: reason || "UNKNOWN_REASON",
    timestamp: new Date().toISOString(),
  };
};
