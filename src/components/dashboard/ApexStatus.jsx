function ApexStatus({ onTriggerSupport }) {
  const checklist = [
    { label: "Detection", status: "Active" },
    { label: "Diagnosis", status: "Active" },
    { label: "Intervention", status: "Active" },
    { label: "Recovery", status: "Active" },
  ];

  return (
    <div className="apex-status-card">
      <div className="apex-status-header">
        <span className="apex-status-title">APEX CORE 1.0</span>
        <div className="apex-status-online">
          <span className="sidebar-agent-dot" />
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </div>

      <div className="apex-core-container">
        <div className="apex-reactor-orbit-2" />
        <div className="apex-reactor-orbit-1" />
        <div className="apex-reactor-core">
          <div className="apex-reactor-label">
            <span>APEX</span>
            <strong>1.0</strong>
          </div>
        </div>
      </div>

      <div className="apex-checklist">
        {checklist.map((item) => (
          <div key={item.label} className="apex-checklist-item">
            <div className="apex-checklist-left">
              <span className="apex-checklist-dot" />
              <span className="apex-checklist-label">{item.label}</span>
            </div>
            <span className="apex-checklist-status">{item.status}</span>
          </div>
        ))}
      </div>

      {/* Support Escalation Option */}
      <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
          Didn't find what you need?
        </span>
        <button 
          onClick={onTriggerSupport}
          type="button"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--color-accent-indigo)', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px', 
            textTransform: 'uppercase', 
            padding: '4px 8px' 
          }}
        >
          Send your problem to us →
        </button>
      </div>
    </div>
  );
}

export default ApexStatus;
