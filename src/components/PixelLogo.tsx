export default function PixelLogo({ size = 36 }: { size?: number }) {
  const s = size / 32
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {/* Map pin shadow */}
      <rect x="16" y="19" width="1" height="1" fill="#1d4ed8" />
      <rect x="15" y="20" width="1" height="1" fill="#1d4ed8" />
      <rect x="14" y="21" width="1" height="1" fill="#1d4ed8" />
      <rect x="14" y="22" width="1" height="1" fill="#1d4ed8" />
      <rect x="13" y="23" width="1" height="1" fill="#1d4ed8" />

      {/* Map pin body */}
      <rect x="11" y="2" width="10" height="1" fill="#3b82f6" />
      <rect x="9" y="3" width="14" height="1" fill="#3b82f6" />
      <rect x="7" y="4" width="18" height="1" fill="#3b82f6" />
      <rect x="6" y="5" width="20" height="2" fill="#3b82f6" />
      <rect x="5" y="7" width="22" height="9" fill="#3b82f6" />
      <rect x="6" y="16" width="20" height="2" fill="#3b82f6" />
      <rect x="8" y="18" width="16" height="1" fill="#3b82f6" />
      <rect x="10" y="19" width="12" height="1" fill="#3b82f6" />
      <rect x="12" y="20" width="8" height="1" fill="#3b82f6" />
      <rect x="13" y="21" width="6" height="1" fill="#3b82f6" />
      <rect x="14" y="22" width="4" height="1" fill="#3b82f6" />
      <rect x="15" y="23" width="2" height="1" fill="#3b82f6" />
      <rect x="16" y="24" width="1" height="1" fill="#3b82f6" />

      {/* Pin border (dark blue) */}
      <rect x="10" y="2" width="1" height="1" fill="#1d4ed8" />
      <rect x="9" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="8" y="4" width="1" height="1" fill="#1d4ed8" />
      <rect x="7" y="5" width="1" height="2" fill="#1d4ed8" />
      <rect x="6" y="7" width="1" height="9" fill="#1d4ed8" />
      <rect x="5" y="16" width="1" height="2" fill="#1d4ed8" />
      <rect x="22" y="5" width="1" height="2" fill="#1d4ed8" />
      <rect x="23" y="7" width="1" height="2" fill="#1d4ed8" />
      <rect x="24" y="9" width="1" height="2" fill="#1d4ed8" />
      <rect x="21" y="2" width="1" height="1" fill="#1d4ed8" />
      <rect x="23" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="25" y="4" width="1" height="1" fill="#1d4ed8" />

      {/* Highlight */}
      <rect x="7" y="5" width="3" height="1" fill="#60a5fa" />
      <rect x="6" y="7" width="2" height="2" fill="#60a5fa" />
      <rect x="5" y="9" width="2" height="1" fill="#2563eb" />

      {/* Heart */}
      <rect x="11" y="9" width="3" height="1" fill="#f59e0b" />
      <rect x="17" y="9" width="3" height="1" fill="#f59e0b" />
      <rect x="10" y="10" width="5" height="1" fill="#f59e0b" />
      <rect x="16" y="10" width="5" height="1" fill="#f59e0b" />
      <rect x="9" y="11" width="6" height="1" fill="#f59e0b" />
      <rect x="15" y="11" width="6" height="1" fill="#f59e0b" />
      <rect x="9" y="12" width="13" height="1" fill="#fbbf24" />
      <rect x="10" y="13" width="11" height="1" fill="#f59e0b" />
      <rect x="11" y="14" width="9" height="1" fill="#f59e0b" />
      <rect x="13" y="15" width="5" height="1" fill="#f59e0b" />
      <rect x="15" y="16" width="1" height="1" fill="#d97706" />

      {/* Heart highlight */}
      <rect x="10" y="10" width="1" height="1" fill="#fbbf24" />
      <rect x="9" y="11" width="1" height="1" fill="#fbbf24" />

      {/* Sparkles */}
      <rect x="24" y="2" width="2" height="1" fill="#fbbf24" />
      <rect x="25" y="1" width="1" height="1" fill="#f59e0b" />
      <rect x="25" y="3" width="1" height="1" fill="#f59e0b" />
      <rect x="2" y="12" width="1" height="2" fill="#fbbf24" />
      <rect x="3" y="13" width="2" height="1" fill="#f59e0b" />
    </svg>
  )
}
