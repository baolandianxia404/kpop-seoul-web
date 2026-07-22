export default function TransportSection({
  transport,
}: {
  transport: {
    subway?: { line: string; station: string; exit: string; walkingMinutes: number }
    bus?: string[]
    note?: string
  }
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <h3 className="font-semibold text-sm mb-2">Transport</h3>
      {transport.subway ? (
        <div className="mb-2">
          <p className="text-sm text-gray-600">
            <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium mr-1">
              Metro
            </span>
            {transport.subway.line} · {transport.subway.station}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Exit {transport.subway.exit} · Walk {transport.subway.walkingMinutes} min
          </p>
        </div>
      ) : null}
      {transport.bus && transport.bus.length > 0 ? (
        <p className="text-sm text-gray-600">
          <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium mr-1">
            Bus
          </span>
          {transport.bus.join(", ")}
        </p>
      ) : null}
      {transport.note ? (
        <p className="text-xs text-gray-400 mt-2">{transport.note}</p>
      ) : null}
    </div>
  )
}
