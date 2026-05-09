"use client";

import { createClient } from "@/lib/supabase/client";
import {
  LastReadPosition,
  LearnItemType,
  LearningEventType,
  ReviewItem,
} from "@/types";

const LAST_READ_KEY = "learnislam_last_read";
const LOCAL_BADGES_KEY = "learnislam_badges";
const LOCAL_REVIEW_KEY = "learnislam_review_items";
const LOCAL_EVENTS_KEY = "learnislam_learning_events";

type EventMetadata = Record<string, unknown>;
type LocalLearningEvent = {
  event_type: LearningEventType;
  item_type: LearnItemType;
  item_id: string;
  metadata: EventMetadata;
  created_at: string;
};

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function recordLocalEvent(event: LocalLearningEvent) {
  const events = readJson<LocalLearningEvent[]>(LOCAL_EVENTS_KEY, []);
  writeJson(LOCAL_EVENTS_KEY, [event, ...events].slice(0, 300));
}

function getLocalTodayEventCounts() {
  const fallback = {
    ayah_read: 0,
    word_reviewed: 0,
    dua_read: 0,
    hadith_read: 0,
    quiz_answered: 0,
  };
  const today = todayIsoDate();

  return readJson<LocalLearningEvent[]>(LOCAL_EVENTS_KEY, []).reduce((acc, event) => {
    if (!event.created_at.startsWith(today)) return acc;
    const key = event.event_type as keyof typeof fallback;
    if (key in acc) acc[key] += 1;
    return acc;
  }, { ...fallback });
}

export async function recordLearningEvent(params: {
  userId: string | null;
  eventType: LearningEventType;
  itemType: LearnItemType;
  itemId: string;
  metadata?: EventMetadata;
}) {
  const localEvent: LocalLearningEvent = {
    event_type: params.eventType,
    item_type: params.itemType,
    item_id: params.itemId,
    metadata: params.metadata || {},
    created_at: new Date().toISOString(),
  };
  recordLocalEvent(localEvent);

  if (!params.userId) return;

  try {
    const supabase = createClient();
    await supabase.from("learning_events").insert({
      user_id: params.userId,
      event_type: params.eventType,
      item_type: params.itemType,
      item_id: params.itemId,
      metadata: params.metadata || {},
    });
  } catch {
    // Newer tables may not exist in local/dev Supabase yet; core flows should continue.
  }
}

export async function getTodayEventCounts(userId?: string | null) {
  const fallback = {
    ayah_read: 0,
    word_reviewed: 0,
    dua_read: 0,
    hadith_read: 0,
    quiz_answered: 0,
  };

  if (!userId) return getLocalTodayEventCounts();

  try {
    const supabase = createClient();
    const since = `${todayIsoDate()}T00:00:00.000Z`;
    const { data, error } = await supabase
      .from("learning_events")
      .select("event_type")
      .eq("user_id", userId)
      .gte("created_at", since);

    if (error || !data) return getLocalTodayEventCounts();

    return data.reduce((acc, event) => {
      const key = event.event_type as keyof typeof fallback;
      if (key in acc) acc[key] += 1;
      return acc;
    }, { ...fallback });
  } catch {
    return getLocalTodayEventCounts();
  }
}

export async function setLastReadPosition(
  userId: string | null,
  position: Omit<LastReadPosition, "updated_at">
) {
  const next: LastReadPosition = {
    ...position,
    updated_at: new Date().toISOString(),
  };

  writeJson(LAST_READ_KEY, next);
}

export async function getLastReadPosition(userId?: string | null): Promise<LastReadPosition | null> {
  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("learning_events")
        .select("metadata, item_id, created_at")
        .eq("user_id", userId)
        .eq("event_type", "ayah_read")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const metadata = data.metadata as { last_read?: LastReadPosition } | null;
        if (metadata?.last_read) return metadata.last_read;

        const [surah, ayah] = String(data.item_id).split(":").map(Number);
        if (surah && ayah) {
          return { surah_id: surah, ayah_id: ayah, updated_at: data.created_at };
        }
      }
    } catch {
      // Fall through to local fallback.
    }
  }

  return readJson<LastReadPosition | null>(LAST_READ_KEY, null);
}

