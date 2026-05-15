// Hadith Seed Script for LearnIslam
//
// Prerequisites:
// 1. Get sunnah.com API key: Create an issue at https://github.com/sunnah-com/api
// 2. Confirm the source/API terms allow committing generated records to this repo
//
// Usage:
// SUNNAH_API_KEY=your_key node scripts/seed-hadiths.js
//
// This will fetch several thousand authentic hadiths, then publish a balanced
// starter library of 1000 hadiths per learning tier to src/data/hadiths/*.json.

const fs = require("fs");
const path = require("path");

const SUNNAH_API_KEY = process.env.SUNNAH_API_KEY;
const OUTPUT_DIR = process.env.HADITH_OUTPUT_DIR
  ? path.resolve(process.env.HADITH_OUTPUT_DIR)
  : path.join(__dirname, "..", "src", "data", "hadiths");

if (!SUNNAH_API_KEY) {
  console.error(
    "Missing env var. Required: SUNNAH_API_KEY"
  );
  process.exit(1);
}

const SUNNAH_BASE = "https://api.sunnah.com/v1";
const COLLECTIONS = ["bukhari", "muslim", "abudawud", "tirmidhi"];
// Maps sunnah.com collection names to our DB enum values
const COLLECTION_DB_NAME = {
  bukhari: "bukhari",
  muslim: "muslim",
  abudawud: "abu_dawud",
  tirmidhi: "tirmidhi",
};
const MAX_RETRIES = 3;
const REQUEST_DELAY_MS = 200;
const TARGET_PER_TIER = Number(process.env.HADITHS_PER_TIER || 1000);
const LEARNING_TIERS = ["must_know", "good_to_know", "deep_dive"];

const SOURCE_NAME = {
  bukhari: "Sahih Bukhari",
  muslim: "Sahih Muslim",
  abudawud: "Sunan Abu Dawud",
  tirmidhi: "Jami at-Tirmidhi",
};

const MUST_KNOW_KEYWORDS = [
  "faith",
  "belief",
  "iman",
  "islam",
  "intention",
  "prayer",
  "salah",
  "zakat",
  "fast",
  "ramadan",
  "hajj",
  "quran",
  "purification",
  "wudu",
  "ablution",
  "manners",
  "character",
  "truth",
  "honesty",
];

const GOOD_TO_KNOW_KEYWORDS = [
  "charity",
  "dua",
  "supplication",
  "remembrance",
  "dhikr",
  "family",
  "parents",
  "neighbour",
  "neighbor",
  "kindness",
  "mercy",
  "food",
  "drink",
  "travel",
  "sleep",
  "market",
  "business",
  "marriage",
  "illness",
];

const DEEP_DIVE_KEYWORDS = [
  "inheritance",
  "divorce",
  "penalty",
  "punishment",
  "legal",
  "judgement",
  "judgment",
  "sales",
  "loans",
  "mortgage",
  "jihad",
  "expedition",
  "blood money",
  "oaths",
  "vows",
  "manumission",
  "theology",
  "fitan",
  "end times",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "x-api-key": SUNNAH_API_KEY },
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000;
        console.warn(`  Rate limited. Waiting ${wait / 1000}s before retry...`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        throw new Error(
          `Failed after ${retries} attempts for ${url}: ${err.message}`
        );
      }
      const wait = Math.pow(2, attempt) * 500;
      console.warn(
        `  Attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${wait}ms...`
      );
      await sleep(wait);
    }
  }
}

async function fetchBooks(collection) {
  const data = await fetchWithRetry(
    `${SUNNAH_BASE}/collections/${collection}/books`
  );
  return data.data || data;
}

