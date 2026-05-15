import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const HADITH_DIR = path.join(ROOT, "src", "data", "hadiths");
const DUA_FILE = path.join(ROOT, "src", "lib", "duas.ts");
const WORDS_FILE = path.join(ROOT, "src", "lib", "arabic-words.ts");
const QURAN_TEXT_FILE = path.join(ROOT, "src", "lib", "quran-text.ts");

const ARABIC_LETTERS = /[\u0621-\u064A\u066E-\u06D3\u06FA-\u06FF]/;
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/;
const PRONUNCIATION_MARKS = /[\u0670\u06E4-\u06E6\u06E8\u08D4-\u08FF]/;
const DIRECTIONAL_FORMATTING = /[\u200B-\u200F\u202A-\u202E]/g;

const EXPECTED_MARK_PATTERNS = [
  {
    label: "Allah lafz should usually preserve dagger alif/shadda",
    unmarked: /\bاللَّه\b|\bالله\b/,
    marked: /اللّٰه|اللَّه|اللَّٰه/,
  },
  {
    label: "Ar-Rahman should usually preserve dagger alif",
    unmarked: /الرَّحْمَن|الرحمن/,
    marked: /الرَّحْمٰن|الرَّحْمَٰن/,
  },
  {
    label: "Ilah should usually preserve dagger alif when vocalized",
    unmarked: /إِلَه|اِلَه/,
    marked: /إِلٰه|إِلَٰه|اِلٰه/,
  },
];

const warnings = [];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalizeWhitespace(text) {
  return String(text).replace(DIRECTIONAL_FORMATTING, "").replace(/\s+/g, " ").trim();
}

function addWarning(source, id, message, text) {
  warnings.push({ source, id, message, sample: normalizeWhitespace(text).slice(0, 160) });
}

function checkArabicText(source, id, text, { expectDiacritics = true } = {}) {
  if (!text || !ARABIC_LETTERS.test(text)) return;

  if (expectDiacritics && !ARABIC_DIACRITICS.test(text)) {
    addWarning(source, id, "Arabic text has no visible diacritics", text);
  }

  for (const pattern of EXPECTED_MARK_PATTERNS) {
    if (pattern.unmarked.test(text) && !pattern.marked.test(text)) {
      addWarning(source, id, pattern.label, text);
    }
  }
}

function extractLiteralFromTs(filePath, exportName, openToken = "[", closeToken = "]") {
  const source = read(filePath);
  const markerIndex = source.indexOf(`export const ${exportName}`) === -1
    ? source.indexOf(`const ${exportName}`)
    : source.indexOf(`export const ${exportName}`);
  if (markerIndex === -1) throw new Error(`Could not find ${exportName} in ${filePath}`);

  const bracketStart = source.indexOf(openToken, markerIndex);
  if (bracketStart === -1) throw new Error(`Could not find literal for ${exportName}`);

  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (let i = bracketStart; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      quote = ch;
      continue;
    }

    if (ch === openToken) depth++;
    if (ch === closeToken) depth--;
    if (depth === 0) {
      return vm.runInNewContext(source.slice(bracketStart, i + 1), {});
    }
  }

  throw new Error(`Could not parse ${exportName}`);
}

function checkQuranCleaner() {
  const source = read(QURAN_TEXT_FILE);
  if (source.includes(".replace(UNSUPPORTED_QURAN_SIGNS") || source.includes(".replace(QURAN_SIGNS")) {
    addWarning("src/lib/quran-text.ts", "cleanQuranText", "Quran cleaner appears to strip the broad Quranic sign range", "");
  }

  const sample = "اللّٰهِ وَلَا الضَّاۤلِّيْنَ";
  if (!PRONUNCIATION_MARKS.test(sample)) return;

  const cleaned = normalizeWhitespace(sample);
  if (!PRONUNCIATION_MARKS.test(cleaned)) {
    addWarning("src/lib/quran-text.ts", "sample", "Quran pronunciation marks were stripped from sample text", sample);
  }
}

function checkHadiths() {
  if (!fs.existsSync(HADITH_DIR)) return;
  for (const file of fs.readdirSync(HADITH_DIR).filter((name) => name.endsWith(".json"))) {
    const rows = JSON.parse(read(path.join(HADITH_DIR, file)));
    for (const row of rows) {
      checkArabicText(`src/data/hadiths/${file}`, row.id ?? row.hadith_number ?? "unknown", row.arabic_text);
    }
  }
}

function checkDuas() {
  const duas = extractLiteralFromTs(DUA_FILE, "DUAS");
  for (const dua of duas) {
    checkArabicText("src/lib/duas.ts", dua.id, dua.arabic);
  }
}

function checkVocabulary() {
  const levels = {
    easy: extractLiteralFromTs(WORDS_FILE, "EASY_WORDS"),
    medium: extractLiteralFromTs(WORDS_FILE, "MEDIUM_WORDS"),
    hard: extractLiteralFromTs(WORDS_FILE, "HARD_WORDS"),
  };
  for (const [level, words] of Object.entries(levels)) {
    for (const word of words) {
      checkArabicText("src/lib/arabic-words.ts", `${level}:${word.transliteration ?? "unknown"}`, word.arabic, {
        expectDiacritics: false,
      });
    }
  }
}

checkQuranCleaner();
checkHadiths();
checkDuas();
checkVocabulary();

if (warnings.length === 0) {
  console.log("Arabic text check passed: no suspicious issues found.");
} else {
  console.log(`Arabic text check found ${warnings.length} review warning(s):`);
  for (const warning of warnings.slice(0, 80)) {
    console.log(`- ${warning.source} [${warning.id}]: ${warning.message}`);
    if (warning.sample) console.log(`  ${warning.sample}`);
  }
  if (warnings.length > 80) {
    console.log(`... ${warnings.length - 80} more warning(s) omitted.`);
  }
}

if (process.env.ARABIC_TEXT_CHECK_STRICT === "1" && warnings.length > 0) {
  process.exit(1);
}
