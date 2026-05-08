"use client";

import { useEffect, useState } from "react";
import { Calendar, Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

interface HijriDate {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

const HIJRI_MONTHS: Record<number, string> = {
  1: "Muharram",
  2: "Safar",
  3: "Rabi ul Awal",
  4: "Rabi ul Thani",
  5: "Jumada al Ula",
  6: "Jumada al Thani",
  7: "Rajab",
  8: "Sha'ban",
  9: "Ramadan",
  10: "Shawwal",
  11: "Dhul Qa'dah",
  12: "Dhul Hijjah",
};

interface IslamicEvent {
  name: string;
  day: number;
  month: number;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "Islamic New Year", day: 1, month: 1 },
  { name: "Ashura", day: 10, month: 1 },
  { name: "Mawlid an-Nabi", day: 12, month: 3 },
  { name: "Isra & Mi'raj", day: 27, month: 7 },
  { name: "Shab-e-Barat", day: 15, month: 8 },
  { name: "Ramadan Begins", day: 1, month: 9 },
  { name: "Laylatul Qadr", day: 27, month: 9 },
  { name: "Eid ul Fitr", day: 1, month: 10 },
  { name: "Eid ul Adha", day: 10, month: 12 },
];

function daysUntilEvent(
  event: IslamicEvent,
  currentDay: number,
  currentMonth: number
): number {
  const eventAbsolute = (event.month - 1) * 30 + event.day;
  const currentAbsolute = (currentMonth - 1) * 30 + currentDay;
  const diff = eventAbsolute - currentAbsolute;
  return diff > 0 ? diff : diff + 354;
}

export function HijriCalendar() {
  const { lang } = useLanguage();
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setHijriDate(data.data.hijri);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-secondary rounded w-32 mb-3" />
        <div className="h-8 bg-secondary rounded w-48 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-secondary rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !hijriDate) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">
          {t("hijri_error", lang)}
        </p>
      </div>
    );
  }

  const currentDay = parseInt(hijriDate.day);
  const currentMonth = hijriDate.month.number;

  const upcomingEvents = [...ISLAMIC_EVENTS]
    .map((event) => ({
      ...event,
      daysUntil: daysUntilEvent(event, currentDay, currentMonth),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const nextEvent = upcomingEvents[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-sm">{t("hijri_calendar_title", lang)}</h3>
      </div>

      <div className="text-2xl font-bold mb-1">
        {hijriDate.day} {HIJRI_MONTHS[currentMonth] || hijriDate.month.en}{" "}
        {hijriDate.year} <span className="text-base font-normal text-muted-foreground">AH</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {hijriDate.month.ar}
      </p>

      {nextEvent && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-emerald-600 fill-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {nextEvent.name}
            </span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
            {t("days_short", lang).replace("{count}", String(nextEvent.daysUntil))} ·{" "}
            {nextEvent.day} {HIJRI_MONTHS[nextEvent.month]}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {t("upcoming_events", lang)}
        </p>
        {upcomingEvents.slice(0, 5).map((event) => (
          <div
            key={event.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">{event.name}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {t("days_short", lang).replace("{count}", String(event.daysUntil))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
