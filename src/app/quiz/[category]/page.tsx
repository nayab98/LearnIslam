"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Zap, Target, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const VALID_CATEGORIES: Record<string, { labelEn: string; labelUr: string }> = {
  hadith: { labelEn: "Hadees Quiz", labelUr: "Hadeeso ka Quiz" },
  "word-meaning": { labelEn: "Word Meaning", labelUr: "Lafz ke Matlab" },
  "ayah-completion": { labelEn: "Ayah Completion", labelUr: "Aayat Poori Karein" },
  "ayah-meaning": { labelEn: "Ayah Meaning", labelUr: "Aayat ka Tarjuma" },
  general: { labelEn: "General Islamic", labelUr: "Aam Islami Maloomat" },
};

const difficultyConfigs = [
  {
    id: "easy",
    labelKey: "aasaan",
    englishLabel: "Easy",
    icon: Zap,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    hoverBorder: "hover:border-green-500",
    descKey: "quiz_easy_desc",
    surahsKey: "quiz_easy_surahs",
    countKey: "quiz_easy_count",
  },
  {
    id: "medium",
    labelKey: "madhyam",
    englishLabel: "Medium",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    hoverBorder: "hover:border-amber-500",
    descKey: "quiz_medium_desc",
    surahsKey: "quiz_medium_surahs",
    countKey: "quiz_medium_count",
  },
  {
    id: "hard",
    labelKey: "kathin",
    englishLabel: "Hard",
    icon: Trophy,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    hoverBorder: "hover:border-red-500",
    descKey: "quiz_hard_desc",
    surahsKey: "quiz_hard_surahs",
    countKey: "quiz_hard_count",
  },
];

export default function CategoryDifficultyPage() {
  const params = useParams();
  const category = params.category as string;
  const { lang } = useLanguage();

  const categoryInfo = VALID_CATEGORIES[category];

  if (!categoryInfo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground">Invalid quiz category.</p>
        <Link href="/quiz" className="text-primary underline mt-4 inline-block">
          Back to Quiz
        </Link>
      </div>
    );
  }

  const categoryLabel = lang === "hi" ? categoryInfo.labelUr : categoryInfo.labelEn;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/quiz"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("quiz_title", lang)}
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{categoryLabel}</h1>
        <p className="text-muted-foreground text-lg">
          {lang === "hi" ? "Mushkilat ka darjah chunein" : "Choose your difficulty level"}
        </p>
      </div>

      {/* Difficulty cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficultyConfigs.map((diff) => {
          const Icon = diff.icon;
          return (
            <Link
              key={diff.id}
              href={`/quiz/${category}/${diff.id}`}
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
                {t(diff.descKey, lang)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 dark:border-white/10 pt-3">
                <span>{t(diff.surahsKey, lang)}</span>
                <span>{t(diff.countKey, lang)}</span>
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
