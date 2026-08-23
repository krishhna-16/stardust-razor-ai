import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { recoveryChartData } from "./mockData";

function RecoveryChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, data: null });
  const svgRef = useRef(null);

  // SVG coordinates configuration
  const width = 1000;
  const height = 220;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxY = 15; // Max value in our dataset scale (Lakhs)

  // Math mappings
  const getX = (index) => {
    return paddingLeft + (index / (recoveryChartData.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return height - paddingBottom - (val / maxY) * chartHeight;
  };

  // Generate paths
  const makeLinePath = (key) => {
    return recoveryChartData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`)
      .join(" ");
  };

  const makeAreaPath = (key) => {
    const linePath = makeLinePath(key);
    return `${linePath} L ${getX(recoveryChartData.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
  };

  const atRiskLine = makeLinePath("atRisk");
  const inRecoveryLine = makeLinePath("inRecovery");
  const recoveredLine = makeLinePath("recovered");

  const atRiskArea = makeAreaPath("atRisk");
  const inRecoveryArea = makeAreaPath("inRecovery");
  const recoveredArea = makeAreaPath("recovered");

  // Handle mouse hovering to locate closest point
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouseX to the coordinate space of the viewBox
    const viewBoxX = (mouseX / rect.width) * width;
    
    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    recoveryChartData.forEach((_, i) => {
      const diff = Math.abs(getX(i) - viewBoxX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setHoveredIndex(closestIdx);

    // Calculate tooltip position (absolute in the container)
    // Place tooltip relative to the hovered item position
    const itemX = (getX(closestIdx) / width) * rect.width;
    const itemY = (getY(recoveryChartData[closestIdx].atRisk) / height) * rect.height;

    setTooltip({
      show: true,
      x: itemX,
      y: Math.max(10, itemY - 95),
      data: recoveryChartData[closestIdx],
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  // Render Horizontal Gridlines
  const yTicks = [0, 5, 10, 15];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-box">
          <span className="chart-title">RECOVERY PERFORMANCE</span>
          <span className="chart-subtitle">Historical values in Lakhs (INR)</span>
        </div>

        <div className="chart-legends">
          <div className="legend-item">
            <span className="legend-dot at-risk" />
            <span>At Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot in-recovery" />
            <span>In Recovery</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot recovered" />
            <span>Recovered</span>
          </div>
        </div>
      </div>

      <div 
        className="svg-chart-container" 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg 
          ref={svgRef} 
          viewBox={`0 0 ${width} ${height}`} 
          className="svg-chart-canvas"
        >
          <defs>
            <linearGradient id="grad-at-risk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-in-recovery" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad-recovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y Axis Gridlines & Labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line 
                x1={paddingLeft} 
                y1={getY(tick)} 
                x2={width - paddingRight} 
                y2={getY(tick)} 
                className={tick === 0 ? "chart-axis-line" : "chart-grid-line"}
              />
              <text 
                x={paddingLeft - 12} 
                y={getY(tick) + 3} 
                textAnchor="end" 
                className="chart-text"
              >
                ₹{tick}L
              </text>
            </g>
          ))}

          {/* X Axis labels */}
          {recoveryChartData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="chart-text"
            >
              {d.day}
            </text>
          ))}

          {/* Area Gradients */}
          <path d={atRiskArea} className="chart-area-path at-risk" />
          <path d={inRecoveryArea} className="chart-area-path in-recovery" />
          <path d={recoveredArea} className="chart-area-path recovered" />

          {/* Main Lines */}
          <motion.path 
            d={atRiskLine} 
            className="chart-line-path at-risk"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.path 
            d={inRecoveryLine} 
            className="chart-line-path in-recovery"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
          />
          <motion.path 
            d={recoveredLine} 
            className="chart-line-path recovered"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />

          {/* Interactive Hover Guides */}
          {hoveredIndex !== null && (
            <>
              {/* Vertical Guide Line */}
              <line
                x1={getX(hoveredIndex)}
                y1={paddingTop}
                x2={getX(hoveredIndex)}
                y2={height - paddingBottom}
                className="chart-hover-line"
              />

              {/* Glowing Dots */}
              <g className="chart-hover-dots">
                <circle 
                  cx={getX(hoveredIndex)} 
                  cy={getY(recoveryChartData[hoveredIndex].atRisk)} 
                  r="5" 
                  fill="#3b82f6" 
                  stroke="#010103" 
                />
                <circle 
                  cx={getX(hoveredIndex)} 
                  cy={getY(recoveryChartData[hoveredIndex].inRecovery)} 
                  r="5" 
                  fill="#8b5cf6" 
                  stroke="#010103" 
                />
                <circle 
                  cx={getX(hoveredIndex)} 
                  cy={getY(recoveryChartData[hoveredIndex].recovered)} 
                  r="5" 
                  fill="#10b981" 
                  stroke="#010103" 
                />
              </g>
            </>
          )}
        </svg>

        {/* Dynamic Tooltip Element */}
        {tooltip.show && tooltip.data && (
          <div 
            className="chart-tooltip" 
            style={{ 
              left: `${tooltip.x}px`, 
              top: `${tooltip.y}px` 
            }}
          >
            <div className="chart-tooltip-header">{tooltip.data.day}</div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">At Risk:</span>
              <span className="chart-tooltip-val at-risk">₹{tooltip.data.atRisk}L</span>
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">In Recovery:</span>
              <span className="chart-tooltip-val in-recovery">₹{tooltip.data.inRecovery}L</span>
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-label">Recovered:</span>
              <span className="chart-tooltip-val recovered">₹{tooltip.data.recovered}L</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecoveryChart;
