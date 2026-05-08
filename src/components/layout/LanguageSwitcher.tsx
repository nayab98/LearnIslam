"use client";

import { ENABLE_LOCALIZED_LANGUAGES, SUPPORTED_LANGS } from "@/lib/feature-flags";
import { useLanguage, type Lang } from "@/lib/language-context";

const options: { value: Lang; label: string }[] = [
  { value: "hi", label: "हिंदी" },
  { value: "hinglish", label: "Hinglish" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  if (!ENABLE_LOCALIZED_LANGUAGES) return null;

  return (
    <div className="flex items-center gap-1">
      {options
        .filter((opt) => SUPPORTED_LANGS.includes(opt.value))
        .map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              lang === opt.value
                ? "bg-emerald-600 text-white"
                : "border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
    </div>
  );
}
