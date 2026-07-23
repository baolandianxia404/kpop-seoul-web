export type Lang = "en" | "zh"

export const translations = {
  // Header
  header_map: { en: "Map", zh: "地图" },
  header_locations: { en: "Locations", zh: "地点" },
  header_groups: { en: "Groups", zh: "团体" },
  header_add_spot: { en: "Add Spot", zh: "添加" },
  header_routes: { en: "Routes", zh: "路线" },
  header_sign_in: { en: "Sign In", zh: "登录" },
  header_join: { en: "Join", zh: "注册" },

  // User menu
  menu_my_house: { en: "My House", zh: "我的小屋" },
  menu_settings: { en: "Settings", zh: "设置" },
  menu_sign_out: { en: "Sign Out", zh: "退出" },

  // Mobile nav
  nav_map: { en: "Map", zh: "地图" },
  nav_locations: { en: "Spots", zh: "地点" },
  nav_groups: { en: "Groups", zh: "团体" },
  nav_planner: { en: "Add", zh: "添加" },
  nav_routes: { en: "Routes", zh: "路线" },
  nav_saved: { en: "Saved", zh: "收藏" },
  nav_house: { en: "House", zh: "小屋" },

  // Homepage
  home_title: { en: "Kpop Seoul Map", zh: "Kpop 首尔地图" },
  home_subtitle: { en: "Discover Kpop filming spots, idol restaurants & album shops in Seoul", zh: "探索首尔 Kpop 拍摄地、爱豆餐厅、专辑店" },
  home_spots: { en: "Spots", zh: "地点" },
  home_groups: { en: "Groups", zh: "团体" },
  home_categories: { en: "Categories", zh: "分类" },
  home_district: { en: "District", zh: "地区" },
  home_seoul: { en: "Seoul", zh: "首尔" },
  home_hint: { en: "Click markers to explore · Drag to pan · Scroll to zoom", zh: "点击标记探索 · 拖拽平移 · 滚轮缩放" },
  home_hot_places: { en: "Hot Places", zh: "热门打卡地" },

  // Auth
  auth_login_title: { en: "Sign In", zh: "登录" },
  auth_register_title: { en: "Join Kpop Seoul", zh: "加入 Kpop Seoul" },
  auth_email: { en: "Email", zh: "邮箱" },
  auth_password: { en: "Password", zh: "密码" },
  auth_confirm_password: { en: "Confirm Password", zh: "确认密码" },
  auth_display_name: { en: "Display Name (optional)", zh: "昵称（选填）" },
  auth_select_group: { en: "Select your fan group", zh: "选择你的本命团体" },
  auth_submit_login: { en: "Sign In", zh: "登录" },
  auth_submit_register: { en: "Create Account", zh: "创建账号" },
  auth_no_account: { en: "Don't have an account?", zh: "还没有账号？" },
  auth_has_account: { en: "Already have an account?", zh: "已有账号？" },
  auth_register_link: { en: "Join", zh: "注册" },
  auth_login_link: { en: "Sign In", zh: "登录" },
  auth_register_success_title: { en: "WELCOME!", zh: "欢迎加入！" },
  auth_register_success: { en: "Start exploring now.", zh: "开始探索吧！" },
  auth_error: { en: "Error", zh: "出错啦" },

  // Profile
  profile_title: { en: "Profile Settings", zh: "个人设置" },
  profile_display_name: { en: "Display Name", zh: "昵称" },
  profile_fan_group: { en: "Fan Group", zh: "本命团体" },
  profile_save: { en: "Save", zh: "保存" },
  profile_saved: { en: "Saved!", zh: "已保存！" },

  // Group detail
  group_house_enter: { en: "Enter House", zh: "进入小屋" },
  group_needs_info: { en: "NEEDS INFO", zh: "待完善" },
  group_help_complete: { en: "Help complete this spot", zh: "帮忙完善信息" },
  group_filter_all: { en: "All", zh: "全部" },
  group_community_spots: { en: "Community Spots", zh: "社区贡献" },

  // House
  house_title: { en: "House", zh: "小屋" },
  house_not_member: { en: "This house is for fans only. Join this group to see what's inside!", zh: "这里只有本命粉丝能看哦，加入团体就能进来啦！" },
  house_sign_in_first: { en: "Sign in to enter your fan house!", zh: "登录后进入你的小屋！" },
  house_empty: { en: "No check-ins yet. Be the first!", zh: "还没有打卡帖，做第一个吧！" },
  house_post_placeholder: { en: "Share your Kpop spot experience...", zh: "分享你的 Kpop 打卡经历..." },
  house_spot_name: { en: "Spot Name", zh: "地点名称" },
  house_location: { en: "Location (optional)", zh: "地址（选填）" },
  house_post: { en: "Post", zh: "发布" },
  house_add_photos: { en: "Add Photos", zh: "添加照片" },

  // Check in card
  checkin_delete: { en: "Delete", zh: "删除" },
  checkin_just_now: { en: "just now", zh: "刚刚" },
  checkin_min_ago: { en: "m ago", zh: "分钟前" },
  checkin_h_ago: { en: "h ago", zh: "小时前" },
  checkin_d_ago: { en: "d ago", zh: "天前" },

  // Add Spot
  add_spot_title: { en: "Add a Kpop Spot", zh: "添加 Kpop 地点" },
  add_spot_subtitle: { en: "Help the community discover more Kpop locations!", zh: "帮助社区发现更多 Kpop 地点！" },
  add_spot_share: { en: "Paste Xiaohongshu share text", zh: "粘贴小红书分享文案" },
  add_spot_select_group: { en: "Select Group", zh: "选择团体" },
  add_spot_name: { en: "Spot Name (optional)", zh: "地点名称（选填）" },
  add_spot_address: { en: "Address (optional)", zh: "地址（选填）" },
  add_spot_type: { en: "Type", zh: "类型" },
  add_spot_description: { en: "Description (optional)", zh: "描述（选填）" },
  add_spot_submit: { en: "Submit Spot", zh: "提交地点" },
  add_spot_xhs_hint: { en: "Paste a Xiaohongshu share link above to auto-fill the name and address.", zh: "粘贴小红书分享链接可自动提取地名和地址" },
  add_spot_draft_notice: { en: "Login to save spots permanently. Currently using local storage.", zh: "登录后可永久保存地点，当前使用本地存储。" },

  // Locations page
  locations_title: { en: "Kpop Locations", zh: "Kpop 地点" },
  locations_search: { en: "Search locations...", zh: "搜索地点..." },
  locations_filter_all: { en: "All", zh: "全部" },

  // Groups page
  groups_title: { en: "Kpop Groups", zh: "Kpop 团体" },
  groups_search: { en: "Search groups...", zh: "搜索团体..." },

  // Saved page
  saved_title: { en: "Saved Spots", zh: "收藏的地点" },
  saved_empty: { en: "No saved spots yet. Add some from the map or planner!", zh: "还没有收藏地点，去地图或规划页面添加吧！" },

  // Categories
  cat_restaurant: { en: "Restaurant", zh: "餐厅" },
  cat_cafe: { en: "Cafe", zh: "咖啡厅" },
  cat_store: { en: "Store", zh: "商店" },
  cat_company: { en: "Company", zh: "娱乐公司" },
  cat_mv_spot: { en: "MV Spot", zh: "MV 拍摄地" },
  cat_entertainment: { en: "Entertainment", zh: "娱乐场所" },

  // Common
  common_loading: { en: "Loading...", zh: "加载中..." },
  common_error: { en: "Something went wrong", zh: "出了点问题" },
  common_retry: { en: "Retry", zh: "重试" },
  common_back: { en: "Back", zh: "返回" },
  common_or: { en: "or", zh: "或" },
} as const

export type TranslationKey = keyof typeof translations
