export type HadithLearningTier = "must_know" | "good_to_know" | "deep_dive";
export type HadithDifficulty = "easy" | "medium" | "hard";
export type HadithReviewStatus = "imported" | "source_listed" | "reviewed" | "published";

export interface HadithTierConfig {
  id: HadithLearningTier;
  slug: string;
  legacyDifficulty: HadithDifficulty;
  label: string;
  shortLabel: string;
  description: string;
}

export const HADITH_TIER_CONFIGS: HadithTierConfig[] = [
  {
    id: "must_know",
    slug: "must-know",
    legacyDifficulty: "easy",
    label: "Must Know",
    shortLabel: "Essential",
    description: "Essential hadiths every learner should know.",
  },
  {
    id: "good_to_know",
    slug: "good-to-know",
    legacyDifficulty: "medium",
    label: "Good to Know",
    shortLabel: "Daily Life",
    description: "Daily life, akhlaq, worship, and common situations.",
  },
  {
    id: "deep_dive",
    slug: "deep-dive",
    legacyDifficulty: "hard",
    label: "Deep Dive",
    shortLabel: "Advanced",
    description: "Fiqh, theology, advanced themes, and longer narrations.",
  },
];

const TIER_BY_ID = new Map(HADITH_TIER_CONFIGS.map((tier) => [tier.id, tier]));
const TIER_BY_PARAM = new Map<string, HadithTierConfig>(
  HADITH_TIER_CONFIGS.flatMap((tier) => [
    [tier.id, tier],
    [tier.slug, tier],
    [tier.legacyDifficulty, tier],
  ])
);
const TIER_BY_DIFFICULTY = new Map(HADITH_TIER_CONFIGS.map((tier) => [tier.legacyDifficulty, tier]));

export function resolveHadithTierParam(param: string): HadithLearningTier | null {
  return TIER_BY_PARAM.get(param)?.id ?? null;
}

export function getHadithTierConfig(tier: HadithLearningTier): HadithTierConfig {
  return TIER_BY_ID.get(tier) ?? HADITH_TIER_CONFIGS[0];
}

export function getHadithTierSlug(tier: HadithLearningTier): string {
  return getHadithTierConfig(tier).slug;
}

export function legacyDifficultyForTier(tier: HadithLearningTier): HadithDifficulty {
  return getHadithTierConfig(tier).legacyDifficulty;
}

export function learningTierForDifficulty(difficulty: HadithDifficulty | string): HadithLearningTier {
  return TIER_BY_DIFFICULTY.get(difficulty as HadithDifficulty)?.id ?? "must_know";
}
