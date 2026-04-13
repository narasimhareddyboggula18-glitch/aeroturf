-- ============================================================
--  AeroTurf — Run this SQL in your Supabase SQL Editor
--  Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id    INTEGER  NOT NULL,
  venue_name  TEXT     NOT NULL,
  sport       TEXT     NOT NULL,
  date        DATE     NOT NULL,
  slot        TEXT     NOT NULL,
  price       INTEGER  NOT NULL,
  num_players INTEGER  DEFAULT 1,
  user_name   TEXT     NOT NULL,
  user_email  TEXT     NOT NULL,
  user_phone  TEXT     DEFAULT '',
  status      TEXT     DEFAULT 'confirmed',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1b. Migration: add num_players to EXISTING tables (safe to run multiple times)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS num_players INTEGER DEFAULT 1;

-- 2. Allow public insert/read (disable RLS for simplicity)
--    If you want per-user security, set up RLS policies instead.
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- 3. Index for fast slot lookup
CREATE INDEX IF NOT EXISTS idx_bookings_venue_date
  ON bookings (venue_id, date, status);

-- 4. Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON bookings (user_email);


-- 2. Allow public insert/read (disable RLS for simplicity)
--    If you want per-user security, set up RLS policies instead.
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- 3. Index for fast slot lookup
CREATE INDEX IF NOT EXISTS idx_bookings_venue_date
  ON bookings (venue_id, date, status);

-- 4. Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON bookings (user_email);
