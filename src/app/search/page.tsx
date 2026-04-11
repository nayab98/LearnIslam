"use client";

import { useState, useCallback, FormEvent } from "react";
import { Search, Loader2, BookOpen, BookText, BookHeart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { CURATED_HADITHS } from "@/lib/hadiths";
import { DUAS } from "@/lib/duas";

interface QuranMatch {
  number: number;
  text: string;
  surah: { number: number; name: string; englishName: string };
  numberInSurah: number;
  edition: { identifier: string; language: string };
}

interface HadithMatch {
  id: number;
  collection: string;
  hadith_number: number;
  arabic_text: string;
  english_text: string;
}

interface DuaMatch {
  id: number;
  category: string;
  arabic: string;
  transliteration: string;
  meaning_en: string;
}

type Tab = "quran" | "hadith" | "duas";

export default function SearchPage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();

  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("quran");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [quranResults, setQuranResults] = useState<QuranMatch[]>([]);
  const [hadithResults, setHadithResults] = useState<HadithMatch[]>([]);
  const [duaResults, setDuaResults] = useState<DuaMatch[]>([]);

  const handleSearch = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const q = input.trim();
      if (!q) return;

      setQuery(q);
      setSearched(true);
      setLoading(true);
      setQuranResults([]);
      setHadithResults([]);
      setDuaResults([]);

      const lower = q.toLowerCase();

      // Hadith search (local)
      const hadithMatches = CURATED_HADITHS.filter(
        (h) =>
          h.english_text.toLowerCase().includes(lower) ||
          h.arabic_text.includes(q)
      );
      setHadithResults(hadithMatches);

      // Dua search (local)
      const duaMatches = DUAS.filter(
        (d) =>
          d.meaning_en.toLowerCase().includes(lower) ||
          d.transliteration.toLowerCase().includes(lower)
      ).map((d) => ({
        id: d.id,
        category: d.category,
        arabic: d.arabic,
        transliteration: d.transliteration,
        meaning_en: d.meaning_en,
      }));
      setDuaResults(duaMatches);

      // Quran search (API)
      try {
        const editions =
          lang === "hi" ? "hi.farooq" : "en";
        const res = await fetch(
          `https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/${editions}`
        );
        if (res.ok) {
          const data = await res.json();
          const matches: QuranMatch[] = data?.data?.matches ?? [];
          setQuranResults(matches.slice(0, 50));
        }
      } catch {
        // API failure — leave empty
      } finally {
        setLoading(false);
      }
    },
    [input, lang]
  );

  const tabs: { key: Tab; label: string; count: number; icon: typeof BookOpen }[] = [
    { key: "quran", label: "Quran", count: quranResults.length, icon: BookOpen },
    { key: "hadith", label: "Hadith", count: hadithResults.length, icon: BookText },
    { key: "duas", label: "Duas", count: duaResults.length, icon: BookHeart },
  ];

  const snippet = (text: string, max = 180) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold">{t("search_title", lang)}</h1>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("search_placeholder", lang)}
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-shadow"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("search_title", lang)
          )}
        </button>
      </form>

      {/* Tabs */}
      {searched && (
        <>
          <div className="flex gap-2 mb-6 border-b border-border">
            {tabs.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === key
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          )}

          {/* Results */}
          {!loading && (
            <div className="space-y-4">
              {/* Quran tab */}
              {activeTab === "quran" && (
                <>
                  {quranResults.length === 0 ? (
                    <EmptyState query={query} lang={lang} />
                  ) : (
                    quranResults.map((m, i) => (
                      <div
                        key={`${m.number}-${i}`}
                        className="rounded-2xl border border-border bg-card p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            {m.surah.englishName}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                            {m.surah.number}:{m.numberInSurah}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed text-foreground">
                          {snippet(m.text)}
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Hadith tab */}
              {activeTab === "hadith" && (
                <>
                  {hadithResults.length === 0 ? (
                    <EmptyState query={query} lang={lang} />
                  ) : (
                    hadithResults.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-2xl border border-border bg-card p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 capitalize">
                            {h.collection.replace("_", " ")}
                          </span>
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                            #{h.hadith_number}
                          </span>
                        </div>
                        <p
                          className={`${arabicFont} text-xl leading-loose text-right mb-3 text-foreground`}
                          dir="rtl"
                        >
                          {snippet(h.arabic_text, 120)}
                        </p>
                        <div className="border-t border-border my-3" />
                        <p className="text-base leading-relaxed text-foreground">
                          {snippet(h.english_text)}
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Duas tab */}
              {activeTab === "duas" && (
                <>
                  {duaResults.length === 0 ? (
                    <EmptyState query={query} lang={lang} />
                  ) : (
                    duaResults.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-2xl border border-border bg-card p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            {d.category}
                          </span>
                        </div>
                        <p
                          className={`${arabicFont} text-xl leading-loose text-right mb-3 text-foreground`}
                          dir="rtl"
                        >
                          {snippet(d.arabic, 120)}
                        </p>
                        <div className="border-t border-border my-3" />
                        <p className="text-sm italic text-muted-foreground mb-2">
                          {snippet(d.transliteration)}
                        </p>
                        <p className="text-base leading-relaxed text-foreground">
                          {snippet(d.meaning_en)}
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg">
            {t("search_placeholder", lang)}
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ query, lang }: { query: string; lang: "hi" | "hinglish" | "en" }) {
  const message = t("search_empty", lang).replace("{query}", query);
  return (
    <div className="text-center py-16">
      <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}
