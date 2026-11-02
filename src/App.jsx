import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "./hooks/useTheme.js";
import { NAV_LINKS } from "./data/index.js";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Works from "./components/Works.jsx";
import Experience from "./components/Experience.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import CustomCursor from "./components/ui/CustomCursor.jsx";


const SECTION_IDS = [...NAV_LINKS];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingFinished = useCallback(() => {
    setIsLoading(false);
  }, []);



  // Active section tracking using highly optimized native IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -55% 0px", // Triggers when the section dominates the viewport center
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <CustomCursor />
      {isLoading && <LoadingScreen onFinished={handleLoadingFinished} />}
      <div
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
            <Hero isLoaded={!isLoading} />
            <About />
            <Works />
            <Experience />
            <Contact />
            <Footer />
          </main>
        </div>
      </div>
    </>
  );
}