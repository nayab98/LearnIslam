import { createClient } from "@/lib/supabase/client";
import { UserProgress, UserStreak, UserProfile, ReadingStats } from "@/types";
import {
  evaluateAndAwardBadges,
  recordLearningEvent,
  setLastReadPosition,
  upsertReviewItem,
} from "@/lib/learning-events";

export const SURAH_AYAH_COUNTS: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6,
};

const TOTAL_QURAN_AYAHS = 6236;

function stableNumber(input: string): number {
  return Array.from(input).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId);
  return data || [];
}

export async function markAyahRead(userId: string, surahId: number, ayahId: number) {
  const supabase = createClient();
  await supabase.from("progress").upsert(
    { user_id: userId, surah_id: surahId, ayah_id: ayahId, status: "read" },
    { onConflict: "user_id,surah_id,ayah_id" }
  );
  await updateStreak(userId);
  await addXP(userId, 5);
  await setLastReadPosition(userId, { surah_id: surahId, ayah_id: ayahId });
  await recordLearningEvent({
    userId,
    eventType: "ayah_read",
    itemType: "ayah",
    itemId: `${surahId}:${ayahId}`,
    metadata: { surah_id: surahId, ayah_id: ayahId },
  });
  await maybeRecordSurahCompletion(userId, surahId);
  await evaluateAndAwardBadges(userId);
}

export async function markAyahMemorized(userId: string, surahId: number, ayahId: number) {
  const supabase = createClient();
  await supabase.from("progress").upsert(
    { user_id: userId, surah_id: surahId, ayah_id: ayahId, status: "memorized" },
    { onConflict: "user_id,surah_id,ayah_id" }
  );
  await addXP(userId, 20);
  await recordLearningEvent({
    userId,
    eventType: "ayah_memorized",
    itemType: "ayah",
    itemId: `${surahId}:${ayahId}`,
    metadata: { surah_id: surahId, ayah_id: ayahId },
  });
  await upsertReviewItem({
    userId,
    itemType: "ayah",
    itemId: `${surahId}:${ayahId}`,
    title: `Surah ${surahId}, Ayah ${ayahId}`,
    result: "good",
  });
  await evaluateAndAwardBadges(userId);
}

export async function saveQuizAttempt(
  userId: string,
  surahId: number,
  ayahId: number,
  isCorrect: boolean,
  difficulty: "easy" | "medium" | "hard"
) {
  const supabase = createClient();
  await supabase.from("quiz_attempts").insert({
    user_id: userId,
    surah_id: surahId,
    ayah_id: ayahId,
    is_correct: isCorrect,
    difficulty,
  });
  if (isCorrect) {
    const xp = difficulty === "hard" ? 30 : difficulty === "medium" ? 20 : 10;
    await addXP(userId, xp);
  } else {
    await upsertReviewItem({
      userId,
      itemType: "ayah",
      itemId: `${surahId}:${ayahId}`,
      title: `Quiz review: Surah ${surahId}, Ayah ${ayahId}`,
      result: "again",
      metadata: { difficulty },
    });
  }
  await updateStreak(userId);
  await recordLearningEvent({
    userId,
    eventType: "quiz_answered",
    itemType: "quiz",
    itemId: `ayah-meaning:${surahId}:${ayahId}`,
    metadata: { category: "ayah-meaning", surah_id: surahId, ayah_id: ayahId, difficulty, is_correct: isCorrect },
  });
  await evaluateAndAwardBadges(userId);
}

export async function saveGenericQuizAttempt(
  userId: string,
  category: string,
  itemId: string,
  isCorrect: boolean,
  difficulty: "easy" | "medium" | "hard",
  title?: string
) {
  const supabase = createClient();
  const numericId = Math.abs(stableNumber(`${category}:${itemId}`));

  try {
    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      surah_id: 0,
      ayah_id: numericId,
      is_correct: isCorrect,
      difficulty,
    });
  } catch {
    // Older schemas should not block local review/event behavior.
  }

  if (isCorrect) {
    const xp = difficulty === "hard" ? 30 : difficulty === "medium" ? 20 : 10;
    await addXP(userId, xp);
  } else {
    await upsertReviewItem({
      userId,
      itemType: "quiz",
      itemId: `${category}:${itemId}`,
      title: title || `${category} review`,
      result: "again",
      metadata: { difficulty, category },
    });
  }

  await updateStreak(userId);
  await recordLearningEvent({
    userId,
    eventType: "quiz_answered",
    itemType: "quiz",
    itemId: `${category}:${itemId}`,
    metadata: { category, difficulty, is_correct: isCorrect, title },
  });
  await evaluateAndAwardBadges(userId);
}

