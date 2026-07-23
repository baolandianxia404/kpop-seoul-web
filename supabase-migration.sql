-- Run this in Supabase SQL Editor: https://supabase.com/dashboard > SQL Editor
-- Tables for Kpop Seoul Map: Idol House + Community Spots

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  fan_group_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community-contributed spots
CREATE TABLE IF NOT EXISTS community_spots (
  id TEXT PRIMARY KEY,
  location_name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  type TEXT DEFAULT 'restaurant',
  group_ids TEXT[] DEFAULT '{}',
  xhs_link TEXT DEFAULT '',
  description TEXT DEFAULT '',
  submitted_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-in posts in idol houses
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id TEXT NOT NULL,
  spot_name TEXT NOT NULL,
  spot_location TEXT DEFAULT '',
  content TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS: community_spots
ALTER TABLE community_spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "spots_select" ON community_spots;
CREATE POLICY "spots_select" ON community_spots FOR SELECT USING (true);
DROP POLICY IF EXISTS "spots_insert" ON community_spots;
CREATE POLICY "spots_insert" ON community_spots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "spots_update" ON community_spots;
CREATE POLICY "spots_update" ON community_spots FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS: check_ins — only same-fandom members can read
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checkins_select" ON check_ins;
CREATE POLICY "checkins_select" ON check_ins FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.fan_group_id = check_ins.group_id
  )
);
DROP POLICY IF EXISTS "checkins_insert" ON check_ins;
CREATE POLICY "checkins_insert" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "checkins_delete" ON check_ins;
CREATE POLICY "checkins_delete" ON check_ins FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket: run this, then go to Storage > Create bucket "checkin-photos" (public)
-- Also run in SQL Editor to allow public read:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('checkin-photos', 'checkin-photos', true)
-- ON CONFLICT (id) DO NOTHING;
-- CREATE POLICY "photos_select" ON storage.objects FOR SELECT USING (bucket_id = 'checkin-photos');
-- CREATE POLICY "photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'checkin-photos' AND auth.role() = 'authenticated');
