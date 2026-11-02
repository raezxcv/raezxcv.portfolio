import { useEffect, useRef } from 'react';

// Walk up the DOM from a point to find the first opaque background color,
// return its perceived luminance (0 = dark, 1 = bright).
function getBackgroundLuminance(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    // Skip the cursor itself and any overlay elements
    if (el.classList?.contains('custom-cursor')) continue;

    let node = el;
    while (node && node !== document.documentElement) {
      const bg = window.getComputedStyle(node).backgroundColor;
      const match = bg.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(',').map(Number);
        const [r, g, b, a = 1] = parts;
        if (a > 0.08 && !(r === 0 && g === 0 && b === 0 && a < 0.1)) {
          // Perceived luminance (WCAG formula)
          return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        }
      }
      node = node.parentElement;
    }
  }
  return 0; // default: treat as dark
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const posRef    = useRef({ x: -200, y: -200 });
  const colorRef  = useRef('#f0f0f0'); // current color
  const rafRef    = useRef(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    // Only on true pointer devices (not touch)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const applyPos = () => {
      cursor.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      rafRef.current = null;
    };

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      // Show cursor on first move
      if (!visibleRef.current) {
        cursor.style.opacity = '1';
        visibleRef.current = true;
      }

      // Detect bg luminance and flip color
      const lum = getBackgroundLuminance(e.clientX, e.clientY);
      const newColor = lum > 0.42 ? '#1a1a1a' : '#f0f0f0';
      if (newColor !== colorRef.current) {
        colorRef.current = newColor;
        cursor.style.color = newColor;
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(applyPos);
      }
    };

    const onLeave = () => { cursor.style.opacity = '0'; visibleRef.current = false; };
    const onEnter = () => { cursor.style.opacity = '1'; visibleRef.current = true; };

    window.addEventListener('mousemove',  onMove,  { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
      {/* Arrow cursor shape — standard pointer silhouette */}
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M1 1L1 19.5L5.8 14.2L9.6 22.5L12 21.4L8.2 13.2L15.8 13.2L1 1Z" />
      </svg>

      <style>{`
        .custom-cursor {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 999999;
          color: #f0f0f0;
          transform: translate(-200px, -200px);
          will-change: transform;
          opacity: 0;
          transition: color 0.18s ease, opacity 0.2s ease;
        }

        .custom-cursor svg {
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
        }
      `}</style>
    </div>
  );
}
