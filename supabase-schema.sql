-- LearnQuran Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Progress table: tracks which ayaat a user has read/memorized
create table public.progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  surah_id integer not null,
  ayah_id integer not null,
  status text check (status in ('read', 'memorized')) default 'read',
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, surah_id, ayah_id)
);

-- Quiz attempts table
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  surah_id integer not null,
  ayah_id integer not null,
  is_correct boolean not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'easy',
  attempted_at timestamp with time zone default timezone('utc', now())
);

-- Streaks table
create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Learning events: append-only activity log used to power daily plans, badges, and review
create table if not exists public.learning_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null,
  item_type text not null,
  item_id text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Cloud-backed bookmarks. Guests still use localStorage until login.
create table if not exists public.user_bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_type text not null,
  item_id text not null,
  title text not null,
  href text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, item_type, item_id)
);

-- Private user notes replacing local-only comments for authenticated users.
create table if not exists public.user_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_type text not null,
  item_id text not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Persisted earned badges.
create table if not exists public.user_earned_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id text not null,
  earned_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, badge_id)
);

-- Spaced review queue for ayahs, words, hadiths, duas, and quiz misses.
create table if not exists public.review_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_type text not null,
  item_id text not null,
  title text,
  next_due_at timestamp with time zone default timezone('utc', now()),
  interval_days integer default 1,
  ease numeric default 2.5,
  last_result text check (last_result in ('again', 'hard', 'good', 'easy')),
  metadata jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, item_type, item_id)
);

-- Future contest system: LeetCode-style scheduled learning competitions.
create table if not exists public.contests (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  title text not null,
  description text,
  contest_type text check (contest_type in ('daily_challenge', 'weekly_quiz', 'ramadan_special', 'topic_based')) not null,
  status text check (status in ('draft', 'scheduled', 'live', 'ended', 'archived')) not null default 'draft',
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  xp_reward_pool integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.contest_questions (
  id uuid default uuid_generate_v4() primary key,
  contest_id uuid references public.contests(id) on delete cascade not null,
  question_type text not null,
  question_payload jsonb not null,
  answer_payload jsonb not null,
  position integer not null,
  points integer not null default 1,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(contest_id, position)
);

create table if not exists public.contest_registrations (
  id uuid default uuid_generate_v4() primary key,
  contest_id uuid references public.contests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  registered_at timestamp with time zone default timezone('utc', now()),
  unique(contest_id, user_id)
);

create table if not exists public.contest_attempts (
  id uuid default uuid_generate_v4() primary key,
  contest_id uuid references public.contests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  time_ms integer,
  metadata jsonb default '{}'::jsonb,
  submitted_at timestamp with time zone default timezone('utc', now()),
  unique(contest_id, user_id)
);

create table if not exists public.contest_leaderboard_snapshots (
  id uuid default uuid_generate_v4() primary key,
  contest_id uuid references public.contests(id) on delete cascade not null,
  rankings jsonb not null,
  generated_at timestamp with time zone default timezone('utc', now())
);

-- Append-only XP source of truth. profiles.xp should become a cached total over this ledger.
create table if not exists public.xp_ledger (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null,
  amount integer not null,
  source_type text not null,
  source_id text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, event_type, source_type, source_id)
);

create index if not exists idx_contests_status_starts_at on public.contests(status, starts_at);
create index if not exists idx_contest_attempts_score on public.contest_attempts(contest_id, score desc, time_ms asc);
create index if not exists idx_xp_ledger_user_created_at on public.xp_ledger(user_id, created_at desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.streaks enable row level security;
alter table public.learning_events enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_earned_badges enable row level security;
alter table public.review_items enable row level security;
alter table public.contests enable row level security;
alter table public.contest_questions enable row level security;
alter table public.contest_registrations enable row level security;
alter table public.contest_attempts enable row level security;
alter table public.contest_leaderboard_snapshots enable row level security;
alter table public.xp_ledger enable row level security;

-- Profiles policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- Progress policies
create policy "Users can view their own progress" on public.progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.progress for update using (auth.uid() = user_id);

-- Quiz attempts policies
create policy "Users can view their own attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert their own attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- Streaks policies
create policy "Users can view their own streak" on public.streaks for select using (auth.uid() = user_id);
create policy "Users can upsert their own streak" on public.streaks for all using (auth.uid() = user_id);

-- Learning event policies
create policy "Users can view their own learning events" on public.learning_events for select using (auth.uid() = user_id);
create policy "Users can insert their own learning events" on public.learning_events for insert with check (auth.uid() = user_id);

-- Bookmark policies
create policy "Users can view their own bookmarks" on public.user_bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert their own bookmarks" on public.user_bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can update their own bookmarks" on public.user_bookmarks for update using (auth.uid() = user_id);
create policy "Users can delete their own bookmarks" on public.user_bookmarks for delete using (auth.uid() = user_id);

-- Notes policies
create policy "Users can view their own notes" on public.user_notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes" on public.user_notes for insert with check (auth.uid() = user_id);
create policy "Users can update their own notes" on public.user_notes for update using (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.user_notes for delete using (auth.uid() = user_id);

-- Badge policies
create policy "Users can view their own badges" on public.user_earned_badges for select using (auth.uid() = user_id);
create policy "Users can insert their own badges" on public.user_earned_badges for insert with check (auth.uid() = user_id);

-- Review item policies
create policy "Users can view their own review items" on public.review_items for select using (auth.uid() = user_id);
create policy "Users can insert their own review items" on public.review_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own review items" on public.review_items for update using (auth.uid() = user_id);
create policy "Users can delete their own review items" on public.review_items for delete using (auth.uid() = user_id);

-- Contest policies
create policy "Anyone can view published contests" on public.contests
  for select using (status in ('scheduled', 'live', 'ended', 'archived'));
create policy "Users can view their own contest registrations" on public.contest_registrations for select using (auth.uid() = user_id);
create policy "Users can register themselves for contests" on public.contest_registrations for insert with check (auth.uid() = user_id);
create policy "Users can view their own contest attempts" on public.contest_attempts for select using (auth.uid() = user_id);
create policy "Users can submit their own contest attempts" on public.contest_attempts for insert with check (auth.uid() = user_id);
create policy "Anyone can view leaderboard snapshots" on public.contest_leaderboard_snapshots for select using (true);
create policy "Users can view their own XP ledger" on public.xp_ledger for select using (auth.uid() = user_id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  
  insert into public.streaks (user_id, current_streak, longest_streak)
  values (new.id, 0, 0);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
