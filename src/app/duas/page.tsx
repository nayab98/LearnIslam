"use client";

import { useEffect, useState, useMemo } from "react";
import { BookHeart, Search, Heart, Check } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { DUAS, DUA_CATEGORIES, type Dua } from "@/lib/duas";
import { addBookmark, getBookmarks, removeBookmark } from "@/lib/bookmarks";
import { recordLearningEvent } from "@/lib/learning-events";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_KEYS: Record<string, string> = {
  All: "dua_category_all",
  "Morning & Evening": "dua_category_morning_evening",
  Salah: "dua_category_salah",
  "Food & Drink": "dua_category_food_drink",
  Travel: "dua_category_travel",
  Sleep: "dua_category_sleep",
  Masjid: "dua_category_masjid",
  Protection: "dua_category_protection",
  Forgiveness: "dua_category_forgiveness",
  General: "dua_category_general",
};

export default function DuasPage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkedDuas, setBookmarkedDuas] = useState<Set<string>>(new Set());
  const [readDuas, setReadDuas] = useState<Set<number>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      getBookmarks(id).then((bookmarks) => {
        setBookmarkedDuas(new Set(bookmarks.filter((b) => b.item_type === "dua").map((b) => b.item_id)));
      });
    });
  }, []);

  const filtered = useMemo(() => {
    let list: Dua[] = DUAS;
    if (activeCategory !== "All") {
      list = list.filter((d) => d.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.transliteration.toLowerCase().includes(q) ||
          d.meaning_en.toLowerCase().includes(q) ||
          d.arabic.includes(q) ||
          d.reference.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, search]);

  const meaningForLang = (d: Dua) => {
    if (lang === "hi") return d.meaning_hi;
    if (lang === "hinglish") return d.meaning_hinglish;
    return d.meaning_en;
  };

  const categoryLabel = (category: string) => t(CATEGORY_KEYS[category] || category, lang);

  const toggleBookmark = async (dua: Dua) => {
    const id = String(dua.id);
    if (bookmarkedDuas.has(id)) {
      await removeBookmark(userId, "dua", id);
      setBookmarkedDuas((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    await addBookmark(userId, {
      item_type: "dua",
      item_id: id,
      title: meaningForLang(dua).slice(0, 80),
      href: `/duas#dua-${dua.id}`,
      created_at: new Date().toISOString(),
    });
    setBookmarkedDuas((prev) => new Set(prev).add(id));
  };

  const markRead = async (dua: Dua) => {
    setReadDuas((prev) => new Set(prev).add(dua.id));
    await recordLearningEvent({
      userId,
      eventType: "dua_read",
      itemType: "dua",
      itemId: String(dua.id),
      metadata: { category: dua.category, title: meaningForLang(dua).slice(0, 80) },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <BookHeart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("duas_title", lang)}</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t("duas_subtitle", lang)}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("duas_search_placeholder", lang)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", ...DUA_CATEGORIES].map((cat) => {
          const count =
            cat === "All"
              ? DUAS.length
              : DUAS.filter((d) => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {categoryLabel(cat)}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Dua count */}
      <p className="text-sm text-muted-foreground mb-4">
        {t("duas_count", lang).replace("{count}", String(filtered.length))}
      </p>

      {/* Dua cards */}
      <div className="space-y-5">
        {filtered.map((dua) => (
          <div
            key={dua.id}
            id={`dua-${dua.id}`}
            className="group rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
          >
            {/* Category + Reference badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {categoryLabel(dua.category)}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                {dua.reference}
              </span>
              <button
                onClick={() => toggleBookmark(dua)}
                className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                title={t("bookmark", lang)}
              >
                <Heart className={`h-4 w-4 ${bookmarkedDuas.has(String(dua.id)) ? "fill-pink-500 text-pink-500" : ""}`} />
              </button>
              <button
                onClick={() => markRead(dua)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  readDuas.has(dua.id)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                <Check className="h-3 w-3" />
                {readDuas.has(dua.id) ? t("padha", lang) : t("mark_read", lang)}
              </button>
            </div>

            {/* Arabic */}
            <p
              className={`${arabicFont} text-2xl sm:text-3xl leading-loose text-right mb-4 text-foreground`}
              dir="rtl"
            >
              {dua.arabic}
            </p>

            {/* Transliteration */}
            <p className="text-sm italic text-muted-foreground mb-3 leading-relaxed">
              {dua.transliteration}
            </p>

            {/* Divider */}
            <div className="border-t border-border my-3" />

            {/* Meaning in selected language */}
            <p className="text-base leading-relaxed text-foreground">
              {meaningForLang(dua)}
            </p>

            {/* English fallback for hi/hinglish */}
            {lang !== "en" && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {dua.meaning_en}
              </p>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {t("duas_empty", lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
