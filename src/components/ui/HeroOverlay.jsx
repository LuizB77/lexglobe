import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const TAGLINES = [
  { lang: 'en', text: "Moving countries shouldn't mean losing track of your rights" },
  { lang: 'pt', text: 'Mudar de país não deveria significar perder seus direitos' },
  { lang: 'es', text: 'Cambiar de país no debería significar perder tus derechos' },
]

export default function HeroOverlay({ onDismiss }) {
  const { user } = useAuth()
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length)
        setFading(false)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    setTimeout(onDismiss, 600)
  }

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center
        pointer-events-none"
      style={{
        opacity: dismissed ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Card */}
      <div
        className="relative pointer-events-auto flex flex-col items-center text-center
          p-8 rounded-3xl max-w-md w-full mx-4"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)',
        }}
      >
        {/* Title */}
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          LexGlobe
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-white/60 mb-5 max-w-xs leading-relaxed">
          Legal answers across Brazil, Portugal, Spain & the US —
          explained in plain language, in your language.
        </p>

        {/* Cycling tagline */}
        <p
          className="text-lg font-medium mb-2 px-2 leading-snug"
          style={{
            color: '#B8860B',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.4s ease',
            minHeight: '3rem',
          }}
        >
          {TAGLINES[taglineIndex].text}
        </p>

        {/* Language dots */}
        <div className="flex gap-2 mb-6">
          {TAGLINES.map((t, i) => (
            <div
              key={t.lang}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === taglineIndex ? '#B8860B' : 'rgba(255,255,255,0.25)',
                transform: i === taglineIndex ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Country + feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['🇧🇷 Brazil', '🇵🇹 Portugal', '🇪🇸 Spain', '🇺🇸 USA', '✦ Plain-Language AI'].map(badge => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full text-xs text-white/80"
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          className="w-full py-3 rounded-xl border border-[#B8860B]/60 bg-[#B8860B]/15
            text-[#B8860B] font-semibold hover:bg-[#B8860B]/25 hover:border-[#B8860B]/80
            transition-all backdrop-blur-sm mb-3"
        >
          Explore the Globe →
        </button>

        {/* Bottom text */}
        {user ? (
          <p className="text-xs text-white/30">
            Welcome back, {user.name.split(' ')[0]} 👋
          </p>
        ) : (
          <p className="text-xs text-white/30">
            Free to explore · Sign in to save articles
          </p>
        )}

        {/* Dismiss X */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center
            rounded-full text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
