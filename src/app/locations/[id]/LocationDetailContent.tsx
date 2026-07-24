"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { getLocationById, locations } from "@/lib/data/locations"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import { getDistance } from "@/lib/utils/distance"
import TransportSection from "@/components/location/TransportSection"
import HoursSection from "@/components/location/HoursSection"
import TipsSection from "@/components/location/TipsSection"
import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"
import { isFavorite, toggleFavorite } from "@/lib/store/favorites"

interface Props {
  id: string
}

export default function LocationDetailContent({ id }: Props) {
  const { t } = useLang()
  const loc = getLocationById(id)
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(id))
  }, [id])

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
            onClick={() => setFav(toggleFavorite(id))}
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
