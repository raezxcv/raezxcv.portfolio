import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../data/index.js";

const CARD_ROTATIONS = ["-5deg", "5deg", "-4deg"];
const MotionH2 = motion.h2;
const MotionDiv = motion.div;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);
  return isMobile;
}

function ProjectCard({ project, index }) {
  const hasLinks =
    (project.live && project.live !== "#") || (project.github && project.github !== "#");

  return (
    <article
      className={`worksProjectCard tone-${project.tone || "dark"}`}
      style={{
        "--project-bg": project.accent,
        "--card-rotation": project.tilt ?? CARD_ROTATIONS[index % CARD_ROTATIONS.length],
        "--mockup-rotation": "0deg",
      }}
    >
      <div className="worksProjectMediaPanel">
        {project.logo && (
          <img
            src={project.logo}
            alt={`${project.title} logo`}
            className="worksProjectLogoOverlay"
            loading="lazy"
          />
        )}
        <div className="worksProjectMeta">
          <span>PROJECT {String(index + 1).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>

        <div className="worksProjectMockupWrap">
          {project.mockup && (
            <img src={project.mockup} alt={project.title} className="worksProjectMockup" loading="lazy" />
          )}
        </div>
      </div>

      <div className="worksProjectBody">
        <div className="worksProjectInfo">
          <h3 className="worksProjectTitle">{project.title}</h3>
          <p className="worksProjectSummary">{project.summary}</p>
          {hasLinks && (
            <div className="projectLinks">
              {project.live && project.live !== "#" && (
                <a href={project.live} target="_blank" rel="noopener noreferrer" className="linkOut">
                  Live Site <ArrowUpRight size={12} />
                </a>
              )}
              {project.github && project.github !== "#" && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="linkOut">
                  Repository <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="worksProjectDetails">
          <p className="worksProjectRole">{project.role}</p>
          <div className="workTags">
            {project.tech.map((tech) => (
              <span key={tech} className="workTag">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Works() {
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const [maxShift, setMaxShift] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartScroll = useRef(0);
  const isHSwipe = useRef(false);
  const mouseStartX = useRef(0);
  const mouseStartScroll = useRef(0);
  const isDragging = useRef(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  // Stops in the middle at 0.88 and holds briefly before unpinning with crisp, near-instant tracking
  const rawX = useTransform(scrollYProgress, [0, 0.88, 1], [0, -maxShift, -maxShift], { clamp: true });
  const springX = useSpring(rawX, { stiffness: 580, damping: 48, mass: 0.1, restDelta: 0.001 });
  // Firmly clamp x so it can never exceed -maxShift or overshoot past the middle
  const x = useTransform(springX, (val) => Math.max(-maxShift, Math.min(0, val)));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const measure = () => {
      const cards = track.querySelectorAll(".worksProjectCard");
      if (cards.length < 2) return;

      const lastCard = cards[cards.length - 1];

      // Exact pixel shift so the last card sits perfectly in the middle of the viewport
      const lastCenterInTrack = lastCard.offsetLeft + lastCard.offsetWidth / 2;
      const targetShift = lastCenterInTrack - window.innerWidth / 2;
      setMaxShift(Math.max(0, targetShift));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Touch-swipe → scroll bridge (rAF throttled)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isMobile) return;
    let touchRaf = null;

    const onTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartScroll.current = window.scrollY;
      isHSwipe.current = false;
    };

    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      if (!isHSwipe.current && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (!isHSwipe.current) {
        isHSwipe.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isHSwipe.current && maxShift > 0) {
        e.preventDefault();
        const stageScrollRange = stage.scrollHeight - window.innerHeight;
        const ratio = stageScrollRange / maxShift;
        const targetY = touchStartScroll.current - dx * ratio;
        if (touchRaf) cancelAnimationFrame(touchRaf);
        touchRaf = requestAnimationFrame(() => window.scrollTo(0, targetY));
      }
    };

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      if (touchRaf) cancelAnimationFrame(touchRaf);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
    };
  }, [maxShift, isMobile]);

  // Mouse click-drag → scroll bridge (rAF throttled)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isMobile) return;
    let mouseRaf = null;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      const prog = scrollYProgress.get();
      if (prog <= 0 || prog >= 1) return;

      mouseStartX.current = e.clientX;
      mouseStartScroll.current = window.scrollY;
      isDragging.current = false;

      const onMouseMove = (mv) => {
        const dx = mv.clientX - mouseStartX.current;
        if (!isDragging.current && Math.abs(dx) < 5) return;
        if (!isDragging.current) {
          isDragging.current = true;
        }
        if (maxShift > 0) {
          const stageScrollRange = stage.scrollHeight - window.innerHeight;
          const ratio = stageScrollRange / maxShift;
          const targetY = mouseStartScroll.current - dx * ratio;
          if (mouseRaf) cancelAnimationFrame(mouseRaf);
          mouseRaf = requestAnimationFrame(() => window.scrollTo(0, targetY));
        }
      };

      const onMouseUp = () => {
        if (mouseRaf) cancelAnimationFrame(mouseRaf);
        isDragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    stage.addEventListener("mousedown", onMouseDown);
    return () => stage.removeEventListener("mousedown", onMouseDown);
  }, [maxShift, isMobile, scrollYProgress]);

  return (
    <section
      id="works"
      className="section worksSection worksSideScroll"
      style={{
        "--works-count": PROJECTS.length,
        "--works-stage-height": `${PROJECTS.length + 1}00vh`,
        "--works-travel-height": `${PROJECTS.length - 1}00vh`,
      }}
    >
      <div className="worksSectionHeader">
        <MotionH2
          className="worksSectionTitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          FEATURED WORKS
        </MotionH2>
        <MotionDiv
          className="worksSectionMeta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="worksMetaLabel">DESIGN INSIGHTS</div>
          <div className="worksMetaTags">
            <span>CONCEPTUAL</span>
            <span>EXPRESSIVE</span>
            <span>IMMERSIVE</span>
          </div>
        </MotionDiv>
      </div>

      <div ref={stageRef} className="worksCarouselStage">
        <div className="worksPinned">
          <div className="worksCarouselViewport" aria-label="Featured project carousel">
            <MotionDiv
              ref={trackRef}
              className="worksCarouselTrack"
              style={prefersReducedMotion || isMobile ? undefined : { x }}
            >
              {PROJECTS.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </MotionDiv>
          </div>
        </div>
      </div>

      <div className="worksCta">
        <a href="https://drive.google.com/drive/u/0/folders/13cSjCS0nFPL4FwnrkCrBagmpxbPrmdWw?fbclid=IwY2xjawPdksBleHRuA2FlbQIxMABicmlkETF1OHpSTFZablBPcnVUYm5rc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHq2K5WXcutLeNXFgZZZVZ5GYREht_hV6RySPKI5JGs8Ws3mt11bou9br8Ws__aem_ybWCwWpOX5e_M2Ug7oHg9w" className="outlineCtaWrapper">
          <div className="outlineCtaPill">
            <span>SEE ALL WORKS</span>
          </div>
          <div className="outlineCtaCircle">
            <ArrowUpRight size={20} />
          </div>
        </a>
      </div>
    </section>
  );
}
