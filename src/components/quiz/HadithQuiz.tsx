"use client";

import { useState, useEffect, useCallback } from "react";
import { getHadithsByDifficulty } from "@/lib/hadiths";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { saveGenericQuizAttempt } from "@/lib/user-data";

interface QuizQuestion {
  id: number;
  arabicText: string;
  promptText: string;
  correctCompletion: string;
  options: string[];
  narrator: string;
  collection: string;
  hadithNumber: number;
}

interface Props {
  difficulty: "easy" | "medium" | "hard";
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function splitHadith(text: string): [string, string] {
  const words = text.split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const TOTAL_QUESTIONS = 10;

const COLLECTION_LABELS: Record<string, string> = {
  bukhari: "Sahih Bukhari",
  muslim: "Sahih Muslim",
  tirmidhi: "Jami At-Tirmidhi",
  abu_dawud: "Sunan Abu Dawud",
};

export default function HadithQuiz({ difficulty }: Props) {
  const { lang } = useLanguage();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const loadQuestions = useCallback(() => {
    setLoading(true);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setResults([]);

    const pool = shuffle(getHadithsByDifficulty(difficulty));
    const picked = pool.slice(0, TOTAL_QUESTIONS);
    const allHadiths = pool;

    const qs: QuizQuestion[] = [];

    for (const hadith of picked) {
      const [firstHalf, secondHalf] = splitHadith(hadith.english_text);

      if (!secondHalf) continue;

      const distractors = shuffle(
        allHadiths
          .filter((h) => h.id !== hadith.id)
          .map((h) => splitHadith(h.english_text)[1])
          .filter(Boolean)
      ).slice(0, 3);

      if (distractors.length < 3) continue;

      qs.push({
        id: hadith.id,
        arabicText: hadith.arabic_text,
        promptText: firstHalf,
        correctCompletion: secondHalf,
        options: shuffle([secondHalf, ...distractors]),
        narrator: hadith.narrator_en,
        collection: hadith.collection,
        hadithNumber: hadith.hadith_number,
      });
    }

    setQuestions(qs);
    setLoading(false);
  }, [difficulty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSelect = async (option: string) => {
    if (selected) return;
    setSelected(option);

    const isCorrect = option === questions[currentIdx].correctCompletion;
    if (isCorrect) setScore((s) => s + 1);
    setResults((r) => [...r, isCorrect]);
    if (userId) {
      const q = questions[currentIdx];
      await saveGenericQuizAttempt(
        userId,
        "hadith",
        String(q.id),
        isCorrect,
        difficulty,
        `${COLLECTION_LABELS[q.collection] || q.collection} #${q.hadithNumber}`
      );
    }
  };

  const handleNext = () => {
    if (currentIdx >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
    }
  };

  const diffLabel =
    difficulty === "easy"
      ? t("easy_level", lang)
      : difficulty === "medium"
      ? t("medium_level", lang)
      : t("hard_level", lang);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-muted-foreground">{t("quiz_loading", lang)}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">{t("quiz_empty", lang)}</p>
        <button
          onClick={loadQuestions}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          {t("quiz_reload", lang)}
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center">
        <div className="bg-card border border-border rounded-3xl p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
            <Trophy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2">{t("quiz_done", lang)}</h2>
          <p className="text-muted-foreground mb-8">
            {t("quiz_completed", lang)} — {t("quiz_type_hadith", lang)} ({diffLabel})
          </p>

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-6xl font-bold text-emerald-600">{score}</span>
            <span className="text-3xl text-muted-foreground">/ {questions.length}</span>
          </div>
          <p className="text-2xl font-semibold mb-8">
            {pct}% {t("sahi", lang)}
            {pct >= 80
              ? ` — ${t("shaandaar", lang)} 🌟`
              : pct >= 50
              ? ` — ${t("acha", lang)}`
              : ` — ${t("more_practice", lang)}`}
          </p>

          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {results.map((r, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  r
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30"
                }`}
              >
                {r ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadQuestions}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t("play_again", lang)}
            </button>
            <Link
              href="/quiz"
              className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-semibold hover:bg-accent transition-colors"
            >
              {t("other_level", lang)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[currentIdx];
  const isCorrect = selected === current.correctCompletion;

  return (
    <div>
      {/* Progress header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                difficulty === "easy"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                  : difficulty === "medium"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30"
              }`}
            >
              {diffLabel}
            </span>
            <span className="text-sm text-muted-foreground">{t("quiz_type_hadith", lang)}</span>
          </div>
          <p className="text-sm font-medium">
            {t("sawaal", lang)} {currentIdx + 1} / {questions.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t("score", lang)}</p>
          <p className="text-xl font-bold text-emerald-600">{score}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-8">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentIdx / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-3xl p-8 mb-6">
        <p className="text-3xl font-arabic text-center leading-[2] text-foreground mb-4">
          {current.arabicText}
        </p>
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground text-center mb-2">
            {lang === "en" ? "Complete the hadith:" : lang === "hi" ? "हदीस पूरी करें:" : "Hadith poori karein:"}
          </p>
          <p className="text-lg text-center text-foreground font-medium">
            &ldquo;{current.promptText} ...&rdquo;
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          {current.narrator} — {COLLECTION_LABELS[current.collection] || current.collection} #{current.hadithNumber}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {current.options.map((option, idx) => {
          let className =
            "w-full text-left p-4 rounded-2xl border-2 text-sm leading-relaxed transition-all font-medium";

          if (!selected) {
            className +=
              " border-border bg-card hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer";
          } else if (option === current.correctCompletion) {
            className +=
              " border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200";
          } else if (option === selected) {
            className +=
              " border-red-400 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200";
          } else {
            className += " border-border bg-card opacity-50";
          }

          return (
            <button key={idx} className={className} onClick={() => handleSelect(option)}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>...{option}</span>
                {selected && option === current.correctCompletion && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 ml-auto" />
                )}
                {selected && option === selected && option !== current.correctCompletion && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0 ml-auto" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {selected && (
        <div
          className={`p-4 rounded-2xl mb-4 ${
            isCorrect
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          }`}
        >
          <p
            className={`font-semibold ${
              isCorrect
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrect ? `✓ ${t("correct_answer", lang)}` : `✗ ${t("wrong_answer", lang)}`}
          </p>
          {!isCorrect && (
            <p className="text-sm text-muted-foreground mt-1">
              {t("correct_was", lang)}{" "}
              <span className="font-medium text-foreground">
                ...{current.correctCompletion}
              </span>
            </p>
          )}
        </div>
      )}

      {selected && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-lg transition-colors"
        >
          {currentIdx >= questions.length - 1 ? (
            <>
              {t("see_result", lang)} <Trophy className="h-5 w-5" />
            </>
          ) : (
            <>
              {t("next_question", lang)} <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
