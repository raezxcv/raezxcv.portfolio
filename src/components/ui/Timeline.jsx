import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans md:px-10 relative" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-[var(--text)] max-w-4xl" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
          JOURNEY
        </h2>
        <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-sm">
          A timeline of my experience and education.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={index} className="flex flex-col md:flex-row w-full pt-10 md:pt-40 relative">
              
              {/* Mobile Layout */}
              <div className="md:hidden absolute left-8 top-0 bottom-0 z-40 pointer-events-none">
                <div className="sticky top-40 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] -translate-x-1/2 mt-10">
                  <div className="h-3 w-3 rounded-full bg-[var(--accent-mid)]" />
                </div>
              </div>

              <div className="md:hidden w-full pl-20">
                <div className="sticky top-40 self-start z-30 pt-10 mb-4 bg-[var(--bg)]/90 backdrop-blur-md rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <h3 className="text-3xl font-bold text-[var(--text)] px-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {item.title}
                  </h3>
                </div>
                {item.content}
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex w-full relative">
                
                {/* Center Sticky Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 z-40 pointer-events-none">
                   <div className="sticky top-40 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-[0_0_15px_rgba(230,0,0,0.15)]">
                     <div className="h-3 w-3 rounded-full bg-[var(--accent-mid)]" />
                   </div>
                </div>

                {isEven ? (
                  <>
                    <div className="w-1/2 pr-12 lg:pr-24 flex justify-end">
                      <div className="sticky top-40 self-start mt-1">
                        <h3 className="text-4xl lg:text-6xl font-bold text-[var(--text)] text-right opacity-40 hover:opacity-100 transition-opacity duration-300" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <div className="w-1/2 pl-12 lg:pl-24">
                      {item.content}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 pr-12 lg:pr-24 flex justify-end">
                      <div className="text-right w-full flex flex-col items-end">
                        {item.content}
                      </div>
                    </div>
                    <div className="w-1/2 pl-12 lg:pl-24">
                      <div className="sticky top-40 self-start mt-1">
                        <h3 className="text-4xl lg:text-6xl font-bold text-[var(--text)] text-left opacity-40 hover:opacity-100 transition-opacity duration-300" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Vertical Line */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-[2.0rem] md:left-1/2 md:-translate-x-1/2 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,transparent,var(--border),transparent)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[var(--accent-mid)] via-[var(--accent-bright)] to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
