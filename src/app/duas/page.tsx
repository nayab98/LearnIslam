"use client";

import { useState, useMemo } from "react";
import { BookHeart, Search } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { DUAS, DUA_CATEGORIES, type Dua } from "@/lib/duas";

export default function DuasPage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

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
          placeholder="Search duas..."
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
              {cat}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Dua count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} duas
      </p>

      {/* Dua cards */}
      <div className="space-y-5">
        {filtered.map((dua) => (
          <div
            key={dua.id}
            className="group rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
          >
            {/* Category + Reference badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {dua.category}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                {dua.reference}
              </span>
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
              No duas found. Try a different search or category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
