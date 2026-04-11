"use client";

import { useState, useRef, useEffect } from "react";
import { Surah, Ayah } from "@/types";
import { Play, Pause, Volume2, VolumeX, BookOpen, Check, Bookmark, LogIn, Paintbrush, Heart, MessageCircle, BookOpenText, Loader2, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { getSurahAudioUrl } from "@/lib/quran-api";
import WordByWordAyah from "./WordByWordAyah";
import TajweedText from "./TajweedText";
import { createClient } from "@/lib/supabase/client";
import { markAyahRead } from "@/lib/user-data";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { addLocalBookmark, removeLocalBookmark, isBookmarked } from "@/lib/bookmarks";
import { getComments, addComment, deleteComment, Comment } from "@/lib/comments";

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
    const ids = new Set<string>();
    ayahs.forEach(ayah => {
      const id = `${surah.number}:${ayah.numberInSurah}`;
      if (isBookmarked("ayah", id)) ids.add(id);
    });
    setBookmarkedAyahs(ids);
  }, [surah.number, ayahs]);

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
      return;
    }
    await markAyahRead(userId, surah.number, ayahNumber);
    setReadAyahs((prev) => new Set(Array.from(prev).concat(ayahNumber)));
  };

  const toggleBookmark = (ayah: Ayah) => {
    const itemId = `${surah.number}:${ayah.numberInSurah}`;
    if (bookmarkedAyahs.has(itemId)) {
      removeLocalBookmark("ayah", itemId);
      setBookmarkedAyahs(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      const title = ayah.translation
        ? ayah.translation.slice(0, 50)
        : ayah.text.slice(0, 50);
      addLocalBookmark({
        item_type: "ayah",
        item_id: itemId,
        title,
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
          setCommentsMap(p => ({ ...p, [itemId]: getComments("ayah", itemId) }));
        }
      }
      return next;
    });
  };

  const handleAddComment = (ayahNum: number) => {
    const itemId = `${surah.number}:${ayahNum}`;
    const text = commentInputs[itemId]?.trim();
    if (!text) return;
    const newComment = addComment("ayah", itemId, text);
    setCommentsMap(p => ({ ...p, [itemId]: [...(p[itemId] || []), newComment] }));
    setCommentInputs(p => ({ ...p, [itemId]: "" }));
  };

  const handleDeleteComment = (ayahNum: number, commentId: string) => {
    const itemId = `${surah.number}:${ayahNum}`;
    deleteComment(commentId);
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
      setTafsirMap(prev => ({ ...prev, [key]: cleaned || "Tafsir not available" }));
    } catch {
      setTafsirMap(prev => ({ ...prev, [key]: "Tafsir not available" }));
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
        {ayahs.map((ayah) => {
          const isActive = activeAyah === ayah.numberInSurah;
          const isRead = readAyahs.has(ayah.numberInSurah);

          return (
            <div
              key={ayah.numberInSurah}
              id={`ayah-${ayah.numberInSurah}`}
              className={`relative group p-6 rounded-2xl border transition-all ${
                isActive
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border bg-card hover:border-emerald-200 dark:hover:border-emerald-800"
              }`}
              onClick={() => setActiveAyah(isActive ? null : ayah.numberInSurah)}
            >
              {/* Ayah number */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                    {ayah.numberInSurah}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(ayah);
                    }}
                    className="p-1.5 rounded-lg transition-colors hover:bg-pink-50 dark:hover:bg-pink-900/20"
                    title="Bookmark"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        bookmarkedAyahs.has(`${surah.number}:${ayah.numberInSurah}`)
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
                </div>

                {!isRead && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(ayah.numberInSurah);
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30 transition-all"
                    >
                      {userId ? (
                        <Bookmark className="h-3 w-3" />
                      ) : (
                        <LogIn className="h-3 w-3" />
                      )}
                      {t("mark_read", lang)}
                    </button>
                    {loginToast === ayah.numberInSurah && (
                      <div className="absolute right-0 top-full mt-2 z-10 whitespace-nowrap px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-1">
                        {t("login_to_save", lang)}
                      </div>
                    )}
                  </div>
                )}
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
                <p className={`text-right text-3xl ${arabicFont} leading-[2.2] text-foreground mb-4 selection:bg-emerald-200`}>
                  {ayah.text}
                </p>
              )}

              {/* Translation */}
              {showTranslation && (ayah.translation_hi || ayah.translation_en) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {lang === "en"
                      ? ayah.translation_en
                      : (ayah.translation_hi || ayah.translation_en)}
                  </p>
                  {lang !== "en" && ayah.translation_en && (
                    <p className="text-sm text-muted-foreground/60 mt-2 italic">
                      {ayah.translation_en}
                    </p>
                  )}
                </div>
              )}

              {/* Tafsir panel */}
              {(() => {
                const tafsirKey = `${surah.number}:${ayah.numberInSurah}`;
                const isExpanded = expandedTafsir.has(ayah.numberInSurah);
                const isLoading = tafsirLoading.has(ayah.numberInSurah);
                return (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleTafsir(ayah.numberInSurah)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30 transition-all"
                    >
                      <BookOpenText className="h-3.5 w-3.5" />
                      Tafsir
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-sm leading-relaxed text-foreground/80">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading tafsir...
                          </div>
                        ) : (
                          <p>{tafsirMap[tafsirKey] || "Tafsir not available"}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Comments section */}
              {(() => {
                const itemId = `${surah.number}:${ayah.numberInSurah}`;
                const isOpen = expandedComments.has(ayah.numberInSurah);
                const comments = commentsMap[itemId] || [];
                return (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleComments(ayah.numberInSurah)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {lang === "hi" ? "टिप्पणियाँ" : lang === "hinglish" ? "Comments" : "Comments"}
                      {comments.length > 0 && (
                        <span className="ml-1 text-[10px] bg-muted px-1.5 rounded-full">{comments.length}</span>
                      )}
                      {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isOpen && (
                      <div className="mt-2 p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        {comments.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">
                            {lang === "hi" ? "कोई टिप्पणी नहीं" : "No comments yet"}
                          </p>
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
                            placeholder={lang === "hi" ? "अपनी टिप्पणी लिखें..." : "Write a note..."}
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
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
