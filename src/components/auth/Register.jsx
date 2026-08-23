import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { register, validateEmail } from "../../services/authService";
import razorpayLogo from "../../assets/razorpay-logo.svg.svg";

function Register({ onSwitchToLogin, onAuthSuccess, addToast }) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validations
    if (!fullName.trim()) {
      addToast("Full name is required", "error");
      return;
    }

    if (!companyName.trim()) {
      addToast("Company name is required", "error");
      return;
    }

    if (!email) {
      addToast("Email address is required", "error");
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

    if (password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      const user = await register(fullName, companyName, email, password);
      addToast("✓ Account created successfully", "success");
      
      // Auto-login registered users or shift to login view. 
      // User request states: "After successful login, navigate to the existing Dashboard"
      // We will sign them up and directly trigger authentication success to enter the dashboard!
      setTimeout(() => {
        onAuthSuccess(user);
      }, 800);
    } catch (err) {
      addToast(err.message || "Registration failed", "error");
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
        <p className="auth-subtitle">Create your account</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="register-name">Full Name</label>
          <div className="input-container">
            <input
              type="text"
              id="register-name"
              className="auth-input"
              placeholder="Elon Musk"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-company">Company Name</label>
          <div className="input-container">
            <input
              type="text"
              id="register-company"
              className="auth-input"
              placeholder="SpaceX"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email Address</label>
          <div className="input-container">
            <input
              type="text"
              id="register-email"
              className="auth-input"
              placeholder="elon@spacex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Password</label>
          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="register-password"
              className="auth-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
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

        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
          <div className="input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="register-confirm"
              className="auth-input"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? "Generating keys..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>
        <button
          type="button"
          className="auth-footer-btn"
          onClick={onSwitchToLogin}
          disabled={loading}
        >
          Login
        </button>
      </div>
    </>
  );
}

export default Register;
