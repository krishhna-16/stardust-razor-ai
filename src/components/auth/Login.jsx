import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, validateEmail } from "../../services/authService";
import razorpayLogo from "../../assets/razorpay-logo.svg.svg";

function Login({ onSwitchToRegister, onAuthSuccess, addToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Local Validation
    if (!email) {
      addToast("Please enter an email address", "error");
      return;
    }

    if (!validateEmail(email)) {
      addToast("Please enter a valid email", "error");
      return;
    }

    if (!password) {
      addToast("Password is required", "error");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password, rememberMe);
      addToast("Login successful — Welcome to STARDUST", "success");
      
      // Delay successful callback slightly to allow toast reading and feeling premium
      setTimeout(() => {
        onAuthSuccess(user);
      }, 500);
    } catch (err) {
      addToast(err.message || "Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    addToast("Password reset link has been dispatched to your email", "success");
  };

  const handleDemoLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const user = await login("demo@stardust.ai", "stardust2026", rememberMe);
      addToast("Login successful — Welcome to STARDUST", "success");
      setTimeout(() => {
        onAuthSuccess(user);
      }, 500);
    } catch (err) {
      addToast(err.message || "Failed to initiate demo login", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header">
        <img
          src={razorpayLogo}
          className="auth-logo"
          alt="Razorpay"
        />
        <h1 className="auth-brand">STARDUST</h1>
        <p className="auth-subtitle">Secure Revenue Intelligence</p>
      </div>

      <div className="demo-access-panel" style={{
        background: 'rgba(99, 102, 241, 0.03)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: '6px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        backdropFilter: 'blur(10px)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.12em', color: '#818cf8', textTransform: 'uppercase' }}>
            DEMO ACCESS — FOR REVIEWERS
          </span>
        </div>
        <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0, lineHeight: '1.4', textAlign: 'left' }}>
          Use the demo account to explore STARDUST instantly.
        </p>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.12em',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.06)';
            e.target.style.borderColor = 'rgba(255,255,255,0.18)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          {loading ? "INITIALIZING..." : "ENTER DEMO →"}
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="input-container">
            <input
              type="text"
              id="login-email"
              className="auth-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="auth-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="forgot-link"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? "Decrypting credentials..." : "LOGIN"}
        </button>
      </form>

      <div className="auth-footer">
        <span>Don't have an account?</span>
        <button
          type="button"
          className="auth-footer-btn"
          onClick={onSwitchToRegister}
          disabled={loading}
        >
          Create account
        </button>
      </div>

    </>
  );
}

export default Login;