async function fetchHadithsForBook(collection, bookNumber) {
  const hadiths = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${SUNNAH_BASE}/hadiths?collection=${collection}&bookNumber=${bookNumber}&limit=50&page=${page}`;
    const data = await fetchWithRetry(url);
    const items = data.data || [];
    hadiths.push(...items);

    hasMore = items.length === 50;
    if (hasMore) {
      page++;
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return hadiths;
}

function isAuthentic(collection, hadith) {
  if (collection === "bukhari" || collection === "muslim") return true;

  const gradeEntries = hadith.grade || hadith.grades || [];
  const grades = Array.isArray(gradeEntries) ? gradeEntries : [gradeEntries];

  for (const g of grades) {
    const text = (typeof g === "string" ? g : g.grade || "").toLowerCase();
    if (text.includes("sahih") || text.includes("hasan")) return true;
  }
  return false;
}

function extractGrade(collection, hadith) {
  if (collection === "bukhari" || collection === "muslim") return "sahih";

  const gradeEntries = hadith.grade || hadith.grades || [];
  const grades = Array.isArray(gradeEntries) ? gradeEntries : [gradeEntries];

  for (const g of grades) {
    const text = (typeof g === "string" ? g : g.grade || "").toLowerCase();
    if (text.includes("sahih")) return "sahih";
    if (text.includes("hasan")) return "hasan";
  }
  return "hasan";
}

function extractEnglishText(hadith) {
  if (hadith.hadithEnglish) return hadith.hadithEnglish;
  if (hadith.body) return hadith.body;
  if (Array.isArray(hadith.hadith) && hadith.hadith[0]?.body) {
    return hadith.hadith[0].body;
  }
  return "";
}

function extractArabicText(hadith) {
  if (hadith.hadithArabic) return hadith.hadithArabic;
  if (hadith.arabicText) return hadith.arabicText;
  return "";
}

function extractNarrator(hadith) {
  if (hadith.englishNarrator) return hadith.englishNarrator;
  if (hadith.narrator) return hadith.narrator;
  return null;
}

function includesAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function classifyTier(item, index, total) {
  const raw = item.raw;
  const text = [
    item.bookName,
    item.chapterName,
    extractNarrator(raw),
    extractEnglishText(raw),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (includesAny(text, DEEP_DIVE_KEYWORDS)) return "deep_dive";
  if (includesAny(text, MUST_KNOW_KEYWORDS)) return "must_know";
  if (includesAny(text, GOOD_TO_KNOW_KEYWORDS)) return "good_to_know";

  // Keep the full imported library browseable even when source metadata is sparse.
  // Early canonical narrations tend to be foundational, middle books tend to be
  // daily-life breadth, and later specialized books are better treated as deep dives.
  const ratio = total === 0 ? 0 : index / total;
  if (ratio < 0.2) return "must_know";
  if (ratio < 0.75) return "good_to_know";
  return "deep_dive";
}

function difficultyForTier(tier) {
  if (tier === "must_know") return "easy";
  if (tier === "good_to_know") return "medium";
  return "hard";
}

function extractTopic(item) {
  const chapter = item.chapterName || "";
  const book = item.bookName || "";
  const source = chapter || book;
  return source
    .replace(/^chapter\s+\d+[:.\s-]*/i, "")
    .replace(/^book\s+\d+[:.\s-]*/i, "")
    .trim()
    .slice(0, 120) || null;
}

function rowKey(row) {
  return `${row.collection}:${row.hadith_number}`;
}

function selectBalancedStarterRows(rows) {
  const selectedKeys = new Set();
  const selectedByTier = Object.fromEntries(LEARNING_TIERS.map((tier) => [tier, []]));

  for (const tier of LEARNING_TIERS) {
    const directMatches = rows.filter((row) => row.learning_tier === tier);
    for (const row of directMatches) {
      if (selectedByTier[tier].length >= TARGET_PER_TIER) break;
      const key = rowKey(row);
      if (selectedKeys.has(key)) continue;
      selectedKeys.add(key);
      selectedByTier[tier].push({ ...row, published: true });
    }
  }

  for (const tier of LEARNING_TIERS) {
    if (selectedByTier[tier].length >= TARGET_PER_TIER) continue;
    const remaining = rows.filter((row) => !selectedKeys.has(rowKey(row)));

    for (const row of remaining) {
      if (selectedByTier[tier].length >= TARGET_PER_TIER) break;
      const key = rowKey(row);
      selectedKeys.add(key);
      selectedByTier[tier].push({
        ...row,
        learning_tier: tier,
        difficulty: difficultyForTier(tier),
        published: true,
      });
    }
  }

  for (const tier of LEARNING_TIERS) {
    if (selectedByTier[tier].length < TARGET_PER_TIER) {
      console.warn(
        `  Warning: only ${selectedByTier[tier].length}/${TARGET_PER_TIER} hadiths available for ${tier}`
      );
    }
  }

  return LEARNING_TIERS.flatMap((tier) => selectedByTier[tier]);
}

function publishRows(rows) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const rowsWithIds = rows.map((row, index) => ({
    id: index + 1,
    ...row,
    review_status: row.review_status || "source_listed",
  }));

  for (const tier of LEARNING_TIERS) {
    const tierRows = rowsWithIds.filter((row) => row.learning_tier === tier);
    const filePath = path.join(OUTPUT_DIR, `${tier}.json`);
    fs.writeFileSync(filePath, `${JSON.stringify(tierRows, null, 2)}\n`);
    console.log(`  Wrote ${tierRows.length} hadiths to ${filePath}`);
  }
}

async function seedCollection(collection) {
  const dbName = COLLECTION_DB_NAME[collection];
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Fetching ${collection}...`);

  const books = await fetchBooks(collection);
  console.log(`  Found ${books.length} books`);

  const allHadiths = [];

  for (const book of books) {
    const bookNumber = book.bookNumber;
    const bookName = book.book?.[0]?.name || book.bookName || `Book ${bookNumber}`;

    await sleep(REQUEST_DELAY_MS);
    const hadiths = await fetchHadithsForBook(collection, bookNumber);

    const authentic = hadiths.filter((h) => isAuthentic(collection, h));
    allHadiths.push(
      ...authentic.map((h) => ({
        raw: h,
        bookName,
        chapterName: h.chapterTitle || h.chapter?.chapterEnglish || null,
      }))
    );

    console.log(
      `  Fetching ${collection}... ${allHadiths.length} hadiths so far (book ${bookNumber}: ${authentic.length}/${hadiths.length} authentic)`
    );
  }

  console.log(`  Total authentic hadiths for ${collection}: ${allHadiths.length}`);

  const rows = allHadiths.map((item, i) => {
    const learningTier = classifyTier(item, i, allHadiths.length);
    return {
      hadith_number: item.raw.hadithNumber,
      collection: dbName,
      source_name: SOURCE_NAME[collection],
      book_name: item.bookName,
      chapter: item.chapterName,
      arabic_text: extractArabicText(item.raw) || "(no Arabic text)",
      english_text: extractEnglishText(item.raw) || "(no English text)",
      narrator_en: extractNarrator(item.raw),
      grade: extractGrade(collection, item.raw),
      difficulty: difficultyForTier(learningTier),
      learning_tier: learningTier,
      topic: extractTopic(item),
      review_status: "source_listed",
    };
  });

  return rows;
}

