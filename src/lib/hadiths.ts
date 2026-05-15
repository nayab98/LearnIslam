import {
  HadithDifficulty,
  HadithLearningTier,
  HadithReviewStatus,
  learningTierForDifficulty,
} from "@/lib/hadith-tiers";

export interface Hadith {
  id: number;
  arabic_text: string;
  english_text: string;
  hindi_text?: string | null;
  hinglish_text?: string | null;
  narrator_en: string;
  collection: "bukhari" | "muslim" | "abu_dawud" | "tirmidhi" | string;
  source_name?: string | null;
  book_name?: string | null;
  chapter?: string | null;
  hadith_number: number;
  grade: "sahih" | "hasan" | string;
  difficulty: HadithDifficulty;
  learning_tier?: HadithLearningTier | null;
  review_status?: HadithReviewStatus | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  published?: boolean | null;
  topic: string | null;
}

export function getHadithLearningTier(hadith: {
  difficulty: HadithDifficulty | string;
  learning_tier?: HadithLearningTier | null;
}): HadithLearningTier {
  return hadith.learning_tier ?? learningTierForDifficulty(hadith.difficulty);
}

export function getHadithSourceName(hadith: { source_name?: string | null; collection: string }): string {
  if (hadith.source_name) return hadith.source_name;
  const map: Record<string, string> = {
    bukhari: "Sahih Bukhari",
    muslim: "Sahih Muslim",
    abu_dawud: "Sunan Abu Dawud",
    tirmidhi: "Jami at-Tirmidhi",
  };
  return map[hadith.collection] ?? hadith.collection;
}
