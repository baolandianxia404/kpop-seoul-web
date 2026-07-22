"use client"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">😵</p>
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
      >
        Try again
      </button>
    </div>
  )
}
