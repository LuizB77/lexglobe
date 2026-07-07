import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'
import TripPlannerModal from '../components/travel/TripPlannerModal'
import TripCard from '../components/travel/TripCard'
import { travelPackets } from '../data/travelPackets'
import { getTrips, deleteTrip, updateTrip } from '../utils/tripStorage'

const COUNTRIES = [
  { code: 'BR', label: 'Brazil 🇧🇷' },
  { code: 'PT', label: 'Portugal 🇵🇹' },
  { code: 'ES', label: 'Spain 🇪🇸' },
  { code: 'US', label: 'USA 🇺🇸' },
]

const COUNTRY_FLAGS = { BR: '🇧🇷', PT: '🇵🇹', ES: '🇪🇸', US: '🇺🇸' }
const COUNTRY_NAMES = { BR: 'Brazil', PT: 'Portugal', ES: 'Spain', US: 'USA' }

const BUTTON_STYLE = {
  background: 'rgba(107,140,174,0.15)',
  border: '1px solid rgba(107,140,174,0.50)',
  color: '#6B8CAE',
}

function BackButton({ navigate }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors"
      style={{ color: 'rgba(255,255,255,0.45)' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#6B8CAE')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      onClick={() => navigate('/travel')}
    >
      ← Back to Travel
    </button>
  )
}

function SelectInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-white/50 text-xs uppercase tracking-widest mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code} style={{ background: '#0d1117' }}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TripRow({ trip, expanded, onToggle, onDelete, onToggleItem }) {
  const done = trip.checklist?.filter(i => i.done).length ?? 0
  const total = trip.checklist?.length ?? 0
  const flag = COUNTRY_FLAGS[trip.destination] || '🌍'
  const name = COUNTRY_NAMES[trip.destination] || trip.destination

  const dep = trip.departureDate
    ? new Date(trip.departureDate + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })
    : null
  const ret = trip.returnDate
    ? new Date(trip.returnDate + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })
    : null

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          background: expanded ? 'rgba(107,140,174,0.10)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${expanded ? 'rgba(107,140,174,0.30)' : 'rgba(255,255,255,0.08)'}`,
        }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
      >
        <span className="text-xl flex-shrink-0">{flag}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          {dep && (
            <p className="text-xs text-white/40 mt-0.5">
              {dep}{ret ? ` – ${ret}` : ''}
            </p>
          )}
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(done / total) * 100}%`, background: '#6B8CAE' }}
              />
            </div>
            <span className="text-xs text-white/40">{done}/{total}</span>
          </div>
        )}
        <span className="text-white/30 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-2 mb-1">
          <TripCard
            trip={trip}
            onDelete={onDelete}
            onToggleChecklistItem={onToggleItem}
          />
        </div>
      )}
    </div>
  )
}

export default function TravelPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { origin, destination } = useParams()

  const [originVal, setOriginVal] = useState('BR')
  const [destVal, setDestVal] = useState('US')
  const [trips, setTrips] = useState(() => getTrips())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDefaultDestination, setModalDefaultDestination] = useState(null)
  const [expandedTripId, setExpandedTripId] = useState(null)

  useEffect(() => {
    if (location.state?.openPlanner) {
      setModalDefaultDestination(location.state.destination || null)
      setIsModalOpen(true)
      navigate('/travel', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  function refreshTrips() {
    setTrips(getTrips())
  }

  function handleDeleteTrip(id) {
    deleteTrip(id)
    setExpandedTripId(prev => prev === id ? null : prev)
    refreshTrips()
  }

  function handleToggleChecklistItem(tripId, itemId) {
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    const checklist = trip.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    )
    updateTrip(tripId, { checklist })
    refreshTrips()
  }

  function openPlanner(defaultDest = null) {
    setModalDefaultDestination(defaultDest)
    setIsModalOpen(true)
  }

  // ── Packet view ───────────────────────────────────────────────────────────
  if (origin && destination) {
    const key = `${origin.toUpperCase()}-${destination.toUpperCase()}`
    const packet = travelPackets[key]

    if (!packet) {
      return (
        <PageBackground>
          <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">
            <BackButton navigate={navigate} />
            <GlassCard className="p-10 text-center">
              <p className="text-white/50 text-sm mb-6">
                Packet not available yet for this route
              </p>
              <button
                className="px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
                style={BUTTON_STYLE}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.15)')}
                onClick={() => navigate('/travel')}
              >
                ← Back to Travel
              </button>
            </GlassCard>
          </div>
        </PageBackground>
      )
    }

    return (
      <PageBackground>
        <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
          <BackButton navigate={navigate} />

          <div className="mb-8">
            <p className="text-2xl mb-2">{packet.flagFrom} → {packet.flagTo}</p>
            <h1 className="text-3xl font-black" style={{ color: '#f5f5f0' }}>
              {packet.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {packet.sections.map(section => (
              <GlassCard key={section.label} className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl flex-shrink-0">{section.icon}</span>
                  <span
                    className="font-bold text-sm uppercase tracking-wide pt-1"
                    style={{ color: '#6B8CAE' }}
                  >
                    {section.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,240,0.80)' }}>
                  {section.body}
                </p>
              </GlassCard>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              className="px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
              style={BUTTON_STYLE}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.15)')}
              onClick={() =>
                navigate('/travel', {
                  state: { openPlanner: true, destination: destination.toUpperCase() },
                })
              }
            >
              + Plan This Trip
            </button>
          </div>
        </div>
      </PageBackground>
    )
  }

  // ── Landing view ──────────────────────────────────────────────────────────
  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">

        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ color: '#f5f5f0' }}>Travel</h1>
          <p className="text-white/50 text-sm">Legal reference for your journey</p>
        </div>

        {/* Step 1 — Packet selector */}
        <GlassCard className="p-6 mb-8">
          <h2 className="font-bold text-white text-base mb-5">Where are you headed?</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <SelectInput label="From" value={originVal} onChange={setOriginVal} />
            <SelectInput label="To" value={destVal} onChange={setDestVal} />
          </div>
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={BUTTON_STYLE}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.15)')}
            onClick={() => navigate(`/travel/${originVal}/${destVal}`)}
          >
            Get Legal Packet →
          </button>
        </GlassCard>

        {/* Your Trips */}
        {trips.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-widest text-white/40 font-medium">
                Your Trips
              </h2>
              <button
                onClick={() => openPlanner(null)}
                className="text-xs transition-colors"
                style={{ color: '#6B8CAE' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                + Plan a trip
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {trips.map(trip => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  expanded={expandedTripId === trip.id}
                  onToggle={() => setExpandedTripId(prev => prev === trip.id ? null : trip.id)}
                  onDelete={handleDeleteTrip}
                  onToggleItem={handleToggleChecklistItem}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
            or{' '}
            <button
              onClick={() => openPlanner(null)}
              className="underline underline-offset-2 transition-colors"
              style={{ color: 'rgba(107,140,174,0.70)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6B8CAE')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(107,140,174,0.70)')}
            >
              plan a trip without a packet →
            </button>
          </p>
        )}
      </div>

      <TripPlannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDestination={modalDefaultDestination}
        onSave={refreshTrips}
      />
    </PageBackground>
  )
}
