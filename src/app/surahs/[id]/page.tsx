"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchSurahDetail } from "@/lib/quran-api";
import { ENABLE_LOCALIZED_LANGUAGES } from "@/lib/feature-flags";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import SurahReader from "@/components/quran/SurahReader";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Surah, Ayah } from "@/types";

export default function SurahDetailPage() {
  const params = useParams();
  const { lang } = useLanguage();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  const surahNumber = parseInt(params.id as string);
  const isValid = !isNaN(surahNumber) && surahNumber >= 1 && surahNumber <= 114;

  useEffect(() => {
    if (!isValid) return;
    setLoading(true);
    fetchSurahDetail(surahNumber)
      .then(({ surah, ayahs }) => {
        setSurah(surah);
        setAyahs(ayahs);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [surahNumber, isValid]);

  if (!isValid) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">{t("error_not_found_title", lang)}</h2>
        <p className="text-muted-foreground">{t("invalid_surah", lang)}</p>
      </div>
    );
  }

  if (loading || !surah) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const prevSurah = surahNumber > 1 ? surahNumber - 1 : null;
  const nextSurah = surahNumber < 114 ? surahNumber + 1 : null;
  const showLocalizedName = ENABLE_LOCALIZED_LANGUAGES && (lang === "hi" || lang === "hinglish");
  const displayName = showLocalizedName ? surah.hindiName : surah.englishName;
  const subtitle = showLocalizedName
    ? surah.englishNameTranslation
    : `${surah.englishNameTranslation} · ${surah.englishName}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/surahs" className="hover:text-foreground transition-colors">
          {t("nav_surahs", lang)}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{displayName}</span>
      </div>

      {/* Surah header */}
      <div className="text-center bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20 rounded-3xl px-6 py-10 mb-8 border border-emerald-100 dark:border-emerald-900/30">
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
          {t("surah", lang)} {surahNumber} · {surah.revelationType === "Meccan" ? t("makki", lang) : t("madani", lang)} ·{" "}
          {surah.numberOfAyahs} {t("ayatein", lang)}
        </p>
        <h1 className="text-5xl quran-arabic text-foreground mb-2 leading-relaxed">{surah.name}</h1>
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
          {displayName}
        </h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* Reader component */}
      <SurahReader surah={surah} ayahs={ayahs} />

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
        {prevSurah ? (
          <Link
            href={`/surahs/${prevSurah}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("surah", lang)} {prevSurah}
          </Link>
        ) : (
          <div />
        )}
        {nextSurah ? (
          <Link
            href={`/surahs/${nextSurah}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-sm font-medium"
          >
            {t("surah", lang)} {nextSurah}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
