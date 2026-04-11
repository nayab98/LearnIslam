"use client";

import { useEffect, useState } from "react";
import { fetchSurahList } from "@/lib/quran-api";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { Surah } from "@/types";
import SurahGrid from "@/components/quran/SurahGrid";

export default function SurahsPage() {
  const { lang } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurahList()
      .then(setSurahs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-96" />
          <div className="flex gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("surahs_title", lang)}</h1>
        <p className="text-muted-foreground">
          {t("surahs_subtitle", lang)}
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { label: t("kul_surahs", lang), value: "114" },
          { label: t("makki", lang), value: String(surahs.filter((s) => s.revelationType === "Meccan").length) },
          { label: t("madani", lang), value: String(surahs.filter((s) => s.revelationType === "Medinan").length) },
          { label: t("kul_ayat", lang), value: "6,236" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl px-5 py-3 flex flex-col"
          >
            <span className="text-2xl font-bold text-emerald-600">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <SurahGrid surahs={surahs} />
    </div>
  );
}
