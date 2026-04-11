"use client";

import Link from "next/link";
import { ArrowRight, Zap, Target, Trophy, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const levels = [
  {
    id: "easy",
    labelKey: "aasaan",
    englishLabel: "Easy",
    desc: "Top 50 most frequent Quranic words",
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
    desc: "Moderately frequent important words",
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
    desc: "Deep vocabulary for advanced learners",
    icon: Trophy,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    hoverBorder: "hover:border-red-500",
  },
];

export default function LafzBaLafzPage() {
  const { lang } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("lafz_title", lang)}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t("lafz_subtitle", lang)}
        </p>
      </div>

      {/* Difficulty cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <Link
              key={lvl.id}
              href={`/lafz-ba-lafz/${lvl.id}`}
              className={`group relative p-6 rounded-2xl border-2 ${lvl.border} ${lvl.bg} ${lvl.hoverBorder} hover:shadow-lg transition-all`}
            >
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-background/50 shadow-sm mb-4">
                <Icon className={`h-6 w-6 ${lvl.color}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{t(lvl.labelKey, lang)}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-muted-foreground">
                  {lvl.englishLabel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lvl.desc}
              </p>
              <ArrowRight
                className={`absolute bottom-6 right-6 h-5 w-5 ${lvl.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
              />
            </Link>
          );
        })}
      </div>

      {/* Flip hint */}
      <p className="text-center text-sm text-muted-foreground">
        {t("flip_to_reveal", lang)}
      </p>
    </div>
  );
}
