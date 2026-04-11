import { Surah, SurahDetail, Ayah } from "@/types";

const BASE_URL = "https://api.alquran.cloud/v1";
const QURAN_COM_BASE = "https://api.quran.com/api/v4";

// Hinglish names for all 114 Surahs
const HINDI_NAMES: Record<number, string> = {
  1: "Al-Fatihah (Kholne Wala)",
  2: "Al-Baqarah (Gaay)",
  3: "Aal-e-Imran (Imran ka Khandaan)",
  4: "An-Nisa (Auraten)",
  5: "Al-Ma'idah (Dastarkhaan)",
  6: "Al-An'am (Maaweshi)",
  7: "Al-A'raf (Unche Maqam)",
  8: "Al-Anfal (Maal-e-Ghanimat)",
  9: "At-Taubah (Taubah)",
  10: "Yunus (Yunus)",
  11: "Hud (Hud)",
  12: "Yusuf (Yusuf)",
  13: "Ar-Ra'd (Garaj)",
  14: "Ibrahim (Ibrahim)",
  15: "Al-Hijr (Pathreeli Zameen)",
  16: "An-Nahl (Madhumakkhi)",
  17: "Al-Isra (Raat ki Safar)",
  18: "Al-Kahf (Ghaar)",
  19: "Maryam (Maryam)",
  20: "Ta-Ha (Ta-Ha)",
  21: "Al-Anbiya (Paighambar)",
  22: "Al-Hajj (Hajj)",
  23: "Al-Mu'minun (Momineen)",
  24: "An-Nur (Roshni)",
  25: "Al-Furqan (Furqan)",
  26: "Ash-Shu'ara (Shaayar)",
  27: "An-Naml (Cheenti)",
  28: "Al-Qasas (Kahaniyaan)",
  29: "Al-Ankabut (Makdi)",
  30: "Ar-Rum (Rooman)",
  31: "Luqman (Luqman)",
  32: "As-Sajdah (Sajda)",
  33: "Al-Ahzab (Giroh)",
  34: "Saba (Sheba)",
  35: "Fatir (Paida Karne Wala)",
  36: "Ya-Sin (Ya-Sin)",
  37: "As-Saffat (Saf Baandhe)",
  38: "Sad (Sad)",
  39: "Az-Zumar (Giroh)",
  40: "Ghafir (Maaf Karne Wala)",
  41: "Fussilat (Waazeh)",
  42: "Ash-Shura (Mashwara)",
  43: "Az-Zukhruf (Sone ke Zewar)",
  44: "Ad-Dukhan (Dhuaan)",
  45: "Al-Jathiyah (Ghutne Tekna)",
  46: "Al-Ahqaf (Reet ke Teelay)",
  47: "Muhammad (Muhammad)",
  48: "Al-Fath (Fatah)",
  49: "Al-Hujurat (Kamre)",
  50: "Qaf (Qaf)",
  51: "Az-Zariyat (Bikherney Wali)",
  52: "At-Tur (Pahad)",
  53: "An-Najm (Sitara)",
  54: "Al-Qamar (Chaand)",
  55: "Ar-Rahman (Rehman)",
  56: "Al-Waqi'ah (Waqiya)",
  57: "Al-Hadid (Loha)",
  58: "Al-Mujadila (Behas)",
  59: "Al-Hashr (Jila Watan)",
  60: "Al-Mumtahanah (Imtihaan)",
  61: "As-Saf (Saf)",
  62: "Al-Jumu'ah (Juma)",
  63: "Al-Munafiqun (Munafiq)",
  64: "At-Taghabun (Aapasi Nuqsan)",
  65: "At-Talaq (Talaaq)",
  66: "At-Tahrim (Haram Karna)",
  67: "Al-Mulk (Badshahi)",
  68: "Al-Qalam (Qalam)",
  69: "Al-Haqqah (Haqeeqat)",
  70: "Al-Ma'arij (Chadhne ke Raste)",
  71: "Nuh (Nuh)",
  72: "Al-Jinn (Jinn)",
  73: "Al-Muzzammil (Lipta Hua)",
  74: "Al-Muddaththir (Chaddar Odhe)",
  75: "Al-Qiyamah (Qiyamat)",
  76: "Al-Insan (Insaan)",
  77: "Al-Mursalat (Bheje Hue)",
  78: "An-Naba (Khabar)",
  79: "An-Nazi'at (Kheenchne Wale)",
  80: "Abasa (Bhrikuti Chadhana)",
  81: "At-Takwir (Lapetna)",
  82: "Al-Infitar (Fatna)",
  83: "Al-Mutaffifin (Milawat Karne Wale)",
  84: "Al-Inshiqaq (Cheerna)",
  85: "Al-Buruj (Sitara Mandal)",
  86: "At-Tariq (Raat Ka Aane Wala)",
  87: "Al-A'la (Buland)",
  88: "Al-Ghashiyah (Dhaamp Lene Wali)",
  89: "Al-Fajr (Subah)",
  90: "Al-Balad (Shehar)",
  91: "Ash-Shams (Suraj)",
  92: "Al-Layl (Raat)",
  93: "Ad-Duha (Subah ka Waqt)",
  94: "Ash-Sharh (Rahat)",
  95: "At-Tin (Anjeer)",
  96: "Al-Alaq (Lothdaa)",
  97: "Al-Qadr (Shab-e-Qadr)",
  98: "Al-Bayyinah (Saaf Saboot)",
  99: "Az-Zalzalah (Zilzila)",
  100: "Al-Adiyat (Daudne Wale)",
  101: "Al-Qari'ah (Aafat)",
  102: "At-Takathur (Kasrat)",
  103: "Al-Asr (Waqt)",
  104: "Al-Humazah (Chuglkhor)",
  105: "Al-Fil (Haathi)",
  106: "Quraysh (Quraysh)",
  107: "Al-Ma'un (Choti Madad)",
  108: "Al-Kawthar (Bahutayat)",
  109: "Al-Kafirun (Kafir)",
  110: "An-Nasr (Madad)",
  111: "Al-Masad (Resha)",
  112: "Al-Ikhlas (Tauheed)",
  113: "Al-Falaq (Subah)",
  114: "An-Nas (Insaniyat)",
};

