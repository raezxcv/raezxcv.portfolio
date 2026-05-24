import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../data/index.js";

const CARD_ROTATIONS = ["-5deg", "5deg", "-4deg"];
const MotionH2 = motion.h2;
const MotionDiv = motion.div;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 819px)');
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
        <div className="worksProjectTop">
          {project.logo && (
            <img
              src={project.logo}
              alt={`${project.title} logo`}
              className="worksProjectLogo"
              loading="lazy"
            />
          )}
          <div className="worksProjectMeta">
            <span>PROJECT {String(index + 1).padStart(2, "0")}</span>
            <span>{project.year}</span>
          </div>
        </div>

        <div className="worksProjectMockupWrap" aria-hidden="true">
          {project.logo && (
            <img
              src={project.logo}
              alt=""
              className="worksProjectLogoOverlay"
              loading="lazy"
            />
          )}
          {project.mockup && (
            <img src={project.mockup} alt="" className="worksProjectMockup" loading="lazy" />
          )}
        </div>
      </div>

      <div className="worksProjectBody">
        <div>
          <h3 className="worksProjectTitle">{project.title}</h3>
          <p className="worksProjectSummary">{project.summary}</p>
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

        {hasLinks && (
          <div className="projectLinks">
            {project.live && project.live !== "#" && (
              <a href={project.live} target="_blank" rel="noreferrer" className="linkOut">
                Live Site <ArrowUpRight size={12} />
              </a>
            )}
            {project.github && project.github !== "#" && (
              <a href={project.github} target="_blank" rel="noreferrer" className="linkOut">
                Repository <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        )}
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
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxShift]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const measure = () => {
      const firstCard = track.querySelector(".worksProjectCard");
      if (!firstCard) return;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      const cardWidth = firstCard.getBoundingClientRect().width;
      setMaxShift(Math.max(0, (cardWidth + gap) * (PROJECTS.length - 1)));
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

  // Touch-swipe → scroll bridge
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isMobile) return;

    const onTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartScroll.current = window.scrollY;
      isHSwipe.current = false;
    };

    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Determine swipe axis once we have enough movement
      if (!isHSwipe.current && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (!isHSwipe.current) {
        isHSwipe.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isHSwipe.current && maxShift > 0) {
        e.preventDefault(); // block vertical scroll while swiping cards
        // Map horizontal drag to the equivalent vertical scroll position
        const stageScrollRange = stage.scrollHeight - window.innerHeight;
        const ratio = stageScrollRange / maxShift;
        window.scrollTo({ top: touchStartScroll.current - dx * ratio, behavior: "instant" });
      }
    };

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
    };
  }, [maxShift]);

  // Mouse click-drag → scroll bridge
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || isMobile) return;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      // Only activate drag when actually scrolled into the works zone
      const prog = scrollYProgress.get();
      if (prog <= 0 || prog >= 1) return;

      mouseStartX.current = e.clientX;
      mouseStartScroll.current = window.scrollY;
      isDragging.current = false;
      stage.dataset.dragging = "false";

      const onMouseMove = (mv) => {
        const dx = mv.clientX - mouseStartX.current;
        if (!isDragging.current && Math.abs(dx) < 5) return;
        if (!isDragging.current) {
          isDragging.current = true;
          stage.dataset.dragging = "true";
        }
        if (maxShift > 0) {
          const stageScrollRange = stage.scrollHeight - window.innerHeight;
          const ratio = stageScrollRange / maxShift;
          window.scrollTo({ top: mouseStartScroll.current - dx * ratio, behavior: "instant" });
        }
      };

      const onMouseUp = () => {
        isDragging.current = false;
        stage.dataset.dragging = "false";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    stage.addEventListener("mousedown", onMouseDown);
    return () => stage.removeEventListener("mousedown", onMouseDown);
  }, [maxShift, scrollYProgress]);

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
