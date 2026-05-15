export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  hindiName: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  translation_hi: string;
  translation_en: string;
  translation_ur: string;
  audio?: string;
  words?: Word[];
}

export interface Word {
  id: number;
  position: number;
  audio_url?: string;
  char_type: string;
  text: string;
  translation: {
    text: string;
    language: string;
  };
  transliteration: {
    text: string;
    language: string;
  };
}

export interface SurahDetail {
  surah: Surah;
  ayahs: Ayah[];
}

export interface UserProgress {
  user_id: string;
  surah_id: number;
  ayah_id: number;
  status: "read" | "memorized";
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface UserProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
}

export interface QuizQuestion {
  surahId: number;
  ayahId: number;
  arabicText: string;
  correctTranslation: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  surahName: string;
}

export interface QuizAttempt {
  user_id: string;
  surah_id: number;
  ayah_id: number;
  is_correct: boolean;
  difficulty: "easy" | "medium" | "hard";
}

export type LearningEventType =
  | "ayah_read"
  | "ayah_memorized"
  | "surah_completed"
  | "quiz_answered"
  | "word_reviewed"
  | "dua_read"
  | "hadith_read"
  | "bookmark_added"
  | "note_added";

export type LearnItemType =
  | "ayah"
  | "surah"
  | "quiz"
  | "word"
  | "dua"
  | "hadith"
  | "note";

export interface LearningEvent {
  id?: string;
  user_id: string;
  event_type: LearningEventType;
  item_type: LearnItemType;
  item_id: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface UserBookmark {
  id?: string;
  user_id?: string;
  item_type: "ayah" | "hadith" | "dua" | "word" | "surah";
  item_id: string;
  title: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface UserNote {
  id: string;
  user_id?: string;
  item_type: "ayah" | "hadith";
  item_id: string;
  text: string;
  author?: string;
  created_at: string;
  updated_at?: string;
}

export interface EarnedBadge {
  id?: string;
  user_id?: string;
  badge_id: string;
  earned_at: string;
}

export interface ReviewItem {
  id?: string;
  user_id?: string;
  item_type: LearnItemType;
  item_id: string;
  title?: string | null;
  next_due_at: string;
  interval_days: number;
  ease: number;
  last_result?: "again" | "hard" | "good" | "easy" | null;
  metadata?: Record<string, unknown>;
  updated_at?: string;
}

export interface LastReadPosition {
  surah_id: number;
  ayah_id: number;
  updated_at: string;
}

export interface ReadingStats {
  readAyahs: number;
  memorizedAyahs: number;
  touchedSurahs: number;
  completedSurahs: number;
  totalAyahs: number;
}

export interface DailyPlanTask {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  progress: number;
  target: number;
}
