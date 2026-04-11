"use client";

import { useArabicFont } from "@/lib/useArabicFont";

const TAJWEED_LEGEND = [
  { name: "Madd", label: "Elongation", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dot: "bg-red-500" },
  { name: "Ghunna", label: "Nasalization", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", dot: "bg-green-500" },
  { name: "Qalqalah", label: "Echo", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dot: "bg-blue-500" },
  { name: "Ikhfa", label: "Hidden", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", dot: "bg-purple-500" },
  { name: "Idgham", label: "Merging", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300", dot: "bg-orange-500" },
];

interface TajweedTextProps {
  text: string;
}

export default function TajweedText({ text }: TajweedTextProps) {
  const arabicFont = useArabicFont();

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
        className={`text-right text-3xl ${arabicFont} leading-[2.2] text-foreground selection:bg-emerald-200`}
      >
        {text}
      </p>

      {/* Note */}
      <p className="text-xs text-muted-foreground italic">
        Full color-coded Tajweed coming soon — use the legend as a reference while reading
      </p>
    </div>
  );
}
