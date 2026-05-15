# Arabic corrections workflow

Use this folder to track reviewed Arabic text corrections for static content.

- Do not algorithmically insert tashkeel, madd, dagger alif, or Quranic marks.
- Prefer source-driven Quran text and preserve marks from the Quran source.
- For hadith, dua, and vocabulary content, make explicit reviewed text edits in the source JSON/TS file.
- Include a source reference, reviewer note, or issue/PR context with each correction.
- Run `npm run check:arabic-text` before opening the PR and review every warning.

