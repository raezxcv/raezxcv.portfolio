import React, { useEffect, useMemo, useRef, useState } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const KEY_SOUNDS_DOWN = {
  A: [31542, 85], B: [40621, 107], C: [39632, 95], D: [32492, 85], E: [23317, 83], F: [32973, 87], G: [33453, 94], H: [33986, 93], I: [25795, 91], J: [34425, 88], K: [34932, 90], L: [35410, 95], M: [41610, 93], N: [41103, 90], O: [26309, 84], P: [26804, 83], Q: [22245, 95], R: [23817, 92], S: [32031, 88], T: [24297, 92], U: [25313, 95], V: [40136, 94], W: [22790, 89], X: [39148, 76], Y: [24811, 93], Z: [38694, 80],
  " ": [51541, 144], "-": [42594, 90], "@": [23317, 83], "/": [42594, 90], ".": [42594, 90], ":": [42594, 90],
  "0": [26309, 84], "1": [25313, 95], "2": [23317, 83], "3": [23817, 92], "4": [24297, 92], "5": [24811, 93], "6": [25313, 95], "7": [25795, 91], "8": [26309, 84], "9": [26804, 83],
  Enter: [19065, 110],
  Backspace: [42594, 90],
};

const KEY_SOUNDS_UP = {
  A: [31632, 80], B: [40736, 95], C: [39732, 85], D: [32577, 80], E: [23402, 80], F: [33063, 80], G: [33553, 85], H: [34081, 85], I: [25890, 85], J: [34515, 85], K: [35027, 85], L: [35510, 85], M: [41710, 85], N: [41198, 85], O: [26394, 80], P: [26889, 80], Q: [22345, 85], R: [23912, 85], S: [32121, 80], T: [24392, 85], U: [25413, 85], V: [40236, 85], W: [22880, 85], X: [39228, 70], Y: [24911, 85], Z: [38779, 75],
  " ": [51691, 130], "-": [42689, 85], "@": [23402, 80], "/": [42689, 85], ".": [42689, 85], ":": [42689, 85],
  "0": [26394, 80], "1": [25413, 85], "2": [23402, 80], "3": [23912, 85], "4": [24392, 85], "5": [24911, 85], "6": [25413, 85], "7": [25890, 85], "8": [26394, 80], "9": [26889, 80],
  Enter: [19180, 100],
  Backspace: [42689, 85],
};

function useAudio(enabled) {
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const init = async () => {
      try {
        ctxRef.current = new AudioContext();
        const res = await fetch("/sounds/sound.ogg");
        if (!res.ok) return;
        bufferRef.current = await ctxRef.current.decodeAudioData(
          await res.arrayBuffer()
        );
        readyRef.current = true;
      } catch {}
    };
    init();
    return () => {
      ctxRef.current?.close();
    };
  }, [enabled]);

  const playSound = (sound) => {
    if (!readyRef.current || !ctxRef.current || !bufferRef.current || !sound)
      return;
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    const src = ctxRef.current.createBufferSource();
    src.buffer = bufferRef.current;
    src.connect(ctxRef.current.destination);
    src.start(0, sound[0] / 1000, sound[1] / 1000);
  };

  const down = (key) =>
    playSound(KEY_SOUNDS_DOWN[key.toUpperCase()] || KEY_SOUNDS_DOWN[key]);
  const up = (key) =>
    playSound(KEY_SOUNDS_UP[key.toUpperCase()] || KEY_SOUNDS_UP[key]);

  return { down, up };
}

function useInView(ref, once = true) {
  const [inView, setInView] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && triggered.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          setInView(true);
          if (once) {
            triggered.current = true;
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once]);

  return inView;
}

