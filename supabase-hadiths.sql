-- Hadiths table
create table public.hadiths (
  id serial primary key,
  hadith_number integer,
  collection text check (collection in ('bukhari', 'muslim', 'abu_dawud', 'tirmidhi')) not null,
  source_name text,
  book_name text,
  chapter text,
  arabic_text text not null,
  english_text text not null,
  narrator_en text,
  grade text check (grade in ('sahih', 'hasan')) not null default 'sahih',
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  learning_tier text check (learning_tier in ('must_know', 'good_to_know', 'deep_dive')) not null default 'must_know',
  topic text,
  review_status text check (review_status in ('imported', 'source_listed', 'reviewed', 'published')) not null default 'source_listed',
  reviewed_by text,
  reviewed_at timestamp with time zone,
  published boolean not null default true,
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
create index idx_hadiths_learning_tier on public.hadiths(learning_tier);
create index idx_hadiths_published_learning_tier on public.hadiths(published, learning_tier);
create index idx_hadiths_collection on public.hadiths(collection);
create index idx_hadiths_topic on public.hadiths(topic);
create index idx_hadiths_review_status on public.hadiths(review_status);

-- Migration-safe updates for existing projects that already created hadiths.
alter table public.hadiths add column if not exists source_name text;
alter table public.hadiths add column if not exists learning_tier text;
alter table public.hadiths add column if not exists review_status text default 'source_listed';
alter table public.hadiths add column if not exists reviewed_by text;
alter table public.hadiths add column if not exists reviewed_at timestamp with time zone;
alter table public.hadiths add column if not exists published boolean not null default true;

update public.hadiths
set learning_tier = case difficulty
  when 'easy' then 'must_know'
  when 'medium' then 'good_to_know'
  when 'hard' then 'deep_dive'
  else 'must_know'
end
where learning_tier is null;

-- Re-tier previously imported large hadith libraries from source metadata.
-- This keeps the old quiz difficulty field as a compatibility mirror, while
-- making learning_tier the primary browsing classification.
update public.hadiths
set learning_tier = case
  when lower(coalesce(book_name, '') || ' ' || coalesce(chapter, '') || ' ' || coalesce(topic, '') || ' ' || coalesce(english_text, '')) ~
    '(inheritance|divorce|penalty|punishment|legal|judgement|judgment|sales|loans|mortgage|jihad|expedition|blood money|oaths|vows|manumission|theology|fitan|end times)'
    then 'deep_dive'
  when lower(coalesce(book_name, '') || ' ' || coalesce(chapter, '') || ' ' || coalesce(topic, '') || ' ' || coalesce(english_text, '')) ~
    '(faith|belief|iman|islam|intention|prayer|salah|zakat|fast|ramadan|hajj|quran|purification|wudu|ablution|manners|character|truth|honesty)'
    then 'must_know'
  when lower(coalesce(book_name, '') || ' ' || coalesce(chapter, '') || ' ' || coalesce(topic, '') || ' ' || coalesce(english_text, '')) ~
    '(charity|dua|supplication|remembrance|dhikr|family|parents|neighbour|neighbor|kindness|mercy|food|drink|travel|sleep|market|business|marriage|illness)'
    then 'good_to_know'
  else learning_tier
end;

update public.hadiths
set difficulty = case learning_tier
  when 'must_know' then 'easy'
  when 'good_to_know' then 'medium'
  when 'deep_dive' then 'hard'
  else difficulty
end;

update public.hadiths
set review_status = 'source_listed'
where review_status is null;
