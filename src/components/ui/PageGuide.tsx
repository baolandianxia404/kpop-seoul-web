"use client"

import { useState, useEffect } from "react"

interface Props {
  pageKey: string
  emoji: string
  title: string
  children: React.ReactNode
}

export default function PageGuide({ pageKey, emoji, title, children }: Props) {
  const storageKey = `kpop_guide_${pageKey}`
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      setExpanded(true)
      const timer = setTimeout(() => setExpanded(false), 8000)
      localStorage.setItem(storageKey, "1")
      return () => clearTimeout(timer)
    }
    setMounted(true)
  }, [storageKey])

  // After mount, allow interaction
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div className="relative mb-4">
      {/* Collapsed bubble */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-dashed border-slate-300 bg-white/80 text-xs font-mono text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all ${
          expanded ? "opacity-0 pointer-events-none absolute" : "opacity-100 animate-bounce-gentle"
        }`}
        aria-label="Show guide"
      >
        <span className="text-sm">{emoji}</span>
        <span>{title}</span>
        <span className="text-[10px] text-slate-300">?</span>
      </button>

      {/* Expanded card */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          expanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="relative p-4 rounded-xl border-2 bg-white"
          style={{
            borderColor: "#bfdbfe",
            boxShadow: "3px 3px 0 0 rgba(59,130,246,0.08)",
          }}
        >
          {/* Rabbit ear accent */}
          <div className="absolute -top-2.5 left-4 flex gap-0.5">
            <div className="w-1.5 h-3 bg-blue-400 rounded-t-sm" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
            <div className="w-1.5 h-3 bg-blue-400 rounded-t-sm" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-800 mb-1">{title}</h4>
              <div className="text-xs text-slate-500 font-mono leading-relaxed">
                {children}
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500 transition text-[10px]"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
