import Link from "next/link"

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-lg font-semibold mb-2">Page not found</h2>
      <p className="text-sm text-gray-500 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
      >
        Back to Map
      </Link>
    </div>
  )
}
