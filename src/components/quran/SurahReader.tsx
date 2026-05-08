"use client";

import { useState, useRef, useEffect } from "react";
import { Surah, Ayah } from "@/types";
import { Play, Pause, Volume2, VolumeX, BookOpen, Check, Bookmark, LogIn, Paintbrush, Heart, MessageCircle, BookOpenText, Loader2, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { getSurahAudioUrl } from "@/lib/quran-api";
import WordByWordAyah from "./WordByWordAyah";
import TajweedText from "./TajweedText";
import { createClient } from "@/lib/supabase/client";
import { getMemorizedAyahNumbers, getReadAyahNumbers, markAyahMemorized, markAyahRead } from "@/lib/user-data";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { addBookmark, getBookmarks, removeBookmark } from "@/lib/bookmarks";
import { addUserComment, deleteUserComment, getCommentsForUser, Comment } from "@/lib/comments";
import { setLastReadPosition } from "@/lib/learning-events";

interface SurahReaderProps {
  surah: Surah;
  ayahs: Ayah[];
}

export default function SurahReader({ surah, ayahs }: SurahReaderProps) {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const [showTranslation, setShowTranslation] = useState(true);
  const [wordByWordMode, setWordByWordMode] = useState(false);
  const [tajweedMode, setTajweedMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const [memorizedAyahs, setMemorizedAyahs] = useState<Set<number>>(new Set());
  const [loginToast, setLoginToast] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedTafsir, setExpandedTafsir] = useState<Set<number>>(new Set());
  const [tafsirMap, setTafsirMap] = useState<Record<string, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      getReadAyahNumbers(userId, surah.number),
      getMemorizedAyahNumbers(userId, surah.number),
    ]).then(([read, memorized]) => {
      setReadAyahs(new Set(read));
      setMemorizedAyahs(new Set(memorized));
    });
  }, [surah.number, userId]);

  useEffect(() => {
    const ayahFromHash = Number(window.location.hash.replace("#ayah-", ""));
    const search = new URLSearchParams(window.location.search);
    const ayahFromQuery = Number(search.get("ayah"));
    const targetAyah = ayahFromHash || ayahFromQuery;
    if (!targetAyah) return;

    setActiveAyah(targetAyah);
    setTimeout(() => {
      document.getElementById(`ayah-${targetAyah}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  }, [surah.number]);

  useEffect(() => {
    getBookmarks(userId).then((bookmarks) => {
      setBookmarkedAyahs(
        new Set(
          bookmarks
            .filter((bookmark) => bookmark.item_type === "ayah")
            .map((bookmark) => bookmark.item_id)
        )
      );
    });
  }, [surah.number, userId]);

  useEffect(() => {
    if (loginToast === null) return;
    const timer = setTimeout(() => setLoginToast(null), 2500);
    return () => clearTimeout(timer);
  }, [loginToast]);

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(getSurahAudioUrl(surah.number));
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.muted = isMuted;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleMarkRead = async (ayahNumber: number) => {
    if (!userId) {
      setLoginToast(ayahNumber);
      await setLastReadPosition(null, { surah_id: surah.number, ayah_id: ayahNumber });
      return;
    }
    await markAyahRead(userId, surah.number, ayahNumber);
    setReadAyahs((prev) => new Set(Array.from(prev).concat(ayahNumber)));
  };

  const handleMarkMemorized = async (ayahNumber: number) => {
    if (!userId) {
      setLoginToast(ayahNumber);
      return;
    }
    await markAyahMemorized(userId, surah.number, ayahNumber);
    setReadAyahs((prev) => new Set(Array.from(prev).concat(ayahNumber)));
    setMemorizedAyahs((prev) => new Set(Array.from(prev).concat(ayahNumber)));
  };

  const handleActivateAyah = async (ayahNumber: number, isActive: boolean) => {
    const next = isActive ? null : ayahNumber;
    setActiveAyah(next);
    if (next) {
      window.history.replaceState(null, "", `#ayah-${next}`);
      await setLastReadPosition(userId, { surah_id: surah.number, ayah_id: next });
    }
  };

  const toggleBookmark = async (ayah: Ayah) => {
    const itemId = `${surah.number}:${ayah.numberInSurah}`;
    if (bookmarkedAyahs.has(itemId)) {
      await removeBookmark(userId, "ayah", itemId);
      setBookmarkedAyahs(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      const title = ayah.translation
        ? ayah.translation.slice(0, 50)
        : ayah.text.slice(0, 50);
      await addBookmark(userId, {
        item_type: "ayah",
        item_id: itemId,
        title,
        href: `/surahs/${surah.number}#ayah-${ayah.numberInSurah}`,
        created_at: new Date().toISOString(),
      });
      setBookmarkedAyahs(prev => new Set(prev).add(itemId));
    }
  };

  const toggleComments = (ayahNum: number) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(ayahNum)) {
        next.delete(ayahNum);
      } else {
        next.add(ayahNum);
        const itemId = `${surah.number}:${ayahNum}`;
        if (!commentsMap[itemId]) {
          getCommentsForUser(userId, "ayah", itemId).then((comments) => {
            setCommentsMap(p => ({ ...p, [itemId]: comments }));
          });
        }
      }
      return next;
    });
  };

  const handleAddComment = (ayahNum: number) => {
    const itemId = `${surah.number}:${ayahNum}`;
    const text = commentInputs[itemId]?.trim();
    if (!text) return;
    addUserComment(userId, "ayah", itemId, text).then((newComment) => {
    setCommentsMap(p => ({ ...p, [itemId]: [...(p[itemId] || []), newComment] }));
    setCommentInputs(p => ({ ...p, [itemId]: "" }));
    });
  };

  const handleDeleteComment = (ayahNum: number, commentId: string) => {
    const itemId = `${surah.number}:${ayahNum}`;
    deleteUserComment(userId, commentId);
    setCommentsMap(p => ({
      ...p,
      [itemId]: (p[itemId] || []).filter(c => c.id !== commentId),
    }));
  };

  const toggleTafsir = async (ayahNum: number) => {
    if (expandedTafsir.has(ayahNum)) {
      setExpandedTafsir(prev => {
        const next = new Set(prev);
        next.delete(ayahNum);
        return next;
      });
      return;
    }

    setExpandedTafsir(prev => new Set(prev).add(ayahNum));

    const key = `${surah.number}:${ayahNum}`;
    if (tafsirMap[key]) return;

    setTafsirLoading(prev => new Set(prev).add(ayahNum));
    try {
      const res = await fetch(
        `https://api.quran.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah/${surah.number}:${ayahNum}`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const text = data?.tafsir?.text || data?.tafsirs?.[0]?.text || "";
      const cleaned = text.replace(/<[^>]*>/g, "");
      setTafsirMap(prev => ({ ...prev, [key]: cleaned || t("tafsir_unavailable", lang) }));
    } catch {
      setTafsirMap(prev => ({ ...prev, [key]: t("tafsir_unavailable", lang) }));
    } finally {
      setTafsirLoading(prev => {
        const next = new Set(prev);
        next.delete(ayahNum);
        return next;
      });
    }
  };

  return (
    <div>
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card border border-border rounded-2xl">
        {/* Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? t("rokein", lang) : t("sunein", lang)}
          </button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl border border-border hover:bg-accent transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Translation toggle */}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            showTranslation
              ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          {showTranslation ? t("tarjuma_hide", lang) : t("tarjuma_show", lang)}
        </button>

        {/* Word by word toggle */}
        <button
          onClick={() => setWordByWordMode(!wordByWordMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            wordByWordMode
              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          ✦ {t("lafz_ba_lafz", lang)}
        </button>

        {/* Tajweed toggle */}
        <button
          onClick={() => setTajweedMode(!tajweedMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            tajweedMode
              ? "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <Paintbrush className="h-4 w-4" />
          Tajweed {tajweedMode ? "OFF" : "ON"}
        </button>
      </div>
      <div className="space-y-6">
        {/* Bismillah — shown as the first card for all surahs except Al-Fatiha (1, has it as Ayah 1) and At-Taubah (9, has none) */}
        {surah.number !== 1 && surah.number !== 9 && (
          <div className="text-center p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/60 to-transparent dark:from-emerald-950/20">
            <p className={`quran-arabic ${arabicFont} text-4xl sm:text-5xl text-emerald-800 dark:text-emerald-200 leading-loose`}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="text-xs text-muted-foreground mt-2">In the name of Allah, the Most Gracious, the Most Merciful</p>
          </div>
        )}
        {ayahs.map((ayah) => {
          const isActive = activeAyah === ayah.numberInSurah;
          const isRead = readAyahs.has(ayah.numberInSurah);
          const tafsirKey = `${surah.number}:${ayah.numberInSurah}`;
          const isTafsirExpanded = expandedTafsir.has(ayah.numberInSurah);
          const isTafsirLoading = tafsirLoading.has(ayah.numberInSurah);
          const itemId = `${surah.number}:${ayah.numberInSurah}`;
          const isCommentsOpen = expandedComments.has(ayah.numberInSurah);
          const comments = commentsMap[itemId] || [];

          return (
            <div
              key={ayah.numberInSurah}
              id={`ayah-${ayah.numberInSurah}`}
              className={`relative group rounded-2xl border transition-all mushaf-page ${
                isActive
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "border-emerald-100 dark:border-emerald-900/40 bg-card hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
              onClick={() => handleActivateAyah(ayah.numberInSurah, isActive)}
            >
              <div className="flex flex-col lg:flex-row">
                {/* ── Left: Arabic text area ── */}
                <div className="flex-1 p-5 sm:p-7">
                  {/* Ayah number row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold shrink-0">
                        {ayah.numberInSurah}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(ayah); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-pink-50 dark:hover:bg-pink-900/20"
                        title="Bookmark"
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            bookmarkedAyahs.has(itemId)
                              ? "fill-pink-500 text-pink-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {isRead && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="h-3 w-3" />
                          {t("padha", lang)}
                        </span>
                      )}
                      {memorizedAyahs.has(ayah.numberInSurah) && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                          <Check className="h-3 w-3" />
                          {t("memorized", lang)}
                        </span>
                      )}
                    </div>

                    <div className="relative flex items-center gap-2">
                      {!isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(ayah.numberInSurah); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30 transition-all"
                        >
                          {userId ? <Bookmark className="h-3 w-3" /> : <LogIn className="h-3 w-3" />}
                          {t("mark_read", lang)}
                        </button>
                      )}
                      {!memorizedAyahs.has(ayah.numberInSurah) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkMemorized(ayah.numberInSurah); }}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30 transition-all"
                        >
                          <Bookmark className="h-3 w-3" />
                          {t("mark_memorized", lang)}
                        </button>
                      )}
                      {loginToast === ayah.numberInSurah && (
                        <div className="absolute right-0 top-full mt-2 z-10 whitespace-nowrap px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-1">
                          {t("login_to_save", lang)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arabic text */}
                  {wordByWordMode ? (
                    <WordByWordAyah
                      surahNumber={surah.number}
                      ayahNumber={ayah.numberInSurah}
                      arabicText={ayah.text}
                    />
                  ) : tajweedMode ? (
                    <TajweedText text={ayah.text} />
                  ) : (
                    <p
                      className={`quran-arabic text-right text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] ${arabicFont} leading-[2.55] text-foreground selection:bg-emerald-200`}
                      dir="rtl"
                    >
                      {ayah.text}
                    </p>
                  )}
                </div>

                {/* ── Right: Tarjuma + Tafsir + Comments ── */}
                <div
                  className="lg:w-80 xl:w-96 lg:border-l border-t lg:border-t-0 border-border p-4 sm:p-5 flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Translation (Tarjuma) */}
                  {showTranslation && ayah.translation_en && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {t("translation_source_en", lang)}
                      </p>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {ayah.translation_en}
                      </p>
                    </div>
                  )}

                  {/* Tafsir */}
                  <div>
                    <button
                      onClick={() => toggleTafsir(ayah.numberInSurah)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all w-full justify-between ${
                        isTafsirExpanded
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-700 dark:text-indigo-300"
                          : "border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpenText className="h-3.5 w-3.5" />
                        {t("tafsir", lang)}
                      </span>
                      {isTafsirExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isTafsirExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs leading-relaxed text-foreground/80">
                        {isTafsirLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t("tafsir_loading", lang)}
                          </div>
                        ) : (
                          <p>{tafsirMap[tafsirKey] || t("tafsir_unavailable", lang)}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-2">{t("tafsir_source", lang)}</p>
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <button
                      onClick={() => toggleComments(ayah.numberInSurah)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-all w-full justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {t("comments", lang)}
                        {comments.length > 0 && (
                          <span className="ml-1 text-[10px] bg-muted px-1.5 rounded-full">{comments.length}</span>
                        )}
                      </span>
                      {isCommentsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isCommentsOpen && (
                      <div className="mt-2 p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        {comments.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">{t("no_comments", lang)}</p>
                        )}
                        {comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-card border border-border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-xs">{c.author}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(c.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/80">{c.text}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(ayah.numberInSurah, c.id)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[itemId] || ""}
                            onChange={(e) => setCommentInputs(p => ({ ...p, [itemId]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(ayah.numberInSurah); }}
                            placeholder={t("write_note", lang)}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleAddComment(ayah.numberInSurah)}
                            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
