import { Hadith } from "@/lib/hadiths";
import { HadithLearningTier, resolveHadithTierParam } from "@/lib/hadith-tiers";

export type HadithRow = Hadith;

const DEFAULT_PAGE_SIZE = 25;

export async function fetchHadithsPage(tierOrLegacyLevel: string, page: number, pageSize = DEFAULT_PAGE_SIZE) {
  const params = new URLSearchParams({
    tier: tierOrLegacyLevel,
    page: String(page),
    pageSize: String(pageSize),
  });

  const res = await fetch(`/api/hadiths?${params.toString()}`);
  if (!res.ok) throw new Error("Could not load hadiths");

  return await res.json() as {
    hadiths: HadithRow[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export async function getHadithCounts(): Promise<Record<HadithLearningTier, number>> {
  const res = await fetch("/api/hadiths/counts");
  if (!res.ok) throw new Error("Could not load hadith counts");
  const data = await res.json() as { counts: Record<HadithLearningTier, number> };
  return data.counts;
}

export async function getHadithCount(tierOrLegacyLevel: string): Promise<number> {
  const counts = await getHadithCounts();
  const tier = resolveHadithTierParam(tierOrLegacyLevel);
  return tier ? counts[tier] ?? 0 : 0;
}

export async function searchHadiths(query: string, limit = 50): Promise<HadithRow[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const res = await fetch(`/api/hadiths/search?${params.toString()}`);
  if (!res.ok) throw new Error("Could not search hadiths");
  const data = await res.json() as { hadiths: HadithRow[] };
  return data.hadiths;
}

export async function fetchDailyHadith(): Promise<HadithRow | null> {
  const res = await fetch("/api/hadiths/daily");
  if (!res.ok) throw new Error("Could not load daily hadith");
  const data = await res.json() as { hadith: HadithRow | null };
  return data.hadith;
}

export async function fetchHadithQuizPool(difficulty: "easy" | "medium" | "hard"): Promise<HadithRow[]> {
  const params = new URLSearchParams({ difficulty });
  const res = await fetch(`/api/hadiths/quiz?${params.toString()}`);
  if (!res.ok) throw new Error("Could not load hadith quiz");
  const data = await res.json() as { hadiths: HadithRow[] };
  return data.hadiths;
}
