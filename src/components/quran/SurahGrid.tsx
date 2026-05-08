"use client";

import { useState } from "react";
import Link from "next/link";
import { Surah } from "@/types";
import { Search } from "lucide-react";
import { ENABLE_LOCALIZED_LANGUAGES } from "@/lib/feature-flags";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

interface SurahGridProps {
  surahs: Surah[];
}

export default function SurahGrid({ surahs }: SurahGridProps) {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Meccan" | "Medinan">("all");
  const showLocalizedNames = ENABLE_LOCALIZED_LANGUAGES && (lang === "hi" || lang === "hinglish");

  const filtered = surahs.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (showLocalizedNames && s.hindiName.toLowerCase().includes(q)) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).includes(q);
    const matchesFilter = filter === "all" || s.revelationType === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("search_surah", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "Meccan", "Medinan"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {f === "all" ? t("sabhi", lang) : f === "Meccan" ? t("makki", lang) : t("madani", lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((surah) => {
          const displayName = showLocalizedNames ? surah.hindiName : surah.englishName;
          const secondaryName = showLocalizedNames
            ? `${surah.englishName} · ${surah.englishNameTranslation}`
            : surah.englishNameTranslation;

          return (
            <Link
              key={surah.number}
              href={`/surahs/${surah.number}`}
              className="group bg-card border border-border rounded-2xl p-5 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-950/20 transition-all"
            >
            {/* Number badge + revelation type */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                {surah.number}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  surah.revelationType === "Meccan"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                }`}
              >
                {surah.revelationType === "Meccan" ? t("makki", lang) : t("madani", lang)}
              </span>
            </div>

            {/* Arabic Name */}
            <p className="text-right text-2xl font-arabic text-foreground mb-1 leading-relaxed group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {surah.name}
            </p>

            {/* Display Name */}
            <p className="text-sm font-semibold text-foreground mb-1 truncate">
              {displayName}
            </p>

            {/* Meaning */}
            <p className={`text-muted-foreground mb-3 truncate ${showLocalizedNames ? "text-xs font-medium" : "text-xs"}`}>
              {secondaryName}
            </p>

            {/* Ayaat count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
              <span>{surah.numberOfAyahs} {t("ayatein", lang)}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                {t("padhein", lang)}
              </span>
            </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{t("no_surah", lang)}</p>
          <p className="text-sm mt-1">{t("try_again", lang)}</p>
        </div>
      )}
    </div>
  );
}
