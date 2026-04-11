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
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { useArabicFont } from "@/lib/useArabicFont";
import { CURATED_HADITHS } from "@/lib/hadiths";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface DailyVerse {
  arabic: string;
  translation: string;
  surahName: string;
  ayahNumber: number;
}

export default function HomePage() {
  const { lang } = useLanguage();
  const arabicFont = useArabicFont();
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  const dayOfYear = getDayOfYear();
  const dailyHadith = CURATED_HADITHS[dayOfYear % CURATED_HADITHS.length];

  useEffect(() => {
    const ayahNumber = (dayOfYear % 6236) + 1;
    const controller = new AbortController();

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}`, { signal: controller.signal }),
      fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/en.asad`, { signal: controller.signal }),
    ])
      .then(async ([arRes, enRes]) => {
        const arData = await arRes.json();
        const enData = await enRes.json();
        if (arData.data && enData.data) {
          setVerse({
            arabic: arData.data.text,
            translation: enData.data.text,
            surahName: arData.data.surah.englishName,
            ayahNumber: arData.data.numberInSurah,
          });
        }
      })
      .catch(() => {})
      .finally(() => setVerseLoading(false));

    return () => controller.abort();
  }, [dayOfYear]);

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

      {/* Daily Verse + Hadith */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            {t("daily_section_title", lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </>
              ) : (
                <p className="text-white/70 text-sm">Could not load verse.</p>
              )}
            </div>

            {/* Today's Hadith */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 sm:p-8 text-white shadow-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                📜 {t("daily_hadith_title", lang)}
              </h3>
              <p className={`text-2xl sm:text-3xl ${arabicFont} leading-loose mb-4 text-right`}>
                {dailyHadith.arabic_text}
              </p>
              <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-3">
                &ldquo;{dailyHadith.english_text}&rdquo;
              </p>
              <p className="text-xs opacity-60">
                — {dailyHadith.narrator_en} | {dailyHadith.collection.charAt(0).toUpperCase() + dailyHadith.collection.slice(1)} #{dailyHadith.hadith_number}
              </p>
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
            <p className="text-5xl font-arabic leading-relaxed mb-6">
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
