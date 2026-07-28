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

-- RLS: check_ins — anyone can read
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checkins_select" ON check_ins;
CREATE POLICY "checkins_select" ON check_ins FOR SELECT USING (true);
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

-- =============================================
-- Check-in Likes
-- =============================================
CREATE TABLE IF NOT EXISTS checkin_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(checkin_id, user_id)
);

ALTER TABLE checkin_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "likes_select" ON checkin_likes;
CREATE POLICY "likes_select" ON checkin_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "likes_insert" ON checkin_likes;
CREATE POLICY "likes_insert" ON checkin_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "likes_delete" ON checkin_likes;
CREATE POLICY "likes_delete" ON checkin_likes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Check-in Comments
-- =============================================
CREATE TABLE IF NOT EXISTS checkin_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checkin_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON checkin_comments;
CREATE POLICY "comments_select" ON checkin_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert" ON checkin_comments;
CREATE POLICY "comments_insert" ON checkin_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_delete" ON checkin_comments;
CREATE POLICY "comments_delete" ON checkin_comments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- User Favorites (cross-device sync)
-- =============================================
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, location_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favs_select" ON user_favorites;
CREATE POLICY "favs_select" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "favs_insert" ON user_favorites;
CREATE POLICY "favs_insert" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "favs_delete" ON user_favorites;
CREATE POLICY "favs_delete" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Itineraries (cross-device sync)
-- =============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "itineraries_select" ON itineraries;
CREATE POLICY "itineraries_select" ON itineraries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "itineraries_insert" ON itineraries;
CREATE POLICY "itineraries_insert" ON itineraries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "itineraries_update" ON itineraries;
CREATE POLICY "itineraries_update" ON itineraries FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "itineraries_delete" ON itineraries;
CREATE POLICY "itineraries_delete" ON itineraries FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Pending Spots (cross-device sync for route planning)
-- =============================================
CREATE TABLE IF NOT EXISTS pending_spots (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, location_id)
);

ALTER TABLE pending_spots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pspots_select" ON pending_spots;
CREATE POLICY "pspots_select" ON pending_spots FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "pspots_insert" ON pending_spots;
CREATE POLICY "pspots_insert" ON pending_spots FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "pspots_delete" ON pending_spots;
CREATE POLICY "pspots_delete" ON pending_spots FOR DELETE USING (auth.uid() = user_id);
