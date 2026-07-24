"use client"

import { useLang } from "@/components/LanguageProvider"

interface TransportProps {
  transport: {
    subway?: { line: string; station: string; exit: string; walkingMinutes: number }
    bus?: string[]
    note?: string
  }
  lat?: number
  lng?: number
  name?: string
}

export default function TransportSection({ transport, lat, lng, name }: TransportProps) {
  const { t } = useLang()
  const mapApps = lat && lng ? [
    {
      label: "KakaoMap",
      url: `https://map.kakao.com/link/to/${encodeURIComponent(name || "destination")},${lat},${lng}`,
      color: "bg-yellow-400 text-black",
    },
    {
      label: "Naver Map",
      url: `https://map.naver.com/v5/search/${encodeURIComponent(`${lat},${lng}`)}`,
      color: "bg-green-500 text-white",
    },
    {
      label: "Google Maps",
      url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      color: "bg-blue-500 text-white",
    },
  ] : []

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <h3 className="font-semibold text-sm mb-2">{t("location_transport")}</h3>
      {transport.subway ? (
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium mr-1">
              {t("location_metro")}
            </span>
            {transport.subway.line} · {transport.subway.station}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t("location_exit")} {transport.subway.exit} · {t("location_walk")} {transport.subway.walkingMinutes} min
          </p>
        </div>
      ) : null}
      {transport.bus && transport.bus.length > 0 ? (
        <p className="text-sm text-gray-600">
          <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium mr-1">
            {t("location_bus")}
          </span>
          {transport.bus.join(", ")}
        </p>
      ) : null}
      {transport.note ? (
        <p className="text-xs text-gray-400 mt-2">{transport.note}</p>
      ) : null}

      {mapApps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-mono w-full mb-0.5">{t("location_navigate")}</span>
          {mapApps.map((app) => (
            <a
              key={app.label}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono ${app.color} hover:opacity-80 transition`}
            >
              {app.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
