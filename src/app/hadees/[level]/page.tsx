"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Heart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { getHadithLearningTier, getHadithSourceName } from "@/lib/hadiths";
import { useArabicFont } from "@/lib/useArabicFont";
import { fetchHadithsPage, HadithRow } from "@/lib/hadith-api";
import { createClient } from "@/lib/supabase/client";
import { addBookmark, getBookmarks, removeBookmark } from "@/lib/bookmarks";
import { recordLearningEvent } from "@/lib/learning-events";
import { cleanArabicTextForDisplay } from "@/lib/quran-text";
import { SourceTrust } from "@/components/common/SourceTrust";
import {
  getHadithTierConfig,
  getHadithTierSlug,
  HadithLearningTier,
  HadithReviewStatus,
  resolveHadithTierParam,
} from "@/lib/hadith-tiers";

type UnifiedHadith = {
  id: number;
  arabic_text: string;
  english_text: string;
  hindi_text?: string | null;
  hinglish_text?: string | null;
  narrator_en: string;
  collection: string;
  source_name?: string | null;
  book_name?: string | null;
  chapter?: string | null;
  hadith_number: number;
  grade: string;
  difficulty: string;
  learning_tier: HadithLearningTier;
  review_status: HadithReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
};

function toUnified(h: HadithRow): UnifiedHadith {
  return {
    id: h.id,
    arabic_text: h.arabic_text,
    english_text: h.english_text,
    hindi_text: "hindi_text" in h ? h.hindi_text : null,
    hinglish_text: "hinglish_text" in h ? h.hinglish_text : null,
    narrator_en: h.narrator_en,
    collection: h.collection,
    source_name: "source_name" in h ? h.source_name : null,
    book_name: "book_name" in h ? h.book_name : null,
    chapter: "chapter" in h ? h.chapter : null,
    hadith_number: h.hadith_number,
    grade: h.grade,
    difficulty: h.difficulty,
    learning_tier: "learning_tier" in h && h.learning_tier ? h.learning_tier : getHadithLearningTier(h),
    review_status: ("review_status" in h && h.review_status ? h.review_status : "source_listed") as HadithReviewStatus,
    reviewed_by: "reviewed_by" in h ? h.reviewed_by : null,
    reviewed_at: "reviewed_at" in h ? h.reviewed_at : null,
  };
}

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const DEFAULT_PAGE_SIZE: PageSize = 25;
const REMOTE_HADITH_TIMEOUT_MS = 2500;
const PAGE_SIZE_STORAGE_KEY = "learnislam_hadith_page_size";

function getInitialPageSize(): PageSize {
  if (typeof window === "undefined") return DEFAULT_PAGE_SIZE;
  const stored = Number(window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
  return PAGE_SIZE_OPTIONS.includes(stored as PageSize) ? (stored as PageSize) : DEFAULT_PAGE_SIZE;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("Hadith source timed out")), ms);
    }),
  ]);
}

export default function HadeesLevelPage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const params = useParams();
  const level = params.level as string;
  const tier = resolveHadithTierParam(level);

  const [pageSize, setPageSize] = useState<PageSize>(getInitialPageSize);
  const [hadiths, setHadiths] = useState<UnifiedHadith[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<Set<string>>(new Set());
  const [readHadiths, setReadHadiths] = useState<Set<number>>(new Set());

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadPage = useCallback(
    async (p: number) => {
      if (!tier) return;
      setLoading(true);

      try {
        const res = await withTimeout(fetchHadithsPage(tier, p, pageSize), REMOTE_HADITH_TIMEOUT_MS);
        setHadiths(res.hadiths.map(toUnified));
        setTotal(res.total);
      } catch {
        setHadiths([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, tier],
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      getBookmarks(id).then((bookmarks) => {
        setBookmarkedHadiths(new Set(bookmarks.filter((b) => b.item_type === "hadith").map((b) => b.item_id)));
      });
    });
  }, []);

  useEffect(() => {
    setPage(1);
    loadPage(1);
  }, [level, loadPage, pageSize]);

  const goToPage = (p: number) => {
    setPage(p);
    loadPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changePageSize = (nextPageSize: PageSize) => {
    setPageSize(nextPageSize);
    window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(nextPageSize));
    setPage(1);
  };

  if (!tier) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Hadith Tier</h1>
        <p className="text-muted-foreground mb-6">
          Choose Must Know, Good to Know, or Deep Dive.
        </p>
        <Link
          href="/hadees"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_hadees", lang)}
        </Link>
      </div>
    );
  }

  const meta = getHadithTierConfig(tier);
  const canonicalSlug = getHadithTierSlug(tier);

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

  async function toggleBookmark(h: UnifiedHadith) {
    const id = String(h.id);
    if (bookmarkedHadiths.has(id)) {
      await removeBookmark(userId, "hadith", id);
      setBookmarkedHadiths((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    await addBookmark(userId, {
      item_type: "hadith",
      item_id: id,
      title: translatedText(h).slice(0, 80),
      href: `/hadees/${canonicalSlug}#hadith-${h.id}`,
      created_at: new Date().toISOString(),
    });
    setBookmarkedHadiths((prev) => new Set(prev).add(id));
  }

  async function markRead(h: UnifiedHadith) {
    setReadHadiths((prev) => new Set(prev).add(h.id));
    await recordLearningEvent({
      userId,
      eventType: "hadith_read",
      itemType: "hadith",
      itemId: String(h.id),
      metadata: { collection: h.collection, hadith_number: h.hadith_number, learning_tier: h.learning_tier },
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/hadees"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back_to_hadees", lang)}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {t("hadith_count", lang).replace("{count}", String(total))} — {meta.label}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
          </div>
          <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
            Per page
            <select
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value) as PageSize)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Hadith per page"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
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
                id={`hadith-${h.id}`}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex flex-wrap justify-end gap-2 mb-3">
                  <button
                    onClick={() => toggleBookmark(h)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                    title={t("bookmark", lang)}
                    aria-label={t("bookmark", lang)}
                  >
                    <Heart className={`h-4 w-4 ${bookmarkedHadiths.has(String(h.id)) ? "fill-pink-500 text-pink-500" : ""}`} />
                  </button>
                  <button
                    onClick={() => markRead(h)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      readHadiths.has(h.id)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    {readHadiths.has(h.id) ? t("padha", lang) : t("mark_read", lang)}
                  </button>
                </div>
                {/* Arabic */}
                <p
                  className={`${arabicFont} max-w-full overflow-hidden break-words text-2xl leading-loose text-right mb-4`}
                  dir="rtl"
                >
                  {cleanArabicTextForDisplay(h.arabic_text)}
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
                  <span className="text-sm text-muted-foreground break-words">
                    {h.narrator_en}
                  </span>
                  <span className="sm:ml-auto inline-flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {getHadithSourceName(h)} #{h.hadith_number}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {getHadithTierConfig(h.learning_tier).label}
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
                <SourceTrust
                  className="mt-3"
                  reviewStatus="source_listed"
                  items={[
                    { label: "Hadith", value: `${getHadithSourceName(h)} #${h.hadith_number}` },
                    { label: "Grade", value: h.grade.toUpperCase() },
                    { label: "Narrator", value: h.narrator_en },
                    { label: "Tier", value: getHadithTierConfig(h.learning_tier).label },
                    { label: "Chapter", value: h.chapter || "" },
                  ]}
                />
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
