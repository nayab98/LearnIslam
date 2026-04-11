"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { SEERAH_EVENTS, SeerahEvent } from "@/lib/seerah";

const CATEGORIES = [
  { key: "all", labelKey: "seerah_all" },
  { key: "early_life", labelKey: "seerah_early_life" },
  { key: "prophethood", labelKey: "seerah_prophethood" },
  { key: "makkah", labelKey: "seerah_makkah" },
  { key: "madinah", labelKey: "seerah_madinah" },
  { key: "final_years", labelKey: "seerah_final_years" },
] as const;

const CATEGORY_COLORS: Record<SeerahEvent["category"], { dot: string; border: string; bg: string; badge: string }> = {
  early_life: { dot: "bg-sky-500", border: "border-sky-200 dark:border-sky-900", bg: "bg-sky-50 dark:bg-sky-950/30", badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" },
  prophethood: { dot: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-900", bg: "bg-emerald-50 dark:bg-emerald-950/30", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" },
  makkah: { dot: "bg-amber-500", border: "border-amber-200 dark:border-amber-900", bg: "bg-amber-50 dark:bg-amber-950/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  madinah: { dot: "bg-purple-500", border: "border-purple-200 dark:border-purple-900", bg: "bg-purple-50 dark:bg-purple-950/30", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
  final_years: { dot: "bg-rose-500", border: "border-rose-200 dark:border-rose-900", bg: "bg-rose-50 dark:bg-rose-950/30", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300" },
};

function getTitle(event: SeerahEvent, lang: string) {
  if (lang === "hi") return event.title_hi;
  if (lang === "en") return event.title_en;
  return event.title_hinglish;
}

function getDescription(event: SeerahEvent, lang: string) {
  if (lang === "hi") return event.description_hi;
  if (lang === "en") return event.description_en;
  return event.description_hinglish;
}

export default function SeerahPage() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? SEERAH_EVENTS
    : SEERAH_EVENTS.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t("seerah_title", lang)}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("seerah_subtitle", lang)}</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {t(cat.labelKey, lang)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-8">
            {filtered.map((event) => {
              const colors = CATEGORY_COLORS[event.category];
              return (
                <div key={event.id} className="relative pl-12 sm:pl-16">
                  {/* Dot on timeline */}
                  <div className={`absolute left-2.5 sm:left-4.5 top-1 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-background`} />

                  {/* Card */}
                  <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5 sm:p-6 transition-all hover:shadow-md`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                        {event.year}
                      </span>
                      {event.hijri_year && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {event.hijri_year}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{getTitle(event, lang)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{getDescription(event, lang)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
