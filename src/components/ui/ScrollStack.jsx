import { useLayoutEffect, useRef, useCallback } from 'react';

export const ScrollStackItem = ({ children, itemClassName = '', style = {} }) => (
  <div
    className={`scroll-stack-card ${itemClassName}`.trim()}
    style={{
      position: 'relative',
      width: '100%',
      transformOrigin: 'top center',
      willChange: 'transform',
      backfaceVisibility: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 0,
  itemScale = 0.04,
  itemStackDistance = 20,
  stackPosition = '5%',
  scaleEndPosition = '5%',
  baseScale = 0.92,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}) => {
  const scrollerRef = useRef(null);
  const rafRef = useRef(null);
  const cardOffsetsRef = useRef([]); // cached absolute offsetTops (no BoundingRect)
  const endOffsetRef = useRef(0);
  const stackCompletedRef = useRef(false);
  const lastTransformsRef = useRef([]);

  const parsePercent = (value, total) =>
    typeof value === 'string' && value.includes('%')
      ? (parseFloat(value) / 100) * total
      : parseFloat(value);

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  // Cache static offsets once (no getBoundingClientRect during scroll)
  const cacheOffsets = useCallback(() => {
    const cards = scrollerRef.current
      ? Array.from(scrollerRef.current.querySelectorAll('.scroll-stack-card'))
      : [];

    cardOffsetsRef.current = cards.map((card) => {
      // Walk up summing offsetTop to get true document offset
      let top = 0;
      let el = card;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      return { el: card, top };
    });

    // End marker offset
    const endEl = scrollerRef.current?.querySelector('.scroll-stack-end');
    if (endEl) {
      let top = 0;
      let el = endEl;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      endOffsetRef.current = top;
    }
  }, []);

  const tick = useCallback(() => {
    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const stackPx = parsePercent(stackPosition, vh);
    const scaleEndPx = parsePercent(scaleEndPosition, vh);
    const cards = cardOffsetsRef.current;
    const endTop = endOffsetRef.current;

    cards.forEach(({ el, top: cardTop }, i) => {
      const triggerStart = cardTop - stackPx - itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPx;
      const pinStart     = triggerStart;
      const pinEnd       = endTop - vh / 2;

      // Scale
      const scaleProgress = clamp01((scrollTop - triggerStart) / Math.max(1, triggerEnd - triggerStart));
      const targetScale   = baseScale + i * itemScale;
      const scale         = 1 - scaleProgress * (1 - targetScale);

      // Rotation
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      // Blur
      let blur = 0;
      if (blurAmount) {
        let topIdx = 0;
        cards.forEach(({ top: jTop }, j) => {
          if (scrollTop >= jTop - stackPx - itemStackDistance * j) topIdx = j;
        });
        if (i < topIdx) blur = Math.max(0, (topIdx - i) * blurAmount);
      }

      // Pin (translateY)
      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;
      }

      // Round to avoid sub-pixel thrashing
      const ty  = Math.round(translateY * 10) / 10;
      const sc  = Math.round(scale * 1000) / 1000;
      const rot = Math.round(rotation * 10) / 10;
      const bl  = Math.round(blur * 10) / 10;

      const last = lastTransformsRef.current[i];
      if (
        !last ||
        Math.abs(last.ty - ty) > 0.05 ||
        Math.abs(last.sc - sc) > 0.0005 ||
        Math.abs(last.rot - rot) > 0.05 ||
        Math.abs(last.bl - bl) > 0.05
      ) {
        el.style.transform = `translate3d(0,${ty}px,0) scale(${sc}) rotate(${rot}deg)`;
        el.style.filter     = bl > 0 ? `blur(${bl}px)` : '';
        lastTransformsRef.current[i] = { ty, sc, rot, bl };
      }

      // onStackComplete callback
      if (i === cards.length - 1) {
        const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (inView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!inView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [
    stackPosition, scaleEndPosition, itemStackDistance,
    baseScale, itemScale, rotationAmount, blurAmount, onStackComplete,
  ]);

  useLayoutEffect(() => {
    // Small delay to let the DOM paint so offsets are stable
    const initTimeout = setTimeout(() => {
      cacheOffsets();

      // Set initial marginBottom between cards
      const cards = scrollerRef.current
        ? Array.from(scrollerRef.current.querySelectorAll('.scroll-stack-card'))
        : [];
      cards.forEach((card, i) => {
        if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      });

      rafRef.current = requestAnimationFrame(tick);
    }, 50);

    // Re-cache on resize (offsets change)
    const onResize = () => {
      cacheOffsets();
      lastTransformsRef.current = [];
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      clearTimeout(initTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      stackCompletedRef.current = false;
      lastTransformsRef.current = [];
    };
  }, [
    itemDistance, tick, cacheOffsets,
  ]);

  return (
    <div ref={scrollerRef} className={`scroll-stack-root ${className}`.trim()}>
      {children}
      <div className="scroll-stack-end" style={{ width: '100%', height: '1px' }} />
    </div>
  );
};

export default ScrollStack;
