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

const BUTTON_STYLE = {
  background: 'rgba(184,134,11,0.15)',
  border: '1px solid rgba(184,134,11,0.50)',
  color: '#B8860B',
}

function BackButton({ navigate }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors"
      style={{ color: 'rgba(255,255,255,0.45)' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#B8860B')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      onClick={() => navigate('/travel')}
    >
      ← Back to Travel
    </button>
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

  // Handle navigation state from packet "Plan This Trip" button
  useEffect(() => {
    if (location.state?.openPlanner) {
      setModalDefaultDestination(location.state.destination || null)
      setIsModalOpen(true)
      // Clear state so re-renders don't re-open
      navigate('/travel', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  function refreshTrips() {
    setTrips(getTrips())
  }

  function handleDeleteTrip(id) {
    deleteTrip(id)
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
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.15)')}
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
                    style={{ color: '#B8860B' }}
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
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.15)')}
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
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2" style={{ color: '#f5f5f0' }}>
            Travel
          </h1>
          <p className="text-white/60 text-sm">
            Get a legal arrival packet and plan your trip
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Card 1 — Legal Arrival Packet */}
          <GlassCard className="p-6 flex-1">
            <h2 className="font-bold text-white text-base mb-4">Legal Arrival Packet</h2>

            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1">
              From
            </label>
            <select
              value={originVal}
              onChange={e => setOriginVal(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-4 outline-none"
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

            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1">
              To
            </label>
            <select
              value={destVal}
              onChange={e => setDestVal(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm mb-6 outline-none"
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

            <button
              className="w-full py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
              style={BUTTON_STYLE}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.15)')}
              onClick={() => navigate(`/travel/${originVal}/${destVal}`)}
            >
              Get Packet
            </button>
          </GlassCard>

          {/* Card 2 — My Trips */}
          <GlassCard className="p-6 flex-1 flex flex-col">
            <h2 className="font-bold text-white text-base mb-4">My Trips</h2>

            {trips.length === 0 ? (
              <p className="text-white/40 text-sm flex-1 mb-6">No trips saved yet</p>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                {trips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={handleDeleteTrip}
                    onToggleChecklistItem={handleToggleChecklistItem}
                  />
                ))}
              </div>
            )}

            <button
              className="w-full py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
              style={BUTTON_STYLE}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.15)')}
              onClick={() => openPlanner(null)}
            >
              + Plan a Trip
            </button>
          </GlassCard>
        </div>
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
