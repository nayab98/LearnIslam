import mustKnow from "@/data/hadiths/must_know.json";
import goodToKnow from "@/data/hadiths/good_to_know.json";
import deepDive from "@/data/hadiths/deep_dive.json";
import { Hadith, getHadithLearningTier } from "@/lib/hadiths";
import {
  HadithDifficulty,
  HadithLearningTier,
  legacyDifficultyForTier,
  resolveHadithTierParam,
} from "@/lib/hadith-tiers";

const DEFAULT_PAGE_SIZE = 25;
const ALLOWED_PAGE_SIZES = [10, 25, 50] as const;
const MAX_SEARCH_RESULTS = 100;

const HADITHS_BY_TIER: Record<HadithLearningTier, Hadith[]> = {
  must_know: mustKnow as Hadith[],
  good_to_know: goodToKnow as Hadith[],
  deep_dive: deepDive as Hadith[],
};

const ALL_HADITHS = Object.values(HADITHS_BY_TIER).flat();

export function normalizeHadithPageSize(pageSize = DEFAULT_PAGE_SIZE) {
  return ALLOWED_PAGE_SIZES.includes(pageSize as (typeof ALLOWED_PAGE_SIZES)[number])
    ? pageSize
    : DEFAULT_PAGE_SIZE;
}

export function normalizeHadithPage(page = 1) {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function getStaticHadithsByTier(tierOrLegacyLevel: string) {
  const tier = resolveHadithTierParam(tierOrLegacyLevel);
  return tier ? HADITHS_BY_TIER[tier] : [];
}

export function getStaticHadithPage(tierOrLegacyLevel: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const normalizedPage = normalizeHadithPage(page);
  const normalizedPageSize = normalizeHadithPageSize(pageSize);
  const hadiths = getStaticHadithsByTier(tierOrLegacyLevel);
  const from = (normalizedPage - 1) * normalizedPageSize;

  return {
    hadiths: hadiths.slice(from, from + normalizedPageSize),
    total: hadiths.length,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}

export function getStaticHadithCounts() {
  return {
    must_know: HADITHS_BY_TIER.must_know.length,
    good_to_know: HADITHS_BY_TIER.good_to_know.length,
    deep_dive: HADITHS_BY_TIER.deep_dive.length,
  } satisfies Record<HadithLearningTier, number>;
}

export function searchStaticHadiths(query: string, limit = 50) {
  const q = query.trim();
  if (!q) return [];

  const lower = q.toLowerCase();
  const normalizedLimit = Math.max(1, Math.min(MAX_SEARCH_RESULTS, Math.floor(limit || 50)));

  return ALL_HADITHS.filter((h) =>
    [
      h.english_text,
      h.arabic_text,
      h.narrator_en,
      h.collection,
      h.source_name,
      h.book_name,
      h.chapter,
      h.topic,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(lower) || String(value).includes(q)),
  ).slice(0, normalizedLimit);
}

export function getStaticDailyHadith(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return ALL_HADITHS[dayOfYear % ALL_HADITHS.length] ?? null;
}

export function getStaticHadithQuizPool(difficulty: HadithDifficulty) {
  const tier = Object.keys(HADITHS_BY_TIER).find(
    (key) => legacyDifficultyForTier(key as HadithLearningTier) === difficulty,
  ) as HadithLearningTier | undefined;

  if (!tier) return [];
  return HADITHS_BY_TIER[tier].map((hadith) => ({
    ...hadith,
    learning_tier: getHadithLearningTier(hadith),
  }));
}
