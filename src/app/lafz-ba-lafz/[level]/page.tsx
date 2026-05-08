"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { WORD_LEVELS, ArabicWord } from "@/lib/arabic-words";
import { createClient } from "@/lib/supabase/client";
import { recordLearningEvent, upsertReviewItem } from "@/lib/learning-events";

const VALID_LEVELS = ["easy", "medium", "hard"] as const;
type Level = (typeof VALID_LEVELS)[number];

function getMeaning(word: ArabicWord, lang: string): string {
  if (lang === "hi") return word.meaning_hi;
  if (lang === "hinglish") return word.meaning_hinglish;
  return word.meaning_en;
}

export default function LafzBaLafzLevelPage() {
  const params = useParams();
  const level = params.level as string;
  const { lang } = useLanguage();

  if (!VALID_LEVELS.includes(level as Level)) {
    notFound();
  }

  const words = WORD_LEVELS[level as Level];
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const toggle = async (idx: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

    if (!flipped.has(idx)) {
      const word = words[idx];
      const itemId = `${level}:${word.arabic}:${word.transliteration}`;
      await recordLearningEvent({
        userId,
        eventType: "word_reviewed",
        itemType: "word",
        itemId,
        metadata: { level, meaning: getMeaning(word, lang) },
      });
      await upsertReviewItem({
        userId,
        itemType: "word",
        itemId,
        title: `${word.arabic} - ${word.meaning_en}`,
        result: "good",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/lafz-ba-lafz"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("lafz_title", lang)}
        </Link>
        <span className="text-sm text-muted-foreground">
          {t("words_count", lang).replace("{count}", String(words.length))}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {words.map((word, idx) => {
          const isFlipped = flipped.has(idx);
          const meaning = getMeaning(word, lang);
          const showEnglishSubtitle = lang !== "en";

          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={`text-left rounded-2xl border p-6 transition-all cursor-pointer select-none ${
                isFlipped
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                  : "bg-card border-border hover:border-foreground/20 hover:shadow-sm"
              }`}
            >
              {!isFlipped ? (
                <div className="flex flex-col items-center gap-3 min-h-[100px] justify-center">
                  <span className="font-arabic text-3xl leading-relaxed" dir="rtl">
                    {word.arabic}
                  </span>
                  <span className="text-xs italic text-muted-foreground">
                    {word.transliteration}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 min-h-[100px] justify-center">
                  <span className="font-arabic text-xl text-muted-foreground" dir="rtl">
                    {word.arabic}
                  </span>
                  <span className="text-base font-semibold text-center leading-snug">
                    {meaning}
                  </span>
                  {showEnglishSubtitle && (
                    <span className="text-xs text-muted-foreground text-center">
                      {word.meaning_en}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
