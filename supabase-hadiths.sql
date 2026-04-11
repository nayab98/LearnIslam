-- Hadiths table
create table public.hadiths (
  id serial primary key,
  hadith_number integer,
  collection text check (collection in ('bukhari', 'muslim', 'abu_dawud', 'tirmidhi')) not null,
  book_name text,
  chapter text,
  arabic_text text not null,
  english_text text not null,
  narrator_en text,
  grade text check (grade in ('sahih', 'hasan')) not null default 'sahih',
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  topic text,
  hindi_text text,
  hinglish_text text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable RLS but allow public read
alter table public.hadiths enable row level security;
create policy "Anyone can read hadiths" on public.hadiths for select using (true);

-- Unique constraint for upsert support (prevents duplicate hadiths)
alter table public.hadiths add constraint uq_hadiths_collection_number unique (collection, hadith_number);

-- Index for common queries
create index idx_hadiths_difficulty on public.hadiths(difficulty);
create index idx_hadiths_collection on public.hadiths(collection);
