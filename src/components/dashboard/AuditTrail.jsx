import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

function AuditTrail({ auditLogs }) {
  const [expandedCaseId, setExpandedCaseId] = useState(null);

  const toggleExpand = (caseId) => {
    setExpandedCaseId((prev) => (prev === caseId ? null : caseId));
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return "00:00:00";
    }
  };

  const logs = auditLogs || [];

  return (
    <div className="table-card" style={{ marginTop: "16px" }}>
      <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="table-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={16} className="table-action-icon" />
          APEX 1.0 SECURE AUDIT TRAIL
        </span>
        <span className="chart-subtitle" style={{ fontSize: "10px", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
          IMMUTABLE LEDGER CACHE
        </span>
      </div>

      <div className="table-responsive">
        <table className="finance-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }} />
              <th>Case ID</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Risk Category</th>
              <th>Diagnosis</th>
              <th>Strategy</th>
              <th>Result</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const caseId = log.caseId || "ST-DX-PENDING";
              const timestamp = log.timestamp || new Date().toISOString();
              const customer = log.customer || "Unknown Client";
              const category = log.category || "payment_failure";
              const diagnosis = log.diagnosis || "unknown";
              const strategy = log.strategy || "SMART_RETRY";
              const amount = log.amount || 0;
              const finalStatus = log.finalStatus || "PENDING";
              const statusHistory = log.statusHistory || [];

              const isExpanded = expandedCaseId === caseId;
              const isRecovered = finalStatus === "RECOVERED";
              const isEscalated = finalStatus === "ESCALATED";

              return (
                <optgroup key={caseId} label={caseId} style={{ display: "contents" }}>
                  <tr 
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleExpand(caseId)}
                  >
                    <td>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-title)" }}>
                        {caseId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                        {formatTimestamp(timestamp)}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{customer}</span></td>
                    <td>{category.toUpperCase().replace("_", " ")}</td>
                    <td>
                      <code style={{ fontSize: "11px", color: "var(--color-accent-violet)" }}>
                        {diagnosis}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                        {strategy}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                        {isRecovered ? `+₹${amount.toLocaleString()}` : "₹0"}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-tag ${finalStatus.toLowerCase() === "recovered" ? "low" : finalStatus.toLowerCase() === "escalated" ? "high" : "medium"}`}>
                        {finalStatus}
                      </span>
                    </td>
                  </tr>
                  
                  {/* Expanded timeline block */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr>
                        <td colSpan="9" style={{ padding: "0", background: "rgba(255, 255, 255, 0.005)" }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                              <h4 style={{ fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 16px" }}>
                                Case Ingestion & Analysis Timeline
                              </h4>
                              
                              <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                                {/* Center/Left line connecting steps */}
                                <div style={{ position: "absolute", left: "10px", top: "10px", bottom: "10px", width: "1px", background: "rgba(255, 255, 255, 0.05)" }} />

                                {statusHistory.map((step, idx) => {
                                  const isTerminal = idx === statusHistory.length - 1;
                                  
                                  return (
                                    <div key={idx} style={{ display: "flex", gap: "16px", position: "relative", zIndex: 1 }}>
                                      {/* Dots */}
                                      <div style={{ 
                                        width: "21px", 
                                        height: "21px", 
                                        borderRadius: "50%", 
                                        background: "var(--bg-dark-base)", 
                                        border: `1px solid ${isTerminal ? (isRecovered ? "var(--color-success)" : isEscalated ? "var(--color-danger)" : "var(--color-warning)") : "rgba(255,255,255,0.2)"}`,
                                        boxShadow: isTerminal ? `0 0 8px ${isRecovered ? "var(--color-success)" : isEscalated ? "var(--color-danger)" : "var(--color-warning)"}` : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "9px",
                                        fontWeight: "bold",
                                        color: isTerminal ? "#fff" : "var(--color-text-muted)"
                                      }}>
                                        {idx + 1}
                                      </div>

                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: isTerminal ? "var(--color-text-title)" : "var(--color-text-secondary)" }}>
                                            {step.status}
                                          </span>
                                          <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                                            {formatTimestamp(step.timestamp)}
                                          </span>
                                        </div>
                                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                                          {step.message}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </optgroup>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditTrail;
