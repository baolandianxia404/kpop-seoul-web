"use client"

import { useState } from "react"
import { useLang } from "@/components/LanguageProvider"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"

type FeedbackCategory = "suggestion" | "bug" | "personal" | "other"

const categories: { key: FeedbackCategory; icon: string; labelKey: string }[] = [
  { key: "suggestion", icon: "💡", labelKey: "feedback_category_suggestion" },
  { key: "bug", icon: "🐛", labelKey: "feedback_category_bug" },
  { key: "personal", icon: "✨", labelKey: "feedback_category_personal" },
  { key: "other", icon: "💬", labelKey: "feedback_category_other" },
]

export default function CreatorFeedback() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const isZh = lang === "zh"

  const [dialogOpen, setDialogOpen] = useState(false)
  const [category, setCategory] = useState<FeedbackCategory>("suggestion")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from("feedback").insert({
        category,
        content: content.trim(),
        user_id: user?.id || null,
        page: typeof window !== "undefined" ? window.location.pathname : "",
      })
      setSubmitted(true)
      setContent("")
    } catch {
      // silently handle error
    } finally {
      setSubmitting(false)
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSubmitted(false)
    setCategory("suggestion")
    setContent("")
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 mb-8">
        {/* Creator Section */}
        <div className="bg-white rounded-2xl border-2 border-blue-50 p-5 mb-4">
          <h2 className="text-sm font-black text-slate-700 mb-3 text-center">
            {t("creator_title")}
          </h2>
          <div className="flex items-start gap-4">
            <img
              src="/creator-avatar.jpg"
              alt="LILY"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 shadow-md border-2 border-blue-100"
            />
            <div>
              <p className="font-bold text-slate-700 text-sm mb-1">
                {isZh ? "LILY" : "LILY"}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                {t("creator_bio")}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.xiaohongshu.com/user/profile/66bcbb4a000000001d022745"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-red-400 transition font-mono flex items-center gap-1"
                >
                  📕 {isZh ? "小红书" : "RED"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl border-2 border-amber-50 p-5">
          <h2 className="text-sm font-black text-slate-700 mb-1 text-center">
            {t("feedback_title")}
          </h2>
          <p className="text-xs text-gray-400 text-center mb-3">
            {t("feedback_desc")}
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 font-bold text-sm rounded-xl border border-amber-200 transition"
          >
            {t("feedback_btn")}
          </button>
        </div>
      </div>

      {/* Feedback Dialog */}
      {dialogOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[2000]" onClick={closeDialog} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2001] w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-700 text-base">
                    {t("feedback_dialog_title")}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t("feedback_dialog_desc")}
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-sm transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5">
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500 mb-3">{t("feedback_login_prompt")}</p>
                  <a
                    href="/auth/login"
                    className="inline-block px-5 py-2 btn-accent text-xs font-semibold rounded-xl"
                  >
                    {t("header_sign_in")}
                  </a>
                </div>
              ) : submitted ? (
                <div className="text-center py-6">
                  <span className="text-3xl mb-2 block">✓</span>
                  <p className="text-sm text-slate-500">{t("feedback_success")}</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                          category === cat.key
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {cat.icon} {t(cat.labelKey as never)}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    placeholder={t("feedback_placeholder")}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-slate-700 placeholder-gray-300 resize-none focus:outline-none focus:border-blue-300 transition"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSubmit}
                      disabled={!content.trim() || submitting}
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition"
                    >
                      {submitting ? (isZh ? "发送中..." : "Sending...") : t("feedback_submit")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
