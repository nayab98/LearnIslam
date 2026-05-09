"use client";

import { createClient } from "@/lib/supabase/client";
import { recordLearningEvent } from "@/lib/learning-events";

export interface Bookmark {
  item_type: "ayah" | "hadith" | "dua";
  item_id: string;
  title: string;
  href?: string | null;
  created_at: string;
}

const STORAGE_KEY = "learnislam_bookmarks";
const MIGRATED_KEY = "learnislam_bookmarks_migrated";

export function getBookmarkHref(itemType: string, itemId: string): string {
  if (itemType === "ayah") {
    const [surah, ayah] = itemId.split(":");
    return `/surahs/${surah}#ayah-${ayah}`;
  }
  if (itemType === "dua") return `/duas#dua-${itemId}`;
  if (itemType === "hadith") return `/hadees#hadith-${itemId}`;
  return "/";
}

export function getLocalBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  const bookmarks = stored ? (JSON.parse(stored) as Bookmark[]) : [];
  return bookmarks.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addLocalBookmark(bookmark: Bookmark) {
  const bookmarks = getLocalBookmarks();
  if (!bookmarks.find(b => b.item_id === bookmark.item_id && b.item_type === bookmark.item_type)) {
    bookmarks.push({ ...bookmark, href: bookmark.href || getBookmarkHref(bookmark.item_type, bookmark.item_id) });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
}

export function removeLocalBookmark(item_type: string, item_id: string) {
  const bookmarks = getLocalBookmarks().filter(
    b => !(b.item_type === item_type && b.item_id === item_id)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(item_type: string, item_id: string): boolean {
  return getLocalBookmarks().some(
    b => b.item_type === item_type && b.item_id === item_id
  );
}

export async function migrateLocalBookmarks(userId: string) {
  if (localStorage.getItem(`${MIGRATED_KEY}_${userId}`)) return;
  const local = getLocalBookmarks();
  if (local.length === 0) {
    localStorage.setItem(`${MIGRATED_KEY}_${userId}`, "1");
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("user_bookmarks").upsert(
      local.map((bookmark) => ({
        user_id: userId,
        item_type: bookmark.item_type,
        item_id: bookmark.item_id,
        title: bookmark.title,
        href: bookmark.href || getBookmarkHref(bookmark.item_type, bookmark.item_id),
      })),
      { onConflict: "user_id,item_type,item_id" }
    );
    localStorage.setItem(`${MIGRATED_KEY}_${userId}`, "1");
  } catch {
    // Keep local bookmarks; migration can retry next session.
  }
}

export async function getBookmarks(userId?: string | null): Promise<Bookmark[]> {
  if (userId) {
    await migrateLocalBookmarks(userId);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_bookmarks")
        .select("item_type, item_id, title, href, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) return data as Bookmark[];
    } catch {
      // Fall back to local bookmarks.
    }
  }

  return getLocalBookmarks();
}

export async function addBookmark(userId: string | null, bookmark: Bookmark) {
  const href = bookmark.href || getBookmarkHref(bookmark.item_type, bookmark.item_id);
  const next = { ...bookmark, href };

  if (!userId) {
    addLocalBookmark(next);
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("user_bookmarks").upsert(
      {
        user_id: userId,
        item_type: next.item_type,
        item_id: next.item_id,
        title: next.title,
        href: next.href,
      },
      { onConflict: "user_id,item_type,item_id" }
    );
    await recordLearningEvent({
      userId,
      eventType: "bookmark_added",
      itemType: next.item_type,
      itemId: next.item_id,
      metadata: { title: next.title, href },
    });
  } catch {
    addLocalBookmark(next);
  }
}

export async function removeBookmark(userId: string | null, itemType: string, itemId: string) {
  if (!userId) {
    removeLocalBookmark(itemType, itemId);
    return;
  }

  try {
    const supabase = createClient();
    await supabase
      .from("user_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("item_type", itemType)
      .eq("item_id", itemId);
  } catch {
    removeLocalBookmark(itemType, itemId);
  }
}

export async function isUserBookmarked(userId: string | null, itemType: string, itemId: string): Promise<boolean> {
  if (!userId) return isBookmarked(itemType, itemId);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("item_id")
      .eq("user_id", userId)
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .maybeSingle();
    return !error && Boolean(data);
  } catch {
    return isBookmarked(itemType, itemId);
  }
}
