import { createClient } from "@/lib/supabase/client";
import {
  HadithLearningTier,
  HadithReviewStatus,
  legacyDifficultyForTier,
  resolveHadithTierParam,
} from "@/lib/hadith-tiers";

export interface HadithRow {
  id: number;
  hadith_number: number;
  collection: string;
  source_name?: string | null;
  book_name?: string | null;
  chapter?: string | null;
  arabic_text: string;
  english_text: string;
  hindi_text: string | null;
  hinglish_text: string | null;
  narrator_en: string;
  grade: string;
  difficulty: string;
  learning_tier?: HadithLearningTier | null;
  review_status?: HadithReviewStatus | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  topic: string;
}

const PAGE_SIZE = 10;

async function queryHadithsByField(field: "learning_tier" | "difficulty", value: string, page: number) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("hadiths")
    .select("*", { count: "exact" })
    .eq(field, value)
    .range(from, to)
    .order("id", { ascending: true });

  if (error) throw error;
  return { hadiths: (data || []) as HadithRow[], total: count || 0, pageSize: PAGE_SIZE };
}

export async function fetchHadithsPage(tierOrLegacyLevel: string, page: number) {
  const tier = resolveHadithTierParam(tierOrLegacyLevel);
  if (!tier) throw new Error("Invalid hadith tier");

  try {
    const byTier = await queryHadithsByField("learning_tier", tier, page);
    if (byTier.total > 0 || byTier.hadiths.length > 0) return byTier;
  } catch {
    // Older Supabase tables may not have learning_tier yet.
  }

  return queryHadithsByField("difficulty", legacyDifficultyForTier(tier), page);
}

async function queryHadithCountByField(field: "learning_tier" | "difficulty", value: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("hadiths")
    .select("*", { count: "exact", head: true })
    .eq(field, value);
  if (error) throw error;
  return count || 0;
}

export async function getHadithCount(tierOrLegacyLevel: string): Promise<number> {
  const tier = resolveHadithTierParam(tierOrLegacyLevel);
  if (!tier) return 0;

  try {
    const byTier = await queryHadithCountByField("learning_tier", tier);
    if (byTier > 0) return byTier;
  } catch {
    // Older Supabase tables may not have learning_tier yet.
  }

  return queryHadithCountByField("difficulty", legacyDifficultyForTier(tier));
}
