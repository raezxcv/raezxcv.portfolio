import { useRef, useEffect } from "react";
import { gsap } from "gsap";

/**
 * Minimal strip — we only need enough digits to cover the max cumulative offset.
 * Max offset across both phases ≈ 13. 3 reps (30 digits) is plenty.
 */
const REPS = 3;
const STRIP_DIGITS = Array.from({ length: REPS * 10 }, (_, i) => i % 10);

/**
 * Compute the next cumulative offset using the MINIMUM upward steps needed.
 * No extra full rotations — clean, mechanical-counter style.
 *
 * @param {number} current     Current cumulative digit index
 * @param {number} targetDigit The digit to land on (0-9)
 */
function nextOffset(current, targetDigit) {
  const curDigit = current % 10;
  let steps;
  if (targetDigit === curDigit) {
    steps = 10; // same digit → one full revolution so the reel visibly moves
  } else if (targetDigit > curDigit) {
    steps = targetDigit - curDigit;
  } else {
    steps = 10 - curDigit + targetDigit; // wrap 9→0
  }
  return current + steps;
}

/**
 * Sequences:
 *  Phase 1 → [0, 6, 7]
 *  Phase 2 → [1, 0, 0]  (exit animation follows)
 */
const SEQUENCES = [
  [0, 6, 7],
  [1, 0, 0],
];

export default function LoadingScreen({ onFinished }) {
  const overlayRef  = useRef(null);
  const textWrapRef = useRef(null);
  const stripRefs   = useRef([null, null, null]);
  const measureRef  = useRef(null);
  const offsets     = useRef([0, 0, 0]);

  /* ── lock body scroll while loading ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── animation ── */
  useEffect(() => {
    const strips = stripRefs.current;
    if (!strips.every(Boolean) || !measureRef.current) return;

    let alive = true;

    const start = () => {
      if (!alive) return;

      const CELL_H = measureRef.current.getBoundingClientRect().height || 200;

      // All reels start at digit 0 (y = 0)
      strips.forEach(s => gsap.set(s, { y: 0 }));

      /**
       * Spin reels to targets in SEQUENCES[phaseIdx].
       * Duration is proportional to step count → fast for 1 step, slower for 10.
       * Stagger: each column fires 60 ms after the previous.
       */
      const spinToPhase = (phaseIdx, onComplete) => {
        const targets = SEQUENCES[phaseIdx];
        let done = 0;

        targets.forEach((digit, col) => {
          const newOffset = nextOffset(offsets.current[col], digit);
          const steps     = newOffset - offsets.current[col];
          offsets.current[col] = newOffset;

          // duration scales with how many positions we scroll
          const dur = Math.max(0.28, steps * 0.1);

          gsap.to(strips[col], {
            y: -newOffset * CELL_H,
            duration: dur,
            ease: "power3.out",
            delay: col * 0.06, // slight stagger between columns
            onComplete: () => {
              done++;
              if (done === 3 && onComplete) onComplete();
            },
          });
        });
      };

      /* Sequence: phase 1 → pause → phase 2 → exit */
      spinToPhase(0, () => {
        gsap.delayedCall(0.2, () => {
          spinToPhase(1, () => {
            gsap.delayedCall(0.35, () => {
              if (!alive) return;
              const tl = gsap.timeline({ onComplete: () => onFinished?.() });

              // Text parallax upward
              tl.to(textWrapRef.current, {
                y: -100,
                opacity: 0,
                duration: 0.45,
                ease: "power2.in",
              }, 0);

              // Overlay slides off screen upward
              tl.to(overlayRef.current, {
                yPercent: -100,
                duration: 0.9,
                ease: "expo.inOut",
              }, 0.1);
            });
          });
        });
      });
    };

    if ("fonts" in document) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      alive = false;
      strips.forEach(s => s && gsap.killTweensOf(s));
    };
  }, [onFinished]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#060608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: [
          "linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px)",
          "linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)",
        ].join(", "),
        backgroundSize: "calc(100vw / 7) 64px",
        overflow: "hidden",
      }}
    >
      {/* Subtle red ambient glow at bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 105%, rgba(192,37,62,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Slot-machine digit display ── */}
      <div
        ref={textWrapRef}
        style={{
          display: "flex",
          gap: "0.02em",              /* moved much closer */
          position: "relative",
          zIndex: 1,
          /* Inherited by every digit cell */
          fontFamily: "'Thunder', sans-serif",
          fontWeight: 700,
          color: "#f0efe9",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          userSelect: "none",
          fontSize: "clamp(9rem, 24vw, 22rem)",  /* bigger */
        }}
      >
        {[0, 1, 2].map((col) => (
          <div
            key={col}
            style={{
              height: "1em",      /* one-digit-tall viewport */
              /* Use clip-path instead of overflow: hidden to allow slanted fonts to bleed horizontally */
              clipPath: "inset(0 -0.15em)",
            }}
          >
            <div
              ref={(el) => { stripRefs.current[col] = el; }}
              style={{
                display: "flex",
                flexDirection: "column",
                willChange: "transform",
              }}
            >
              {STRIP_DIGITS.map((digit, idx) => (
                <div
                  key={idx}
                  ref={col === 0 && idx === 0 ? measureRef : undefined}
                  style={{
                    height: "1em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom-left editorial label */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "clamp(1.25rem, 6vw, 7rem)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.48rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)",
        }}
      >
        loading
      </div>

      {/* Bottom-right handle */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "clamp(1.25rem, 6vw, 7rem)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.48rem",
          letterSpacing: "0.22em",
          color: "rgba(255,255,255,0.18)",
        }}
      >
        raezxcv
      </div>
    </div>
  );
}
