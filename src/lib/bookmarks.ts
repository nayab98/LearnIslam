"use client";

export interface Bookmark {
  item_type: "ayah" | "hadith" | "dua";
  item_id: string;
  title: string;
  created_at: string;
}

const STORAGE_KEY = "learnislam_bookmarks";

export function getLocalBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addLocalBookmark(bookmark: Bookmark) {
  const bookmarks = getLocalBookmarks();
  if (!bookmarks.find(b => b.item_id === bookmark.item_id && b.item_type === bookmark.item_type)) {
    bookmarks.push(bookmark);
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
