import { useState, useEffect, useMemo } from "react";
import { processEvent, getRiskLogs, getEngineStats, clearEngineCache, processGatewayEvent } from "../agent/apexEngine";
import { getAuditHistory, clearAuditCache } from "../agent/auditTrail";
import { calculateMetrics } from "../agent/metrics";

// Initial set of events to feed to APEX engine on mount
const INITIAL_SEEDS = [
  { type: "PAYMENT_FAILED", customer: "Acme Corp", amount: 18400, reason: "INSUFFICIENT_FUNDS", attempts: 0 },
  { type: "SUBSCRIPTION_FAILED", customer: "Nova Labs", amount: 9800, reason: "CARD_EXPIRED", attempts: 1 },
  { type: "INVOICE_OVERDUE", customer: "Vertex Systems", amount: 42000, reason: "UNKNOWN", attempts: 2 },
  { type: "PAYMENT_FAILED", customer: "Quantum Edge", amount: 15200, reason: "CARD_EXPIRED", attempts: 0 },
  { type: "PAYMENT_FAILED", customer: "Apex Dynamics", amount: 24500, reason: "PAYMENT_DECLINED", attempts: 1 },
  { type: "PAYMENT_FAILED", customer: "Sentinel Tech", amount: 31000, reason: "INSUFFICIENT_FUNDS", attempts: 2 },
  { type: "PAYMENT_FAILED", customer: "Nebula Ventures", amount: 8400, reason: "NETWORK_ERROR", attempts: 0 },
];

// Continuous mock simulation cases when user triggers simulation button
const SIMULATION_QUEUE = [
  { type: "PAYMENT_FAILED", customer: "Chronos Labs", amount: 14500, reason: "INSUFFICIENT_FUNDS", attempts: 0 },
  { type: "SUBSCRIPTION_FAILED", customer: "Sora Media", amount: 21000, reason: "CARD_EXPIRED", attempts: 1 },
  { type: "CHECKOUT_ABANDONED", customer: "Nebula Commerce", amount: 8400, reason: "UNKNOWN", attempts: 0 },
  { type: "INVOICE_OVERDUE", customer: "Alpha Dynamic", amount: 55000, reason: "UNKNOWN", attempts: 2 }, // triggers CUSTOMER_SUPPORT_DUNNING on 3rd attempt
  { type: "PAYMENT_FAILED", customer: "Titan Energy", amount: 62000, reason: "NETWORK_ERROR", attempts: 0 }, // high-value network error (smart retry route)
  { type: "SUBSCRIPTION_FAILED", customer: "Zion Corp", amount: 4800, reason: "INSUFFICIENT_FUNDS", attempts: 0 }, // low value
  { type: "PAYMENT_FAILED", customer: "Helix Robotics", amount: 89000, reason: "PAYMENT_DECLINED", attempts: 0 }, // issuer decline
  { type: "CHECKOUT_ABANDONED", customer: "Apex Tech", amount: 12500, reason: "UNKNOWN", attempts: 0 },
  { type: "PAYMENT_FAILED", customer: "Vortex Systems", amount: 14500, reason: "INSUFFICIENT_FUNDS", attempts: 3 }, // safety halt trigger (limit 3 attempts exceeded)
  { type: "INVOICE_OVERDUE", customer: "Omega Capital", amount: 120000, reason: "UNKNOWN", attempts: 0 }, // large corporate invoice
];

// Simulated incoming Razorpay webhook raw payloads (in Paise currency units)
const SIMULATED_WEBHOOKS = [
  {
    event: "payment.failed",
    attempts: 0,
    payload: {
      payment: {
        entity: {
          id: "pay_failed_rzp_98a8d7a",
          amount: 2450000, // ₹24,500 in paise
          currency: "INR",
          email: "finance@stellarcorp.com",
          error_code: "INSUFFICIENT_FUNDS",
          notes: {
            customer_name: "Stellar Corp (Webhook)"
          }
        }
      }
    }
  },
  {
    event: "subscription.charged",
    attempts: 1,
    payload: {
      subscription: {
        entity: {
          id: "sub_rzp_827f8a9d",
          charge_amount: 1280000, // ₹12,800 in paise
          notes: {
            customer_name: "Aura Design Studio (Webhook)"
          }
        }
      },
      payment: {
        entity: {
          id: "pay_failed_rzp_118a8d2",
          error_code: "CARD_EXPIRED",
          email: "billing@auradesign.io"
        }
      }
    }
  },
  {
    event: "invoice.expired",
    attempts: 0,
    payload: {
      invoice: {
        entity: {
          id: "inv_rzp_773fd92a",
          amount: 9500000, // ₹95,000 in paise
          customer_details: {
            name: "Nova Distribution (Webhook)"
          }
        }
      }
    }
  }
];

