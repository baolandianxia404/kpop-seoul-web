"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { getLocationById, locations } from "@/lib/data/locations"
import { groups } from "@/lib/data/groups"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import { getDistance } from "@/lib/utils/distance"
import TransportSection from "@/components/location/TransportSection"
import HoursSection from "@/components/location/HoursSection"
import TipsSection from "@/components/location/TipsSection"
import PhotoWall from "@/components/location/PhotoWall"
import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"
import { useAuth } from "@/components/auth/AuthProvider"
import { useFavorites } from "@/lib/store/favorites"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/utils/compress-image"

interface Props {
  id: string
}

export default function LocationDetailContent({ id }: Props) {
  const { t } = useLang()
  const { user, profile } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const loc = getLocationById(id)
  const fav = isFavorite(id)
  const [checkinContent, setCheckinContent] = useState("")
  const [checkinPhotos, setCheckinPhotos] = useState<File[]>([])
  const [checkinPreviews, setCheckinPreviews] = useState<string[]>([])
  const [checkinSubmitting, setCheckinSubmitting] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [checkinError, setCheckinError] = useState("")
  const [photoKey, setPhotoKey] = useState(0)

  const locGroups = groups.filter((g) => loc && loc.groupNames.includes(g.name))

  const checkinGroupId = locGroups.length > 0 ? locGroups[0].id : ""

  const handleCheckin = async () => {
    if (!user || !checkinGroupId) return
    setCheckinSubmitting(true)
    setCheckinError("")
    const supabase = createClient()

    const photoUrls: string[] = []
    for (const file of checkinPhotos) {
      const compressed = await compressImage(file)
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
      const { data, error: uploadErr } = await supabase.storage
        .from("checkin-photos")
        .upload(fileName, compressed, { upsert: false })
      if (uploadErr) {
        setCheckinError("照片上传失败: " + uploadErr.message)
        setCheckinSubmitting(false)
        return
      }
      if (data) {
        const { data: urlData } = supabase.storage.from("checkin-photos").getPublicUrl(data.path)
        photoUrls.push(urlData.publicUrl)
      }
    }

    const { data, error } = await supabase.rpc("insert_checkin", {
      p_user_id: user.id,
      p_group_id: checkinGroupId,
      p_spot_name: loc!.name,
      p_spot_location: loc!.location?.district || "",
      p_content: checkinContent.trim(),
      p_photos: photoUrls,
    })

    if (error) {
      setCheckinError(error.message + " | code: " + error.code)
    } else if (!data || data.length === 0) {
      setCheckinError("Insert returned no data. user_id: " + user.id + " group: " + checkinGroupId)
    } else {
      setCheckinDone(true); setCheckinContent(""); setCheckinPhotos([]); setCheckinPreviews([]); setPhotoKey(k => k + 1)
    }
    setCheckinSubmitting(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (checkinPhotos.length + files.length > 5) {
      setCheckinError("最多 5 张照片")
      e.target.value = ""
      return
    }
    setCheckinPhotos((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = () => setCheckinPreviews((p) => [...p, reader.result as string])
      reader.readAsDataURL(f)
    })
    e.target.value = ""
  }

  if (!loc) notFound()

  const typeInfo = LOCATION_TYPES[loc.type]
  const nearby = locations
    .filter(
      (l) => l.id !== loc.id && l.location.district === loc.location.district
    )
    .sort(
      (a, b) =>
        getDistance(
          loc.location.latitude,
          loc.location.longitude,
          a.location.latitude,
          a.location.longitude
        ) -
        getDistance(
          loc.location.latitude,
          loc.location.longitude,
          b.location.latitude,
          b.location.longitude
        )
    )
    .slice(0, 5)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-500">
          {t("common_home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/locations" className="hover:text-blue-500">
          {t("header_locations")}
        </Link>
        <span className="mx-2">/</span>
        <span>{loc.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold">{loc.name}</h1>
          <button
            onClick={() => toggleFavorite(id)}
            className="text-2xl hover:scale-110 transition-transform"
            aria-label="Toggle favorite"
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>
        <p className="text-lg text-gray-500 mb-3">{loc.nameKo}</p>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white`} style={{ backgroundColor: typeInfo.color }}>
            {TYPE_NAME_CN[loc.type]} / {typeInfo.name}
          </span>
          {loc.groupNames.map((g) => (
            <Link
              key={g}
              href={`/groups/${g.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      {/* Rating */}
      {loc.rating && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="font-semibold">{loc.rating}</span>
        </div>
      )}

      {/* Description */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{t("location_about")}</h2>
        <p className="text-gray-700 leading-relaxed">{loc.description}</p>
        {loc.tips && (
          <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{t("location_tip")} </span>
              {loc.tips}
            </p>
          </div>
        )}
      </section>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Address */}
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <h3 className="font-semibold text-sm mb-1">{t("location_address")}</h3>
          <p className="text-sm text-gray-600">{loc.location.address}</p>
          <p className="text-xs text-gray-400 mt-1">{loc.location.addressKo}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <a
              href={`https://map.kakao.com/link/to/${encodeURIComponent(loc.name)},${loc.location.latitude},${loc.location.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-yellow-400 text-black rounded-lg text-xs font-bold hover:bg-yellow-500 transition"
            >
              KakaoMap
            </a>
            <a
              href={`https://map.naver.com/v5/search/${encodeURIComponent(`${loc.location.latitude},${loc.location.longitude}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition"
            >
              Naver Map
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.location.latitude},${loc.location.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition"
            >
              Google Maps
            </a>
          </div>
        </div>

        {/* Transport */}
        <TransportSection
          transport={loc.transport}
          lat={loc.location.latitude}
          lng={loc.location.longitude}
          name={loc.name}
        />

        {/* Hours */}
        <HoursSection hours={loc.hours} />

        {/* Price */}
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <h3 className="font-semibold text-sm mb-1">{t("location_price")}</h3>
          <p className="text-sm text-gray-600">
            {loc.price.isFree ? t("location_free") : loc.price.range}
          </p>
          {loc.price.note && (
            <p className="text-xs text-gray-400 mt-1">{loc.price.note}</p>
          )}
        </div>

        {/* Duration */}
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <h3 className="font-semibold text-sm mb-1">{t("location_duration")}</h3>
          <p className="text-sm text-gray-600">
            ~{loc.estimatedDuration} {t("location_minutes")}
          </p>
        </div>
      </div>

      {/* Check-in Tips */}
      {loc.checkInTips && loc.checkInTips.length > 0 && (
        <TipsSection tips={loc.checkInTips} />
      )}

      {/* Check-in Form */}
      <section className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
        <p className="text-sm font-semibold text-slate-700 mb-3">
          {t("location_checkin_prompt")}
        </p>
        {!user ? (
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition active:scale-95"
          >
            {t("auth_login_link")}
          </Link>
        ) : checkinDone ? (
          <div className="text-center py-2">
            <p className="text-lg mb-1">🎉</p>
            <p className="text-sm font-bold text-green-600">打卡成功！</p>
            <button onClick={() => setCheckinDone(false)} className="text-xs text-blue-500 mt-2 font-mono underline">再发一条</button>
          </div>
        ) : locGroups.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono">此地点暂无关联团体</p>
        ) : (
          <div className="space-y-3">
            <textarea
              value={checkinContent}
              onChange={(e) => setCheckinContent(e.target.value)}
              placeholder="分享你的打卡感受…"
              rows={2}
              maxLength={300}
              className="w-full px-3 py-2 text-sm border-2 border-blue-200 rounded-xl outline-none focus:border-blue-400 resize-none font-mono"
            />
            {checkinPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {checkinPreviews.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-100">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setCheckinPhotos((prev) => prev.filter((_, idx) => idx !== i))
                        setCheckinPreviews((prev) => prev.filter((_, idx) => idx !== i))
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-white border-2 border-dashed border-blue-200 text-blue-500 hover:border-blue-400 transition">
                📷 添加照片
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              </label>
              <span className="text-[10px] text-slate-300">{checkinPhotos.length}/5</span>
            </div>
            {checkinError && <p className="text-xs text-red-500">{checkinError}</p>}
            <button
              onClick={handleCheckin}
              disabled={checkinSubmitting}
              className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-xl text-sm disabled:opacity-30 hover:bg-blue-600 transition active:scale-[0.98]"
            >
              {checkinSubmitting ? "发布中…" : "📝 打卡"}
            </button>
          </div>
        )}
      </section>

      {/* Fan Photo Wall */}
      <PhotoWall key={photoKey} locationName={loc.name} />

      {/* Nearby */}
      {nearby.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {t("location_nearby")} {loc.location.district}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearby.map((n) => (
              <Link
                key={n.id}
                href={`/locations/${n.id}`}
                className="p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition"
              >
                <p className="font-medium text-sm">{n.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {LOCATION_TYPES[n.type].name} ·{" "}
                  {getDistance(
                    loc.location.latitude,
                    loc.location.longitude,
                    n.location.latitude,
                    n.location.longitude
                  ) < 1000
                    ? `${Math.round(
                        getDistance(
                          loc.location.latitude,
                          loc.location.longitude,
                          n.location.latitude,
                          n.location.longitude
                        )
                      )}m away`
                    : `${(
                        getDistance(
                          loc.location.latitude,
                          loc.location.longitude,
                          n.location.latitude,
                          n.location.longitude
                        ) / 1000
                      ).toFixed(1)}km away`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
