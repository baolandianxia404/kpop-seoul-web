"use client"

import { useState, useEffect } from "react"
import { useLang } from "@/components/LanguageProvider"

export default function InstallGuide() {
  const { t, lang } = useLang()
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) setPlatform("ios")
    else if (/Android/.test(ua)) setPlatform("android")

    const timer = setTimeout(() => {
      const d = localStorage.getItem("install_guide_dismissed")
      if (!d) setShow(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem("install_guide_dismissed", "1")
  }

  if (!show) return null

  const isZh = lang === "zh"

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] mx-auto max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-700">
            {isZh ? "添加到主屏幕" : "Add to Home Screen"}
          </h3>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-sm leading-none">✕</button>
        </div>

        {platform === "ios" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span className="text-xs text-slate-600">{isZh ? "点底部 Safari 分享按钮" : "Tap the Share button in Safari"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span className="text-xs text-slate-600">{isZh ? "滑动找到「添加到主屏幕」" : 'Scroll to "Add to Home Screen"'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span className="text-xs text-slate-600">{isZh ? "点击添加，下次一键打开" : "Tap Add, open with one tap next time"}</span>
            </div>
            <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mt-2">
              {isZh ? "iOS 只能用 Safari 添加到桌面，其他浏览器不支持" : "iOS only supports Safari for Add to Home Screen"}
            </p>
          </div>
        )}

        {platform === "android" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span className="text-xs text-slate-600">{isZh ? "点浏览器右上角 ⋮ 菜单" : "Tap ⋮ menu in browser"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span className="text-xs text-slate-600">{isZh ? "选择「添加到主屏幕」/「安装应用」" : 'Select "Add to Home Screen" / "Install app"'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span className="text-xs text-slate-600">{isZh ? "确认安装，桌面出现星旅图标" : "Confirm, StarTrail icon appears on home screen"}</span>
            </div>
            <p className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-lg mt-2">
              {isZh ? "Chrome / Edge / 自带浏览器都支持" : "Works with Chrome, Edge, and most browsers"}
            </p>
          </div>
        )}

        {platform === "other" && (
          <p className="text-xs text-slate-500">
            {isZh
              ? "在手机浏览器打开此网站，这里会显示安装教程。PC 用户可以直接收藏。"
              : "Open this site in a mobile browser to see installation instructions."}
          </p>
        )}

        <button
          onClick={dismiss}
          className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-500"
        >
          {isZh ? "知道了" : "Got it"}
        </button>
      </div>
    </div>
  )
}