export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  const supabase = createClient();
  const { data } = await supabase.from("streaks").select("*").eq("user_id", userId).single();
  return data;
}

async function updateStreak(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: streak } = await supabase.from("streaks").select("*").eq("user_id", userId).single();

  if (!streak) {
    await supabase.from("streaks").upsert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  const lastActive = streak.last_active_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = streak.current_streak;
  if (lastActive === today) return;
  if (lastActive === yesterdayStr) {
    newStreak = streak.current_streak + 1;
  } else {
    newStreak = 1;
  }

  await supabase.from("streaks").update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, streak.longest_streak),
    last_active_date: today,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
}

async function addXP(userId: string, amount: number) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (!profile) return;
  const newXP = profile.xp + amount;
  const newLevel = Math.floor(newXP / 500) + 1;

  await supabase.from("profiles").update({ xp: newXP, level: newLevel }).eq("id", userId);
}

export async function getQuizStats(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("is_correct, difficulty")
    .eq("user_id", userId);

  if (!data) return { total: 0, correct: 0, accuracy: 0 };
  const total = data.length;
  const correct = data.filter((a) => a.is_correct).length;
  return { total, correct, accuracy: total ? Math.round((correct / total) * 100) : 0 };
}

export async function getReadSurahIds(userId: string): Promise<number[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("progress")
    .select("surah_id")
    .eq("user_id", userId);
  if (!data) return [];
  return Array.from(new Set(data.map((p) => p.surah_id)));
}

export async function getReadAyahNumbers(userId: string, surahId: number): Promise<number[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("progress")
    .select("ayah_id")
    .eq("user_id", userId)
    .eq("surah_id", surahId)
    .in("status", ["read", "memorized"]);
  return data?.map((p) => p.ayah_id) || [];
}

export async function getMemorizedAyahNumbers(userId: string, surahId: number): Promise<number[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("progress")
    .select("ayah_id")
    .eq("user_id", userId)
    .eq("surah_id", surahId)
    .eq("status", "memorized");
  return data?.map((p) => p.ayah_id) || [];
}

export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const supabase = createClient();
  const { data } = await supabase
    .from("progress")
    .select("surah_id, ayah_id, status")
    .eq("user_id", userId);

  const progress = data || [];
  const bySurah = new Map<number, Set<number>>();
  let memorizedAyahs = 0;

  for (const row of progress) {
    if (!bySurah.has(row.surah_id)) bySurah.set(row.surah_id, new Set());
    bySurah.get(row.surah_id)?.add(row.ayah_id);
    if (row.status === "memorized") memorizedAyahs += 1;
  }

  let completedSurahs = 0;
  bySurah.forEach((ayahs, surahId) => {
    if (ayahs.size >= (SURAH_AYAH_COUNTS[surahId] || Infinity)) completedSurahs += 1;
  });

  return {
    readAyahs: Array.from(bySurah.values()).reduce((sum, ayahs) => sum + ayahs.size, 0),
    memorizedAyahs,
    touchedSurahs: bySurah.size,
    completedSurahs,
    totalAyahs: TOTAL_QURAN_AYAHS,
  };
}

async function maybeRecordSurahCompletion(userId: string, surahId: number) {
  const readAyahs = await getReadAyahNumbers(userId, surahId);
  if (readAyahs.length >= (SURAH_AYAH_COUNTS[surahId] || Infinity)) {
    await recordLearningEvent({
      userId,
      eventType: "surah_completed",
      itemType: "surah",
      itemId: String(surahId),
      metadata: { surah_id: surahId },
    });
  }
}
