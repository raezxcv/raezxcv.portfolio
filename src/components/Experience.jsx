import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

// ─── Real experience data ─────────────────────────────────────────────────────
const MILESTONES = [
  {
    id: 1,
    title: "NOLA Web Solutions",
    subtitle: "Full-Stack Developer / UI UX Intern",
    description: "Built a one-way SMS platform SaaS inside GoHighLevel, enabling Philippine businesses to automate marketing campaigns and customer promotions.",
    date: "2026 – Present",
  },
  {
    id: 2,
    title: "SafeHito Capstone Project",
    subtitle: "Mobile App Developer",
    description: "Developed a mobile application integrated with an AI-based scanning system using Raspberry Pi to detect fungal infections in African catfish with real-time water quality monitoring.",
    date: "2025",
  },
  {
    id: 3,
    title: "Bureau of Information Technology Specialists",
    subtitle: "Graphic Designer",
    description: "Created social media posts, announcements, and event graphics supporting internal and external communications while maintaining visual brand consistency.",
    date: "2024 – 2025",
  },
  {
    id: 4,
    title: "Pampanga State University",
    subtitle: "Bachelor of Science in Information Technology",
    description: "Focused on software engineering, web development, and system architecture while engaging in hands-on projects and collaborative learning.",
    date: "2022 – Present",
  },
];

// ─── Scroll-drawn center line ─────────────────────────────────────────────────
function ScrollLine({ trackRef, scaleY }) {
  return (
    <div className="expTrail-lineTrack" ref={trackRef} aria-hidden="true">
      <motion.div className="expTrail-lineDrawn" style={{ scaleY }} />
    </div>
  );
}

// ─── Single milestone row ─────────────────────────────────────────────────────
function MilestoneSection({ milestone, index }) {
  const isRight = index % 2 === 0;
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="expTrail-milestone" data-index={index}>
      <div className="expTrail-milestoneInner">
        {/* ── Dot / Spine ── */}
        <div className="expTrail-spine" aria-hidden="true">
          <motion.div
            className={`expTrail-dot ${isActive ? "is-active" : ""}`}
            onViewportEnter={() => setIsActive(true)}
            onViewportLeave={() => setIsActive(false)}
            viewport={{ once: false, margin: "10000px 0px -50% 0px" }}
          />
        </div>

        {/* ── Content block ── */}
        <motion.div
          className={`expTrail-content ${isRight ? "expTrail-content--right" : "expTrail-content--left"}`}
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, margin: "-20% 0px -20% 0px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <h3 className="expTrail-company">{milestone.title}</h3>
          <p className="expTrail-role">{milestone.subtitle}</p>
          <p className="expTrail-desc">{milestone.description}</p>
          <p className="expTrail-date">{milestone.date}</p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
export default function Experience() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  const { scrollYProgress: trackScrollY } = useScroll({
    target: trackRef,
    offset: ["start center", "end center"],
  });

  const { scrollYProgress: sectionScrollY } = useScroll({
    target: sectionRef,
    offset: ["end end", "end center"],
  });

  const [isLight, setIsLight] = useState(false);

  useMotionValueEvent(trackScrollY, "change", (latest) => {
    // Switches to light mode after the second milestone (approx > 45% down the line)
    if (latest > 0.45) {
      if (!isLight) setIsLight(true);
    } else {
      if (isLight) setIsLight(false);
    }
  });

  const scaleY = useTransform(trackScrollY, [0, 1], [0, 1]);

  // Curve depth decreases as the section scrolls up
  // A 200vw width element with 75vw vertical radius creates exactly a 10vw drop in the center of the viewport without vertical edges.
  const curveDepth = useTransform(sectionScrollY, [0, 1], ["50vw", "0vw"]);
  const curveRadius = useTransform(curveDepth, v => `50% ${v}`);

  return (
    <motion.section
      id="experience"
      ref={sectionRef}
      className={`expTrailSection ${isLight ? "expTrail--light" : ""}`}
    >
      <motion.div
        className="expTrail-curveBg"
        style={{
          borderBottomLeftRadius: curveRadius,
          borderBottomRightRadius: curveRadius
        }}
        aria-hidden="true"
      />
      {/* ── Header ── */}
      <div style={{ padding: "20vh var(--gutter) 0" }}>
        <div className="worksSectionHeader expTrail-headerOverride">
          <motion.h2
            className="worksSectionTitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            EXPERIENCE
          </motion.h2>

          <motion.div
            className="expTrail-headerDesc"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p>Explore my journey and the technologies that define my craft.</p>
          </motion.div>
        </div>
      </div>

      {/* ── Milestone body + scroll-drawn line ── */}
      <div className="expTrail-body">
        <ScrollLine trackRef={trackRef} scaleY={scaleY} />

        {MILESTONES.map((m, i) => (
          <MilestoneSection
            key={m.id}
            milestone={m}
            index={i}
          />
        ))}
      </div>
      {/* ── Marquee Ribbons ── */}
      <div style={{ paddingBottom: "10vw" }}>
        <MarqueeRibbons />
      </div>
    </motion.section>
  );
}

// ─── Marquee Ribbons ──────────────────────────────────────────────────────────
function MarqueeRibbons() {
  const text = "Driven by Passion, Built with Code ✺ Custom Web Experiences ✺ Innovative Self-Made Creations ✺ Tailored Web Solutions ✺ ";
  return (
    <div className="expTrail-marqueeContainer">
      <div className="expTrail-marqueeRibbon expTrail-marqueeRibbon--1">
        <div className="expTrail-marqueeContent">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
      <div className="expTrail-marqueeRibbon expTrail-marqueeRibbon--2">
        <div className="expTrail-marqueeContent expTrail-marqueeContent--reverse">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}
