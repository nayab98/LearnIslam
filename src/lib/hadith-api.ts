import { createClient } from "@/lib/supabase/client";

export interface HadithRow {
  id: number;
  hadith_number: number;
  collection: string;
  arabic_text: string;
  english_text: string;
  hindi_text: string | null;
  hinglish_text: string | null;
  narrator_en: string;
  grade: string;
  difficulty: string;
  topic: string;
}

const PAGE_SIZE = 50;

export async function fetchHadithsPage(difficulty: string, page: number) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("hadiths")
    .select("*", { count: "exact" })
    .eq("difficulty", difficulty)
    .range(from, to)
    .order("id", { ascending: true });

  if (error) throw error;
  return { hadiths: (data || []) as HadithRow[], total: count || 0, pageSize: PAGE_SIZE };
}

export async function getHadithCount(difficulty: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("hadiths")
    .select("*", { count: "exact", head: true })
    .eq("difficulty", difficulty);
  return count || 0;
}
