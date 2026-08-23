import razorpayLogo from "../../assets/razorpay-logo.svg.svg";

function Topbar() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">STARDUST</span>
        </div>

        <div className="topbar-center">
          <span className="topbar-agent-label">APEX 1.0</span>
          <div className="topbar-status-tag">
            <span className="topbar-status-dot" />
            <span>ONLINE</span>
          </div>
        </div>
      </header>

      {/* CRITICAL REQUIREMENT: Fixed in the viewport top-right, visible above scrolling */}
      <div className="razorpay-badge" id="fixed-razorpay-logo">
        <img
          src={razorpayLogo}
          alt="Razorpay"
        />
        <span>AI BUILDER</span>
      </div>
    </>
  );
}

export default Topbar;
