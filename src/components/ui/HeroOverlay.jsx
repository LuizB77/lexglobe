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

  // Cycle through taglines every 2.5 seconds
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
      className="absolute inset-0 z-30 flex flex-col items-center
        justify-center pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(245,245,240,0.15) 0%, rgba(245,245,240,0.5) 60%, rgba(245,245,240,0.85) 100%)',
        opacity: dismissed ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Content card */}
      <div
        className="pointer-events-auto flex flex-col items-center text-center
          px-8 py-10 rounded-3xl max-w-lg mx-4"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        }}
      >
        {/* Logo */}
        <div className="text-5xl mb-4">🌐</div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
          LexGlobe
        </h1>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          Legal answers across Brazil, Portugal, Spain & the US —
          explained in plain language, in your language.
        </p>

        {/* Cycling tagline */}
        <p
          className="text-lg sm:text-xl font-medium mb-2 transition-opacity duration-400"
          style={{
            color: '#7F77DD',
            opacity: fading ? 0 : 1,
            minHeight: '2rem',
          }}
        >
          {TAGLINES[taglineIndex].text}
        </p>

        {/* Language indicator dots */}
        <div className="flex gap-2 mb-6">
          {TAGLINES.map((t, i) => (
            <div
              key={t.lang}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === taglineIndex ? '#7F77DD' : '#d1d5db',
                transform: i === taglineIndex ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            '🇧🇷 Brazil',
            '🇵🇹 Portugal',
            '🇪🇸 Spain',
            '🇺🇸 USA',
            '✦ Plain-Language AI',
          ].map(badge => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full text-xs font-medium
                bg-gray-100 text-gray-600"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          className="w-full py-4 rounded-2xl text-white font-bold text-base
            transition-all hover:scale-105 active:scale-95 shadow-lg mb-3"
          style={{
            background: 'linear-gradient(135deg, #7F77DD 0%, #5a52b8 100%)',
            boxShadow: '0 8px 24px rgba(127,119,221,0.4)',
          }}
        >
          Explore the Globe →
        </button>

        {!user && (
          <p className="text-xs text-gray-400">
            Free to explore · Sign in to save articles
          </p>
        )}
        {user && (
          <p className="text-xs text-gray-400">
            Welcome back, {user.name.split(' ')[0]} 👋
          </p>
        )}
      </div>
    </div>
  )
}
