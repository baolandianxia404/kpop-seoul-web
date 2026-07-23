"use client"

import { createContext, useContext, useState, useCallback } from "react"
import type { Lang, TranslationKey } from "@/lib/i18n/translations"
import { translations } from "@/lib/i18n/translations"

interface LangContextType {
  lang: Lang
  t: (key: TranslationKey) => string
  toggleLang: () => void
}

const LangContext = createContext<LangContextType>({
  lang: "zh",
  t: () => "",
  toggleLang: () => {},
})

export function useLang() {
  return useContext(LangContext)
}

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang]
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh")

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "zh" ? "en" : "zh"))
  }, [])

  const translate = useCallback(
    (key: TranslationKey) => translations[key][lang],
    [lang]
  )

  return (
    <LangContext.Provider value={{ lang, t: translate, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}
