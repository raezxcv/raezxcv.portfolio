import nolaLogo from "../assets/works-logo/NOLA SMS Pro.png";
import safeHitoLogo from "../assets/works-logo/SafeHito.png";
import cloudJamzLogo from "../assets/works-logo/CloudJamz.png";
import nolaMockup from "../assets/Mockups/Mockup1.png";
import safeHitoMockup from "../assets/Mockups/Mockup2.png";
import cloudJamzMockup from "../assets/Mockups/Mockup3.png";

export const SITE_META = {
  name: "Raely Ivan D. Reyes",
  initials: "R",
  nickname: "rei",
  role: "Frontend Developer & UI/UX Designer",
  tagline:
    "Crafting intuitive digital experiences. Specializing as a Frontend Developer and UI/UX Designer to build clean, scalable web applications.",
  email: "raelyivandreyes@gmail.com",
  github: "https://github.com/raezxcv",
  linkedin: "https://www.linkedin.com/in/raely-ivan-reyes-65051028a",
  location: "Pampanga, PH",
};

export const NAV_LINKS = ["home", "about", "works", "experience", "contact"];

export const PROJECTS = [
  {
    id: 1,
    title: "NOLA SMS Pro",
    summary: "Full-scale multi-role SMS platform built for CRM integration and enterprise messaging workflows.",
    role: "UI/UX - Frontend - Backend - System Architecture - API Integration",
    tech: ["React", "Tailwind", "REST APIs", "Cloud Run"],
    live: "#",
    github: "#",
    year: "2026",
    logo: nolaLogo,
    mockup: nolaMockup,
    accent: "#1f5fb8",
    tone: "dark",
  },
  {
    id: 2,
    title: "SafeHito",
    summary: "IoT + AI water quality monitoring system for catfish farming with real-time sensor dashboards.",
    role: "Mobile Developer - UI Design - Hardware Integration",
    tech: ["Kotlin", "IoT", "AI/ML", "Firebase"],
    live: "#",
    github: "#",
    year: "2025",
    logo: safeHitoLogo,
    mockup: safeHitoMockup,
    accent: "#29b9e9",
    tone: "dark",
  },
  {
    id: 3,
    title: "CloudJamz",
    summary: "Online music streaming platform with curated playlists and seamless audio playback experience.",
    role: "Frontend Developer - UI/UX Design",
    tech: ["React", "Tailwind", "APIs"],
    live: "#",
    github: "#",
    year: "2025",
    logo: cloudJamzLogo,
    mockup: cloudJamzMockup,
    accent: "#121212",
    tone: "dark",
  },
];

export const SKILLS = [
  {
    category: "Frontend",
    icon: "⬡",
    items: ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"],
  },
  {
    category: "Backend Exposure",
    icon: "⬡",
    items: ["REST APIs", "Authentication", "Google Cloud Run"],
  },
  {
    category: "Tools & Deploy",
    icon: "⬡",
    items: ["GitHub", "Vercel", "Figma"],
  },
  {
    category: "Design",
    icon: "⬡",
    items: ["UI/UX Design", "Wireframing", "Interface Systems"],
  },
];

export const EXPERIENCE = [
  {
    title: "Frontend Developer Intern",
    org: "NOLA Web Solutions",
    year: "2024",
    bullets: [
      "Built multi-role dashboard UI systems",
      "Integrated REST APIs with backend dev team",
      "Designed user flows and system architecture",
      "Created funnel and graphic designs for clients",
      "Improved UX across SMS and CRM platforms",
    ],
  },
];

export const EDUCATION = [
  {
    degree: "BS Information Technology",
    school: "Pampanga State University",
    year: "2020 – 2024",
    capstoneTitle: "SafeHito",
    capstoneLines: ["Water Quality Monitoring", "with AI Detection"],
  },
];

export const CONTACT_LINKS = [
  { label: "Email", value: SITE_META.email, href: `mailto:${SITE_META.email}` },
  { label: "GitHub", value: "github.com/raezxcv", href: SITE_META.github },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/raely-ivan-reyes",
    href: SITE_META.linkedin,
  },
];

export const THEME_STORAGE_KEY = "raely-portfolio-theme";
export const THEMES = { dark: "dark", light: "light" };
