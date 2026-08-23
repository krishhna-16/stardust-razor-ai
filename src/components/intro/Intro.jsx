import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import razorpayLogo from "../../assets/razorpay-logo.svg.svg";
import "./Intro.css";

function Intro({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);

  const startExperience = () => {
    setStarted(true);

    // =====================================
    // CINEMATIC SEQUENCE
    // =====================================

    // Razorpay timing — unchanged
    setTimeout(() => setStage(1), 150);

    // Stardust
    setTimeout(() => setStage(2), 1500);

    // Apex
    setTimeout(() => setStage(3), 2800);

    // Apex stays for 2.4 seconds
    setTimeout(() => setStage(4), 5200);

    // NO automatic onComplete()
    // ONLINE stays until ENTER STARDUST is clicked.
  };

  // =====================================
  // STARS
  // =====================================

  const stars = Array.from({ length: 35 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${4 + Math.random() * 4}s`,
    delay: `${Math.random() * 3}s`,
  }));

  return (
    <main className="intro">

      {/* GALAXY */}
      <div className="galaxy" />

      {/* STARS */}
      <div className="stars-layer">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              "--star-duration": star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* START SCREEN */}
      {!started && (
        <motion.div
          className="start-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          <motion.div
            className="start-symbol"
            animate={{
              opacity: [0.35, 1, 0.35],
              scale: [0.95, 1.03, 0.95],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.div>

          <p className="start-label">
            STARDUST
          </p>

          <h1>
            AI REVENUE RECOVERY
          </h1>

          <button
            type="button"
            onClick={startExperience}
          >
            START EXPERIENCE
          </button>

        </motion.div>
      )}

      {/* CINEMATIC INTRO */}
      {started && (
        <div className="intro-stage">

          <AnimatePresence mode="wait">

            {/* RAZORPAY */}
            {stage === 1 && (
              <motion.div
                key="razorpay"
                className="scene razorpay-scene"
                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.04,
                  y: -10,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >

                <img
                  src={razorpayLogo}
                  className="razorpay-logo"
                  alt="Razorpay"
                />

                <p>
                  AI BUILDER
                </p>

              </motion.div>
            )}

            {/* STARDUST */}
            {stage === 2 && (
              <motion.div
                key="stardust"
                className="scene stardust-scene"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.04,
                  y: -15,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >

                <h1 className="stardust-title">
                  STARDUST
                </h1>

                <p>
                  AI REVENUE RECOVERY PLATFORM
                </p>

              </motion.div>
            )}

            {/* APEX 1.0 */}
            {stage === 3 && (
              <motion.div
                key="apex"
                className="scene apex-scene"
                initial={{
                  opacity: 0,
                  scale: 0.75,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.08,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >

                <div className="apex-core">

                  <span>
                    APEX
                  </span>

                  <strong>
                    1.0
                  </strong>

                </div>

                <h2 className="apex-title">
                  AUTONOMOUS REVENUE AGENT
                </h2>

              </motion.div>
            )}

            {/* ONLINE */}
            {stage === 4 && (
              <motion.div
                key="online"
                className="scene online-scene"
                initial={{
                  opacity: 0,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >

                <div className="online-dot" />

                <h2>
                  SYSTEM STATUS
                </h2>

                <h1 className="online">
                  ONLINE
                </h1>

                <motion.button
                  type="button"
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.15,
                    duration: 0.3,
                  }}
                  onClick={() => {
                    if (onComplete) {
                      onComplete();
                    }
                  }}
                >
                  ENTER STARDUST
                </motion.button>

              </motion.div>
            )}

          </AnimatePresence>

        </div>
      )}

      {/* FOOTER */}
      <div className="intro-footer">
        STARDUST&nbsp;&nbsp;/&nbsp;&nbsp;APEX 1.0
      </div>

    </main>
  );
}

export default Intro;