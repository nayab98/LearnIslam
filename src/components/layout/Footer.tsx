"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☪</span>
            <span className="font-semibold text-emerald-600">LearnIslam</span>
            <span className="text-sm text-muted-foreground">— {t("footer_tagline", lang)}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/surahs" className="hover:text-foreground transition-colors">{t("nav_surahs", lang)}</Link>
            <Link href="/quiz" className="hover:text-foreground transition-colors">{t("nav_quiz", lang)}</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">{t("nav_progress", lang)}</Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {t("footer_note", lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}
