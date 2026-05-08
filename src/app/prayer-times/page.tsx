"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
type PrayerKey = (typeof PRAYER_KEYS)[number];

const PRAYER_TRANSLATION_MAP: Record<PrayerKey, string> = {
  Fajr: "prayer_fajr",
  Sunrise: "prayer_sunrise",
  Dhuhr: "prayer_dhuhr",
  Asr: "prayer_asr",
  Maghrib: "prayer_maghrib",
  Isha: "prayer_isha",
};

const PRAYER_ICONS: Record<PrayerKey, string> = {
  Fajr: "🌙",
  Sunrise: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌃",
};

const METHODS = [
  { id: 1, name: "University of Islamic Sciences, Karachi (Hanafi)" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 11, name: "Qatar" },
  { id: 12, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 13, name: "UOIF, France" },
  { id: 14, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 15, name: "Spiritual Administration of Muslims of Russia" },
];

const METHOD_KEY = "learnislam_prayer_method";
const CITY_KEY = "learnislam_prayer_city";
const COORDS_KEY = "learnislam_prayer_coords";

function parseTime24(timeStr: string): { hours: number; minutes: number } | null {
  const clean = timeStr.replace(/\s*\(.*\)/, "");
  const parts = clean.split(":");
  if (parts.length < 2) return null;
  return { hours: parseInt(parts[0], 10), minutes: parseInt(parts[1], 10) };
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PrayerTimesPage() {
  const { lang } = useLanguage();
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(localStorage.getItem(METHOD_KEY)) || 1;
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityInput, setCityInput] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(CITY_KEY) || "";
  });
  const [locationDenied, setLocationDenied] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [nextPrayer, setNextPrayer] = useState<PrayerKey | null>(null);

  const fetchTimings = useCallback(async (lat: number, lng: number, m: number) => {
    setLoading(true);
    setError("");
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${m}`
      );
      const data = await res.json();
      if (data.code === 200 && data.data?.timings) {
        setTimings(data.data.timings);
      } else {
        setError(t("prayer_error_fetch", lang));
      }
    } catch {
      setError(t("prayer_error_network", lang));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    const savedCoords = localStorage.getItem(COORDS_KEY);
    if (savedCoords) {
      try {
        const c = JSON.parse(savedCoords) as { lat: number; lng: number };
        setCoords(c);
        fetchTimings(c.lat, c.lng, method);
        return;
      } catch {
        localStorage.removeItem(COORDS_KEY);
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          localStorage.setItem(COORDS_KEY, JSON.stringify(c));
          fetchTimings(c.lat, c.lng, method);
        },
        () => {
          setLocationDenied(true);
          setLoading(false);
        }
      );
    } else {
      setLocationDenied(true);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(METHOD_KEY, String(method));
    if (coords) fetchTimings(coords.lat, coords.lng, method);
  }, [method, coords, fetchTimings]);

  // Countdown timer
  useEffect(() => {
    if (!timings) return;

    const findNext = () => {
      const now = new Date();
      const actualPrayers = PRAYER_KEYS.filter((k) => k !== "Sunrise");

      for (const key of actualPrayers) {
        const parsed = parseTime24(timings[key]);
        if (!parsed) continue;
        const prayerDate = new Date();
        prayerDate.setHours(parsed.hours, parsed.minutes, 0, 0);
        if (prayerDate > now) {
          setNextPrayer(key);
          setCountdown(formatCountdown(prayerDate.getTime() - now.getTime()));
          return;
        }
      }
      // All passed — next is tomorrow's Fajr
      setNextPrayer("Fajr");
      const parsed = parseTime24(timings.Fajr);
      if (parsed) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(parsed.hours, parsed.minutes, 0, 0);
        setCountdown(formatCountdown(tomorrow.getTime() - now.getTime()));
      }
    };

    findNext();
    const interval = setInterval(findNext, 1000);
    return () => clearInterval(interval);
  }, [timings]);

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const c = { lat: data.results[0].latitude, lng: data.results[0].longitude };
        setCoords(c);
        localStorage.setItem(COORDS_KEY, JSON.stringify(c));
        localStorage.setItem(CITY_KEY, cityInput.trim());
        setLocationDenied(false);
      } else {
        setError(t("prayer_city_not_found", lang));
        setLoading(false);
      }
    } catch {
      setError(t("prayer_error_city_search", lang));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t("prayer_title", lang)}</h1>
          <p className="text-muted-foreground text-lg">{t("prayer_subtitle", lang)}</p>
        </div>

        {/* Next Prayer Countdown */}
        {nextPrayer && timings && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center shadow-lg">
            <p className="text-sm uppercase tracking-wider opacity-80 mb-1">{t("prayer_next", lang)}</p>
            <p className="text-3xl font-bold mb-1">
              {PRAYER_ICONS[nextPrayer]} {t(PRAYER_TRANSLATION_MAP[nextPrayer], lang)}
            </p>
            <p className="text-4xl font-mono font-bold tracking-wider">{countdown}</p>
            <p className="text-xs opacity-70 mt-1">{t("prayer_countdown", lang)}</p>
          </div>
        )}

        {/* City input if location denied */}
        {locationDenied && !timings && (
          <div className="mb-8 rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-3">{t("prayer_enter_city", lang)}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                placeholder={t("prayer_city_placeholder", lang)}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleCitySearch}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                {t("prayer_search", lang)}
              </button>
            </div>
          </div>
        )}

        {/* Method Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t("prayer_method", lang)}</label>
          <select
            value={method}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            {t("prayer_pref_saved", lang)}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-3">{t("prayer_detecting", lang)}</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-center text-red-500 text-sm mb-6">{error}</p>}

        {/* Prayer Time Cards */}
        {timings && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PRAYER_KEYS.map((key) => {
              const isNext = key === nextPrayer;
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-5 text-center transition-all ${
                    isNext
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-lg scale-105"
                      : "border-border bg-card hover:shadow-md"
                  }`}
                >
                  <div className="text-2xl mb-2">{PRAYER_ICONS[key]}</div>
                  <p className={`text-sm font-medium mb-1 ${isNext ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {t(PRAYER_TRANSLATION_MAP[key], lang)}
                  </p>
                  <p className={`text-2xl font-bold font-mono ${isNext ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                    {timings[key]?.replace(/\s*\(.*\)/, "")}
                  </p>
                  {isNext && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-medium">
                      {t("prayer_next", lang)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
