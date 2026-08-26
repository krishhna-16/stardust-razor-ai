import React, { useState } from "react";
import "./RazorAI.css";

const questions = [
  {
    title: "Revenue & Recovery",
    subtitle: "Understand your recovery performance",
    answer:
      "STARDUST monitors revenue at risk, recovered revenue, active cases and recovery performance through the APEX 1.0 engine."
  },
  {
    title: "APEX Cases",
    subtitle: "Understand cases, risks and decisions",
    answer:
      "APEX detects revenue-risk events, diagnoses their root cause, selects a recovery strategy and applies safety stopping rules before recovery."
  },
  {
    title: "Payments",
    subtitle: "Understand payment failures",
    answer:
      "APEX analyzes payment failures such as insufficient funds, expired payment methods and gateway/network failures, then selects an appropriate recovery strategy."
  },
  {
    title: "Subscriptions & Invoices",
    subtitle: "Understand failed renewals and overdue accounts",
    answer:
      "STARDUST monitors failed subscription renewals and overdue invoices, identifies the cause and determines whether automated recovery or escalation is appropriate."
  },
  {
    title: "Recovery Strategies",
    subtitle: "Understand APEX recovery decisions",
    answer:
      "APEX can select strategies such as Smart Retry, Payment Method Update, Retry, Checkout Recovery and Receivables Chase depending on the diagnosed situation."
  }
];

export default function RazorAI({ stats, metrics }) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [supportOpen, setSupportOpen] = useState(false);
  const [problem, setProblem] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const sendMessage = async (text) => {
    const question = text.trim();

    if (!question) return;

    setMessages((prev) => [
      ...prev,
      { type: "user", text: question },
      { type: "ai", text: "Razor AI is thinking..." }
    ]);

    setInput("");

    try {
      const response = await fetch("http://localhost:3001/api/razor-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question,
          context: {
            activeCases: stats?.activeCases ?? 0,
            escalatedCases: metrics?.global?.escalatedCases ?? 0,
            recoveryRate: stats?.recoveryRate ?? "0%",
            recoveredRevenue: stats?.recovered ?? "₹0.0L",
            revenueAtRisk: stats?.revenueAtRisk ?? "₹0.0L"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Razor AI server error");
      }

      const data = await response.json();

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          type: "ai",
          text:
            data.answer ||
            "Razor AI could not generate a response."
        };

        return updated;
      });
    } catch (error) {
      console.error("Razor AI connection error:", error);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          type: "ai",
          text:
            "Razor AI is temporarily unavailable. Please make sure the Razor AI backend is running."
        };

        return updated;
      });
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submitSupport = () => {
    if (!problem.trim()) return;

    setSupportSent(true);
    setProblem("");
  };

  return (
    <>
      {!open && (
        <div className="razor-ai-intro">
          <div className="razor-ai-intro-title">
            <span className="razor-ai-sparkle">✦</span>
            Meet Razor AI
          </div>

          <div className="razor-ai-intro-text">
            Ask about your revenue recovery, active cases, or APEX decisions.
          </div>

          <button onClick={handleOpen}>
            Ask Razor AI →
          </button>
        </div>
      )}

      {!open && (
        <button
          className="razor-ai-floating"
          onClick={handleOpen}
          aria-label="Open Razor AI"
        >
          <span className="razor-ai-logo">✦</span>
          Razor AI
        </button>
      )}

      {open && !accepted && (
        <div className="razor-ai-panel razor-ai-disclaimer-panel">
          <div className="razor-ai-header">
            <div>
              <div className="razor-ai-title">
                <span className="razor-ai-logo">✦</span>
                Razor AI
              </div>

              <div className="razor-ai-subtitle">
                Revenue Recovery Intelligence
              </div>
            </div>

            <button
              className="razor-ai-close"
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div className="razor-ai-disclaimer">
            <div className="razor-ai-big-logo">✦</div>

            <h3>Razor AI Disclaimer</h3>

            <p>
              Razor AI provides AI-generated information based on data
              available in STARDUST.
            </p>

            <p>
              Responses are for informational purposes only and should be
              reviewed before taking action.
            </p>

            <p className="razor-ai-demo-note">
              Payment and recovery actions shown in this demo are simulated.
            </p>

            <button
              className="razor-ai-primary"
              onClick={() => setAccepted(true)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {open && accepted && (
        <div className="razor-ai-panel">
          <div className="razor-ai-header">
            <div>
              <div className="razor-ai-title">
                <span className="razor-ai-logo">✦</span>
                Razor AI
              </div>

              <div className="razor-ai-subtitle">
                Revenue Recovery Intelligence
              </div>
            </div>

            <button
              className="razor-ai-close"
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div className="razor-ai-demo-badge">
            DEMO / SANDBOX
          </div>

          <div className="razor-ai-content">
            {messages.length === 0 && !supportOpen && (
              <>
                <div className="razor-ai-welcome">
                  <div className="razor-ai-big-logo">
                    ✦
                  </div>

                  <h3>
                    What would you like to know?
                  </h3>

                  <p>
                    Choose a topic below to explore STARDUST and APEX.
                  </p>
                </div>

                <div className="razor-ai-options">
                  {questions.map((item, index) => (
                    <button
                      key={item.title}
                      className="razor-ai-option"
                      onClick={() => sendMessage(item.title)}
                    >
                      <span className="razor-ai-option-number">
                        0{index + 1}
                      </span>

                      <span>
                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.subtitle}
                        </small>
                      </span>

                      <span className="razor-ai-arrow">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`razor-ai-message ${
                  message.type === "user"
                    ? "user"
                    : "assistant"
                }`}
              >
                {message.type === "ai" && (
                  <span className="razor-ai-message-logo">
                    ✦
                  </span>
                )}

                {message.text}
              </div>
            ))}

            {supportOpen && (
              <div className="razor-ai-support">
                {!supportSent ? (
                  <>
                    <button
                      className="razor-ai-back"
                      onClick={() => setSupportOpen(false)}
                    >
                      ← Back to Razor AI
                    </button>

                    <h3>
                      Send your problem to us
                    </h3>

                    <p>
                      Tell us what you need help with and our service team can
                      review your request.
                    </p>

                    <textarea
                      value={problem}
                      onChange={(e) =>
                        setProblem(e.target.value)
                      }
                      placeholder="Describe your problem..."
                    />

                    <button
                      className="razor-ai-primary"
                      onClick={submitSupport}
                    >
                      Send Request →
                    </button>

                    <small className="razor-ai-demo-note">
                      Demo/Sandbox submission. No external message is sent.
                    </small>
                  </>
                ) : (
                  <div className="razor-ai-support-success">
                    <div className="razor-ai-success-icon">
                      ✓
                    </div>

                    <h3>
                      Request submitted
                    </h3>

                    <p>
                      Your support request has been recorded in the
                      STARDUST demo environment.
                    </p>

                    <p className="razor-ai-demo-note">
                      In a production deployment, this request can be routed
                      to the connected support service.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!supportOpen && (
            <>
              <div className="razor-ai-other">
                <span>
                  Didn't find what you need?
                </span>

                <button
                  onClick={() => setSupportOpen(true)}
                >
                  Other questions →
                </button>
              </div>

              <div className="razor-ai-input">
                <input
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask Razor AI..."
                />

                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}