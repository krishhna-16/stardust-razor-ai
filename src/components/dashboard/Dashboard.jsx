import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MetricCards from "./MetricCards";
import RecoveryChart from "./RecoveryChart";
import ApexActivity from "./ApexActivity";
import RiskTable from "./RiskTable";
import ApexStatus from "./ApexStatus";
import AuditTrail from "./AuditTrail";
import CaseDetailsDrawer from "./CaseDetailsDrawer";
import SupportModal from "./SupportModal";
import RazorAI from "./RazorAI";
import { useApex } from "../../hooks/useApex";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const { 
    cases, 
    audits, 
    stats, 
    metrics,
    simulateNextCase, 
    simulateGatewayEvent, 
    triggerCaseAction,
    resetEngine, 
    simulationLoading, 
    gatewayLoading,
    actionLoading
  } = useApex();

  // Toast notification manager helper
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // React to dynamic APEX events to dispatch notifications
  const [prevCasesLength, setPrevCasesLength] = useState(cases.length);
  useEffect(() => {
    if (cases.length > prevCasesLength) {
      const latestCase = cases[0];
      if (latestCase) {
        const customer = latestCase.customer || "Merchant";
        const status = latestCase.finalStatus || "PENDING";
        const amount = latestCase.amount || 0;
        
        if (status === "RECOVERED") {
          addToast(`APEX secured ₹${amount.toLocaleString()} from ${customer}!`, "success");
        } else if (status === "ESCALATED") {
          addToast(`Case for ${customer} (₹${amount.toLocaleString()}) escalated to Support.`, "warning");
        } else if (status === "FAILED") {
          addToast(`APEX automated recovery failed for ${customer}.`, "error");
        } else {
          addToast(`New APEX case created for ${customer} (₹${amount.toLocaleString()}).`, "success");
        }
      }
      setPrevCasesLength(cases.length);
    }
  }, [cases, prevCasesLength]);

  // Selected case reference
  const selectedCase = cases.find(c => c.caseId === selectedCaseId);

  const formatLakh = (val) => {
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  };

  // Variants for tab switching page content
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Standard Header block helper
  const renderHeader = (title, subtitle) => (
    <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 className="dashboard-header-title">{title}</h1>
        <p className="dashboard-header-subtitle">{subtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={simulateNextCase} 
          className="enter-button" 
          style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={simulationLoading}
        >
          {simulationLoading && <RefreshCw size={12} className="animate-spin-fast" />}
          <span>{simulationLoading ? "APEX Ingesting..." : "Run APEX Simulation"}</span>
        </button>
        <button 
          onClick={simulateGatewayEvent} 
          className="enter-button" 
          style={{ marginTop: 0, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass-glow-active)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={gatewayLoading}
        >
          {gatewayLoading && <RefreshCw size={12} className="animate-spin-fast" />}
          <span>{gatewayLoading ? "Gateway Processing..." : "Simulate Gateway Event"}</span>
        </button>
      </div>
    </div>
  );

  const handleRowSelect = (row) => {
    setSelectedCaseId(row.caseId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            {renderHeader("Revenue Recovery", "APEX continuously detects, diagnoses and recovers revenue at risk.")}

            <MetricCards stats={stats} />

            <RecoveryChart />

            <div className="dashboard-middle-row">
              <ApexActivity cases={cases} />
              <ApexStatus onTriggerSupport={() => setShowSupportForm(true)} />
            </div>

            <RiskTable cases={cases} onRowClick={handleRowSelect} />
            <AuditTrail auditLogs={audits} />
          </>
        );

      case "recovery":
        return (
          <>
            {renderHeader("Recovery Pipeline", "Current queue of automated payment retries, card updater links, and manual account support escalations.")}
            
            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">ACTIVE CASES</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.recovery.activeRecoveryCases}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RECOVERED REVENUE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{stats.recovered}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">TERMINAL FAILURES</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.recovery.failedCases}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">ESCALATED CASES</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.recovery.escalatedCases}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-middle-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <RiskTable cases={cases} onRowClick={handleRowSelect} />

              <div className="table-card">
                <div className="table-header">
                  <span className="table-title">RECOVERY CHANNELS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {Object.entries(metrics.recovery.strategyCounts).map(([strat, val]) => (
                    <div key={strat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                        {strat}
                      </span>
                      <span className="risk-tag low" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                        {val} Active
                      </span>
                    </div>
                  ))}
                  {Object.keys(metrics.recovery.strategyCounts).length === 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      No active allocations
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case "payments":
        const paymentCases = cases.filter(c => c.category === "payment_failure");
        return (
          <>
            {renderHeader("Payments Gateway Failures", "Detailed feed of failed payment transactions tracked on Razorpay payment routes.")}

            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">FAILURES INGESTED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.payments.failuresIngested}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">PAYMENTS RECOVERED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.payments.recovered)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">REVENUE AT RISK</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.payments.revenueAtRisk)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RECOVERY RATE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.payments.recoveryRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <RiskTable cases={paymentCases} onRowClick={handleRowSelect} />
          </>
        );

      case "subscriptions":
        const subCases = cases.filter(c => c.category === "subscription_failure");
        return (
          <>
            {renderHeader("Subscription Churn Recovery", "Autonomous renewal recovery chasers, smart retries, and card updater tracking.")}

            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RENEWALS FAILED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.subscriptions.renewalsFailed}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">CHURN RECOVERED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.subscriptions.recovered)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">SUBSCRIPTION RISK</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.subscriptions.revenueAtRisk)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RECOVERY RATE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.subscriptions.recoveryRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <RiskTable cases={subCases} onRowClick={handleRowSelect} />
          </>
        );

      case "invoices":
        const invCases = cases.filter(c => c.category === "invoice_overdue");
        return (
          <>
            {renderHeader("Overdue Accounts Receivable", "Tracking outstanding B2B invoice collection queues and dispatch chasers history.")}

            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">INVOICES OVERDUE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.invoices.invoicesOverdue}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">INVOICES RECOVERED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.invoices.recovered)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">OUTSTANDING AMOUNT</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.invoices.revenueAtRisk)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RECOVERY RATE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.invoices.recoveryRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <RiskTable cases={invCases} onRowClick={handleRowSelect} />
          </>
        );

      case "checkout":
        const checkCases = cases.filter(c => c.category === "checkout_abandonment");
        return (
          <>
            {renderHeader("Checkout Abandonment Recovery", "Autonomous cart abandonment chasers, exit-intent hooks, and checkout payment links.")}

            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">CARTS ABANDONED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.checkout.cartsAbandoned}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">CARTS RECOVERED</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.checkout.recovered)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">ABANDONED VALUE RISK</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{formatLakh(metrics.checkout.revenueAtRisk)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-card-bg-glow" />
                <div className="metric-card-top">
                  <span className="metric-label">RECOVERY RATE</span>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value">{metrics.checkout.recoveryRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <RiskTable cases={checkCases} onRowClick={handleRowSelect} />
          </>
        );

      case "analytics":
        return (
          <>
            {renderHeader("APEX Recovery Analytics", "Historical efficiency dashboards, category distributions, and automated channels metrics.")}

            <MetricCards stats={stats} />

            <RecoveryChart />

            <div className="dashboard-middle-row" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '16px' }}>
              
              {/* Failure Categories Box */}
              <div className="table-card" style={{ height: 'auto' }}>
                <div className="table-header">
                  <span className="table-title">FAILURE CATEGORIES</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Payment gateway errors</span>
                    <span className="risk-tag high" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{metrics.analytics.paymentFailuresCount} cases</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Subscription renewal errors</span>
                    <span className="risk-tag medium" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{metrics.analytics.subscriptionFailuresCount} cases</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Checkout cart abandonment</span>
                    <span className="risk-tag low" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{metrics.analytics.checkoutAbandonmentCount} cases</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Overdue accounts invoice</span>
                    <span className="risk-tag low" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{metrics.analytics.overdueInvoicesCount} cases</span>
                  </div>
                </div>
              </div>

              {/* Strategy Success Performance Box */}
              <div className="table-card" style={{ height: 'auto' }}>
                <div className="table-header">
                  <span className="table-title">APEX CHANNELS PERFORMANCE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {Object.entries(metrics.analytics.strategyStats).map(([strat, item]) => {
                    const successRate = item.total > 0 ? (item.recovered / item.total) * 100 : 0;
                    return (
                      <div key={strat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {strat}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: successRate > 50 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {successRate.toFixed(0)}% S.R.
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            ({item.recovered}/{item.total})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(metrics.analytics.strategyStats).length === 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      No analytical metrics compiled yet
                    </span>
                  )}
                </div>
              </div>

            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Visual background layers */}
      <div className="dashboard-stars" />
      <div className="dashboard-nebula" />
      <div className="dashboard-nebula-left" />

      {/* Sidebar Panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* Main Panel */}
      <main className="main-content">
        <Topbar />
        <motion.div
          key={activeTab}
          className="content-body"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {renderContent()}
        </motion.div>
      </main>

      {/* Selected Case details overlay drawer panel */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetailsDrawer 
            caseItem={selectedCase}
            onClose={() => setSelectedCaseId(null)}
            onAction={(actionType) => {
              return triggerCaseAction(selectedCase.caseId, actionType).then((res) => {
                if (res.message) {
                  addToast(res.message, res.type);
                }
              });
            }}
            actionLoading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Support Escalation Modal Overlay */}
      <AnimatePresence>
        {showSupportForm && (
          <SupportModal 
            onClose={() => setShowSupportForm(false)}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* Razor AI Assistant — available across all dashboard tabs */}
      <RazorAI />

      {/* Toast Notification HUD Overlay */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 11000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              style={{
                minWidth: '320px',
                maxWidth: '400px',
                padding: '14px 18px',
                background: 'rgba(5, 7, 20, 0.9)',
                borderLeft: `4px solid ${toast.type === "success" ? "var(--color-success)" : toast.type === "error" ? "var(--color-danger)" : "var(--color-warning)"}`,
                borderTop: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderRight: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '6px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
                color: '#fff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(16px)'
              }}
            >
              <span style={{ fontWeight: '500', lineHeight: '1.4' }}>{toast.message}</span>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default Dashboard;