async function main() {
  console.log("Hadith Seed Script — LearnIslam");
  console.log("================================");

  const summary = { total: 0, must_know: 0, good_to_know: 0, deep_dive: 0 };
  const collectionCounts = {};
  const importedRows = [];

  for (const collection of COLLECTIONS) {
    try {
      const rows = await seedCollection(collection);
      collectionCounts[collection] = rows.length;
      importedRows.push(...rows);
    } catch (err) {
      console.error(`\nFATAL error seeding ${collection}: ${err.message}`);
      console.error(
        "Continuing with remaining collections...\n"
      );
    }
  }

  const starterRows = selectBalancedStarterRows(importedRows);
  console.log(`\nWriting balanced starter library: ${TARGET_PER_TIER} per tier (${starterRows.length} total)...`);
  publishRows(starterRows);

  for (const r of starterRows) {
    summary.total++;
    summary[r.learning_tier]++;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("SEED COMPLETE");
  console.log(`${"=".repeat(60)}`);
  for (const [col, count] of Object.entries(collectionCounts)) {
    console.log(`  ${col}: ${count} hadiths`);
  }
  console.log(
    `\nTotal inserted: ${summary.total} (Must Know: ${summary.must_know}, Good to Know: ${summary.good_to_know}, Deep Dive: ${summary.deep_dive})`
  );
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
