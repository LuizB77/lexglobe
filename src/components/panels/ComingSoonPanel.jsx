import { useState } from 'react'

export default function ComingSoonPanel({ country, onClose }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!email.includes('@')) return
    const existing = JSON.parse(localStorage.getItem('lexglobe_waitlist') || '[]')
    localStorage.setItem('lexglobe_waitlist', JSON.stringify([...existing, { email, country: country.code }]))
    setSubmitted(true)
  }

  return (
    <div
      className="absolute right-0 top-0 h-full w-full sm:w-96 z-30
        bg-space/95 backdrop-blur-md border-l border-white/10
        flex flex-col shadow-2xl"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{country.name}</h2>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs
              bg-white/10 text-white/50 border border-white/10">
              Coming Soon
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full
            text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-5xl">🌐</div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {country.name} is on our roadmap
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            We're working on bringing {country.name}'s legal codes to LexGlobe.
            Join the waitlist to be notified when it launches.
          </p>
        </div>

        {!submitted ? (
          <div className="w-full flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-white/30 text-sm
                focus:outline-none focus:border-brand/60"
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold
                hover:bg-white/20 transition-colors text-sm border border-white/10"
            >
              Notify Me
            </button>
          </div>
        ) : (
          <div className="w-full py-4 rounded-xl bg-brand/10 border border-brand/30
            text-brand text-sm text-center font-medium">
            ✓ You're on the list for {country.name}
          </div>
        )}
      </div>
    </div>
  )
}
