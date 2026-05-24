import React, { useState, useEffect } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import { NAV_LINKS, SITE_META } from "../data/index.js";
import StaggeredMenu from "./ui/StaggeredMenu.jsx";

const MotionDiv = motion.div;

function scrollTo(id) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar({ activeSection, theme }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 240, damping: 36, mass: 0.6 });
  const progressScaleX = useTransform(progress, [0, 1], [0, 1]);

  const [isOverLightSection, setIsOverLightSection] = useState(theme === 'light');
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 819px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    let ticking = false;

    const getColorLightness = (color) => {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;

      const [r, g, b, alpha = 1] = match[1]
        .split(",")
        .map((value) => Number.parseFloat(value.trim()));

      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || alpha < 0.2) {
        return null;
      }

      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
    };
    
    const checkBackground = () => {
      // Check what element is directly under the navbar's menu button (top right)
      // We use X: window.innerWidth - 60, Y: 40
      const x = window.innerWidth - 60;
      const y = 56;
      const elements = document.elementsFromPoint(x, y);
      if (!elements || elements.length === 0) return;

      let detectedLight = null;
      let fallbackLight = null;

      for (const el of elements) {
        if (el.closest?.(".sm-scope") || el.classList?.contains("grain")) continue;

        let node = el;
        while (node && node !== document.documentElement) {
          if (node.closest?.(".sm-scope")) break;
          const isLight = getColorLightness(window.getComputedStyle(node).backgroundColor);
          if (node === document.body) {
            fallbackLight = fallbackLight ?? isLight;
            break;
          }
          if (isLight !== null) {
            detectedLight = isLight;
            break;
          }
          node = node.parentElement;
        }
        if (detectedLight !== null) break;
      }

      detectedLight = detectedLight ?? fallbackLight;

      if (detectedLight !== null) {
        setIsOverLightSection(detectedLight);
        if (detectedLight) {
          document.documentElement.classList.add('light-scrollbar');
        } else {
          document.documentElement.classList.remove('light-scrollbar');
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkBackground);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Check a few times after mount because some sections change tone from scroll-linked animation.
    const initialChecks = [100, 350, 800].map((delay) => setTimeout(checkBackground, delay));
    const backgroundPoll = setInterval(checkBackground, 500);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      initialChecks.forEach((id) => clearTimeout(id));
      clearInterval(backgroundPoll);
    };
  }, [theme, activeSection]);

  const menuItems = NAV_LINKS.map(id => ({
    label: id,
    ariaLabel: `Go to ${id} section`,
    link: `#${id}`,
    onClick: () => scrollTo(id)
  }));

  const socialItems = [
    { label: 'Email', link: `mailto:${SITE_META.email}` },
    { label: 'GitHub', link: SITE_META.github },
    { label: 'LinkedIn', link: SITE_META.linkedin }
  ];

  const showHeader = activeSection !== "home" || isMobileViewport;
  const isLightNavSurface = isOverLightSection || activeSection === "works";
  const menuButtonPalette = {
    color: "#111111",
    bg: "#ffffff",
    border: isLightNavSurface ? "rgba(17, 17, 17, 0.12)" : "rgba(255, 255, 255, 0.72)",
  };
  const logoColor = isLightNavSurface ? "#111111" : "#ffffff";

  const openMenuButtonPalette = {
    color: "#111111",
    bg: "#ffffff",
    border: "rgba(255, 255, 255, 0.72)",
  };

  return (
    <>
      <MotionDiv
        initial={{ top: -100 }}
        animate={{ top: showHeader ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          left: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 999,
          pointerEvents: 'none'
        }}
      >
        <StaggeredMenu
          isFixed={false}
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          theme={theme}
          logoColor={logoColor}
          menuButtonColor={menuButtonPalette.color}
          menuButtonBackgroundColor={menuButtonPalette.bg}
          menuButtonBorderColor={menuButtonPalette.border}
          openMenuButtonColor={openMenuButtonPalette.color}
          openMenuButtonBackgroundColor={openMenuButtonPalette.bg}
          openMenuButtonBorderColor={openMenuButtonPalette.border}
          changeMenuColorOnOpen={true}
          colors={theme === 'light' ? ['#e0e0e0', '#f0f0f0'] : ['#9C0D0D', '#e60000']}
          logoUrl="" 
          accentColor="#E60000"
        />
      </MotionDiv>

      {/* Scroll progress bar */}
      <MotionDiv
        className="navProgress"
        style={{ 
          scaleX: progressScaleX,
          backgroundColor: isLightNavSurface ? '#1a1a1a' : 'var(--text)'
        }}
        aria-hidden="true"
      />
    </>
  );
}
