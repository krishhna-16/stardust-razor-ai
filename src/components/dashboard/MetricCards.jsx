import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Activity, Zap } from "lucide-react";
import { metricCardsData } from "./mockData";

const iconMap = {
  AlertTriangle: AlertTriangle,
  ShieldCheck: ShieldCheck,
  Activity: Activity,
  Zap: Zap,
};

function MetricCards({ stats }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Safe fallback stats in case props aren't loaded yet
  const activeStats = stats || {
    revenueAtRisk: "₹12.4L",
    recovered: "₹4.8L",
    activeCases: 38,
    recoveryRate: "68.4%",
  };

  const dynamicCards = metricCardsData.map((card) => {
    let value = card.value;
    if (card.id === "risk") value = activeStats.revenueAtRisk;
    if (card.id === "recovered") value = activeStats.recovered;
    if (card.id === "cases") value = activeStats.activeCases;
    if (card.id === "rate") value = activeStats.recoveryRate;

    return {
      ...card,
      value,
    };
  });

  return (
    <motion.div
      className="metric-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {dynamicCards.map((card) => {
        const IconComponent = iconMap[card.icon];
        const isRisk = card.id === "risk";
        const isRecovered = card.id === "recovered";

        return (
          <motion.div
            key={card.id}
            className="metric-card"
            variants={cardVariants}
            whileHover={{ y: -3 }}
          >
            <div className="metric-card-bg-glow" />
            <div className="metric-card-top">
              <span className="metric-label">{card.label}</span>
              <div className="metric-icon-box">
                {IconComponent && <IconComponent size={16} />}
              </div>
            </div>

            <div className="metric-card-bottom">
              <span className="metric-value">{card.value}</span>
              <span
                className={`metric-change ${
                  isRisk ? "up" : isRecovered ? "success" : "stable"
                }`}
              >
                {card.change}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default MetricCards;