function tokenizeBash(text) {
  const tokens = [];
  const words = text.split(/(\s+)/);
  let isFirstWord = true;

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      tokens.push({ type: "default", value: word });
      continue;
    }
    if (word.startsWith("#")) {
      tokens.push({ type: "comment", value: word });
      continue;
    }
    if (word.startsWith("$")) {
      tokens.push({ type: "variable", value: word });
      isFirstWord = false;
      continue;
    }
    if (word.startsWith("--") || word.startsWith("-")) {
      tokens.push({ type: "flag", value: word });
      isFirstWord = false;
      continue;
    }
    if (/^["'].*["']$/.test(word)) {
      tokens.push({ type: "string", value: word });
      isFirstWord = false;
      continue;
    }
    if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", value: word });
      isFirstWord = false;
      continue;
    }
    if (/^[|>&<]+$/.test(word)) {
      tokens.push({ type: "operator", value: word });
      isFirstWord = true;
      continue;
    }
    if (word.includes("/") || word.startsWith(".") || word.startsWith("~")) {
      tokens.push({ type: "path", value: word });
      isFirstWord = false;
      continue;
    }
    if (isFirstWord) {
      tokens.push({ type: "command", value: word });
      isFirstWord = false;
      continue;
    }
    tokens.push({ type: "default", value: word });
  }

  return tokens;
}

const tokenColors = {
  command: "text-emerald-400",
  flag: "text-sky-400",
  string: "text-amber-300",
  number: "text-purple-400",
  operator: "text-red-400",
  path: "text-cyan-300",
  variable: "text-pink-400",
  comment: "text-neutral-500",
  default: "text-neutral-300",
};

function SyntaxHighlightedText({ text }) {
  const tokens = tokenizeBash(text);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={tokenColors[token.type]}>
          {token.value}
        </span>
      ))}
    </>
  );
}

