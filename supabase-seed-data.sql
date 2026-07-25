-- ============================================================
-- Seed Demo Data for Kpop Seoul Map
-- ============================================================
-- INSTRUCTIONS:
-- 1. Open your app, sign in, go to any page
-- 2. In Supabase SQL Editor, run: SELECT id FROM auth.users LIMIT 1;
-- 3. Copy that UUID, replace 'REPLACE_WITH_YOUR_USER_ID' below
-- 4. Run this entire script
-- ============================================================

DO $$
DECLARE
  demo_user_id UUID := 'REPLACE_WITH_YOUR_USER_ID';
BEGIN

-- Skip if user doesn't exist
IF demo_user_id = 'REPLACE_WITH_YOUR_USER_ID' THEN
  RAISE EXCEPTION 'Please replace REPLACE_WITH_YOUR_USER_ID with your actual user ID (run SELECT id FROM auth.users LIMIT 1; first)';
END IF;

-- Ensure profile exists
INSERT INTO profiles (id, email, display_name, fan_group_id)
VALUES (demo_user_id, 'demo@startrail.app', '星旅小兔', 'bts')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 15 demo check-ins across popular groups
-- ============================================================
INSERT INTO check_ins (user_id, group_id, spot_name, spot_location, content, photos, created_at) VALUES
(demo_user_id, 'bts', 'HYBE INSIGHT', '首尔龙山区汉江大路42号', 'BTS 的博物馆太震撼了！看到他们练习生时期的手写信直接泪目 💜 推荐下午来，人少拍照好看', ARRAY['https://images.unsplash.com/photo-1598387993441-a2cd0e3f1e0d?w=400'], NOW() - INTERVAL '3 days'),
(demo_user_id, 'bts', '旧 BigHit 大楼', '首尔江南区论岘路145号', '来朝圣 BTS 的起点，墙上还有粉丝留言 🥹 虽然已经搬走了但很有意义', ARRAY[]::text[], NOW() - INTERVAL '5 days'),
(demo_user_id, 'blackpink', 'YG 大楼', '首尔麻浦区喜雨亭路1号', '在 YG 门口蹲了两小时没见到 BLACKPINK 但是对面咖啡厅老板说 Lisa 上周来过！', ARRAY['https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400'], NOW() - INTERVAL '2 days'),
(demo_user_id, 'blackpink', 'THE SAME E 咖啡厅', '首尔麻浦区延南洞', 'JENNIE 同款咖啡厅！点了她最爱的拿铁，店里氛围超好，拍照巨出片 ☕✨', ARRAY['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'], NOW() - INTERVAL '1 day'),
(demo_user_id, 'twice', 'JYP 新大楼', '首尔江东区城内路', 'TWICE 的小窝！公司旁边有专门的粉丝拍照区，ONCE 必打卡 💖', ARRAY['https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=400'], NOW() - INTERVAL '4 days'),
(demo_user_id, 'nct', 'KWANGYA 首尔', '首尔江南区永东大路513号', 'SM 的宇宙世界太酷了！买了 NCT 的专辑还抽到了在玹的小卡 🥹💚', ARRAY[]::text[], NOW() - INTERVAL '2 days'),
(demo_user_id, 'seventeen', 'HYBE 龙山', '首尔龙山区汉江大路42号', '为了 SEVENTEEN 来的！大楼像美术馆一样美，CARAT 必来 🙌💎', ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'], NOW() - INTERVAL '1 day'),
(demo_user_id, 'aespa', 'SM 娱乐总部', '首尔城东区圣水洞', '新大楼好漂亮！一楼咖啡厅偶遇到宁宁，整个人都在发光 😭✨', ARRAY['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'], NOW() - INTERVAL '6 hours'),
(demo_user_id, 'bts', 'Haru One Day 咖啡厅', '首尔麻浦区延南洞', 'SJ 东海开的咖啡厅，但是 ARMY 也爱来～菜单全是韩文但老板人很好帮翻译', ARRAY[]::text[], NOW() - INTERVAL '7 days'),
(demo_user_id, 'newjeans', 'Minji 同款书店', '首尔钟路区', 'NewJeans Minji 推荐的书店！复古感很强，买了几本韩文书当纪念 📚', ARRAY['https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400'], NOW() - INTERVAL '3 days'),
(demo_user_id, 'txt', '汉江公园汝矣岛', '首尔永登浦区汝矣岛', 'TXT MV 拍摄地！傍晚来吹着江风听歌，瞬间理解为什么选这里拍 🍃', ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'], NOW() - INTERVAL '8 days'),
(demo_user_id, 'enhypen', '梨泰院烤肉店', '首尔龙山区梨泰院', 'ENHYPEN 去的烤肉店！墙上全是签名，生拌牛肉绝了 🥩', ARRAY[]::text[], NOW() - INTERVAL '6 days'),
(demo_user_id, 'ive', '汝矣岛汉江公园', '首尔永登浦区汝矣岛', 'IVE 来过的汉江公园！和朋友一起点炸鸡外卖在草坪上吃，太幸福了 🍗', ARRAY['https://images.unsplash.com/photo-1506152983158-b4a74a01c654?w=400'], NOW() - INTERVAL '2 days'),
(demo_user_id, 'stray-kids', '弘大街头表演区', '首尔麻浦区弘益大学', 'STRAY KIDS 练习生时期在这边街头表演过～晚上氛围超棒 🎤', ARRAY[]::text[], NOW() - INTERVAL '5 days'),
(demo_user_id, 'blackpink', '明洞专辑店', '首尔中区明洞', '明洞这家专辑店 BLACKPINK 周边超全，买了一堆回家，钱包空了 💀🖤💗', ARRAY['https://images.unsplash.com/photo-1523251343397-4285e5d47a42?w=400'], NOW() - INTERVAL '12 hours');

-- ============================================================
-- Likes on some check-ins (to show engagement)
-- ============================================================
INSERT INTO checkin_likes (checkin_id, user_id)
SELECT c.id, demo_user_id
FROM check_ins c WHERE c.user_id = demo_user_id
LIMIT 8;

-- ============================================================
-- Comments on some check-ins
-- ============================================================
INSERT INTO checkin_comments (checkin_id, user_id, content)
SELECT c.id, demo_user_id, '好想去！想问下交通方便吗？'
FROM check_ins c WHERE c.user_id = demo_user_id AND c.spot_name = 'HYBE INSIGHT'
LIMIT 1;

INSERT INTO checkin_comments (checkin_id, user_id, content)
SELECT c.id, demo_user_id, '打卡成功～这个太有用了！'
FROM check_ins c WHERE c.user_id = demo_user_id AND c.spot_name = 'YG 大楼'
LIMIT 1;

INSERT INTO checkin_comments (checkin_id, user_id, content)
SELECT c.id, demo_user_id, '可以分享下具体位置吗？'
FROM check_ins c WHERE c.user_id = demo_user_id AND c.spot_name = 'JYP 新大楼'
LIMIT 1;

-- ============================================================
-- 5 community-contributed spots
-- ============================================================
INSERT INTO community_spots (id, location_name, address, type, group_ids, description, created_at) VALUES
('seed-1', '秀晶同款炒年糕店', '首尔麻浦区延南洞 234-1', 'restaurant', ARRAY['f(x)', 'red-velvet'], 'Krystal 来过的小店，年糕超级辣但是好吃！', NOW() - INTERVAL '4 days'),
('seed-2', '楷灿推荐烤肉', '首尔江南区狎鸥亭路 88', 'restaurant', ARRAY['nct'], 'NCT 楷灿综艺里推荐的烤肉店，排队半小时但值了', NOW() - INTERVAL '7 days'),
('seed-3', 'JEONGHAN 同款文具店', '首尔钟路区仁寺洞 45', 'store', ARRAY['seventeen'], 'SEVENTEEN JEONGHAN 来过的文具店，韩系手账天堂', NOW() - INTERVAL '3 days'),
('seed-4', '金秋天面包店', '首尔城东区圣水洞 127', 'cafe', ARRAY['ive'], 'IVE 秋天来过的面包房，盐面包是招牌', NOW() - INTERVAL '9 days'),
('seed-5', 'Felix 同款健身房', '首尔江南区清潭洞 66', 'entertainment', ARRAY['stray-kids'], 'Stray Kids Felix 去过的健身房，设施很新', NOW() - INTERVAL '2 days');

END $$;
