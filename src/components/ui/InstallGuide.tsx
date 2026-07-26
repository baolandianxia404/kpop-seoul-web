"use client"

import { useState, useEffect } from "react"
import { useLang } from "@/components/LanguageProvider"

export default function InstallGuide() {
  const { t, lang } = useLang()
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other")

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) setPlatform("ios")
    else if (/Android/.test(ua)) setPlatform("android")
  }, [])

  const isZh = lang === "zh"

  return (
    <div className="max-w-lg mx-auto px-4 mb-8">
      <div className="bg-white rounded-2xl border-2 border-blue-50 p-5">
        <h2 className="text-sm font-black text-slate-700 mb-1 text-center">
          {isZh ? "添加到主屏幕" : "Add to Home Screen"}
        </h2>
        <p className="text-xs text-gray-400 text-center mb-4">
          {isZh ? "像 App 一样打开，不用每次输网址" : "Open like an app, no typing URLs"}
        </p>

        {/* iOS Steps */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="text-base">🍎</span> iPhone / iPad
          </h3>
          <div className="space-y-2">
            {[
              isZh ? "用 Safari 打开本网页" : "Open this site in Safari",
              isZh ? "点底部中间的分享按钮 ↑" : "Tap the Share button at bottom",
              isZh ? "滑动找到「添加到主屏幕」" : 'Find "Add to Home Screen"',
              isZh ? "点右上角「添加」，完成！" : "Tap Add — done!",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-600">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg mt-2.5">
            {isZh ? "只能用 Safari 添加，微信/Chrome 不支持" : "Only Safari supports this on iOS"}
          </p>
        </div>

        {/* Android Steps */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="text-base">🤖</span> Android
          </h3>
          <div className="space-y-2">
            {[
              isZh ? "用浏览器打开本网页（Chrome/Edge/自带）" : "Open site in Chrome, Edge, or default browser",
              isZh ? "点右上角 ⋮ 菜单" : "Tap ⋮ menu at top right",
              isZh ? "选择「添加到主屏幕」或「安装应用」" : 'Select "Add to Home Screen" or "Install app"',
              isZh ? "确认安装，桌面出现星旅图标 ✨" : "Confirm — StarTrail icon appears on home screen",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-md bg-green-100 text-green-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
