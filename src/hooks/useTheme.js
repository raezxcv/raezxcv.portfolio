import { useState, useEffect } from "react";
import { THEME_STORAGE_KEY, THEMES } from "../data/index.js";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === THEMES.dark || stored === THEMES.light) return stored;
    } catch {
      // ignore
    }
    const prefersLight =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? THEMES.light : THEMES.dark;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === THEMES.dark ? THEMES.light : THEMES.dark));

  return { theme, toggleTheme };
}
