"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getUserProfile,
  getUserStreak,
  getQuizStats,
  getReadSurahIds,
} from "@/lib/user-data";
import { UserProfile, UserStreak } from "@/types";
import { Flame, Trophy, BookOpen, Target, Zap, LogIn, Lock, Award } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { HijriCalendar } from "@/components/layout/HijriCalendar";
import { BADGES, getEarnedBadges } from "@/lib/badges";

interface Stats {
  profile: UserProfile | null;
  streak: UserStreak | null;
  quiz: { total: number; correct: number; accuracy: number };
  readSurahs: number[];
}

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Level {level}</span>
          <span>{xp} / {xpForNextLevel} XP</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const { lang } = useLanguage();

  useEffect(() => {
    setEarnedBadgeIds(getEarnedBadges());
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);

      const [profile, streak, quiz, readSurahs] = await Promise.all([
        getUserProfile(data.user.id),
        getUserStreak(data.user.id),
        getQuizStats(data.user.id),
        getReadSurahIds(data.user.id),
      ]);

      setStats({ profile, streak, quiz, readSurahs });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded-xl w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-secondary rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const profile = stats?.profile ?? null;
  const streak = stats?.streak ?? null;
  const quiz = stats?.quiz ?? { total: 0, correct: 0, accuracy: 0 };
  const readSurahs = stats?.readSurahs ?? [];
  const totalSurahs = 114;
  const surahProgress = Math.round((readSurahs.length / totalSurahs) * 100);

  const statCards = [
    {
      icon: Flame,
      label: t("streak_label", lang),
      value: `${streak?.current_streak || 0}`,
      sub: t("din", lang),
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: BookOpen,
      label: t("nav_surahs", lang),
      value: `${readSurahs.length}`,
      sub: `/ 114 ${t("padhi", lang)}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: Target,
      label: t("quiz_title", lang),
      value: `${quiz.correct}`,
      sub: `/ ${quiz.total} ${t("sahi", lang)}`,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Trophy,
      label: t("sateekta", lang),
      value: `${quiz.accuracy}%`,
      sub: t("quiz_mein", lang),
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Guest banner */}
      {!isLoggedIn && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          <LogIn className="h-4 w-4 shrink-0" />
          <span>{t("login_for_progress", lang)}</span>
          <Link href="/login" className="ml-auto font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0">
            {t("nav_login", lang)} →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          {profile?.name ? `${profile.name} ka Dashboard` : t("dashboard_title", lang)}
        </h1>
        <p className="text-muted-foreground">{t("dashboard_subtitle", lang)}</p>
      </div>

      {/* XP bar */}
      {profile && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-sm">{t("xp_progress", lang)}</span>
            </div>
            <span className="text-sm text-muted-foreground">{profile.xp} XP</span>
          </div>
          <XPBar xp={profile.xp} level={profile.level} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-border`}>
              <Icon className={`h-6 w-6 ${card.color} mb-3`} />
              <div className="text-3xl font-bold mb-0.5">{card.value}</div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{card.label}</span>
                <span> {card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Surah progress bar */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t("surah_progress", lang)}</h3>
          <span className="text-sm font-medium text-emerald-600">{surahProgress}%</span>
        </div>
        <Progress value={surahProgress} className="h-3 mb-3" />
        <p className="text-sm text-muted-foreground">
          {readSurahs.length} {t("nav_surahs", lang)} {t("padhi", lang)} · {totalSurahs - readSurahs.length} {t("baaki", lang)}
        </p>
      </div>

      {/* Streak info */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">{t("streak_label", lang)}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-4xl font-bold text-orange-500">{streak?.current_streak || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">{t("current_streak", lang)} ({t("din", lang)})</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-500">{streak?.longest_streak || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">{t("longest_streak", lang)}</div>
          </div>
        </div>
        {streak?.last_active_date && (
          <p className="text-xs text-muted-foreground mt-3">
            {t("last_active", lang)} {new Date(streak.last_active_date).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {/* Hijri Calendar */}
      <div className="mb-6">
        <HijriCalendar />
      </div>

      {/* Badges / Achievements */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">
              {lang === "hi" ? "बैजेस / उपलब्धियाँ" : lang === "hinglish" ? "Badges / Achievements" : "Badges / Achievements"}
            </h3>
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {earnedBadgeIds.length} / {BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadgeIds.includes(badge.id);
            const name = lang === "hi" ? badge.name_hi : lang === "hinglish" ? badge.name_hinglish : badge.name_en;
            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                  earned
                    ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700"
                    : "border-border bg-muted/40 opacity-50 grayscale"
                }`}
                title={earned ? badge.description_en : badge.condition}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-xs font-semibold leading-tight">{name}</span>
                {!earned && (
                  <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/surahs"
          className="flex items-center gap-4 p-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-colors group"
        >
          <BookOpen className="h-8 w-8 opacity-80" />
          <div>
            <div className="font-semibold">{t("read_surah", lang)}</div>
            <div className="text-sm opacity-80">114 {t("nav_surahs", lang)} {t("available", lang)}</div>
          </div>
        </Link>
        <Link
          href="/quiz"
          className="flex items-center gap-4 p-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors group"
        >
          <Target className="h-8 w-8 opacity-80" />
          <div>
            <div className="font-semibold">{t("take_quiz", lang)}</div>
            <div className="text-sm opacity-80">{t("earn_xp", lang)}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
