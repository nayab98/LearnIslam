"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText, Zap, Target, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { getHadithsByDifficulty } from "@/lib/hadiths";
import { getHadithCount } from "@/lib/hadith-api";

const difficultyConfigs = [
  {
    id: "easy",
    labelKey: "aasaan",
    englishLabel: "Easy",
    desc: "Most famous hadiths every Muslim should know",
    icon: Zap,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    hoverBorder: "hover:border-green-500",
  },
  {
    id: "medium",
    labelKey: "madhyam",
    englishLabel: "Medium",
    desc: "Important hadiths on daily life and akhlaq",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    hoverBorder: "hover:border-amber-500",
  },
  {
    id: "hard",
    labelKey: "kathin",
    englishLabel: "Hard",
    desc: "Detailed theological and fiqh hadiths",
    icon: Trophy,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    hoverBorder: "hover:border-red-500",
  },
] as const;

export default function HadeesPage() {
  const { lang } = useLanguage();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const result: Record<string, number> = {};
      for (const diff of difficultyConfigs) {
        try {
          const c = await getHadithCount(diff.id);
          if (c > 0) {
            result[diff.id] = c;
          } else {
            throw new Error("zero");
          }
        } catch {
          result[diff.id] = getHadithsByDifficulty(diff.id as "easy" | "medium" | "hard").length;
        }
      }
      setCounts(result);
    }
    loadCounts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <BookOpenText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("hadees_title", lang)}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t("hadees_subtitle", lang)}
        </p>
      </div>

      {/* Difficulty cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {difficultyConfigs.map((diff) => {
          const Icon = diff.icon;
          const count = counts[diff.id] ?? 0;
          return (
            <Link
              key={diff.id}
              href={`/hadees/${diff.id}`}
              className={`group relative p-6 rounded-2xl border-2 ${diff.border} ${diff.bg} ${diff.hoverBorder} hover:shadow-lg transition-all`}
            >
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-background/50 shadow-sm mb-4">
                <Icon className={`h-6 w-6 ${diff.color}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{t(diff.labelKey, lang)}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-muted-foreground">
                  {diff.englishLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {diff.desc}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 dark:border-white/10 pt-3">
                <span>{count} Hadiths</span>
              </div>
              <ArrowRight
                className={`absolute bottom-6 right-6 h-5 w-5 ${diff.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
