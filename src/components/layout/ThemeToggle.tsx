"use client";

import { useLanguage, type Theme } from "@/lib/language-context";
import { Sun, Moon, Monitor } from "lucide-react";

const options: { value: Theme; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`rounded-full p-1.5 text-xs font-medium transition-colors ${
              theme === opt.value
                ? "bg-emerald-600 text-white"
                : "border border-border text-muted-foreground hover:bg-accent"
            }`}
            title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
