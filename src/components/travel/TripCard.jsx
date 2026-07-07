import GlassCard from '../ui/GlassCard'

const COUNTRY_META = {
  BR: { label: 'Brazil', flag: '🇧🇷' },
  PT: { label: 'Portugal', flag: '🇵🇹' },
  ES: { label: 'Spain', flag: '🇪🇸' },
  US: { label: 'USA', flag: '🇺🇸' },
}

const TRIP_TYPE_LABELS = {
  tourism: 'Tourism',
  moving: 'Moving',
  study: 'Study',
  work: 'Work',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function passportWarning(passportExpiry, returnDate) {
  if (!passportExpiry) return null
  const expiry = new Date(passportExpiry + 'T12:00:00')
  // Passport must be valid 6 months beyond the return date (or today if no return date)
  const baseline = returnDate ? new Date(returnDate + 'T12:00:00') : new Date()
  const sixMonthsOut = new Date(baseline)
  sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6)
  if (expiry < sixMonthsOut) {
    return formatDate(passportExpiry)
  }
  return null
}

export default function TripCard({ trip, onDelete, onToggleChecklistItem }) {
  const country = COUNTRY_META[trip.destination] || { label: trip.destination, flag: '🌍' }
  const expiryWarning = passportWarning(trip.passportExpiry, trip.returnDate)

  return (
    <GlassCard className="p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{country.flag}</span>
            <span className="font-bold text-white text-base">{country.label}</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(107,140,174,0.15)',
                border: '1px solid rgba(107,140,174,0.35)',
                color: '#6B8CAE',
              }}
            >
              {TRIP_TYPE_LABELS[trip.tripType] || trip.tripType}
            </span>
          </div>
          <p className="text-xs text-white/40">
            {formatDate(trip.departureDate)}
            {trip.returnDate ? ` – ${formatDate(trip.returnDate)}` : ''}
          </p>
        </div>
        <button
          onClick={() => onDelete(trip.id)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full
            text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm"
          title="Delete trip"
        >
          🗑
        </button>
      </div>

      {/* Passport expiry warning */}
      {expiryWarning && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3 text-xs leading-snug"
          style={{
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.30)',
            color: '#fca5a5',
          }}
        >
          <span className="flex-shrink-0">⚠️</span>
          <span>
            Passport expires {expiryWarning} — may not be valid for this trip (needs 6mo+ validity beyond return date)
          </span>
        </div>
      )}

      {/* Checklist */}
      {trip.checklist?.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {trip.checklist.map(item => (
            <label
              key={item.id}
              className="flex items-start gap-2.5 cursor-pointer group"
              onClick={() => onToggleChecklistItem(trip.id, item.id)}
            >
              <div
                className="flex-shrink-0 w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-all"
                style={{
                  background: item.done ? 'rgba(107,140,174,0.25)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${item.done ? 'rgba(107,140,174,0.60)' : 'rgba(255,255,255,0.20)'}`,
                }}
              >
                {item.done && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#6B8CAE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                className="text-xs leading-relaxed transition-all"
                style={{
                  color: item.done ? '#6B8CAE' : 'rgba(245,245,240,0.75)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  opacity: item.done ? 0.65 : 1,
                }}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
