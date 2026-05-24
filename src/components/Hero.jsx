import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import HeroImg from "../assets/hero.png";
import Grainient from "./ui/Grainient.jsx";
import { NAV_LINKS } from "../data/index.js";

function scrollTo(id) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.78, delay, ease: [0.22, 1, 0.36, 1] },
});

const centerUp = (delay = 0) => ({
  initial: { opacity: 0, y: "calc(-50% + 22px)", x: "-50%" },
  animate: { opacity: 1, y: "-50%", x: "-50%" },
  transition: { duration: 0.78, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  return (
    <header id="home" className="hero">
      {/* Animated gradient background */}
      <div className="heroGrainientBg" aria-hidden="true">
        <Grainient
          color1="#3A3A3A"
          color2="#6B6B6B"
          color3="#1A1A1A"
          timeSpeed={1.25}
          colorBalance={0.0}
          warpStrength={1.0}
          warpFrequency={5.0}
          warpSpeed={7.0}
          warpAmplitude={50.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={500.0}
          noiseScale={2.0}
          grainAmount={0.1}
          grainScale={2.0}
          grainAnimated={false}
          contrast={1.5}
          gamma={1.0}
          saturation={1.0}
          centerX={0.0}
          centerY={0.0}
          zoom={0.9}
        />
      </div>
      <div className="heroInner">
        <div className="heroStackedWrap">
          {/* Name & Image & CTAs Stack */}
          <div className="heroCenterStack">
            <div className="heroNameWrapper">
              <div className="heroNameTopBar">
                <motion.p className="heroNameTopLeft" {...up(0.05)}>
                  HEY, HELLO, I AM
                </motion.p>
                <motion.div className="heroNameTopRight" {...up(0.05)}>
                  {NAV_LINKS.map(id => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollTo(id)}
                      aria-label={`Scroll to ${id}`}
                    >
                      {id}
                    </button>
                  ))}
                </motion.div>
              </div>

              <motion.h1 className="heroNameLine" {...up(0.12)}>
                <span className="heroNameWord">Raely</span>
                <span className="heroNameWord">Ivan</span>
                <span className="heroNameWord">Reyes</span>
              </motion.h1>

              <motion.div className="heroNameBottomRoles" {...up(0.20)}>
                <span>Full Stack Developer</span>
                <span>UI/UX Designer</span>
                <span>Graphic Designer</span>
                <span>Mobile App Developer</span>
              </motion.div>
            </div>

            <motion.div
              className="heroImageBlock"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="heroImgWrap">
                <div className="heroImgFrame">
                  <img src={HeroImg} alt="Raely Ivan Reyes" className="heroImg" />
                </div>
              </div>
            </motion.div>

            <motion.div className="heroCtas" {...centerUp(0.54)}>
              <motion.button
                type="button"
                className="btn btnPrimary"
                onClick={() => scrollTo("works")}
                aria-label="View works section"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
              >
                View Works
              </motion.button>
              <motion.button
                type="button"
                className="btn btnGhost"
                onClick={() => scrollTo("contact")}
                aria-label="Scroll to contact section"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
              >
                Contact Me
              </motion.button>
            </motion.div>
          </div>


        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="heroScroll"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <div className="heroScrollLine" />
        <div className="heroScrollText">SCROLL</div>
        <div className="heroScrollIcon">
          <ChevronDown size={13} />
        </div>
      </motion.div>
    </header>
  );
}
