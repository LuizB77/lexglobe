import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

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

export default function TravelPage() {
  const navigate = useNavigate()
  const { origin, destination } = useParams()

  const [originVal, setOriginVal] = useState('BR')
  const [destVal, setDestVal] = useState('US')

  if (origin && destination) {
    return (
      <PageBackground>
        <div className="max-w-2xl mx-auto px-4 pt-20 pb-16 flex flex-col items-center justify-center min-h-screen">
          <GlassCard className="p-10 text-center w-full">
            <h1
              className="text-2xl font-black mb-6"
              style={{ color: '#f5f5f0' }}
            >
              Packet: {origin} → {destination}
            </h1>
            <button
              className="px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all"
              style={BUTTON_STYLE}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,134,11,0.15)'}
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
        <div className="mb-8">
          <h1
            className="text-3xl font-black mb-2"
            style={{ color: '#f5f5f0' }}
          >
            Travel
          </h1>
          <p className="text-white/60 text-sm">
            Get a legal arrival packet and plan your trip
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
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
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,134,11,0.15)'}
              onClick={() => navigate(`/travel/${originVal}/${destVal}`)}
            >
              Get Packet
            </button>
          </GlassCard>

          {/* Card 2 — My Trips */}
          <GlassCard className="p-6 flex-1 flex flex-col">
            <h2 className="font-bold text-white text-base mb-4">My Trips</h2>
            <p className="text-white/40 text-sm flex-1">No trips saved yet</p>
            <button
              className="w-full py-2.5 rounded-full text-sm font-semibold uppercase tracking-wide transition-all mt-6"
              style={BUTTON_STYLE}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,134,11,0.15)'}
            >
              + Plan a Trip
            </button>
          </GlassCard>
        </div>
      </div>
    </PageBackground>
  )
}
