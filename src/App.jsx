import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./hooks/useTheme.js";
import { NAV_LINKS } from "./data/index.js";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Works from "./components/Works.jsx";
import Experience from "./components/Experience.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";


const SECTION_IDS = [...NAV_LINKS];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const containerRef = useRef(null);

  // Discrete background color per section mimicking Occupied.unadsgn.tw
  // Uses sharp Japanese red (#B30000) and deep black/charcoal (#060608)
  const sectionColorsDark = {
    home: "#060608",
    about: "#9C0D0D",
    works: "#060608",
    contact: "#060608",
  };

  const sectionColorsLight = {
    home: "#f7f6f3",
    about: "#f4eaea",
    works: "#f7f6f3",
    contact: "#f7f6f3",
  };

  const currentBgMap = theme === "dark" ? sectionColorsDark : sectionColorsLight;
  const backgroundColor = currentBgMap[activeSection] || currentBgMap.home;

  // Scroll-position based active section tracking
  useEffect(() => {
    const OFFSET = 100;

    const getActive = () => {
      const sections = SECTION_IDS
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter((s) => s.el)
        .sort((a, b) => a.el.offsetTop - b.el.offsetTop);

      const nearBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
      if (nearBottom) {
        const lastNav = [...sections].reverse().find((s) => NAV_LINKS.includes(s.id));
        if (lastNav) return lastNav.id;
      }

      let current = sections[0]?.id ?? SECTION_IDS[0];
      for (const { id, el } of sections) {
        if (el.getBoundingClientRect().top <= OFFSET) {
          current = id;
        }
      }
      return current;
    };

    const onScroll = () => setActiveSection(getActive());
    window.addEventListener("scroll", onScroll, { passive: true });
    setActiveSection(getActive());
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="layout"
      ref={containerRef}
    >
      {/* Grain noise texture */}
      <div className="grain" aria-hidden="true" />

      <div className="container">
        <Navbar
          activeSection={activeSection}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main aria-label="Portfolio main content">
          <Hero />
          <About />
          <Works />
          <Experience />
          <Contact />
          <Footer />
        </main>
      </div>
    </motion.div>
  );
}