export default function TipsSection({ tips }: { tips: string[] }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Check-in Tips</h2>
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-purple-500 flex-shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
