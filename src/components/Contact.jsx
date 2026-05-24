import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Send, Mail, Link as Linkedin, ArrowUpRight, MapPin } from "lucide-react";
import { SITE_META } from "../data/index.js";
import MagicBento from "./ui/MagicBento.jsx";

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim()) errors.email = "Email is required.";
  else if (!(form.email.includes("@") && form.email.includes(".")))
    errors.email = "Enter a valid email.";
  if (!form.message.trim()) errors.message = "Message is required.";
  return errors;
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const setField = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSending(true);

    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name.trim()}`);
    const body = encodeURIComponent(
      [
        `Name: ${form.name.trim()}`,
        `Email: ${form.email.trim()}`,
        "",
        form.message.trim(),
      ].join("\n")
    );

    window.location.href = `mailto:${SITE_META.email}?subject=${subject}&body=${body}`;
    setSending(false);
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4200);
  };

  return (
    <form className="contactBentoForm" onSubmit={onSubmit} noValidate aria-label="Contact form">
      <div className="contactBentoFormRow">
        <div className="contactBentoField">
          <input
            id="cb-name"
            type="text"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className={`contactBentoInput${errors.name ? " error" : ""}`}
            placeholder="Your Name"
            autoComplete="name"
          />
          {errors.name && (
            <div className="contactBentoError" role="alert">
              <AlertCircle size={10} /> {errors.name}
            </div>
          )}
        </div>
        <div className="contactBentoField">
          <input
            id="cb-email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={`contactBentoInput${errors.email ? " error" : ""}`}
            placeholder="Your Email"
            autoComplete="email"
          />
          {errors.email && (
            <div className="contactBentoError" role="alert">
              <AlertCircle size={10} /> {errors.email}
            </div>
          )}
        </div>
      </div>

      <div className="contactBentoField grow">
        <textarea
          id="cb-message"
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          className={`contactBentoTextarea${errors.message ? " error" : ""}`}
          placeholder="Tell me about your project..."
        />
        {errors.message && (
          <div className="contactBentoError" role="alert">
            <AlertCircle size={10} /> {errors.message}
          </div>
        )}
      </div>

      <div className="contactBentoFormBottom">
        <button type="submit" className="contactBentoSubmit" disabled={sending}>
          <span>{sending ? "Sending…" : "Send Message"}</span>
          <Send size={13} />
        </button>
        <div aria-live="polite">
          <AnimatePresence>
            {submitted && (
              <motion.div
                key="success"
                className="contactBentoSuccess"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle size={13} />
                Email draft opened.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}

import Globe3D from "./ui/Globe3D.jsx";

const sampleMarkers = [
  { lat: 40.7128, lng: -74.006, src: "https://assets.aceternity.com/avatars/1.webp", label: "New York" },
  { lat: 51.5074, lng: -0.1278, src: "https://assets.aceternity.com/avatars/2.webp", label: "London" },
  { lat: 35.6762, lng: 139.6503, src: "https://assets.aceternity.com/avatars/3.webp", label: "Tokyo" },
  { lat: -33.8688, lng: 151.2093, src: "https://assets.aceternity.com/avatars/4.webp", label: "Sydney" },
  { lat: 48.8566, lng: 2.3522, src: "https://assets.aceternity.com/avatars/5.webp", label: "Paris" },
  { lat: 28.6139, lng: 77.209, src: "https://assets.aceternity.com/avatars/6.webp", label: "New Delhi" },
  { lat: 55.7558, lng: 37.6173, src: "https://assets.aceternity.com/avatars/7.webp", label: "Moscow" },
  { lat: -22.9068, lng: -43.1729, src: "https://assets.aceternity.com/avatars/8.webp", label: "Rio de Janeiro" },
  { lat: 31.2304, lng: 121.4737, src: "https://assets.aceternity.com/avatars/9.webp", label: "Shanghai" },
  { lat: 25.2048, lng: 55.2708, src: "https://assets.aceternity.com/avatars/10.webp", label: "Dubai" },
  { lat: -34.6037, lng: -58.3816, src: "https://assets.aceternity.com/avatars/11.webp", label: "Buenos Aires" },
  { lat: 1.3521, lng: 103.8198, src: "https://assets.aceternity.com/avatars/12.webp", label: "Singapore" },
  { lat: 37.5665, lng: 126.978, src: "https://assets.aceternity.com/avatars/13.webp", label: "Seoul" },
];

export default function Contact() {
  const bentoCards = [
    // Card 1 — Hero headline (left, tall)
    {
      label: "",
      custom: (
        <div className="contactBentoHeroCard">


          {/* Text — top-left */}
          <div className="contactBentoIntro">
            <h2 className="contactBentoTitle">LET'S<br />WORK<br />TOGETHER.</h2>
            <div className="contactBentoSubWrap">
              <p className="contactBentoSub">
                Open to freelance projects, full-time roles, and creative collaborations.
              </p>
            </div>
          </div>

          {/* Globe — pushed low, only top arc peeks up */}
          <div className="contactBentoGlobeShell">
            <Globe3D
              markers={sampleMarkers}
              config={{
                atmosphereColor: "#4da6ff",
                atmosphereIntensity: 20,
                bumpScale: 5,
                autoRotateSpeed: 0.3,
              }}
              className="contactBentoGlobe"
            />
          </div>
        </div>
      ),
      style: { padding: 0 }
    },
    // Card 2 — Email
    {
      label: "Email",
      custom: (
        <a href={`mailto:${SITE_META.email}`} className="contactBentoLink" aria-label="Send email">
          <div className="contactBentoLinkContent">
            <Mail size={20} className="contactBentoLinkIcon" />
            <div>
              <div className="contactBentoLinkLabel">Email me</div>
              <div className="contactBentoLinkValue">{SITE_META.email}</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="contactBentoArrow" />
        </a>
      ),
      style: {}
    },
    // Card 3 — LinkedIn (replaces GitHub)
    {
      label: "LinkedIn",
      custom: (
        <a href={SITE_META.linkedin} target="_blank" rel="noreferrer" className="contactBentoLink" aria-label="LinkedIn profile">
          <div className="contactBentoLinkContent">
            <Linkedin size={20} className="contactBentoLinkIcon" />
            <div>
              <div className="contactBentoLinkLabel">LinkedIn</div>
              <div className="contactBentoLinkValue">Raely Ivan Reyes</div>
            </div>
          </div>
          <ArrowUpRight size={16} className="contactBentoArrow" />
        </a>
      ),
      style: {}
    },
    // Card 4 — Contact form (bottom, wide)
    {
      label: "Message",
      title: "Drop a message",
      custom: <ContactForm />,
      style: { display: 'flex', flexDirection: 'column' }
    },
  ];

  return (
    <section id="contact" className="contactSection">
      <MagicBento
        cards={bentoCards}
        textAutoHide={false}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={true}
        spotlightRadius={300}
        particleCount={8}
        glowColor="255, 255, 255"
      />
    </section>
  );
}