export async function fetchSurahList(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/surah`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Failed to fetch Surah list");
  const data = await res.json();
  return data.data.map((s: Record<string, unknown>) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    hindiName: HINDI_NAMES[s.number as number] || String(s.englishName),
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
}

export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  const [arabicRes, hindiRes, englishRes, audioRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}`, { next: { revalidate: 86400 } }),
    fetch(`${BASE_URL}/surah/${surahNumber}/hi.farooq`, { next: { revalidate: 86400 } }),
    fetch(`${BASE_URL}/surah/${surahNumber}/en.sahih`, { next: { revalidate: 86400 } }),
    fetch(`${BASE_URL}/surah/${surahNumber}/ar.alafasy`, { next: { revalidate: 86400 } }),
  ]);

  if (!arabicRes.ok) throw new Error("Failed to fetch Surah");

  const [arabicData, hindiData, englishData, audioData] = await Promise.all([
    arabicRes.json(),
    hindiRes.ok ? hindiRes.json() : null,
    englishRes.ok ? englishRes.json() : null,
    audioRes.ok ? audioRes.json() : null,
  ]);

  const surahInfo = arabicData.data;
  const hindiAyahs: Record<number, string> = {};
  const englishAyahs: Record<number, string> = {};
  const audioMap: Record<number, string> = {};

  if (hindiData?.data?.ayahs) {
    for (const a of hindiData.data.ayahs) {
      hindiAyahs[a.numberInSurah] = a.text;
    }
  }
  if (englishData?.data?.ayahs) {
    for (const a of englishData.data.ayahs) {
      englishAyahs[a.numberInSurah] = a.text;
    }
  }
  if (audioData?.data?.ayahs) {
    for (const a of audioData.data.ayahs) {
      audioMap[a.numberInSurah] = a.audio;
    }
  }

  const surah: Surah = {
    number: surahInfo.number,
    name: surahInfo.name,
    englishName: surahInfo.englishName,
    englishNameTranslation: surahInfo.englishNameTranslation,
    hindiName: HINDI_NAMES[surahInfo.number] || surahInfo.englishName,
    numberOfAyahs: surahInfo.numberOfAyahs,
    revelationType: surahInfo.revelationType,
  };

  const ayahs: Ayah[] = surahInfo.ayahs.map((a: Record<string, unknown>) => ({
    number: a.number,
    numberInSurah: a.numberInSurah,
    text: a.text,
    translation_hi: hindiAyahs[a.numberInSurah as number] || "",
    translation_en: englishAyahs[a.numberInSurah as number] || "",
    translation: hindiAyahs[a.numberInSurah as number] || englishAyahs[a.numberInSurah as number] || "",
    audio: audioMap[a.numberInSurah as number] || "",
  }));

  return { surah, ayahs };
}

export async function fetchWordByWord(surahNumber: number, ayahNumber: number) {
  try {
    const res = await fetch(
      `${QURAN_COM_BASE}/verses/by_key/${surahNumber}:${ayahNumber}?language=ur&words=true&word_fields=text_uthmani,transliteration,translation`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.verse?.words || null;
  } catch {
    return null;
  }
}

export async function fetchRandomAyahsForQuiz(count = 10): Promise<Ayah[]> {
  const surahIds = Array.from({ length: count }, () => Math.floor(Math.random() * 114) + 1);
  const unique = Array.from(new Set(surahIds));

  const results: Ayah[] = [];
  for (const id of unique) {
    try {
      const { ayahs } = await fetchSurahDetail(id);
      if (ayahs.length > 0) {
        const randomAyah = ayahs[Math.floor(Math.random() * ayahs.length)];
        if (randomAyah.translation) results.push(randomAyah);
      }
    } catch {
      // skip
    }
    if (results.length >= count) break;
  }
  return results;
}

export function getAudioUrl(surahNumber: number, ayahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
    (surahNumber - 1) * 286 + ayahNumber
  }.mp3`;
}

export function getSurahAudioUrl(surahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;
}
