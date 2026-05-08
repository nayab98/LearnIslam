"use client";

import { useArabicFont } from "@/lib/useArabicFont";

const TAJWEED_LEGEND = [
  { name: "Madd", label: "Stretch", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", dot: "bg-orange-500" },
  { name: "Ghunna", label: "Nasal", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", dot: "bg-green-500" },
  { name: "Qalqalah", label: "Echo", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300", dot: "bg-sky-500" },
  { name: "Ikhfa", label: "Hidden", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300", dot: "bg-teal-500" },
  { name: "Tafkheem", label: "Heavy", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", dot: "bg-indigo-500" },
];

interface TajweedTextProps {
  text: string;
}

const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;
const SUKUN = "\u0652";
const SHADDA = "\u0651";
const TANWEEN = /[\u064B-\u064D]/;
const QALQALAH = new Set(["ق", "ط", "ب", "ج", "د"]);
const TAFKHEEM = new Set(["خ", "ص", "ض", "غ", "ط", "ق", "ظ"]);
const MADD = new Set(["ا", "و", "ي", "ى", "آ"]);
const IKHFA = new Set(["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]);
const IDGHAM = new Set(["ي", "ر", "م", "ل", "و", "ن"]);

function tokenizeArabic(text: string) {
  const tokens: string[] = [];

  for (const char of Array.from(text)) {
    if (ARABIC_MARKS.test(char) && tokens.length > 0) {
      tokens[tokens.length - 1] += char;
    } else {
      tokens.push(char);
    }
  }

  return tokens;
}

function baseLetter(token: string) {
  return Array.from(token).find((char) => !ARABIC_MARKS.test(char)) || token;
}

function tajweedClass(token: string, nextToken?: string) {
  const base = baseLetter(token);
  const nextBase = nextToken ? baseLetter(nextToken) : "";
  const hasSukun = token.includes(SUKUN);
  const hasShadda = token.includes(SHADDA);
  const hasTanween = TANWEEN.test(token);

  if ((base === "ن" || base === "م") && hasShadda) return "tajweed-ghunnah";
  if ((base === "ن" && hasSukun && IKHFA.has(nextBase)) || (hasTanween && IKHFA.has(nextBase))) {
    return "tajweed-ikhfa";
  }
  if ((base === "ن" && hasSukun && IDGHAM.has(nextBase)) || (hasTanween && IDGHAM.has(nextBase))) {
    return "tajweed-idgham";
  }
  if (QALQALAH.has(base) && hasSukun) return "tajweed-qalqalah";
  if (MADD.has(base) || token.includes("\u0670") || base === "آ") return "tajweed-madd";
  if (TAFKHEEM.has(base)) return "tajweed-tafkheem";

  return "";
}

export default function TajweedText({ text }: TajweedTextProps) {
  const arabicFont = useArabicFont();
  const tokens = tokenizeArabic(text);

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {TAJWEED_LEGEND.map((rule) => (
          <span
            key={rule.name}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${rule.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${rule.dot}`} />
            {rule.name}
            <span className="opacity-60">— {rule.label}</span>
          </span>
        ))}
      </div>

      {/* Arabic text */}
      <p
        className={`quran-arabic text-right text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] ${arabicFont} leading-[2.55] text-foreground selection:bg-emerald-200`}
        dir="rtl"
      >
        {tokens.map((token, index) => {
          const className = tajweedClass(token, tokens[index + 1]);
          return className ? (
            <span key={`${token}-${index}`} className={className}>
              {token}
            </span>
          ) : (
            <span key={`${token}-${index}`}>{token}</span>
          );
        })}
      </p>

      {/* Note */}
      <p className="text-xs text-muted-foreground italic">
        Color coding is an on-page guide based on common tajweed markers. Use a qualified teacher for precise recitation rules.
      </p>
    </div>
  );
}
