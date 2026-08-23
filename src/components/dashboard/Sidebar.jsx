import { 
  LayoutDashboard, 
  RefreshCw, 
  CreditCard, 
  Repeat, 
  FileText, 
  ShoppingCart, 
  BarChart3,
  LogOut
} from "lucide-react";

function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "recovery", label: "Recovery", icon: RefreshCw },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "subscriptions", label: "Subscriptions", icon: Repeat },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "checkout", label: "Checkout", icon: ShoppingCart },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">✦</span>
          <span className="sidebar-brand-name">STARDUST</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-menu-item ${activeTab === item.id ? "active" : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-agent-status">
          <div className="sidebar-agent-info">
            <span className="sidebar-agent-name">APEX 1.0</span>
            <div className="sidebar-agent-online">
              <span className="sidebar-agent-dot" />
              <span>ONLINE</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="sidebar-menu-item"
          style={{ marginTop: '8px', width: '100%', display: 'flex', alignItems: 'center' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
