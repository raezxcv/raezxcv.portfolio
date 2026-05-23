import { SITE_META } from "../data/index.js";

const PARTS = [
  "FRONTEND DEVELOPER",
  "UI/UX DESIGNER",
  "REACT",
  "TAILWIND CSS",
  SITE_META.location,
  "NOLA WEB SOLUTIONS",
  "OPEN TO WORK",
  "FIGMA",
];

function MarqueeRow({ reverse, dimmed }) {
  const chunks = Array.from({ length: 4 });
  return (
    <div className="marqueeRow">
      <div
        className="marqueeTrack"
        style={{
          animation: reverse
            ? "marquee-reverse 32s linear infinite"
            : "marquee 26s linear infinite",
          opacity: dimmed ? 0.55 : 1,
        }}
      >
        {chunks.map((_, ci) => (
          <span key={ci} className="marqueeChunk">
            {PARTS.map((p, i) => (
              <span key={`${p}-${i}`} className="marqueeItem">
                <span className={i % 3 === 1 ? "marqueeAccent" : ""}>{p}</span>
                <span className="marqueeStar" aria-hidden="true">
                  {i % 2 === 0 ? "✦" : "·"}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeTicker() {
  return (
    <section className="marquee" aria-label="Scrolling ticker">
      <MarqueeRow reverse={false} dimmed={false} />
      <MarqueeRow reverse={true} dimmed={true} />
    </section>
  );
}
