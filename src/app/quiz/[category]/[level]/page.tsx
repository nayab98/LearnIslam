"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import QuizGame from "@/components/quiz/QuizGame";
import HadithQuiz from "@/components/quiz/HadithQuiz";
import WordMeaningQuiz from "@/components/quiz/WordMeaningQuiz";
import GeneralQuiz from "@/components/quiz/GeneralQuiz";
import AyahCompletionQuiz from "@/components/quiz/AyahCompletionQuiz";

const VALID_CATEGORIES = ["hadith", "word-meaning", "ayah-completion", "ayah-meaning", "general"];
const VALID_LEVELS = ["easy", "medium", "hard"];

const CATEGORY_LABELS: Record<string, string> = {
  hadith: "quiz_cat_hadith",
  "word-meaning": "quiz_cat_word",
  "ayah-completion": "quiz_cat_ayah_comp",
  "ayah-meaning": "quiz_cat_ayah_mean",
  general: "quiz_cat_general",
};

const DIFFICULTY_MAP: Record<string, { labelKey: string; surahRange: [number, number] }> = {
  easy: { labelKey: "aasaan", surahRange: [108, 114] },
  medium: { labelKey: "madhyam", surahRange: [67, 107] },
  hard: { labelKey: "kathin", surahRange: [1, 66] },
};

export default function QuizLevelPage() {
  const params = useParams();
  const category = params.category as string;
  const level = params.level as string;
  const { lang } = useLanguage();

  if (!VALID_CATEGORIES.includes(category) || !VALID_LEVELS.includes(level)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">{t("error_not_found_title", lang)}</h2>
        <p className="text-muted-foreground">{t("invalid_quiz_level", lang)}</p>
        <Link href="/quiz" className="text-emerald-600 underline mt-4 inline-block">{t("back_to_quiz", lang)}</Link>
      </div>
    );
  }

  const difficulty = level as "easy" | "medium" | "hard";
  const diffConfig = DIFFICULTY_MAP[level];
  const categoryLabel = t(CATEGORY_LABELS[category], lang);

  function renderQuiz() {
    switch (category) {
      case "ayah-meaning":
        return <QuizGame difficulty={difficulty} surahRange={diffConfig.surahRange} label={t(diffConfig.labelKey, lang)} />;
      case "hadith":
        return <HadithQuiz difficulty={difficulty} />;
      case "word-meaning":
        return <WordMeaningQuiz difficulty={difficulty} />;
      case "general":
        return <GeneralQuiz difficulty={difficulty} />;
      case "ayah-completion":
        return <AyahCompletionQuiz difficulty={difficulty} />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href={`/quiz/${category}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {categoryLabel}
      </Link>
      {renderQuiz()}
    </div>
  );
}
