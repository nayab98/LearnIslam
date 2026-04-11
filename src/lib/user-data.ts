import { createClient } from "@/lib/supabase/client";
import { UserProgress, UserStreak, UserProfile } from "@/types";

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
}

export async function markAyahMemorized(userId: string, surahId: number, ayahId: number) {
  const supabase = createClient();
  await supabase.from("progress").upsert(
    { user_id: userId, surah_id: surahId, ayah_id: ayahId, status: "memorized" },
    { onConflict: "user_id,surah_id,ayah_id" }
  );
  await addXP(userId, 20);
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
  }
  await updateStreak(userId);
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

  if (!streak) return;

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
