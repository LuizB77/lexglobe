import { useState } from 'react'
import { generateChecklist } from '../../utils/checklistTemplates'
import { saveTrip } from '../../utils/tripStorage'

const COUNTRIES = [
  { code: 'BR', label: 'Brazil 🇧🇷' },
  { code: 'PT', label: 'Portugal 🇵🇹' },
  { code: 'ES', label: 'Spain 🇪🇸' },
  { code: 'US', label: 'USA 🇺🇸' },
]

const TRIP_TYPES = [
  { value: 'tourism', label: 'Tourism' },
  { value: 'moving', label: 'Moving Permanently' },
  { value: 'study', label: 'Study' },
  { value: 'work', label: 'Work' },
]

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.85)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}

const modalCard = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '24px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
}

export default function TripPlannerModal({ isOpen, onClose, defaultDestination, onSave }) {
  const [destination, setDestination] = useState(defaultDestination || 'US')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [tripType, setTripType] = useState('tourism')
  const [passportExpiry, setPassportExpiry] = useState('')
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  function validate() {
    const e = {}
    if (!destination) e.destination = 'Please select a destination'
    if (!departureDate) e.departureDate = 'Please enter a departure date'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const checklist = generateChecklist(destination, tripType)
    saveTrip({ destination, departureDate, returnDate, tripType, passportExpiry, checklist })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-md p-8"
        style={{ ...modalCard, animation: 'authSlideUp 0.3s ease-out' }}
      >
        <style>{`
          @keyframes authSlideUp {
            from { transform: translateY(24px) scale(0.97); opacity: 0; }
            to   { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center
            rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all text-lg"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Plan a Trip</h2>
          <p className="text-sm text-white/50 mt-1">Save your trip and get a personalized checklist</p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Destination */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1.5">
              Destination
            </label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              style={{ ...inputStyle, background: 'rgba(255,255,255,0.07)' }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: '#0d1117' }}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.destination && (
              <p className="text-red-400 text-xs mt-1">{errors.destination}</p>
            )}
          </div>

          {/* Departure date */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1.5">
              Departure Date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              style={inputStyle}
            />
            {errors.departureDate && (
              <p className="text-red-400 text-xs mt-1">{errors.departureDate}</p>
            )}
          </div>

          {/* Return date */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1.5">
              Return Date <span className="normal-case text-white/30">(optional)</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Trip type */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1.5">
              Trip Type
            </label>
            <select
              value={tripType}
              onChange={e => setTripType(e.target.value)}
              style={{ ...inputStyle, background: 'rgba(255,255,255,0.07)' }}
            >
              {TRIP_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#0d1117' }}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Passport expiry */}
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-1.5">
              Passport Expiry <span className="normal-case text-white/30">(for expiry alerts)</span>
            </label>
            <input
              type="date"
              value={passportExpiry}
              onChange={e => setPassportExpiry(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.70)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: 'rgba(107,140,174,0.15)',
              border: '1px solid rgba(107,140,174,0.50)',
              color: '#6B8CAE',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(107,140,174,0.15)')}
          >
            Save Trip
          </button>
        </div>
      </div>
    </div>
  )
}
