import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

function Auth({ onAuthSuccess }) {
  const [view, setView] = useState("login"); // "login" | "register"
  const [toasts, setToasts] = useState([]);

  // Toast notification trigger
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="auth-wrapper">
      {/* Background aesthetics */}
      <div className="auth-stars" />
      <div className="auth-nebula" />

      {/* Forms Container with Transition */}
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            className="auth-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Login
              onSwitchToRegister={() => setView("register")}
              onAuthSuccess={onAuthSuccess}
              addToast={addToast}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            className="auth-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Register
              onSwitchToLogin={() => setView("login")}
              onAuthSuccess={onAuthSuccess}
              addToast={addToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification Container */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              onClick={() => removeToast(toast.id)}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="toast-icon" size={14} />
              ) : (
                <XCircle className="toast-icon" size={14} />
              )}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Auth;
