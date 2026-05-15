"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  BookOpen,
  BookOpenText,
  HelpCircle,
  LayoutDashboard,
  Headphones,
  Star,
  ArrowRight,
  CheckCircle,
  BookmarkCheck,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { fetchDailyHadith, type HadithRow } from "@/lib/hadith-api";
import { fetchDailyVerse, type DailyVerseResult } from "@/lib/quran-api";
import { cleanArabicTextForDisplay } from "@/lib/quran-text";
import { getBookmarks, type Bookmark } from "@/lib/bookmarks";
import { getDueReviewItems, getLastReadPosition, getTodayEventCounts } from "@/lib/learning-events";
import { createClient } from "@/lib/supabase/client";
import { SourceTrust } from "@/components/common/SourceTrust";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const [verse, setVerse] = useState<DailyVerseResult | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [dailyHadith, setDailyHadith] = useState<HadithRow | null>(null);
  const [homeProgress, setHomeProgress] = useState<{
    today: Awaited<ReturnType<typeof getTodayEventCounts>>;
    lastRead: Awaited<ReturnType<typeof getLastReadPosition>>;
    dueReviewCount: number;
    bookmarks: Bookmark[];
  } | null>(null);

  const dayOfYear = getDayOfYear();

  useEffect(() => {
    const ayahNumber = (dayOfYear % 6236) + 1;
    let mounted = true;

    fetchDailyVerse(ayahNumber)
      .then((dailyVerse) => {
        if (mounted) setVerse(dailyVerse);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setVerseLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dayOfYear]);

  useEffect(() => {
    let mounted = true;

    fetchDailyHadith()
      .then((hadith) => {
        if (mounted) setDailyHadith(hadith);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      const [today, lastRead, dueReview, bookmarks] = await Promise.all([
        getTodayEventCounts(id),
        getLastReadPosition(id),
        getDueReviewItems(id, 5),
        getBookmarks(id),
      ]);
      if (mounted) {
        setHomeProgress({
          today,
          lastRead,
          dueReviewCount: dueReview.length,
          bookmarks,
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const features = [
    {
      icon: BookOpen,
      titleKey: "feat_surahs_title",
      descKey: "feat_surahs_desc",
      href: "/surahs",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: Star,
      titleKey: "feat_words_title",
      descKey: "feat_words_desc",
      href: "/lafz-ba-lafz",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      icon: Headphones,
      titleKey: "feat_audio_title",
      descKey: "feat_audio_desc",
      href: "/surahs",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: HelpCircle,
      titleKey: "feat_quiz_title",
      descKey: "feat_quiz_desc",
      href: "/quiz",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: BookOpenText,
      titleKey: "feat_hadees_title",
      descKey: "feat_hadees_desc",
      href: "/hadees",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: LayoutDashboard,
      titleKey: "feat_track_title",
      descKey: "feat_track_desc",
      href: "/dashboard",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
    {
      icon: CheckCircle,
      titleKey: "feat_arabic_title",
      descKey: "feat_arabic_desc",
      href: "/arabic-basics",
      color: "text-teal-600",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
  ];

  const steps = [
    { step: "01", titleKey: "step1_title", descKey: "step1_desc" },
    { step: "02", titleKey: "step2_title", descKey: "step2_desc" },
    { step: "03", titleKey: "step3_title", descKey: "step3_desc" },
    { step: "04", titleKey: "step4_title", descKey: "step4_desc" },
  ];

  const stats = [
    { value: "114", labelKey: "stat_surahs" },
    { value: "6,236", labelKey: "stat_ayat" },
    { value: "30", labelKey: "stat_paare" },
  ];

  const today = homeProgress?.today ?? {
    ayah_read: 0,
    word_reviewed: 0,
    dua_read: 0,
    hadith_read: 0,
    quiz_answered: 0,
  };
  const pathItems = [
    {
      icon: BookmarkCheck,
      title: t("continue_reading", lang),
      desc: homeProgress?.lastRead
        ? `Surah ${homeProgress.lastRead.surah_id}, Ayah ${homeProgress.lastRead.ayah_id}`
        : t("choose_surah_to_begin", lang),
      href: homeProgress?.lastRead
        ? `/surahs/${homeProgress.lastRead.surah_id}#ayah-${homeProgress.lastRead.ayah_id}`
        : "/surahs",
      progress: Math.min(today.ayah_read, 5),
      target: 5,
      color: "text-emerald-600",
    },
    {
      icon: RotateCcw,
      title: t("review_queue", lang),
      desc: `${homeProgress?.dueReviewCount ?? 0} ${t("due_items", lang)}`,
      href: "/lafz-ba-lafz/easy",
      progress: Math.min(today.word_reviewed, 5),
      target: 5,
      color: "text-purple-600",
    },
    {
      icon: ListChecks,
      title: t("daily_plan", lang),
      desc: `${Math.min(today.dua_read, 1) + Math.min(today.hadith_read, 1) + Math.min(today.quiz_answered, 1)} / 3 essentials`,
      href: "/dashboard",
      progress: Math.min(today.dua_read, 1) + Math.min(today.hadith_read, 1) + Math.min(today.quiz_answered, 1),
      target: 3,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/20 dark:via-background dark:to-background">
        <div
          className="absolute inset-0 flex items-center justify-center opacity-[0.04] select-none pointer-events-none"
          aria-hidden
        >
          <span className="text-[300px] leading-none font-arabic">بِسْمِ اللّٰهِ</span>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="text-base">☪</span>
            {t("landing_badge", lang)}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-emerald-600 dark:text-emerald-400">Learn</span>Islam
          </h1>

          <p className="text-4xl sm:text-5xl font-arabic text-emerald-800 dark:text-emerald-300 mb-6 leading-relaxed">
            اقْرَأْ بِاسْمِ رَبِّكَ
          </p>
          <p className="text-lg text-muted-foreground mb-4">
            &ldquo;{t("landing_hero_quote", lang)}&rdquo; — {t("landing_hero_ref", lang)}
          </p>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t("landing_hero_desc", lang)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/surahs"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              <BookOpen className="h-5 w-5" />
              {t("landing_cta_read", lang)}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              {t("landing_cta_quiz", lang)}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t(stat.labelKey, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Verse + Hadith + Quick Links */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Today&apos;s Path
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold">Continue with one clear step</h2>
              </div>
              <Link
                href="/bookmarks"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Saved items ({homeProgress?.bookmarks.length ?? 0})
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pathItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-2xl border border-border bg-card p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-muted p-2">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{item.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {item.progress}/{item.target}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {homeProgress?.bookmarks && homeProgress.bookmarks.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {homeProgress.bookmarks.slice(0, 3).map((bookmark) => (
                  <Link
                    key={`${bookmark.item_type}-${bookmark.item_id}`}
                    href={bookmark.href || "/bookmarks"}
                    className="max-w-full rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="font-medium capitalize">{bookmark.item_type}</span>
                    <span className="mx-1">·</span>
                    <span className="inline-block max-w-[14rem] truncate align-bottom">{bookmark.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {t("daily_section_title", lang)}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Verse + Hadith — take up 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Verse */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 sm:p-8 text-white shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                  📖 {t("daily_verse_title", lang)}
                </h3>
                {verseLoading ? (
                  <p className="text-white/70 text-sm">{t("daily_loading", lang)}</p>
                ) : verse ? (
                  <>
                    <p className={`text-2xl sm:text-3xl ${arabicFont} leading-loose mb-4 text-right`}>
                      {verse.arabic}
                    </p>
                    <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-3">
                      &ldquo;{verse.translation}&rdquo;
                    </p>
                    <p className="text-xs opacity-60">
                      — {verse.surahName}, Ayah {verse.ayahNumber}
                    </p>
                    <SourceTrust
                      compact
                      className="mt-4 [&>span]:border-white/20 [&>span]:bg-white/15 [&>span]:text-white/85 [&_span]:text-white/90"
                      items={[
                        { label: "Arabic", value: verse.source },
                        { label: "Translation", value: "Sahih International" },
                      ]}
                    />
                  </>
                ) : (
                  <p className="text-white/70 text-sm">{t("daily_verse_error", lang)}</p>
                )}
              </div>

              {/* Today's Hadith */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 sm:p-8 text-white shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                  📜 {t("daily_hadith_title", lang)}
                </h3>
                {dailyHadith ? (
                  <>
                    <p className={`text-2xl sm:text-3xl ${arabicFont} leading-loose mb-4 text-right`}>
                      {cleanArabicTextForDisplay(dailyHadith.arabic_text)}
                    </p>
                    <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-3">
                      &ldquo;{dailyHadith.english_text}&rdquo;
                    </p>
                    <p className="text-xs opacity-60">
                      — {dailyHadith.narrator_en} | {dailyHadith.collection.charAt(0).toUpperCase() + dailyHadith.collection.slice(1)} #{dailyHadith.hadith_number}
                    </p>
                    <SourceTrust
                      compact
                      className="mt-4 [&>span]:border-white/20 [&>span]:bg-white/15 [&>span]:text-white/85 [&_span]:text-white/90"
                      items={[
                        {
                          label: "Hadith",
                          value: `${dailyHadith.collection.replace("_", " ")} #${dailyHadith.hadith_number}`,
                        },
                        { label: "Grade", value: dailyHadith.grade.toUpperCase() },
                      ]}
                    />
                  </>
                ) : (
                  <p className="text-white/70 text-sm">{t("quiz_loading", lang)}</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                ⚡ {t("quick_links", lang)}
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { number: 36, arabic: "يٰسٓ", name: "Ya-Sin" },
                  { number: 56, arabic: "الواقعة", name: "Al-Waqi'ah" },
                  { number: 67, arabic: "الملك", name: "Al-Mulk" },
                  { number: 55, arabic: "الرحمن", name: "Ar-Rahman" },
                  { number: 62, arabic: "الجمعة", name: "Al-Jumu'ah" },
                  { number: 18, arabic: "الكهف", name: "Al-Kahf" },
                ].map((surah) => (
                  <Link
                    key={surah.number}
                    href={`/surahs/${surah.number}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                        {surah.number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{surah.name}</p>
                      </div>
                    </div>
                    <span className={`text-lg ${arabicFont} text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400`}>
                      {surah.arabic}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing_features_title", lang)}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("landing_hero_desc", lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.titleKey}
                  href={feature.href}
                  className={`group p-6 rounded-2xl border border-border ${feature.bg} hover:scale-[1.02] transition-transform cursor-pointer`}
                >
                  <div className="inline-flex p-3 rounded-xl bg-white dark:bg-background/50 mb-4 shadow-sm">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    {t(feature.titleKey, lang)}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(feature.descKey, lang)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-emerald-50 dark:bg-emerald-950/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("landing_how_title", lang)}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("landing_how_subtitle", lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-xl mb-4 shadow-lg shadow-emerald-200 dark:shadow-none">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(step.titleKey, lang)}</h3>
                <p className="text-muted-foreground text-sm">{t(step.descKey, lang)}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute mt-7 ml-full">
                    <ArrowRight className="h-5 w-5 text-emerald-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quran verse highlight */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-white">
            <p className={`text-5xl ${arabicFont} leading-relaxed mb-6`}>
              وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ
            </p>
            <p className="text-xl font-medium mb-2 opacity-90">
              &ldquo;{t("verse_text", lang)}&rdquo;
            </p>
            <p className="text-sm opacity-70">— {t("verse_ref", lang)}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-emerald-600 dark:bg-emerald-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t("landing_cta_final", lang)}
          </h2>
          <p className="text-lg opacity-90 mb-10">
            {t("landing_cta_desc", lang)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {t("landing_cta_free", lang)}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/surahs"
              className="inline-flex items-center gap-2 border-2 border-white/60 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {t("landing_cta_peek", lang)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
