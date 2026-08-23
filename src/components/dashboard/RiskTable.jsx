import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Search } from "lucide-react";

function RiskTable({ cases, onRowClick }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: "tween" } },
  };

  const activeCases = cases || [];

  // Filter cases logic
  const filteredCases = activeCases.filter((row) => {
    const customer = (row.customer || "").toLowerCase();
    const status = (row.status || row.finalStatus || "").toLowerCase();
    const category = (row.category || "").toLowerCase();
    const priority = (row.priority || "").toLowerCase();

    const matchesSearch = customer.includes(searchTerm.toLowerCase());
    
    // Status filter matches
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        matchesStatus = status === "pending" || status === "decided" || status === "detected" || status === "diagnosed" || status === "intervened";
      } else {
        matchesStatus = status === statusFilter.toLowerCase();
      }
    }

    const matchesCategory = categoryFilter === "all" || category === categoryFilter.toLowerCase();
    const matchesPriority = priorityFilter === "all" || priority === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="table-card">
      <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '4px' }}>
        <span className="table-title">AT-RISK REVENUE TRACKER</span>
      </div>

      {/* Dynamic Search and Filtering Row */}
      <div className="table-filters" style={{ display: 'flex', gap: '12px', padding: '0 20px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search customer name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '6px',
              padding: '7px 12px 7px 32px',
              color: '#fff',
              fontSize: '12.5px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ background: '#070913', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '7px 10px', color: 'var(--color-text-body)', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">Status: All</option>
          <option value="recovered">Recovered</option>
          <option value="failed">Failed</option>
          <option value="escalated">Escalated</option>
          <option value="closed">Closed</option>
          <option value="pending">Pending</option>
        </select>

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ background: '#070913', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '7px 10px', color: 'var(--color-text-body)', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">Category: All</option>
          <option value="payment_failure">Payment Failure</option>
          <option value="subscription_failure">Subscription Failure</option>
          <option value="invoice_overdue">Invoice Overdue</option>
          <option value="checkout_abandonment">Checkout Abandoned</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ background: '#070913', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '7px 10px', color: 'var(--color-text-body)', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
        >
          <option value="all">Priority: All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Issue</th>
              <th>At-Risk</th>
              <th>Recovered</th>
              <th>Risk</th>
              <th>APEX Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCases.map((row) => {
              const customerName = row.customer || "Unknown Client";
              const caseId = row.caseId || "ST-DX-PENDING";
              const category = row.category || "payment_failure";
              const amount = row.amount || 0;
              const priority = row.priority || "medium";
              const strategy = row.strategy || "SMART_RETRY";
              const status = row.status || row.finalStatus || "Pending";

              const recoveredAmount = row.recovery ? (row.recovery.recoveredAmount || 0) : 0;
              const isRecovered = status.toLowerCase() === "recovered";

              // Map engine output codes to existing CSS style selectors
              const getStatusClass = (statusStr) => {
                const norm = (statusStr || "").toLowerCase();
                if (norm === "failed" || norm === "escalated") return "escalated";
                if (norm === "recovered" || norm === "closed") return "recovered";
                return "pending"; // default/recovering fallback
              };

              return (
                <motion.tr 
                  key={caseId} 
                  variants={rowVariants}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  whileHover={onRowClick ? { backgroundColor: 'rgba(255, 255, 255, 0.015)' } : {}}
                >
                  <td>
                    <div className="table-customer-cell">
                      <span className="table-customer-name">{customerName}</span>
                      <span className="table-customer-id">{caseId}</span>
                    </div>
                  </td>
                  <td>{category.toUpperCase().replace("_", " ")}</td>
                  <td className="table-amount-cell">₹{amount.toLocaleString()}</td>
                  <td className="table-amount-cell" style={{ color: isRecovered ? "var(--color-success)" : "var(--color-text-muted)", fontWeight: isRecovered ? "bold" : "normal" }}>
                    {isRecovered ? `+₹${recoveredAmount.toLocaleString()}` : "₹0"}
                  </td>
                  <td>
                    <span className={`risk-tag ${priority.toLowerCase()}`}>
                      {priority}
                    </span>
                  </td>
                  <td>
                    <div className="table-action-cell">
                      <Play className="table-action-icon" size={12} fill="currentColor" />
                      <span>{strategy}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(status)}`}>
                      <span className="status-indicator-dot" />
                      <span>{status}</span>
                    </span>
                  </td>
                </motion.tr>
              );
            })}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  No cases matched your search query
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export default RiskTable;
