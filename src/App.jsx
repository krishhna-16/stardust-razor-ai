import { useState, useEffect } from "react";
import Intro from "./components/intro/Intro";
import Auth from "./components/auth/Auth";
import Dashboard from "./components/dashboard/Dashboard";
import { getCurrentUser, logout } from "./services/authService";

function App() {
  const [flowStage, setFlowStage] = useState("intro"); // "intro" | "auth" | "dashboard"

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const user = getCurrentUser();

      if (hash === "#/dashboard") {
        if (user) {
          setFlowStage("dashboard");
        } else {
          window.location.hash = "#/login";
          setFlowStage("auth");
        }
      } else if (hash === "#/login" || hash === "#/register") {
        if (user) {
          window.location.hash = "#/dashboard";
          setFlowStage("dashboard");
        } else {
          setFlowStage("auth");
        }
      } else {
        // No hash (default intro or dashboard if authenticated)
        if (user) {
          window.location.hash = "#/dashboard";
          setFlowStage("dashboard");
        } else {
          setFlowStage("intro");
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleAuthSuccess = () => {
    window.location.hash = "#/dashboard";
    setFlowStage("dashboard");
  };

  const handleLogout = () => {
    logout();
    window.location.hash = "#/login";
    setFlowStage("auth");
  };

  return (
    <>
      {flowStage === "intro" && (
        <Intro onComplete={() => {
          const user = getCurrentUser();
          if (user) {
            window.location.hash = "#/dashboard";
            setFlowStage("dashboard");
          } else {
            window.location.hash = "#/login";
            setFlowStage("auth");
          }
        }} />
      )}

      {flowStage === "auth" && (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}

      {flowStage === "dashboard" && (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;