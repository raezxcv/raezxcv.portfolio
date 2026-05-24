import { useEffect, useMemo, useState, useRef } from "react";
import { NAV_LINKS, SITE_META } from "../data/index.js";
import Grainient from "./ui/Grainient.jsx";

const SPLINE_SCENE = "https://prod.spline.design/bFZ6AT7vuNNrpNib/scene.splinecode";
const SPLINE_VIEWER_SRC = "https://unpkg.com/@splinetool/viewer@1.12.87/build/spline-viewer.js";

function scrollTo(id) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SplineRobot() {
  const containerRef = useRef(null);
  const [hasSize, setHasSize] = useState(false);

  useEffect(() => {
    if (!document.querySelector(`script[src="${SPLINE_VIEWER_SRC}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = SPLINE_VIEWER_SRC;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setHasSize(true);
      } else {
        setHasSize(false);
      }
    };

    checkSize();
    const observer = new ResizeObserver(checkSize);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="footerRobot" aria-hidden="true">
      {hasSize && <spline-viewer url={SPLINE_SCENE} loading="lazy" />}
    </div>
  );
}

function useLocalTime() {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Singapore",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    []
  );
  const [time, setTime] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatter.format(new Date())), 30000);
    return () => window.clearInterval(id);
  }, [formatter]);

  return time;
}

export default function Footer() {
  const localTime = useLocalTime();
  const primaryLinks = NAV_LINKS.filter((id) => id !== "experience");
  const socialLinks = [
    { label: "Email", href: `mailto:${SITE_META.email}` },
    { label: "LinkedIn", href: SITE_META.linkedin },
    { label: "Github", href: SITE_META.github },
  ];

  return (
    <footer className="footer" aria-label="Site footer">
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


      <div className="footerLinkBoard">
        <div className="footerColumns" aria-label="Footer links">
          <div className="footerColumn">
            <h2 className="footerColumnTitle">LINKS</h2>
            {primaryLinks.map((id) => (
              <button
                key={id}
                type="button"
                className="footerTextLink"
                onClick={() => scrollTo(id)}
              >
                {id === "works" ? "Work" : id}
              </button>
            ))}
          </div>

          <div className="footerColumn">
            <h2 className="footerColumnTitle">SOCIALS</h2>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                className="footerTextLink"
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="footerColumn">
            <h2 className="footerColumnTitle">LOCAL TIME</h2>
            <p className="footerStaticText">{localTime} UTC+8</p>
          </div>

          <div className="footerColumn">
            <h2 className="footerColumnTitle">VERSION</h2>
            <p className="footerStaticText">2026 &copy; Edition</p>
          </div>
        </div>

        <div className="footerContactPills" aria-label="Primary contact links">
          <a className="footerContactPill" href={`mailto:${SITE_META.email}`}>
            {SITE_META.email}
          </a>
          <a className="footerContactPill" href={SITE_META.github} target="_blank" rel="noreferrer">
            github.com/raezxcv
          </a>
        </div>
      </div>

      <div className="footerRobotWrap" aria-hidden="true">
        <span className="footerRobotName">RAELY IVAN REYES</span>

        <SplineRobot />
      </div>
    </footer>
  );
}
