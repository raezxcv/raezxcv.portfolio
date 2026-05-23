import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import resumeFile from "../assets/Raely_Ivan_Reyes_Resume.pdf";

const aboutParagraphs = [
  "I'm Raely – an aspiring Software Engineer crafting clean, intuitive, and visually engaging digital experiences.",
  "I specialize in building responsive web applications, system designs, and scalable digital products using technologies like React.js, Rest APIs, and Tailwind CSS.",
];

export default function About() {
  return (
    <section id="about" className="aboutSection relative">
      {/* About Me Body */}
      <div className="aboutBody">
        {aboutParagraphs.map((para, i) => (
          <motion.p
            key={i}
            className="aboutBodyPara"
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {para}
          </motion.p>
        ))}

        {/* Resume CTA */}
        <motion.div
          className="aboutCtaRow"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href={resumeFile}
            target="_blank"
            rel="noopener noreferrer"
            className="aboutResumeCtaWrapper"
            download="Raely_Ivan_Reyes_Resume.pdf"
          >
            <div className="aboutResumeCtaPill">
              View Resume
            </div>
            <div className="aboutResumeCtaCircle">
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
