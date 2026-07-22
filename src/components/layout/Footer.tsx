import Link from "next/link"

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="text-sm font-semibold">Kpop Seoul Map</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/locations" className="text-sm text-gray-500 hover:text-purple-600">
              Locations
            </Link>
            <Link href="/groups" className="text-sm text-gray-500 hover:text-purple-600">
              Groups
            </Link>
            <Link href="/planner" className="text-sm text-gray-500 hover:text-purple-600">
              Planner
            </Link>
          </nav>
          <p className="text-xs text-gray-400">
            Discover 170+ Kpop locations across Seoul
          </p>
        </div>
      </div>
    </footer>
  )
}
