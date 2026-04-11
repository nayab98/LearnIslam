"use client";

export interface Comment {
  id: string;
  item_type: "ayah" | "hadith";
  item_id: string;
  text: string;
  author: string;
  created_at: string;
}

const STORAGE_KEY = "learnislam_comments";

function getAllComments(): Comment[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveComments(comments: Comment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}

export function getComments(type: "ayah" | "hadith", itemId: string): Comment[] {
  return getAllComments().filter(
    (c) => c.item_type === type && c.item_id === itemId
  );
}

export function addComment(
  type: "ayah" | "hadith",
  itemId: string,
  text: string,
  author: string = "Guest"
): Comment {
  const comment: Comment = {
    id: crypto.randomUUID(),
    item_type: type,
    item_id: itemId,
    text,
    author,
    created_at: new Date().toISOString(),
  };
  const all = getAllComments();
  all.push(comment);
  saveComments(all);
  return comment;
}

export function deleteComment(id: string): void {
  const all = getAllComments().filter((c) => c.id !== id);
  saveComments(all);
}
