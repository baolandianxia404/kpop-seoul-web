// Categories for location classification
export const categories = [
  {
    "type": "company",
    "name": "公司大楼",
    "icon": "🏢",
    "color": "#7C3AED",
    "subtypes": [
      {
        "key": "building",
        "name": "大楼/总部"
      },
      {
        "key": "cafe",
        "name": "公司咖啡厅"
      },
      {
        "key": "shop",
        "name": "公司周边店"
      }
    ],
    "sortOrder": 1
  },
  {
    "type": "restaurant",
    "name": "同款美食",
    "icon": "🍽️",
    "color": "#F59E0B",
    "subtypes": [
      {
        "key": "korean",
        "name": "韩餐"
      },
      {
        "key": "cafe",
        "name": "咖啡厅"
      },
      {
        "key": "dessert",
        "name": "甜品"
      },
      {
        "key": "western",
        "name": "西餐"
      }
    ],
    "sortOrder": 2
  },
  {
    "type": "mv_spot",
    "name": "MV拍摄地",
    "icon": "🎬",
    "color": "#3B82F6",
    "subtypes": [
      {
        "key": "outdoor",
        "name": "户外"
      },
      {
        "key": "indoor",
        "name": "室内"
      }
    ],
    "sortOrder": 3
  },
  {
    "type": "store",
    "name": "专辑/周边",
    "icon": "🛍️",
    "color": "#10B981",
    "subtypes": [
      {
        "key": "album",
        "name": "专辑店"
      },
      {
        "key": "goods",
        "name": "周边店"
      },
      {
        "key": "both",
        "name": "综合"
      }
    ],
    "sortOrder": 4
  },
  {
    "type": "entertainment",
    "name": "娱乐景点",
    "icon": "🎡",
    "color": "#EC4899",
    "subtypes": [
      {
        "key": "broadcast",
        "name": "电视台"
      },
      {
        "key": "venue",
        "name": "演出场馆"
      },
      {
        "key": "landmark",
        "name": "地标"
      }
    ],
    "sortOrder": 5
  }
] as const

export type Category = (typeof categories)[number]["type"]
