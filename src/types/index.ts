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