export function Terminal({
  commands = ["npx shadcn@latest init"],
  outputs = {},
  username = "rei",
  className,
  typingSpeed = 50,
  delayBetweenCommands = 800,
  initialDelay = 500,
  enableSound = true,
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const inView = useInView(containerRef);
  const { down, up } = useAudio(enableSound);

  const [lines, setLines] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [commandIdx, setCommandIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [outputIdx, setOutputIdx] = useState(-1);
  const [phase, setPhase] = useState("idle");
  const [cursorVisible, setCursorVisible] = useState(true);

  const currentCommand = commands[commandIdx] || "";
  const currentOutputs = useMemo(
    () => outputs[commandIdx] || [],
    [outputs, commandIdx]
  );
  const isLastCommand = commandIdx === commands.length - 1;

  useEffect(() => {
    if (!inView || phase !== "idle") return;
    const t = setTimeout(() => setPhase("typing"), initialDelay);
    return () => clearTimeout(t);
  }, [inView, phase, initialDelay]);

  useEffect(() => {
    if (phase !== "typing") return;

    if (charIdx < currentCommand.length) {
      const char = currentCommand[charIdx];
      down(char);
      const t = setTimeout(
        () => {
          up(char);
          setCurrentText(currentCommand.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        },
        typingSpeed + Math.random() * 30
      );
      return () => clearTimeout(t);
    } else {
      down("Enter");
      const t = setTimeout(() => {
        up("Enter");
        setPhase("executing");
      }, 80);
      return () => clearTimeout(t);
    }
  }, [phase, charIdx, currentCommand, typingSpeed, down, up]);

  useEffect(() => {
    if (phase !== "executing") return;

    setLines((prev) => [...prev, { type: "command", content: currentCommand }]);
    setCurrentText("");

    if (currentOutputs.length > 0) {
      setOutputIdx(0);
      setPhase("outputting");
    } else if (isLastCommand) {
      setPhase("done");
    } else {
      setPhase("pausing");
    }
  }, [phase, currentCommand, currentOutputs.length, isLastCommand]);

  useEffect(() => {
    if (phase !== "outputting") return;

    if (outputIdx >= 0 && outputIdx < currentOutputs.length) {
      const t = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "output", content: currentOutputs[outputIdx] },
        ]);
        setOutputIdx((i) => i + 1);
      }, 150);
      return () => clearTimeout(t);
    } else if (outputIdx >= currentOutputs.length) {
      const t = setTimeout(() => {
        if (isLastCommand) {
          setPhase("done");
        } else {
          setPhase("pausing");
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, outputIdx, currentOutputs, isLastCommand]);

  useEffect(() => {
    if (phase !== "pausing") return;
    const t = setTimeout(() => {
      setCharIdx(0);
      setOutputIdx(-1);
      setCommandIdx((c) => c + 1);
      setPhase("typing");
    }, delayBetweenCommands);
    return () => clearTimeout(t);
  }, [phase, delayBetweenCommands]);

  // Backspacing phase
  useEffect(() => {
    if (phase === "done") {
      const t = setTimeout(() => {
        setPhase("backspacing");
      }, 2500); // Wait 2.5s before clearing
      return () => clearTimeout(t);
    }
    
    if (phase === "backspacing") {
      if (lines.length === 0) {
        setCommandIdx(0);
        setCharIdx(0);
        setOutputIdx(-1);
        setPhase("typing");
        return;
      }
      
      const t = setTimeout(() => {
        setLines((prev) => {
          const newLines = [...prev];
          const lastIndex = newLines.length - 1;
          const lastLine = { ...newLines[lastIndex] };
          
          if (lastLine.content && lastLine.content.length > 0) {
            lastLine.content = lastLine.content.slice(0, -1);
            newLines[lastIndex] = lastLine;
            // Play backspace sound occasionally for effect
            if (Math.random() > 0.5) {
              down("Backspace");
              setTimeout(() => up("Backspace"), 50);
            }
            return newLines;
          } else {
            newLines.pop();
            return newLines;
          }
        });
      }, 15); // Fast backspace
      return () => clearTimeout(t);
    }
  }, [phase, lines, down, up]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines, phase, currentText]);

  const prompt = (
    <span className="text-neutral-500">
      <span className="text-sky-500">{username}</span>
      <span className="text-emerald-600">:</span>
      <span className="text-sky-400">~</span>
      <span className="text-neutral-500">$</span>{" "}
    </span>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "mx-auto w-full max-w-xl px-2 sm:px-3 font-mono text-[8px] sm:text-[9px]",
        className
      )}
    >
      <div className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 shadow-xl text-left">
        {/* Title Bar */}
        <div className="flex items-center gap-1.5 bg-neutral-800 px-2 py-1.5 sm:px-3 sm:py-2">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 transition-colors hover:bg-red-600" />
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600" />
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 transition-colors hover:bg-green-600" />
          </div>
          <div className="flex-1 text-center">
            <span className="truncate text-[7px] sm:text-[8px] text-neutral-400">
              {username} — bash
            </span>
          </div>
          <div className="w-[20px] sm:w-[30px]" />
        </div>

        {/* Terminal Content */}
        <div
          ref={contentRef}
          className="no-visible-scrollbar h-36 sm:h-48 overflow-y-auto p-2 sm:p-3 font-mono leading-normal"
        >
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap flex">
              {line.type === "command" ? (
                <div className="flex-1 break-all">
                  {prompt}
                  <SyntaxHighlightedText text={line.content} />
                </div>
              ) : (
                <span className="text-neutral-400 break-words flex-1">{line.content}</span>
              )}
            </div>
          ))}

          {phase === "typing" && (
            <div className="whitespace-pre-wrap flex">
              <div className="flex-1 break-all">
                {prompt}
                <SyntaxHighlightedText text={currentText} />
                <span className="ml-0.5 inline-block h-2.5 w-1 sm:h-3 sm:w-1.5 bg-neutral-300 align-middle" />
              </div>
            </div>
          )}

          {(phase === "done" ||
            phase === "pausing" ||
            phase === "outputting" ||
            phase === "backspacing") && (
            <div className="whitespace-pre-wrap">
              {prompt}
              <span
                className={cn(
                  "inline-block h-2.5 w-1 sm:h-3 sm:w-1.5 bg-neutral-300 align-middle transition-opacity duration-100",
                  !cursorVisible && "opacity-0"
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Terminal;
