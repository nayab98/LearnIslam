# LearnIslam ☪

**Interactive Islamic learning platform for Hindi-Urdu speakers — Quran, Hadith, Arabic & more.**

हिंदी-उर्दू बोलने वाले भारतीयों के लिए क़ुरआन सीखने का सबसे आसान तरीका।

## Features

- 📖 **114 Surahs** — Arabic text + Hindi-Urdu translation side by side
- ✦ **Word-by-Word Mode** — Click any Arabic word to see its Hindi-Urdu meaning
- 🎧 **Audio Recitation** — Mishary Alafasy's recitation, play full Surah or individual ayahs
- 🧠 **Quiz System** — Interactive MCQ challenges across 5 categories, 3 difficulty levels (Easy/Medium/Hard)
- 📊 **Progress Dashboard** — Streaks, XP, completed Surahs, quiz accuracy
- 🔐 **Auth** — Sign up / Log in via Supabase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend/DB | Supabase (Postgres + Auth) |
| Quran Data | [Al Quran Cloud API](https://alquran.cloud/api) + [Quran.com API v4](https://api-docs.quran.com) |
| Audio | Islamic Network CDN |

## Getting Started

### 1. Clone & Install

```bash
npm install
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in your Supabase SQL editor
3. Enable Email auth in Authentication settings

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Supabase URL and anon key in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/surahs` | All 114 Surahs with Hindi names |
| `/surahs/[1-114]` | Surah reader with audio + word-by-word |
| `/quiz` | Quiz difficulty picker |
| `/quiz/easy` | Easy quiz (Surahs 108–114) |
| `/quiz/medium` | Medium quiz (Surahs 67–107) |
| `/quiz/hard` | Hard quiz (Surahs 1–66) |
| `/dashboard` | User progress, streaks, XP |
| `/login` | Login |
| `/signup` | Sign up |

## Database Schema

See `supabase-schema.sql` for the complete schema including:
- `profiles` — user info and XP/level
- `progress` — per-ayah read/memorized tracking  
- `quiz_attempts` — quiz history
- `streaks` — daily streak tracking

## Deployment

Deploy to Vercel with one click — all environment variables set in Vercel dashboard.