export async function getEarnedBadgeIds(userId?: string | null): Promise<string[]> {
  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_earned_badges")
        .select("badge_id")
        .eq("user_id", userId);

      if (!error && data) return data.map((b) => b.badge_id);
    } catch {
      // Fall through to local fallback.
    }
  }

  return readJson<string[]>(LOCAL_BADGES_KEY, []);
}

export async function awardBadge(userId: string | null, badgeId: string) {
  const local = readJson<string[]>(LOCAL_BADGES_KEY, []);
  if (!local.includes(badgeId)) {
    writeJson(LOCAL_BADGES_KEY, [...local, badgeId]);
  }

  if (!userId) return;

  try {
    const supabase = createClient();
    await supabase.from("user_earned_badges").upsert(
      { user_id: userId, badge_id: badgeId },
      { onConflict: "user_id,badge_id" }
    );
  } catch {
    // Local badge fallback already updated.
  }
}

export async function evaluateAndAwardBadges(userId: string) {
  try {
    const supabase = createClient();
    const [{ data: progress }, { data: attempts }, { data: streak }] = await Promise.all([
      supabase.from("progress").select("surah_id, ayah_id, status").eq("user_id", userId),
      supabase.from("quiz_attempts").select("is_correct").eq("user_id", userId),
      supabase.from("streaks").select("current_streak").eq("user_id", userId).maybeSingle(),
    ]);

    const readSurahs = new Set((progress || []).map((p) => p.surah_id));
    const hasQuiz = (attempts || []).length > 0;
    const currentStreak = streak?.current_streak || 0;

    if (readSurahs.size >= 1) await awardBadge(userId, "first_surah");
    if (readSurahs.size >= 5) await awardBadge(userId, "surah_5");
    if (hasQuiz) await awardBadge(userId, "quiz_first");
    if ((attempts || []).length >= 10 && (attempts || []).every((a) => a.is_correct)) {
      await awardBadge(userId, "quiz_master");
    }
    if (currentStreak >= 7) await awardBadge(userId, "streak_7");
    if (currentStreak >= 30) await awardBadge(userId, "streak_30");
  } catch {
    // Badge evaluation is an enhancement; never block the main learning action.
  }
}

export async function upsertReviewItem(params: {
  userId: string | null;
  itemType: LearnItemType;
  itemId: string;
  title?: string;
  result?: "again" | "hard" | "good" | "easy";
  metadata?: EventMetadata;
}) {
  const now = new Date();
  const intervalDays =
    params.result === "easy" ? 4 : params.result === "good" ? 2 : params.result === "hard" ? 1 : 1;
  const nextDue = new Date(now);
  nextDue.setDate(now.getDate() + intervalDays);

  const localItems = readJson<ReviewItem[]>(LOCAL_REVIEW_KEY, []);
  const localNext: ReviewItem = {
    item_type: params.itemType,
    item_id: params.itemId,
    title: params.title,
    next_due_at: nextDue.toISOString(),
    interval_days: intervalDays,
    ease: params.result === "easy" ? 2.8 : params.result === "hard" ? 2.2 : 2.5,
    last_result: params.result || "again",
    metadata: params.metadata || {},
    updated_at: now.toISOString(),
  };
  writeJson(
    LOCAL_REVIEW_KEY,
    [localNext, ...localItems.filter((item) => !(item.item_type === params.itemType && item.item_id === params.itemId))]
  );

  if (!params.userId) return;

  try {
    const supabase = createClient();
    await supabase.from("review_items").upsert(
      {
        user_id: params.userId,
        item_type: params.itemType,
        item_id: params.itemId,
        title: params.title,
        next_due_at: nextDue.toISOString(),
        interval_days: intervalDays,
        ease: localNext.ease,
        last_result: localNext.last_result,
        metadata: params.metadata || {},
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id,item_type,item_id" }
    );
  } catch {
    // Local review fallback already updated.
  }
}

export async function getDueReviewItems(userId?: string | null, limit = 5): Promise<ReviewItem[]> {
  const now = new Date().toISOString();

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("review_items")
        .select("*")
        .eq("user_id", userId)
        .lte("next_due_at", now)
        .order("next_due_at", { ascending: true })
        .limit(limit);

      if (!error && data) return data as ReviewItem[];
    } catch {
      // Fall through to local fallback.
    }
  }

  return readJson<ReviewItem[]>(LOCAL_REVIEW_KEY, [])
    .filter((item) => item.next_due_at <= now)
    .slice(0, limit);
}
