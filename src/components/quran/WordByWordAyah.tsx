"use client";

import { useState, useEffect } from "react";
import { fetchWordByWord } from "@/lib/quran-api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useArabicFont } from "@/lib/useArabicFont";

interface Props {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
}

interface WordData {
  text: string;
  transliteration?: { text: string };
  translation?: { text: string };
  char_type?: string;
}

export default function WordByWordAyah({ surahNumber, ayahNumber, arabicText }: Props) {
  const [words, setWords] = useState<WordData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const arabicFont = useArabicFont();

  useEffect(() => {
    setLoading(true);
    fetchWordByWord(surahNumber, ayahNumber)
      .then((data) => setWords(data))
      .finally(() => setLoading(false));
  }, [surahNumber, ayahNumber]);

  if (loading) {
    return (
      <p className={`text-right text-3xl ${arabicFont} leading-[2.2] text-foreground animate-pulse`}>
        {arabicText}
      </p>
    );
  }

  if (!words || words.length === 0) {
    return (
      <p className={`text-right text-3xl ${arabicFont} leading-[2.2] text-foreground`}>
        {arabicText}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap-reverse gap-x-2 gap-y-4 justify-end">
      {words
        .filter((w) => w.char_type !== "end")
        .map((word, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger
              onClick={(e) => {
                e.stopPropagation();
                setActiveWord(activeWord === idx ? null : idx);
              }}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all cursor-pointer ${
                activeWord === idx
                  ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-400"
                  : "hover:bg-accent"
              }`}
            >
              <span className={`text-2xl ${arabicFont} leading-relaxed`}>{word.text}</span>
              {word.transliteration?.text && (
                <span className="text-[10px] text-muted-foreground italic">
                  {word.transliteration.text}
                </span>
              )}
              {(activeWord === idx || true) && word.translation?.text && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
                  {word.translation.text}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {word.translation?.text || "—"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
    </div>
  );
}
