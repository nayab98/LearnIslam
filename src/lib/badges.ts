"use client";

export interface Badge {
  id: string;
  name_hi: string;
  name_hinglish: string;
  name_en: string;
  description_en: string;
  icon: string;
  condition: string;
}

export const BADGES: Badge[] = [
  { id: "first_surah", name_hi: "पहली सूरत", name_hinglish: "Pehli Surah", name_en: "First Surah", description_en: "Read your first complete Surah", icon: "📖", condition: "Read 1 surah" },
  { id: "surah_5", name_hi: "5 सूरतें", name_hinglish: "5 Suraatein", name_en: "5 Surahs", description_en: "Read 5 complete Surahs", icon: "📚", condition: "Read 5 surahs" },
  { id: "juz_30", name_hi: "30वाँ पारा", name_hinglish: "30wa Paara", name_en: "Juz 30", description_en: "Read all Surahs of Juz 30", icon: "🌟", condition: "Complete Juz 30" },
  { id: "quiz_first", name_hi: "पहला क्विज़", name_hinglish: "Pehla Quiz", name_en: "First Quiz", description_en: "Complete your first quiz", icon: "🧠", condition: "Complete 1 quiz" },
  { id: "quiz_master", name_hi: "क्विज़ मास्टर", name_hinglish: "Quiz Master", name_en: "Quiz Master", description_en: "Score 100% in any quiz", icon: "🏆", condition: "Perfect quiz score" },
  { id: "streak_7", name_hi: "7 दिन", name_hinglish: "7 Din Streak", name_en: "7 Day Streak", description_en: "Maintain a 7-day learning streak", icon: "🔥", condition: "7 day streak" },
  { id: "streak_30", name_hi: "30 दिन", name_hinglish: "30 Din Streak", name_en: "30 Day Streak", description_en: "Maintain a 30-day learning streak", icon: "💪", condition: "30 day streak" },
  { id: "hadith_50", name_hi: "50 हदीसें", name_hinglish: "50 Hadeesein", name_en: "50 Hadiths", description_en: "Read 50 hadiths", icon: "📜", condition: "Read 50 hadiths" },
  { id: "word_learner", name_hi: "शब्द सीखने वाला", name_hinglish: "Lafz Seekhne Wala", name_en: "Word Learner", description_en: "Learn 50 Arabic words", icon: "✨", condition: "Complete easy word level" },
  { id: "dua_reader", name_hi: "दुआ पढ़ने वाला", name_hinglish: "Dua Padhne Wala", name_en: "Dua Reader", description_en: "Read all duas in one category", icon: "🤲", condition: "Read all duas in a category" },
];

const STORAGE_KEY = "learnislam_badges";

export function getEarnedBadges(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function earnBadge(id: string): void {
  if (typeof window === "undefined") return;
  const earned = getEarnedBadges();
  if (!earned.includes(id)) {
    earned.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
  }
}

export function hasBadge(id: string): boolean {
  return getEarnedBadges().includes(id);
}
