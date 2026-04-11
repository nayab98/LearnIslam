// Hadith Seed Script for LearnIslam
//
// Prerequisites:
// 1. Get sunnah.com API key: Create an issue at https://github.com/sunnah-com/api
// 2. Get Supabase service role key from your Supabase dashboard > Settings > API
// 3. Run the supabase-hadiths.sql in your Supabase SQL editor first
//
// Usage:
// SUNNAH_API_KEY=your_key SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-hadiths.js
//
// This will fetch ~6,500 authentic hadiths and insert them into your Supabase database.

const { createClient } = require("@supabase/supabase-js");

const SUNNAH_API_KEY = process.env.SUNNAH_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUNNAH_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Missing env vars. Required: SUNNAH_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SUNNAH_BASE = "https://api.sunnah.com/v1";
const COLLECTIONS = ["bukhari", "muslim", "abudawud", "tirmidhi"];
// Maps sunnah.com collection names to our DB enum values
const COLLECTION_DB_NAME = {
  bukhari: "bukhari",
  muslim: "muslim",
  abudawud: "abu_dawud",
  tirmidhi: "tirmidhi",
};
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const REQUEST_DELAY_MS = 200;

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

function assignDifficulty(index, total) {
  const third = total / 3;
  if (index < third) return "easy";
  if (index < third * 2) return "medium";
  return "hard";
}

async function upsertBatch(rows) {
  const { error } = await supabase.from("hadiths").upsert(rows, {
    onConflict: "collection,hadith_number",
    ignoreDuplicates: true,
  });

  if (error) {
    console.error(`  Supabase upsert error: ${error.message}`);
    throw error;
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

  const rows = allHadiths.map((item, i) => ({
    hadith_number: item.raw.hadithNumber,
    collection: dbName,
    book_name: item.bookName,
    chapter: item.chapterName,
    arabic_text: extractArabicText(item.raw) || "(no Arabic text)",
    english_text: extractEnglishText(item.raw) || "(no English text)",
    narrator_en: extractNarrator(item.raw),
    grade: extractGrade(collection, item.raw),
    difficulty: assignDifficulty(i, allHadiths.length),
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch);
    inserted += batch.length;
    console.log(
      `  Inserted ${inserted}/${rows.length} into Supabase`
    );
  }

  return rows;
}

async function main() {
  console.log("Hadith Seed Script — LearnIslam");
  console.log("================================");

  const summary = { total: 0, easy: 0, medium: 0, hard: 0 };
  const collectionCounts = {};

  for (const collection of COLLECTIONS) {
    try {
      const rows = await seedCollection(collection);
      collectionCounts[collection] = rows.length;
      for (const r of rows) {
        summary.total++;
        summary[r.difficulty]++;
      }
    } catch (err) {
      console.error(`\nFATAL error seeding ${collection}: ${err.message}`);
      console.error(
        "Continuing with remaining collections...\n"
      );
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("SEED COMPLETE");
  console.log(`${"=".repeat(60)}`);
  for (const [col, count] of Object.entries(collectionCounts)) {
    console.log(`  ${col}: ${count} hadiths`);
  }
  console.log(`\nTotal inserted: ${summary.total} (Easy: ${summary.easy}, Medium: ${summary.medium}, Hard: ${summary.hard})`);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
