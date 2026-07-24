export type Lang = "en" | "zh"

export const translations = {
  // Header
  header_map: { en: "Map", zh: "地图" },
  header_locations: { en: "Locations", zh: "地点" },
  header_groups: { en: "Groups", zh: "团体" },
  header_add_spot: { en: "Share", zh: "投稿" },
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
  profile_change_group: { en: "Change your fan group", zh: "更换本命团体" },
  profile_saving: { en: "Saving...", zh: "保存中..." },

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
  house_gathering: { en: "Fandom gathering place", zh: "粉丝聚集地" },
  house_locked_title: { en: "Fandom Members Only", zh: "仅限粉丝成员" },
  house_locked_msg: { en: "Sign in and join the {groupName} fandom to see check-ins.", zh: "登录并加入 {groupName} 粉丝团才能看到打卡内容。" },
  house_join_fandom: { en: "JOIN FANDOM", zh: "加入粉丝团" },
  house_not_yours: { en: "This is another group's House", zh: "这是别人家的小屋" },
  house_not_yours_msg: { en: "You're a {myGroup} fan. Only {houseGroup} fandom members can view posts here.", zh: "你是 {myGroup} 的粉丝，只有 {houseGroup} 粉丝团成员才能看到这里的帖子。" },
  house_go_mine: { en: "GO TO MY HOUSE →", zh: "去我的小屋 →" },
  house_checkin_count: { en: "{n} check-ins", zh: "{n} 条打卡" },
  house_new_checkin: { en: "📝 NEW CHECK-IN", zh: "📝 新打卡" },
  house_loading: { en: "Loading check-ins...", zh: "加载打卡中..." },
  house_empty_msg: { en: "Be the first to share your pilgrimage story.", zh: "来做第一个打卡的粉丝吧！" },

  // Check in card
  checkin_delete: { en: "Delete", zh: "删除" },
  checkin_just_now: { en: "just now", zh: "刚刚" },
  checkin_min_ago: { en: "m ago", zh: "分钟前" },
  checkin_h_ago: { en: "h ago", zh: "小时前" },
  checkin_d_ago: { en: "d ago", zh: "天前" },
  checkin_delete_confirm: { en: "Delete this check-in?", zh: "确定删除这条打卡？" },
  checkin_comment_placeholder: { en: "Add a comment...", zh: "写评论..." },
  checkin_no_comments: { en: "No comments yet", zh: "暂无评论" },

  // Add Spot
  add_spot_title: { en: "Share a Kpop Spot", zh: "分享 Kpop 打卡地" },
  add_spot_subtitle: { en: "Found a great Kpop spot? Share it with the community!", zh: "发现了宝藏追星地？分享给大家吧！" },
  add_spot_share: { en: "Xiaohongshu Share Text", zh: "小红书分享文案" },
  add_spot_select_group: { en: "Select Group", zh: "选择团体" },
  add_spot_name: { en: "Spot Name (optional)", zh: "地点名称（选填）" },
  add_spot_address: { en: "Address (optional)", zh: "地址（选填）" },
  add_spot_type: { en: "Type", zh: "类型" },
  add_spot_description: { en: "Description (optional)", zh: "描述（选填）" },
  add_spot_submit: { en: "Submit Spot", zh: "提交地点" },
  add_spot_xhs_hint: { en: 'Open XHS app → tap "Share" → "Copy Share Text" → paste here. Auto-extracts spot name & address!', zh: "打开小红书 → 点「分享」→「复制分享文案」→ 粘贴到这里，自动提取地名和地址！" },
  add_spot_xhs_example: { en: 'Format: 【Spot Name】Description text... http://xhslink.com/xxx', zh: "格式：【地点名称】描述文字... http://xhslink.com/xxx" },
  add_spot_xhs_url_only: { en: "It looks like you only pasted a URL. For auto-extraction, use Xiaohongshu's \"Copy Share Text\" instead of \"Copy Link\".", zh: "检测到你只粘贴了链接。想要自动提取信息，请使用小红书的「复制分享文案」而非「复制链接」。" },
  add_spot_parse_title: { en: "Extracted title & address from share text!", zh: "已从分享文案中提取标题和地址！" },
  add_spot_parse_title_only: { en: "Extracted title from share text. Please fill in the address manually.", zh: "已从分享文案中提取标题，请手动填写地址。" },
  add_spot_fetching_url: { en: "Fetching page info from URL...", zh: "正在从链接获取页面信息..." },
  add_spot_fetch_url_failed: { en: "Couldn't fetch page info (site may block automated access). Try pasting the full share text instead!", zh: "无法获取页面信息（网站可能限制访问），试试粘贴完整的分享文案吧！" },
  add_spot_parse_btn: { en: "Extract", zh: "提取信息" },
  add_spot_howto_title: { en: "How to share from Xiaohongshu", zh: "如何从小红书分享" },
  add_spot_howto_step1: { en: "Open Xiaohongshu app, find a Kpop spot post", zh: "打开小红书 App，找到追星打卡地帖子" },
  add_spot_howto_step2: { en: 'Tap the share button (top right arrow) → "Copy Share Text"', zh: "点击右上角分享按钮 →「复制分享文案」" },
  add_spot_howto_step3: { en: "Paste here — spot name & address will be auto-extracted!", zh: "粘贴到这里 → 自动提取地名和地址！" },
  add_spot_needs_group: { en: "Please select at least one group.", zh: "请至少选择一个团体。" },
  add_spot_success_title: { en: "SPOT SHARED!", zh: "分享成功！" },
  add_spot_success_msg: { en: "Thanks for contributing!", zh: "感谢你的贡献！" },
  add_spot_success_draft: { en: "This spot needs more info — other fans can help complete it.", zh: "这个地点信息还不够完整，其他粉丝可以帮忙完善。" },
  add_spot_success_another: { en: "SHARE ANOTHER SPOT", zh: "继续分享" },
  add_spot_footer: { en: "Only group selection is required. Other fans can help fill in the details!", zh: "只需选择团体即可提交，其他粉丝可以帮忙完善信息！" },
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
  saved_how_to: { en: "Click ⭐ on map markers or Add to Plan to save spots here.", zh: "在地图上点 ⭐ 或添加到计划来收藏地点。" },

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
  common_home: { en: "Home", zh: "首页" },
  common_not_found: { en: "Not found", zh: "未找到" },
  common_back_groups: { en: "← BACK TO GROUPS", zh: "← 返回团体" },
  common_back_spots: { en: "← SPOTS", zh: "← 地点" },
  common_cancel: { en: "CANCEL", zh: "取消" },

  // Location detail
  location_about: { en: "About", zh: "简介" },
  location_address: { en: "Address", zh: "地址" },
  location_transport: { en: "Transport", zh: "交通" },
  location_price: { en: "Price", zh: "价格" },
  location_duration: { en: "Suggested Duration", zh: "建议时长" },
  location_minutes: { en: "minutes", zh: "分钟" },
  location_nearby: { en: "Nearby in", zh: "周边 - " },
  location_tip: { en: "Tip:", zh: "贴士：" },
  location_free: { en: "Free", zh: "免费" },
  location_metro: { en: "Metro", zh: "地铁" },
  location_bus: { en: "Bus", zh: "公交" },
  location_walk: { en: "Walk", zh: "步行" },
  location_exit: { en: "Exit", zh: "出口" },
  location_navigate: { en: "Navigate with:", zh: "导航应用：" },
} as const

export type TranslationKey = keyof typeof translations
