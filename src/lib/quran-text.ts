export const CANONICAL_BISMILLAH = "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ";

const UNSUPPORTED_QURAN_SIGNS = /[\u06D6-\u06ED\u08D4-\u08FF]/g;
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/g;
const DIRECTIONAL_FORMATTING = /[\u200B-\u200F\u202A-\u202E]/g;
const TATWEEL = /\u0640/g;
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g;

export function cleanQuranText(text: string) {
  return text
    .replace(UNSUPPORTED_QURAN_SIGNS, "")
    .replace(DIRECTIONAL_FORMATTING, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanArabicTextForDisplay(text: string) {
  return text
    .replace(UNSUPPORTED_QURAN_SIGNS, "")
    .replace(DIRECTIONAL_FORMATTING, "")
    .replace(/\s+/g, " ")
    .trim();
}

function arabicSkeleton(text: string) {
  return cleanQuranText(text)
    .replace(TATWEEL, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/\s+/g, "");
}

export function stripLeadingBismillah(text: string) {
  const cleaned = cleanQuranText(text);
  const words = cleaned.split(/\s+/);
  if (words.length < 4) return cleaned;

  const firstFourWords = words.slice(0, 4).join("");
  if (arabicSkeleton(firstFourWords) !== arabicSkeleton(CANONICAL_BISMILLAH)) {
    return cleaned;
  }

  return words.slice(4).join(" ").trim();
}

export function cleanAyahTextForDisplay(text: string, surahNumber: number, ayahNumber: number) {
  const cleaned = cleanQuranText(text);
  if (ayahNumber === 1 && surahNumber !== 1 && surahNumber !== 9) {
    return stripLeadingBismillah(cleaned);
  }
  return cleaned;
}
