"use client";

import { createClient } from "@/lib/supabase/client";
import { recordLearningEvent } from "@/lib/learning-events";

export interface Comment {
  id: string;
  item_type: "ayah" | "hadith";
  item_id: string;
  text: string;
  author: string;
  created_at: string;
}

const STORAGE_KEY = "learnislam_comments";
const MIGRATED_KEY = "learnislam_comments_migrated";

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

export async function migrateLocalComments(userId: string) {
  if (localStorage.getItem(`${MIGRATED_KEY}_${userId}`)) return;
  const local = getAllComments();
  if (local.length === 0) {
    localStorage.setItem(`${MIGRATED_KEY}_${userId}`, "1");
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("user_notes").insert(
      local.map((comment) => ({
        user_id: userId,
        item_type: comment.item_type,
        item_id: comment.item_id,
        text: comment.text,
        created_at: comment.created_at,
      }))
    );
    localStorage.setItem(`${MIGRATED_KEY}_${userId}`, "1");
  } catch {
    // Keep local notes; migration can retry next session.
  }
}

export async function getCommentsForUser(
  userId: string | null,
  type: "ayah" | "hadith",
  itemId: string
): Promise<Comment[]> {
  if (userId) {
    await migrateLocalComments(userId);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_notes")
        .select("id, item_type, item_id, text, created_at")
        .eq("user_id", userId)
        .eq("item_type", type)
        .eq("item_id", itemId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((note) => ({
          id: note.id,
          item_type: note.item_type,
          item_id: note.item_id,
          text: note.text,
          author: "You",
          created_at: note.created_at,
        }));
      }
    } catch {
      // Fall back to local comments.
    }
  }

  return getComments(type, itemId);
}

export async function addUserComment(
  userId: string | null,
  type: "ayah" | "hadith",
  itemId: string,
  text: string
): Promise<Comment> {
  if (!userId) return addComment(type, itemId, text);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_notes")
      .insert({ user_id: userId, item_type: type, item_id: itemId, text })
      .select("id, item_type, item_id, text, created_at")
      .single();

    if (error || !data) throw error;

    await recordLearningEvent({
      userId,
      eventType: "note_added",
      itemType: "note",
      itemId,
      metadata: { source_type: type },
    });

    return {
      id: data.id,
      item_type: data.item_type,
      item_id: data.item_id,
      text: data.text,
      author: "You",
      created_at: data.created_at,
    };
  } catch {
    return addComment(type, itemId, text, "You");
  }
}

export async function deleteUserComment(userId: string | null, id: string): Promise<void> {
  if (!userId) {
    deleteComment(id);
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("user_notes").delete().eq("user_id", userId).eq("id", id);
  } catch {
    deleteComment(id);
  }
}
