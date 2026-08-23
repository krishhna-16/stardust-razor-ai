import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";
import { useApex } from "../../hooks/useApex";
import "./RazorAI.css";

function RazorAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am Razor AI, your STARDUST autonomous assistant. Ask me anything about recovered revenue, active recovery cases, or APEX strategies!"
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);

  const { stats, metrics } = useApex();

  // Auto-dismiss introduction banner after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [messages, isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowIntro(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isThinking) return;

    const userText = inputValue.trim();

    // Show user's message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userText
      }
    ]);

    setInputValue("");
    setIsThinking(true);

    try {
      // Send question + current STARDUST data to backend
      const response = await fetch("http://localhost:3001/api/razor-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText,

          context: {
            activeCases: metrics?.global?.activeCases,
            escalatedCases: metrics?.global?.escalatedCases,
            recoveryRate: stats?.recoveryRate,
            recoveredRevenue: stats?.recovered,
            revenueAtRisk: stats?.revenueAtRisk,
            strategies: Object.keys(
              metrics?.recovery?.strategyCounts || {}
            )
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Razor AI backend returned an error."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            data?.answer ||
            "Razor AI could not generate a response."
        }
      ]);
    } catch (error) {
      console.error("Razor AI request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            "I'm having trouble connecting to Razor AI right now. Please make sure the STARDUST AI backend is running."
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Viewport Floating Introduction banner overlay */}
      <AnimatePresence>
        {showIntro && !isOpen && (
          <motion.div
            className="razor-ai-intro"
            initial={{
              opacity: 0,
              y: 15,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.95
            }}
            style={{
              position: "fixed",
              bottom: "84px",
              right: "24px",
              width: "280px",
              background: "rgba(6, 8, 20, 0.95)",
              border:
                "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "8px",
              padding: "16px",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.5)",
              zIndex: 9500,
              backdropFilter: "blur(12px)",
              textAlign: "left"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "8px"
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Sparkles size={12} />
                Meet Razor AI
              </span>

              <button
                onClick={() => setShowIntro(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                <X size={12} />
              </button>
            </div>

            <p
              style={{
                fontSize: "11.5px",
                color: "var(--color-text-secondary)",
                margin: "0 0 12px 0",
                lineHeight: "1.4"
              }}
            >
              Ask about your revenue recovery, active cases,
              or APEX decisions.
            </p>

            <button
              onClick={handleOpenChat}
              style={{
                background:
                  "rgba(255, 255, 255, 0.03)",
                border:
                  "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "10.5px",
                fontWeight: "600",
                padding: "6px 12px",
                cursor: "pointer",
                width: "100%",
                textAlign: "center"
              }}
            >
              Ask Razor AI →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Razor AI Closed Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="razor-ai-btn"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background:
              "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            border: "none",
            borderRadius: "999px",
            color: "#fff",
            padding: "12px 20px",
            fontWeight: "600",
            fontSize: "12.5px",
            boxShadow:
              "0 4px 20px rgba(79, 70, 229, 0.4)",
            cursor: "pointer"
          }}
        >
          <MessageSquare size={16} />
          <span>✦ Razor AI</span>
        </button>
      )}

      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="razor-ai-panel"
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.96
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.96
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 18
            }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              width: "100%",
              maxWidth: "360px",
              height: "460px",
              background: "rgba(6, 8, 20, 0.96)",
              border:
                "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "10px",
              boxShadow:
                "0 15px 40px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 9500,
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  "rgba(255,255,255,0.02)",
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
                padding: "14px 18px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background:
                      "rgba(79, 70, 229, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8"
                  }}
                >
                  <Bot size={14} />
                </div>

                <div>
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#fff",
                      margin: 0
                    }}
                  >
                    Razor AI
                  </h4>

                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--color-success)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        background:
                          "var(--color-success)",
                        borderRadius: "50%"
                      }}
                    />
                    Copilot Online
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf:
                      m.sender === "user"
                        ? "flex-end"
                        : "flex-start",
                    maxWidth: "85%",
                    background:
                      m.sender === "user"
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      m.sender === "user"
                        ? "1px solid rgba(99, 102, 241, 0.25)"
                        : "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    lineHeight: "1.4",
                    color: "#f1f5f9",
                    textAlign: "left"
                  }}
                >
                  {m.text}
                </div>
              ))}

              {isThinking && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    maxWidth: "85%",
                    background:
                      "rgba(255,255,255,0.02)",
                    border:
                      "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#94a3b8"
                  }}
                >
                  Razor AI is thinking...
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "12px",
                borderTop:
                  "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "8px",
                background:
                  "rgba(255,255,255,0.01)"
              }}
            >
              <input
                type="text"
                placeholder={
                  isThinking
                    ? "Razor AI is thinking..."
                    : "Ask Razor AI..."
                }
                value={inputValue}
                disabled={isThinking}
                onChange={(e) =>
                  setInputValue(e.target.value)
                }
                style={{
                  flex: 1,
                  background:
                    "rgba(0,0,0,0.2)",
                  border:
                    "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "12px",
                  outline: "none"
                }}
              />

              <button
                type="submit"
                disabled={isThinking}
                style={{
                  background:
                    "var(--color-accent-indigo)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isThinking
                    ? "not-allowed"
                    : "pointer",
                  opacity: isThinking ? 0.6 : 1
                }}
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RazorAI;