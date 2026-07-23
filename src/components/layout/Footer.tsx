import Link from "next/link"

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-blue-50 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs gradient-cute">
              K
            </div>
            <span className="text-sm font-semibold">
              <span className="text-blue-500">Kpop</span>{" "}
              <span className="text-amber-500">Seoul</span>{" "}
              <span className="text-gray-400 font-normal">Map</span>
            </span>
          </div>
          <nav className="flex gap-6">
            <Link href="/locations" className="text-sm text-gray-400 hover:text-blue-500 transition">
              Locations
            </Link>
            <Link href="/groups" className="text-sm text-gray-400 hover:text-blue-500 transition">
              Groups
            </Link>
            <Link href="/planner" className="text-sm text-gray-400 hover:text-blue-500 transition">
              Planner
            </Link>
          </nav>
          <p className="text-xs text-gray-400">
            💜 Discover 190+ Kpop locations across Seoul
          </p>
        </div>
      </div>
    </footer>
  )
}
