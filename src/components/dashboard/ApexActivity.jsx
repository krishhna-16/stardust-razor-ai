import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ApexActivity({ cases }) {
  const activeCases = cases || [];

  // Flatten and map status histories of the most recent cases
  const activities = [];
  activeCases.slice(0, 4).forEach((c) => {
    c.statusHistory.forEach((h, idx) => {
      const stepId = `${c.caseId}-${h.status}-${idx}`;

      const formatTime = (isoStr) => {
        try {
          const date = new Date(isoStr);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
          return "00:00:00";
        }
      };

      activities.push({
        id: stepId,
        time: formatTime(h.timestamp),
        type: h.status, // DETECTED, DIAGNOSED, DECIDED, INTERVENED, RECOVERED, etc.
        amount: `₹${c.amount.toLocaleString()}`,
        customer: c.customer,
        detail: h.message,
        timestamp: new Date(h.timestamp).getTime(),
      });
    });
  });

  // Sort latest event first
  activities.sort((a, b) => b.timestamp - a.timestamp);

  // Map APEX engine status flags to existing css badge classes
  const getBadgeClass = (statusType) => {
    switch (statusType) {
      case "DETECTED":
      case "FAILED":
        return "detected";
      case "DIAGNOSED":
      case "ESCALATED":
        return "diagnosed";
      case "DECIDED":
      case "INTERVENED":
        return "action";
      default:
        return "recovered"; // RECOVERED or CLOSED
    }
  };

  return (
    <div className="activity-card">
      <div className="activity-header">
        <span className="activity-title">APEX AGENT ACTIVITY FEED</span>
        <div className="activity-live-indicator">
          <span className="activity-live-dot" />
          <span>LIVE TRACKING</span>
        </div>
      </div>

      <div className="activity-scroll-area">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 14,
              }}
              className="activity-item"
            >
              <div className="activity-item-top">
                <span className={`activity-badge ${getBadgeClass(item.type)}`}>
                  APEX {item.type}
                </span>
                <span className="activity-time">{item.time}</span>
              </div>

              <div className="activity-item-content">
                <span className="activity-subject">{item.type.charAt(0) + item.type.slice(1).toLowerCase()} Action</span>
                <span className="activity-amount">{item.amount}</span>
              </div>

              <div className="activity-item-details">
                <span className="activity-client">{item.customer}</span>
                <span className="activity-desc" title={item.detail}>
                  {item.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ApexActivity;
