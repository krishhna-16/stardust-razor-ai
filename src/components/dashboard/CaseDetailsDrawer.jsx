import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, EyeOff } from "lucide-react";

function CaseDetailsDrawer({ caseItem, onClose, onAction, actionLoading }) {
  if (!caseItem) return null;

  const {
    caseId,
    customer,
    amount,
    category,
    priority,
    diagnosis,
    strategy,
    confidence,
    finalStatus,
    statusHistory,
    stoppingRules,
    intervention,
    recovery,
  } = caseItem;

  const recoveredAmount = recovery ? (recovery.recoveredAmount || 0) : 0;
  const isRecovered = finalStatus.toUpperCase() === "RECOVERED";
  const isClosed = finalStatus.toUpperCase() === "CLOSED";
  const isEscalated = finalStatus.toUpperCase() === "ESCALATED";

  const attemptsCount = stoppingRules ? (stoppingRules.previousAttempts || 0) : 0;

  // Visual status pill classes
  const getStatusClass = (statusStr) => {
    const norm = (statusStr || "").toLowerCase();
    if (norm === "failed" || norm === "escalated") return "escalated";
    if (norm === "recovered" || norm === "closed") return "recovered";
    return "pending";
  };

  // Compile visual explanation stages
  const getReasoningStages = () => {
    const stages = [
      {
        name: "DETECTED",
        desc: `Risk ingested for ${category.toUpperCase().replace("_", " ")} from customer "${customer}".`,
        done: true,
      },
      {
        name: "DIAGNOSED",
        desc: `Root cause identified: "${diagnosis}". Threat priority marked "${priority.toUpperCase()}".`,
        done: true,
      },
      {
        name: "DECIDED",
        desc: `Strategy "${strategy}" chosen with ${confidence}% confidence. Proposed next action: "${caseItem.nextAction || "retry"}".`,
        done: true,
      },
      {
        name: "INTERVENED",
        desc: intervention 
          ? `Dispatched: "${intervention.action}" (Attempt #${intervention.attemptNumber}). API Msg: "${intervention.message}"`
          : `Automated intervention bypassed. Safety rule: "${stoppingRules?.reason || "halted"}"`,
        done: !!intervention,
      },
      {
        name: finalStatus.toUpperCase(),
        desc: recovery 
          ? `Outcome: ${recovery.reason}. Mapped resolved amount: ₹${recoveredAmount.toLocaleString()}.`
          : `Halted: "${stoppingRules?.reason || "automation stopped"}"`,
        done: true,
        type: finalStatus.toLowerCase()
      }
    ];
    return stages;
  };

  const reasoningStages = getReasoningStages();

  return (
    <motion.div 
      className="drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <motion.div
        className="drawer-container"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: 'rgba(6, 8, 20, 0.95)',
          borderLeft: '1px solid rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '30px'
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>CASE ID: {caseId}</span>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{customer}</h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status and Priority Summary Cards */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</span>
            <span className={`status-pill ${getStatusClass(finalStatus)}`} style={{ display: 'inline-flex' }}>
              <span className="status-indicator-dot" />
              <span>{finalStatus}</span>
            </span>
          </div>
          <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Threat Level</span>
            <span className={`risk-tag ${priority.toLowerCase()}`} style={{ display: 'inline-flex' }}>
              {priority}
            </span>
          </div>
        </div>

        {/* Case Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>At-Risk Amount</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>₹{amount.toLocaleString()}</span>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Recovered Result</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: isRecovered ? 'var(--color-success)' : '#fff' }}>
              {isRecovered ? `₹${recoveredAmount.toLocaleString()}` : "₹0"}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Event Source</span>
            <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{category.replace("_", " ")}</span>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Allocated Strategy</span>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>{strategy}</span>
          </div>
        </div>

        {/* APEX Cognitive Reasoning Map */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-accent-indigo)', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>
            APEX Cognitive Reasoning
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reasoningStages.map((stage, idx) => (
              <div key={stage.name} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: stage.type ? 'var(--color-danger)' : stage.done ? 'var(--color-success)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    {idx + 1}
                  </div>
                  {idx < reasoningStages.length - 1 && (
                    <div style={{ width: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', display: 'block' }}>{stage.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4', marginTop: '2px', display: 'block' }}>
                    {stage.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chronological Audit Trail Timeline */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-accent-indigo)', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Chronological Audit History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
            {statusHistory && statusHistory.map((step, idx) => (
              <div key={idx} style={{ position: 'relative', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{
                  position: 'absolute',
                  left: '-4px',
                  top: '4px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: getStatusClass(step.status) === "recovered" ? "var(--color-success)" : getStatusClass(step.status) === "escalated" ? "var(--color-danger)" : "var(--color-warning)"
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{step.status}</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  {step.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation recommendations block */}
        {isEscalated && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-danger)', marginBottom: '8px' }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.04em' }}>AUTOMATED TIMEOUT HALTED</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-body)', display: 'block', lineHeight: '1.4' }}>
              <strong>Halt Reason</strong>: {stoppingRules?.reason || "Retries limit hit."}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-body)', display: 'block', marginTop: '6px', lineHeight: '1.4' }}>
              <strong>Recommended Human Action</strong>: Reach out directly via manual account manager follow-up or email billing dispatch.
            </span>
          </div>
        )}

        {/* Action Controls Footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          {(!isRecovered && !isClosed) ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => onAction("retry")}
                disabled={attemptsCount >= 3 || actionLoading}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: (attemptsCount >= 3 || actionLoading) ? 'rgba(255,255,255,0.02)' : 'var(--color-accent-indigo)',
                  color: (attemptsCount >= 3 || actionLoading) ? 'var(--color-text-muted)' : '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: (attemptsCount >= 3 || actionLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw size={14} className={actionLoading ? "animate-spin-fast" : attemptsCount < 3 ? "animate-spin-slow" : ""} />
                <span>{actionLoading ? "Processing Retry..." : `Retry Now (${attemptsCount}/3)`}</span>
              </button>
              
              {!isEscalated && (
                <button
                  onClick={() => onAction("escalate")}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    backgroundColor: actionLoading ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.02)',
                    color: actionLoading ? 'var(--color-text-muted)' : 'var(--color-danger)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <AlertTriangle size={14} className={actionLoading ? "animate-spin-fast" : ""} />
                  <span>{actionLoading ? "Escalating..." : "Escalate"}</span>
                </button>
              )}

              <button
                onClick={() => onAction("close")}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'transparent',
                  color: actionLoading ? 'var(--color-text-muted)' : 'var(--color-text-body)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <EyeOff size={14} className={actionLoading ? "animate-spin-fast" : ""} />
                <span>{actionLoading ? "Closing..." : "Close Case"}</span>
              </button>
            </div>
          ) : (
            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-success)', letterSpacing: '0.04em' }}>
                CASE RESOLVED AND TERMINATED
              </span>
            </div>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}

export default CaseDetailsDrawer;
