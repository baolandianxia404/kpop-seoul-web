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
      {/* Left ear */}
      <rect x="10" y="3" width="4" height="9" fill="#3b82f6" />
      <rect x="10" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="13" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="9" y="4" width="1" height="1" fill="#1d4ed8" />
      <rect x="14" y="4" width="1" height="1" fill="#1d4ed8" />
      <rect x="11" y="5" width="2" height="4" fill="#f9a8d4" />

      {/* Right ear */}
      <rect x="18" y="3" width="4" height="9" fill="#3b82f6" />
      <rect x="18" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="21" y="3" width="1" height="1" fill="#1d4ed8" />
      <rect x="17" y="4" width="1" height="1" fill="#1d4ed8" />
      <rect x="22" y="4" width="1" height="1" fill="#1d4ed8" />
      <rect x="19" y="5" width="2" height="4" fill="#f9a8d4" />

      {/* Round head */}
      <rect x="7" y="11" width="18" height="14" fill="#3b82f6" />
      <rect x="6" y="12" width="20" height="12" fill="#3b82f6" />
      <rect x="5" y="13" width="22" height="10" fill="#3b82f6" />

      {/* Head outline */}
      <rect x="7" y="11" width="1" height="1" fill="#1d4ed8" />
      <rect x="24" y="11" width="1" height="1" fill="#1d4ed8" />
      <rect x="6" y="12" width="1" height="1" fill="#1d4ed8" />
      <rect x="25" y="12" width="1" height="1" fill="#1d4ed8" />
      <rect x="5" y="13" width="1" height="10" fill="#1d4ed8" />
      <rect x="26" y="13" width="1" height="10" fill="#1d4ed8" />
      <rect x="6" y="23" width="1" height="1" fill="#1d4ed8" />
      <rect x="25" y="23" width="1" height="1" fill="#1d4ed8" />
      <rect x="7" y="24" width="18" height="1" fill="#1d4ed8" />

      {/* Head highlight */}
      <rect x="7" y="12" width="4" height="1" fill="#60a5fa" />
      <rect x="6" y="13" width="3" height="1" fill="#60a5fa" />

      {/* Eyes */}
      <rect x="11" y="16" width="3" height="3" fill="#1e293b" />
      <rect x="18" y="16" width="3" height="3" fill="#1e293b" />
      <rect x="11" y="16" width="1" height="1" fill="#ffffff" />
      <rect x="18" y="16" width="1" height="1" fill="#ffffff" />

      {/* Nose */}
      <rect x="15" y="20" width="2" height="1" fill="#f59e0b" />

      {/* Mouth */}
      <rect x="14" y="22" width="1" height="1" fill="#1d4ed8" />
      <rect x="17" y="22" width="1" height="1" fill="#1d4ed8" />
      <rect x="15" y="23" width="2" height="1" fill="#1d4ed8" />
    </svg>
  )
}
