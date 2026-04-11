"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { getHadithsByDifficulty, Hadith } from "@/lib/hadiths";
import { useArabicFont } from "@/lib/useArabicFont";
import { fetchHadithsPage, HadithRow } from "@/lib/hadith-api";

const VALID_LEVELS = ["easy", "medium", "hard"] as const;
type Level = (typeof VALID_LEVELS)[number];

const levelLabels: Record<Level, { labelKey: string; englishLabel: string }> = {
  easy: { labelKey: "aasaan", englishLabel: "Easy" },
  medium: { labelKey: "madhyam", englishLabel: "Medium" },
  hard: { labelKey: "kathin", englishLabel: "Hard" },
};

function collectionLabel(c: string) {
  const map: Record<string, string> = {
    bukhari: "Sahih Bukhari",
    muslim: "Sahih Muslim",
    abu_dawud: "Abu Dawud",
    tirmidhi: "Jami at-Tirmidhi",
  };
  return map[c] ?? c;
}

type UnifiedHadith = {
  id: number;
  arabic_text: string;
  english_text: string;
  hindi_text?: string | null;
  hinglish_text?: string | null;
  narrator_en: string;
  collection: string;
  hadith_number: number;
  grade: string;
};

function toUnified(h: HadithRow | Hadith): UnifiedHadith {
  return {
    id: h.id,
    arabic_text: h.arabic_text,
    english_text: h.english_text,
    hindi_text: "hindi_text" in h ? h.hindi_text : null,
    hinglish_text: "hinglish_text" in h ? h.hinglish_text : null,
    narrator_en: h.narrator_en,
    collection: h.collection,
    hadith_number: h.hadith_number,
    grade: h.grade,
  };
}

const PAGE_SIZE = 10;

export default function HadeesLevelPage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const params = useParams();
  const level = params.level as string;

  const [hadiths, setHadiths] = useState<UnifiedHadith[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("supabase");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadPage = useCallback(
    async (p: number) => {
      if (!VALID_LEVELS.includes(level as Level)) return;
      setLoading(true);
      try {
        const res = await fetchHadithsPage(level, p);
        if (res.hadiths.length > 0 || res.total > 0) {
          setHadiths(res.hadiths.map(toUnified));
          setTotal(res.total);
          setSource("supabase");
        } else {
          throw new Error("empty");
        }
      } catch {
        const local = getHadithsByDifficulty(level as Level);
        const start = (p - 1) * PAGE_SIZE;
        setHadiths(local.slice(start, start + PAGE_SIZE).map(toUnified));
        setTotal(local.length);
        setSource("local");
      } finally {
        setLoading(false);
      }
    },
    [level],
  );

  useEffect(() => {
    setPage(1);
    loadPage(1);
  }, [level, loadPage]);

  const goToPage = (p: number) => {
    setPage(p);
    loadPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!VALID_LEVELS.includes(level as Level)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Level</h1>
        <p className="text-muted-foreground mb-6">
          Level &quot;{level}&quot; is not valid. Please choose easy, medium, or hard.
        </p>
        <Link
          href="/hadees"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hadees
        </Link>
      </div>
    );
  }

  const validLevel = level as Level;
  const meta = levelLabels[validLevel];

  function translatedText(h: UnifiedHadith) {
    if (lang === "hi") return h.hindi_text || h.english_text;
    if (lang === "hinglish") return h.hinglish_text || h.english_text;
    return h.english_text;
  }

  function showEnglishRef(h: UnifiedHadith) {
    if (lang === "en") return false;
    const primary = translatedText(h);
    return primary !== h.english_text;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/hadees"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hadees
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {total} Hadiths — {t(meta.labelKey, lang)} / {meta.englishLabel}
        </h1>
        {source === "local" && (
          <p className="text-xs text-muted-foreground mt-1">Showing local data</p>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-muted rounded w-3/4 mb-4 ml-auto" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-5/6 mb-4" />
              <div className="flex gap-2 pt-3 border-t border-border">
                <div className="h-3 bg-muted rounded w-28" />
                <div className="ml-auto h-5 bg-muted rounded-full w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Hadith cards */}
          <div className="space-y-6">
            {hadiths.map((h) => (
              <div
                key={h.id}
                className="bg-card border border-border rounded-2xl p-6"
              >
                {/* Arabic */}
                <p
                  className={`${arabicFont} text-2xl leading-loose text-right mb-4`}
                  dir="rtl"
                >
                  {h.arabic_text}
                </p>

                {/* Translation */}
                <p className="text-foreground leading-relaxed mb-1">
                  {translatedText(h)}
                </p>

                {/* English reference when hi/hinglish */}
                {showEnglishRef(h) && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {h.english_text}
                  </p>
                )}
                {!showEnglishRef(h) && <div className="mb-4" />}

                {/* Bottom row */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {h.narrator_en}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {collectionLabel(h.collection)} #{h.hadith_number}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        h.grade === "sahih"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {h.grade === "sahih" ? "Sahih" : "Hasan"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-10">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - page) <= 1;
                })
                .reduce<(number | "dots")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("dots");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "dots" ? (
                    <span key={`dots-${idx}`} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item)}
                      className={`min-w-[2.25rem] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                        item === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
