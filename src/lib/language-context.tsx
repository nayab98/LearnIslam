"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/lib/feature-flags";

export type Lang = "hi" | "hinglish" | "en";
export type Script = "naskh" | "indopak";
export type Theme = "light" | "dark" | "system";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  script: Script;
  setScript: (s: Script) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG as Lang,
  setLang: () => {},
  script: "indopak",
  setScript: () => {},
  theme: "system",
  setTheme: () => {},
});

function isSupportedLang(value: string | null): value is Lang {
  return !!value && SUPPORTED_LANGS.includes(value);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG as Lang);
  const [script, setScriptState] = useState<Script>("indopak");
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const savedLang = localStorage.getItem("learnislam_lang");
    const nextLang = isSupportedLang(savedLang) ? savedLang : (DEFAULT_LANG as Lang);
    setLangState(nextLang);
    localStorage.setItem("learnislam_lang", nextLang);

    const savedScript = localStorage.getItem("learnislam_script") as Script | null;
    if (savedScript && ["naskh", "indopak"].includes(savedScript)) {
      setScriptState(savedScript);
    }
    const savedTheme = localStorage.getItem("learnislam_theme") as Theme | null;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("system");
    }
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setLang = (newLang: Lang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) {
      setLangState(DEFAULT_LANG as Lang);
      localStorage.setItem("learnislam_lang", DEFAULT_LANG);
      return;
    }

    setLangState(newLang);
    localStorage.setItem("learnislam_lang", newLang);
  };

  const setScript = (newScript: Script) => {
    setScriptState(newScript);
    localStorage.setItem("learnislam_script", newScript);
  };

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("learnislam_theme", newTheme);
    applyTheme(newTheme);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, script, setScript, theme, setTheme }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
