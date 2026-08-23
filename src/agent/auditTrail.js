// APEX 1.0 - Audit Trail Module
// Generates immutable, timestamped chronological reports of recovery pipelines.
// Pure JS: Decoupled and modular logic.

// Bounded in-memory store
const auditLogStore = [];

/**
 * Deep freezes an object recursively to guarantee absolute immutability
 */
export const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Freeze properties first
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });

  return obj;
};

/**
 * Builds a unique, readable Case ID combining date stamps and random hashes
 */
const generateCaseId = (customer) => {
  const cleanCustomer = (customer || "STARDUST")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const dateStr = Date.now().toString().slice(-6);
  const randHex = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `ST-DX-${cleanCustomer}-${dateStr}-${randHex}`;
};

/**
 * Builds an immutable audit report logging chronological status changes
 */
export const createAuditRecord = (pipelineData) => {
  if (!pipelineData || typeof pipelineData !== "object") {
    throw new Error("Pipeline data payload must be a non-null object to create audit trail");
  }

  const {
    category,
    priority,
    customer,
    amount,
    reason,
    diagnosis,
    recoverability,
    strategy,
    confidence,
    nextAction,
    stoppingRules,
    intervention,
    recovery,
  } = pipelineData;

  const caseId = pipelineData.caseId || generateCaseId(customer);
  const nowISO = new Date().toISOString();
  
  // Status timeline array
  const statusHistory = pipelineData.statusHistory ? [...pipelineData.statusHistory] : [];

  const addHistoryStep = (status, message) => {
    statusHistory.push({
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  // Add initial pipeline details only on first ingestion
  if (statusHistory.length === 0) {
    // 1. DETECTED Status
    addHistoryStep(
      "DETECTED",
      `Revenue risk event ${category.toUpperCase()} detected for client ${customer}. Amount: ₹${amount.toLocaleString()}.`
    );

    // 2. DIAGNOSED Status
    addHistoryStep(
      "DIAGNOSED",
      `Root cause diagnosed: "${diagnosis}". Recoverability index evaluated as: ${recoverability.toUpperCase()}.`
    );

    // 3. DECIDED Status
    addHistoryStep(
      "DECIDED",
      `Recovery strategy decided: ${strategy}. Confidence metric: ${confidence}. Proposed action: ${nextAction || "retry"}.`
    );
  }

  // 4. STOPPING RULE / INTERVENTION State logic
  let finalStatus = "DECIDED";

  if (stoppingRules && stoppingRules.shouldStop) {
    let stopStatus = "CLOSED";
    const stopReason = stoppingRules.reason.toLowerCase();

    if (stopReason.includes("already recovered")) {
      stopStatus = "CLOSED";
    } else if (stopReason.includes("limit exceeded") || stopReason.includes("escalated")) {
      stopStatus = "ESCALATED";
    } else {
      stopStatus = "FAILED";
    }

    addHistoryStep(
      stopStatus,
      `Pipeline execution halted by safety guard: ${stoppingRules.reason}. Automated retries terminated.`
    );
    finalStatus = stopStatus;
  } else {
    // Pipeline proceeds to Intervention
    if (intervention) {
      addHistoryStep(
        "INTERVENED",
        `Intervention executed: ${intervention.action} (Attempt #${intervention.attemptNumber}). Log: ${intervention.message}`
      );
      finalStatus = "INTERVENED";
    }

    // Pipeline proceeds to Recovery Outcomes
    if (recovery) {
      let outcomeStatus = "FAILED";
      if (recovery.recovered) {
        outcomeStatus = "RECOVERED";
      } else if (recovery.status === "Escalated") {
        outcomeStatus = "ESCALATED";
      }

      addHistoryStep(
        outcomeStatus,
        `Mitigation check: ${recovery.reason} Status updated. Amount recovered: ₹${recovery.recoveredAmount.toLocaleString()}.`
      );
      finalStatus = outcomeStatus;
    }
  }

  // Compile final structured report
  const rawRecord = {
    caseId,
    timestamp: nowISO,
    customer,
    amount,
    reason,
    category,
    priority,
    diagnosis,
    recoverability,
    strategy,
    confidence,
    nextAction,
    stoppingRules,
    intervention,
    recovery,
    statusHistory,
    finalStatus,
  };

  // Deep freeze the record to guarantee absolute immutability after generation
  return deepFreeze(rawRecord);
};

/**
 * Pushes record to bounded memory store
 */
export const logAuditRecord = (record) => {
  if (!record || !record.caseId) {
    throw new Error("Invalid record format: cannot save to Audit Log");
  }

  // Overwrite existing log versions in-place to compile single timelines
  const existingIdx = auditLogStore.findIndex((r) => r.caseId === record.caseId);
  if (existingIdx !== -1) {
    auditLogStore[existingIdx] = record;
  } else {
    auditLogStore.unshift(record);
  }

  // Cap memory size to avoid memory leaks
  if (auditLogStore.length > 100) {
    auditLogStore.pop();
  }
};

/**
 * Returns read-only history array
 */
export const getAuditHistory = () => {
  return [...auditLogStore];
};

/**
 * Clears in-memory audit store
 */
export const clearAuditCache = () => {
  auditLogStore.length = 0;
};
