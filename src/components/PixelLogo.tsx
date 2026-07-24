export default function PixelLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {/* Body / background */}
      <rect x="1" y="1" width="30" height="30" fill="#3b82f6" />

      {/* Left ear */}
      <rect x="7" y="1" width="6" height="10" fill="#3b82f6" />
      <rect x="6" y="2" width="8" height="8" fill="#3b82f6" />
      <rect x="6" y="1" width="1" height="1" fill="#1d4ed8" />
      <rect x="12" y="1" width="1" height="1" fill="#1d4ed8" />
      <rect x="5" y="2" width="1" height="2" fill="#1d4ed8" />
      <rect x="13" y="2" width="1" height="2" fill="#1d4ed8" />
      <rect x="9" y="3" width="3" height="5" fill="#f9a8d4" />

      {/* Right ear */}
      <rect x="19" y="1" width="6" height="10" fill="#3b82f6" />
      <rect x="18" y="2" width="8" height="8" fill="#3b82f6" />
      <rect x="18" y="1" width="1" height="1" fill="#1d4ed8" />
      <rect x="24" y="1" width="1" height="1" fill="#1d4ed8" />
      <rect x="17" y="2" width="1" height="2" fill="#1d4ed8" />
      <rect x="25" y="2" width="1" height="2" fill="#1d4ed8" />
      <rect x="20" y="3" width="3" height="5" fill="#f9a8d4" />

      {/* Head */}
      <rect x="6" y="10" width="20" height="16" fill="#3b82f6" />
      <rect x="4" y="11" width="24" height="14" fill="#3b82f6" />
      <rect x="5" y="10" width="22" height="1" fill="#60a5fa" />
      <rect x="4" y="11" width="24" height="1" fill="#60a5fa" />
      <rect x="4" y="12" width="24" height="1" fill="#93c5fd" />

      {/* Head outline */}
      <rect x="5" y="10" width="1" height="2" fill="#1d4ed8" />
      <rect x="26" y="10" width="1" height="2" fill="#1d4ed8" />
      <rect x="3" y="11" width="1" height="1" fill="#1d4ed8" />
      <rect x="28" y="11" width="1" height="1" fill="#1d4ed8" />
      <rect x="3" y="12" width="1" height="12" fill="#1d4ed8" />
      <rect x="28" y="12" width="1" height="12" fill="#1d4ed8" />
      <rect x="4" y="24" width="24" height="1" fill="#1d4ed8" />
      <rect x="5" y="25" width="22" height="1" fill="#1d4ed8" />

      {/* Cheeks */}
      <rect x="6" y="17" width="4" height="3" fill="#ffffff" />
      <rect x="22" y="17" width="4" height="3" fill="#ffffff" />
      <rect x="5" y="18" width="1" height="2" fill="#ffffff" />
      <rect x="26" y="18" width="1" height="2" fill="#ffffff" />

      {/* Blush */}
      <rect x="8" y="20" width="2" height="2" fill="#fca5a5" />
      <rect x="22" y="20" width="2" height="2" fill="#fca5a5" />

      {/* Eyes */}
      <rect x="11" y="15" width="4" height="4" fill="#1e293b" />
      <rect x="11" y="15" width="1" height="1" fill="#ffffff" />
      <rect x="14" y="16" width="1" height="1" fill="#ffffff" />
      <rect x="17" y="15" width="4" height="4" fill="#1e293b" />
      <rect x="17" y="15" width="1" height="1" fill="#ffffff" />
      <rect x="20" y="16" width="1" height="1" fill="#ffffff" />

      {/* Nose */}
      <rect x="15" y="19" width="2" height="1" fill="#f59e0b" />
      <rect x="14" y="20" width="4" height="1" fill="#f59e0b" />

      {/* Mouth */}
      <rect x="13" y="22" width="2" height="1" fill="#1d4ed8" />
      <rect x="17" y="22" width="2" height="1" fill="#1d4ed8" />
      <rect x="15" y="23" width="2" height="1" fill="#1d4ed8" />

      {/* Whiskers */}
      <rect x="2" y="19" width="2" height="1" fill="#60a5fa" />
      <rect x="2" y="21" width="2" height="1" fill="#60a5fa" />
      <rect x="28" y="19" width="2" height="1" fill="#60a5fa" />
      <rect x="28" y="21" width="2" height="1" fill="#60a5fa" />
    </svg>
  )
}
