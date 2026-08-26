// APEX 1.0 - Core Engine Orchestrator
// Coordinates revenue threat assessment logging, analysis history caches, and statistics.
// Decoupled from UI code, running as a pure execution pipeline.

import { detectRisk } from "./detector";
import { diagnoseRisk } from "./diagnostician";
import { decideRecoveryAction } from "./decisionEngine";
import { checkStoppingRules } from "./stoppingRules";
import { simulateIntervention, simulateRecovery } from "./recoveryEngine";
import { createAuditRecord, logAuditRecord } from "./auditTrail";
import { mapWebhookEventToApex } from "../services/razorpayAdapter";

// In-memory buffer tracking processes risk records
const processedThreats = [];

/**
 * Receives an event payload, routes it to the detector, logs result, and returns analysis
 */
export const processEvent = (event, previousAttempts = 0, currentStatus = "") => {
  try {
    const analysis = detectRisk(event);
    const diagnosis = diagnoseRisk(event);
    const decision = decideRecoveryAction({ ...analysis, ...diagnosis }, previousAttempts);
    
    // Safety check evaluation
    const safetyCheck = checkStoppingRules(event, decision, previousAttempts, currentStatus);

    let interventionReport = null;
    let recoveryOutcome = null;
    let finalStatus = currentStatus || "Pending";

    // Run simulated execution steps only if safety rules permit it
    if (!safetyCheck.shouldStop) {
      const nextAttemptNumber = previousAttempts + 1;
      interventionReport = simulateIntervention(decision.strategy, nextAttemptNumber);
      recoveryOutcome = simulateRecovery(decision.strategy, diagnosis.recoverability, event.amount);
      finalStatus = recoveryOutcome.status;
    }

    const combinedAnalysis = {
      ...analysis,
      ...diagnosis,
      ...decision,
      caseId: event.caseId,
      statusHistory: event.statusHistory,
      stoppingRules: {
        ...safetyCheck,
        previousAttempts: safetyCheck.shouldStop ? previousAttempts : previousAttempts + 1
      },
      intervention: interventionReport,
      recovery: recoveryOutcome,
      status: finalStatus,
      lastEvaluated: new Date().toISOString()
    };

    // Generate the immutable frozen audit trail record
    const auditRecord = createAuditRecord(combinedAnalysis);

    // Save to local logs store and bounded memory queues
    logAuditRecord(auditRecord);
    
    const existingIdx = processedThreats.findIndex((t) => t.caseId === auditRecord.caseId);
    if (existingIdx !== -1) {
      processedThreats[existingIdx] = auditRecord;
    } else {
      processedThreats.unshift(auditRecord);
    }

    // Keep memory bounded to avoid leaks
    if (processedThreats.length > 200) {
      processedThreats.pop();
    }

    return {
      success: true,
      data: auditRecord,
      error: null,
    };
  } catch (error) {
    // Gracefully catch and structure validator errors
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

/**
 * Retrieves the read-only history logs of detected threats
 */
export const getRiskLogs = () => {
  return [...processedThreats];
};

/**
 * Calculates current cumulative metrics for logged alerts
 */
export const getEngineStats = () => {
  const count = processedThreats.length;
  if (count === 0) {
    return {
      totalAtRisk: 0,
      highPriorityCount: 0,
      averageAmount: 0,
    };
  }

  let totalAmount = 0;
  let highPriority = 0;

  processedThreats.forEach((threat) => {
    totalAmount += threat.amount;
    if (threat.priority === "high") {
      highPriority++;
    }
  });

  return {
    totalAtRisk: totalAmount,
    highPriorityCount: highPriority,
    averageAmount: Math.round(totalAmount / count),
  };
};

/**
 * Wipes the internal process buffer cache
 */
export const clearEngineCache = () => {
  processedThreats.length = 0;
};

/**
 * Translates raw Razorpay webhook events to APEX and processes them
 */
export const processGatewayEvent = (razorpayEvent, previousAttempts = 0, currentStatus = "") => {
  const normalizedEvent = mapWebhookEventToApex(razorpayEvent);
  return processEvent(normalizedEvent, previousAttempts, currentStatus);
};
