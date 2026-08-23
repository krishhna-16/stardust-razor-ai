import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, RefreshCw } from "lucide-react";
import { dispatchSupportTicket } from "../../services/supportService";

function SupportModal({ onClose, addToast }) {
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!problem.trim()) {
      addToast("Please describe your problem", "error");
      return;
    }

    setLoading(true);
    try {
      await dispatchSupportTicket(problem, category);
      setSubmitted(true);
      addToast("Support request dispatched to sandbox", "success");
    } catch (error) {
      addToast("Failed to send support request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 12000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(6, 8, 20, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '8px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-accent-indigo)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Support Escalation (Sandbox)
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Describe your problem</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: '#070913', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '10px', color: 'var(--color-text-body)', fontSize: '12px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="General">General Inquiry</option>
                <option value="APEX_Failure">APEX Pipeline Bug</option>
                <option value="Billing">Billing & Retries</option>
                <option value="Integration">Razorpay Gateway Mismatch</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Details</label>
              <textarea 
                placeholder="What occurred? Describe the steps to reproduce..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '12.5px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', display: 'block', lineHeight: '1.4', backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              ⚠️ **Demo Environment Warning**: Submissions are simulated locally and are not transmitted to active ticketing endpoints.
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--color-accent-indigo)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'opacity 0.2s'
              }}
            >
              {loading && <RefreshCw size={14} className="animate-spin-fast" />}
              <span>Send to STARDUST Support →</span>
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <CheckCircle size={44} style={{ color: 'var(--color-success)' }} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>✓ Message received</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                Our support team will review your request.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '600',
                padding: '8px 24px',
                cursor: 'pointer',
                marginTop: '12px',
                textTransform: 'uppercase'
              }}
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SupportModal;
