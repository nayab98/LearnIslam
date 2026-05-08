"use client";

import { useState, useEffect } from "react";
import { Heart, X, BookOpen, BookMarked } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { getBookmarkHref, getBookmarks, removeBookmark, Bookmark } from "@/lib/bookmarks";
import { createClient } from "@/lib/supabase/client";

type TabType = "ayah" | "hadith" | "dua";

export default function BookmarksPage() {
  const { lang } = useLanguage();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("ayah");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id || null;
      setUserId(id);
      getBookmarks(id).then(setBookmarks);
    });
  }, []);

  const handleRemove = async (item_type: string, item_id: string) => {
    await removeBookmark(userId, item_type, item_id);
    setBookmarks(await getBookmarks(userId));
  };

  const grouped: Record<TabType, Bookmark[]> = {
    ayah: bookmarks.filter(b => b.item_type === "ayah"),
    hadith: bookmarks.filter(b => b.item_type === "hadith"),
    dua: bookmarks.filter(b => b.item_type === "dua"),
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "ayah", label: t("ayatein", lang) },
    { key: "hadith", label: t("hadees_title", lang) },
    { key: "dua", label: t("duas_title", lang) },
  ];

  const current = grouped[activeTab];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <BookMarked className="h-7 w-7 text-emerald-600" />
          <h1 className="text-3xl font-bold text-foreground">
            {t("bookmarks_title", lang)}
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">
          {t("bookmarks_subtitle", lang)}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                activeTab === tab.key
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
              {grouped[tab.key].length > 0 && (
                <span className="ml-2 text-xs opacity-70">
                  ({grouped[tab.key].length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {current.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg max-w-sm">
              {t("bookmarks_empty", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {current.map(bm => (
              <div
                key={`${bm.item_type}-${bm.item_id}`}
                className="flex items-start justify-between gap-4 p-4 bg-card border border-border rounded-2xl group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
              >
                <Link
                  href={bm.href || getBookmarkHref(bm.item_type, bm.item_id)}
                  className="flex items-start gap-3 min-w-0 flex-1"
                >
                  <BookOpen className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {bm.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bm.item_id}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(bm.item_type, bm.item_id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
