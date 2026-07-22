"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { locations } from "@/lib/data/locations"
import { groups } from "@/lib/data/groups"
import type { Location, Group } from "@/types"

interface Props {
  open: boolean
  onClose: () => void
}

interface SearchResult {
  type: "location" | "group"
  id: string
  title: string
  subtitle: string
}

export default function SearchDialog({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery("")
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const q = query.toLowerCase()
    const locResults: SearchResult[] = locations
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nameKo.includes(q) ||
          l.groupNames.some((g) => g.toLowerCase().includes(q)) ||
          l.location.district.includes(q)
      )
      .slice(0, 5)
      .map((l) => ({
        type: "location" as const,
        id: l.id,
        title: l.name,
        subtitle: `${l.location.district} · ${l.groupNames.slice(0, 2).join(", ")}`,
      }))

    const groupResults: SearchResult[] = groups
      .filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.nameKo.includes(q) ||
          g.company.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((g) => ({
        type: "group" as const,
        id: g.id,
        title: g.name,
        subtitle: g.company,
      }))

    setResults([...locResults, ...groupResults].slice(0, 8))
  }, [query])

  const handleSelect = (r: SearchResult) => {
    onClose()
    router.push(r.type === "location" ? `/locations/${r.id}` : `/groups/${r.id}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/40" onClick={onClose}>
      <div
        className="absolute top-0 left-0 right-0 bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search locations, groups..."
              className="flex-1 outline-none text-sm"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
              ESC
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="text-sm">
                    {r.type === "location" ? "📍" : "💜"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No results found</p>
          )}
        </div>
      </div>
    </div>
  )
}
