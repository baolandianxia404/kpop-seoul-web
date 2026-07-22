export default function HoursSection({
  hours,
}: {
  hours: {
    weekday?: string
    weekend?: string
    closed?: string
    note?: string
  }
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <h3 className="font-semibold text-sm mb-2">Opening Hours</h3>
      {hours.weekday && (
        <p className="text-sm text-gray-600">
          <span className="text-xs text-gray-400">Weekdays: </span>
          {hours.weekday}
        </p>
      )}
      {hours.weekend && (
        <p className="text-sm text-gray-600">
          <span className="text-xs text-gray-400">Weekends: </span>
          {hours.weekend}
        </p>
      )}
      {hours.closed && (
        <p className="text-sm text-red-600 mt-1">
          <span className="text-xs text-gray-400">Closed: </span>
          {hours.closed}
        </p>
      )}
      {hours.note && (
        <p className="text-xs text-gray-400 mt-2">{hours.note}</p>
      )}
    </div>
  )
}