export const useApex = () => {
  const [cases, setCases] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [webhookIndex, setWebhookIndex] = useState(0);
  // Helper to re-derive states from engine
  const refreshStates = () => {
    const logs = getRiskLogs();
    const auditLogs = getAuditHistory();

    setCases(logs);
    setAudits(auditLogs);
  };

  const metrics = useMemo(() => calculateMetrics(cases), [cases]);

  const stats = useMemo(() => {
    const formatLakh = (val) => {
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(1)}L`;
    };

    return {
      revenueAtRisk: formatLakh(metrics.global.totalRevenueAtRisk),
      recovered: formatLakh(metrics.global.recoveredRevenue),
      activeCases: metrics.global.activeCases,
      recoveryRate: `${metrics.global.recoveryRate.toFixed(1)}%`,
    };
  }, [metrics]);

  // Seed on Mount
  useEffect(() => {
    // Run initial cases
    INITIAL_SEEDS.forEach((seed) => {
      processEvent(seed, seed.attempts);
    });
    refreshStates();
  }, []);

  /**
   * Triggers ingestion of the next simulation case
   */
  const simulateNextCase = () => {
    if (loading) return;
    setLoading(true);

    const nextEvent = SIMULATION_QUEUE[simIndex];
    
    // Simulate short network processing latency for UI feel
    setTimeout(() => {
      processEvent(nextEvent, nextEvent.attempts);
      
      setSimIndex((prev) => (prev + 1) % SIMULATION_QUEUE.length);
      refreshStates();
      setLoading(false);
    }, 450);
  };

  /**
   * Triggers ingestion of mock Razorpay Webhook Events
   */
  const simulateGatewayEvent = () => {
    if (gatewayLoading) return;
    setGatewayLoading(true);

    const nextWebhook = SIMULATED_WEBHOOKS[webhookIndex];

    setTimeout(() => {
      // Ingest event via Razorpay normalized gateway service
      processGatewayEvent(nextWebhook, nextWebhook.attempts || 0);

      setWebhookIndex((prev) => (prev + 1) % SIMULATED_WEBHOOKS.length);
      refreshStates();
      setGatewayLoading(false);
    }, 450);
  };

  /**
   * Resets engine cache
   */
  const resetEngine = () => {
    clearEngineCache();
    clearAuditCache();
    INITIAL_SEEDS.forEach((seed) => {
      processEvent(seed, seed.attempts);
    });
    setSimIndex(0);
    setWebhookIndex(0);
    refreshStates();
  };

  /**
   * Triggers manual actions (retry, escalate, close) on an active case item
   */
  const triggerCaseAction = (caseId, actionType) => {
    if (actionLoading) return Promise.reject("Action loading");
    setActionLoading(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const targetCase = getRiskLogs().find((c) => c.caseId === caseId);
        if (!targetCase) {
          setActionLoading(false);
          resolve({ success: false, error: "Case not found" });
          return;
        }

        let resultType = "success";
        let message = "";

        if (actionType === "retry") {
          const currentAttempts = targetCase.stoppingRules ? targetCase.stoppingRules.previousAttempts : 0;
          if (currentAttempts >= 3) {
            resultType = "error";
            message = "Action Blocked: Maximum retry limit (3) exceeded";
          } else {
            processEvent(targetCase, currentAttempts);
            // Re-fetch updated version
            const updatedCase = getRiskLogs().find((c) => c.caseId === caseId);
            const finalStatus = updatedCase ? updatedCase.finalStatus : "FAILED";
            
            if (finalStatus === "RECOVERED") {
              resultType = "success";
              message = `Retry successful! Mapped ₹${targetCase.amount.toLocaleString()} recovered revenue.`;
            } else if (finalStatus === "ESCALATED") {
              resultType = "warning";
              message = `Retry failed. Safety halt: ${updatedCase?.stoppingRules?.reason || "Limit reached."}`;
            } else {
              resultType = "error";
              message = "APEX retry attempt failed.";
            }
          }
        } else if (actionType === "escalate") {
          const currentAttempts = targetCase.stoppingRules ? targetCase.stoppingRules.previousAttempts : 0;
          processEvent(targetCase, currentAttempts, "ESCALATED");
          resultType = "warning";
          message = "Case manually escalated to support channel.";
        } else if (actionType === "close") {
          const currentAttempts = targetCase.stoppingRules ? targetCase.stoppingRules.previousAttempts : 0;
          processEvent(targetCase, currentAttempts, "CLOSED");
          resultType = "success";
          message = "Case closed and resolved.";
        }

        refreshStates();
        setActionLoading(false);
        resolve({ success: true, type: resultType, message });
      }, 550);
    });
  };

  return {
    cases,
    audits,
    stats,
    metrics,
    simulateNextCase,
    simulateGatewayEvent,
    triggerCaseAction,
    resetEngine,
    simulationLoading: loading,
    gatewayLoading,
    actionLoading,
  };
};
