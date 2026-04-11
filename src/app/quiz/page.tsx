"use client";

import Link from "next/link";
import {
  ArrowRight,
  HelpCircle,
  BookOpenText,
  Type,
  BookOpen,
  Languages,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const categoryConfigs = [
  {
    id: "hadith",
    labelEn: "Hadees Quiz",
    labelUr: "Hadeeso ka Quiz",
    description: "Test your knowledge of Prophet's sayings",
    icon: BookOpenText,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    hoverBorder: "hover:border-purple-500",
  },
  {
    id: "word-meaning",
    labelEn: "Word Meaning",
    labelUr: "Lafz ke Matlab",
    description: "Match Arabic words with their meanings",
    icon: Type,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    hoverBorder: "hover:border-amber-500",
  },
  {
    id: "ayah-completion",
    labelEn: "Ayah Completion",
    labelUr: "Aayat Poori Karein",
    description: "Complete the missing part of an ayah",
    icon: BookOpen,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    hoverBorder: "hover:border-emerald-500",
  },
  {
    id: "ayah-meaning",
    labelEn: "Ayah Meaning",
    labelUr: "Aayat ka Tarjuma",
    description: "Pick correct translation of an ayah",
    icon: Languages,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    hoverBorder: "hover:border-blue-500",
  },
  {
    id: "general",
    labelEn: "General Islamic",
    labelUr: "Aam Islami Maloomat",
    description: "Test your Islamic general knowledge",
    icon: GraduationCap,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    hoverBorder: "hover:border-rose-500",
  },
];

export default function QuizPage() {
  const { lang } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <HelpCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("quiz_title", lang)}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t("quiz_desc", lang)}
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categoryConfigs.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/quiz/${cat.id}`}
              className={`group relative p-6 rounded-2xl border-2 ${cat.border} ${cat.bg} ${cat.hoverBorder} hover:shadow-lg transition-all`}
            >
              <div className="inline-flex p-3 rounded-xl bg-white dark:bg-background/50 shadow-sm mb-4">
                <Icon className={`h-6 w-6 ${cat.color}`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">
                  {lang === "hi" ? cat.labelUr : cat.labelEn}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {cat.description}
              </p>
              <ArrowRight
                className={`absolute bottom-6 right-6 h-5 w-5 ${cat.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
              />
            </Link>
          );
        })}
      </div>

      {/* How the quiz works */}
      <div className="bg-card border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">{t("quiz_how_title", lang)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "1", titleKey: "quiz_step1_title", descKey: "quiz_step1_desc" },
            { step: "2", titleKey: "quiz_step2_title", descKey: "quiz_step2_desc" },
            { step: "3", titleKey: "quiz_step3_title", descKey: "quiz_step3_desc" },
            { step: "4", titleKey: "quiz_step4_title", descKey: "quiz_step4_desc" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{t(item.titleKey, lang)}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(item.descKey, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
