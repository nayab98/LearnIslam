"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BookOpenText, LayoutDashboard, HelpCircle, LogOut, Menu, X, Type, BookA, Heart, Search, Clock, ScrollText, HandHelping, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const primaryNav = [
  { href: "/surahs", labelKey: "nav_surahs" as const, icon: BookOpen },
  { href: "/hadees", labelKey: "hadees_title" as const, icon: BookOpenText },
  { href: "/duas", labelKey: "duas_title" as const, icon: HandHelping },
  { href: "/quiz", labelKey: "nav_quiz" as const, icon: HelpCircle },
  { href: "/arabic-basics", labelKey: "arabic_title" as const, icon: BookA },
  { href: "/dashboard", labelKey: "nav_progress" as const, icon: LayoutDashboard },
];

const secondaryNav = [
  { href: "/lafz-ba-lafz", labelKey: "lafz_ba_lafz" as const, icon: Type },
  { href: "/seerah", labelKey: "seerah_title" as const, icon: ScrollText },
  { href: "/prayer-times", labelKey: "prayer_title" as const, icon: Clock },
  { href: "/search", labelKey: "search_title" as const, icon: Search },
  { href: "/bookmarks", labelKey: "bookmarks_title" as const, icon: Heart },
];

const allNav = [...primaryNav, ...secondaryNav];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const { lang, script, setScript } = useLanguage();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">☪</span>
            <span className="text-emerald-600 dark:text-emerald-400">Learn</span>
            <span>Islam</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{t(item.labelKey, lang)}</span>
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  secondaryNav.some((item) => pathname.startsWith(item.href))
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <span className="hidden lg:inline">More</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-50 py-1">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t(item.labelKey, lang)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={() => setScript(script === "naskh" ? "indopak" : "naskh")}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-accent transition-colors font-arabic"
            >
              {script === "naskh" ? "Naskh" : "South Asian"}
            </button>
            {user ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav_logout", lang)}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  {t("nav_login", lang)}
                </Link>
                <Link
                  href="/signup"
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {t("nav_start", lang)}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <div className="pb-2 flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={() => setScript(script === "naskh" ? "indopak" : "naskh")}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-accent transition-colors font-arabic"
            >
              {script === "naskh" ? "Naskh" : "South Asian"}
            </button>
          </div>
          {allNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                  active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey, lang)}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border mt-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent w-full"
              >
                <LogOut className="h-4 w-4" />
                {t("nav_logout", lang)}
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md border hover:bg-accent transition-colors"
                >
                  {t("nav_login", lang)}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md font-medium transition-colors"
                >
                  {t("nav_start", lang)}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
