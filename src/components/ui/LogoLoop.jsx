import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
};

const toCssLength = (value) =>
  typeof value === 'number' ? `${value}px` : (value ?? undefined);

const useResizeObserver = (callback, elements, dependencies) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }
    const observers = elements.map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => observers.forEach((o) => o?.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);
};

const useImageLoader = (seqRef, onLoad, dependencies) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) { onLoad(); return; }
    let remaining = images.length;
    const handleLoad = () => { if (--remaining === 0) onLoad(); };
    images.forEach((img) => {
      if (img.complete) handleLoad();
      else {
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleLoad, { once: true });
      }
    });
    return () => images.forEach((img) => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleLoad);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoad, seqRef, ...dependencies]);
};

const useAnimationLoop = (
  trackRef, targetVelocity, seqWidth, seqHeight,
  isHovered, hoverSpeed, isVertical
) => {
  const rafRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const seqSize = isVertical ? seqHeight : seqWidth;

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0,${-offsetRef.current}px,0)`
        : `translate3d(${-offsetRef.current}px,0,0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0,0,0)';
      return () => { lastTimestampRef.current = null; };
    }

    const animate = (timestamp) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const dt = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      const easing = 1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easing;

      if (seqSize > 0) {
        let next = offsetRef.current + velocityRef.current * dt;
        next = ((next % seqSize) + seqSize) % seqSize;
        offsetRef.current = next;
        track.style.transform = isVertical
          ? `translate3d(0,${-next}px,0)`
          : `translate3d(${-next}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, trackRef]);
};

export const LogoLoop = memo(({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const seqRef = useRef(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(ANIMATION_CONFIG.MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === 'up' || direction === 'down';

  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === true) return 0;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  const targetVelocity = useMemo(() => {
    const mag = Math.abs(speed);
    const dirMul = isVertical
      ? (direction === 'up' ? 1 : -1)
      : (direction === 'left' ? 1 : -1);
    return mag * dirMul * (speed < 0 ? -1 : 1);
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const seqRect = seqRef.current?.getBoundingClientRect?.();
    const sw = seqRect?.width ?? 0;
    const sh = seqRect?.height ?? 0;
    if (isVertical) {
      const parentH = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentH > 0)
        containerRef.current.style.height = `${Math.ceil(parentH)}px`;
      if (sh > 0) {
        setSeqHeight(Math.ceil(sh));
        const vp = containerRef.current?.clientHeight ?? parentH ?? sh;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES,
          Math.ceil(vp / sh) + ANIMATION_CONFIG.COPY_HEADROOM));
      }
    } else if (sw > 0) {
      setSeqWidth(Math.ceil(sw));
      const cw = containerRef.current?.clientWidth ?? 0;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES,
        Math.ceil(cw / sw) + ANIMATION_CONFIG.COPY_HEADROOM));
    }
  }, [isVertical]);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
  useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical);

  const cssVars = useMemo(() => ({
    '--ll-gap': `${gap}px`,
    '--ll-height': `${logoHeight}px`,
    ...(fadeOutColor ? { '--ll-fade': fadeOutColor } : {}),
  }), [gap, logoHeight, fadeOutColor]);

  const handleEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);
  const handleLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  const renderLogoItem = useCallback((item, key) => {
    if (renderItem) {
      return (
        <li className="logoloop-item" key={key} style={{ marginRight: isVertical ? 0 : 'var(--ll-gap)', marginBottom: isVertical ? 'var(--ll-gap)' : 0 }} role="listitem">
          {renderItem(item, key)}
        </li>
      );
    }
    const isNode = 'node' in item;
    const content = isNode ? (
      <span className={`logoloop-icon${scaleOnHover ? ' logoloop-icon--scale' : ''}`} aria-hidden={!!item.href}>
        {item.node}
      </span>
    ) : (
      <img
        className={`logoloop-img${scaleOnHover ? ' logoloop-img--scale' : ''}`}
        src={item.src} srcSet={item.srcSet} sizes={item.sizes}
        width={item.width} height={item.height}
        alt={item.alt ?? ''} title={item.title}
        loading="lazy" decoding="async" draggable={false}
      />
    );

    const inner = item.href ? (
      <a className="logoloop-link" href={item.href}
        aria-label={isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title)}
        target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    ) : content;

    return (
      <li
        className={`logoloop-item${scaleOnHover ? ' logoloop-item--scale' : ''}`}
        key={key}
        style={{ marginRight: isVertical ? 0 : 'var(--ll-gap)', marginBottom: isVertical ? 'var(--ll-gap)' : 0 }}
        role="listitem"
      >
        {inner}
      </li>
    );
  }, [isVertical, scaleOnHover, renderItem]);

  const logoLists = useMemo(() =>
    Array.from({ length: copyCount }, (_, i) => (
      <ul className={`logoloop-seq${isVertical ? ' logoloop-seq--vertical' : ''}`}
        key={`copy-${i}`} role="list" aria-hidden={i > 0}
        ref={i === 0 ? seqRef : undefined}>
        {logos.map((item, j) => renderLogoItem(item, `${i}-${j}`))}
      </ul>
    )),
    [copyCount, logos, renderLogoItem, isVertical]);

  const containerStyle = useMemo(() => ({
    width: isVertical
      ? (toCssLength(width) === '100%' ? undefined : toCssLength(width))
      : (toCssLength(width) ?? '100%'),
    ...cssVars,
    ...style,
  }), [width, cssVars, style, isVertical]);

  return (
    <div ref={containerRef}
      className={`logoloop-root${isVertical ? ' logoloop-root--vertical' : ''}${scaleOnHover ? ' logoloop-root--scale' : ''}${className ? ` ${className}` : ''}`}
      style={containerStyle}
      role="region" aria-label={ariaLabel}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}
    >
      {fadeOut && (
        isVertical ? (
          <>
            <div aria-hidden className="logoloop-fade logoloop-fade--top" />
            <div aria-hidden className="logoloop-fade logoloop-fade--bottom" />
          </>
        ) : (
          <>
            <div aria-hidden className="logoloop-fade logoloop-fade--left" />
            <div aria-hidden className="logoloop-fade logoloop-fade--right" />
          </>
        )
      )}
      <div ref={trackRef}
        className={`logoloop-track${isVertical ? ' logoloop-track--vertical' : ''}`}
        onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {logoLists}
      </div>
    </div>
  );
});

LogoLoop.displayName = 'LogoLoop';
export default LogoLoop;
