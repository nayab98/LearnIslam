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

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.streaks enable row level security;

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
