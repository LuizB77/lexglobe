import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageBackground from '../components/ui/PageBackground'

const COUNTRY_LABELS = {
  BR: { flag: '🇧🇷', label: 'Brazil' },
  PT: { flag: '🇵🇹', label: 'Portugal' },
  ES: { flag: '🇪🇸', label: 'Spain' },
  US: { flag: '🇺🇸', label: 'USA' },
}

const REASON_LABELS = {
  travel: { emoji: '🧳', label: "I'm traveling" },
  immigrant: { emoji: '🌎', label: "I'm an immigrant" },
  studying: { emoji: '📚', label: "I'm studying law" },
  business: { emoji: '💼', label: 'Business & work' },
}

function initials(name, email) {
  if (name && name !== email?.split('@')[0]) {
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

function cardStyle() {
  return {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '16px',
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [articlesRead, setArticlesRead] = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [streak, setStreak] = useState(1)
  const [preferences, setPreferences] = useState(null)

  useEffect(() => {
    // redirect guests
    if (!user) { navigate('/'); return }

    setArticlesRead(
      parseInt(localStorage.getItem('lexglobe_articles_read') || '0', 10)
    )

    const bookmarks = JSON.parse(localStorage.getItem('lexglobe_bookmarks') || '{}')
    const total = Object.values(bookmarks).reduce((sum, arr) => sum + arr.length, 0)
    setBookmarkCount(total)

    const streakData = JSON.parse(localStorage.getItem('lexglobe_streak') || '{"count":1}')
    setStreak(streakData.count ?? 1)

    const prefs = localStorage.getItem('lexglobe_preferences')
    if (prefs) {
      try { setPreferences(JSON.parse(prefs)) } catch {}
    }
  }, [user, navigate])

  if (!user) return null

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  const quickLinks = [
    { emoji: '📚', label: 'Browse Law Library', path: '/library/BR' },
    { emoji: '⭐', label: 'Saved Articles', path: '/bookmarks' },
    { emoji: '🗺️', label: 'Travel Guide', path: '/travel' },
  ]

  return (
    <PageBackground>
      <div className="min-h-screen text-white relative">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-20">

          {/* ── SECTION 1: USER HEADER ── */}
          <div className="p-6 mb-4" style={cardStyle()}>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center
                  font-bold text-xl flex-shrink-0"
                style={{
                  background: 'rgba(184,134,11,0.20)',
                  border: '1px solid rgba(184,134,11,0.40)',
                  color: '#B8860B',
                }}
              >
                {initials(user.name, user.email)}
              </div>

              {/* Info */}
              <div>
                <p className="text-white font-semibold text-lg leading-tight">
                  {user.name || 'Guest'}
                </p>
                <p className="text-white/50 text-sm">{user.email}</p>
                <p className="text-white/30 text-xs mt-0.5">Member since {memberSince}</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: STATS ROW ── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { value: articlesRead, label: 'Articles Read' },
              { value: bookmarkCount, label: 'Saved' },
              {
                value: (
                  <span className="flex items-center justify-center gap-1">
                    {streak}
                    {streak > 2 && <span className="text-base">🔥</span>}
                  </span>
                ),
                label: 'Day Streak',
              },
            ].map(({ value, label }) => (
              <div key={label} className="p-4 text-center" style={cardStyle()}>
                <p className="text-2xl font-bold leading-none" style={{ color: '#B8860B' }}>
                  {value}
                </p>
                <p className="text-white/50 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* ── SECTION 3: PREFERENCES ── */}
          <div className="p-6 mb-4" style={cardStyle()}>
            <p className="text-white font-semibold mb-4">Your Interests</p>

            {preferences && (preferences.countries?.length > 0 || preferences.reason) ? (
              <div className="flex flex-col gap-3">
                {preferences.countries?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.countries.map(code => {
                      const c = COUNTRY_LABELS[code]
                      if (!c) return null
                      return (
                        <span
                          key={code}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            background: 'rgba(184,134,11,0.20)',
                            border: '1px solid #B8860B',
                            color: '#B8860B',
                          }}
                        >
                          {c.flag} {c.label}
                        </span>
                      )
                    })}
                  </div>
                )}
                {preferences.reason && REASON_LABELS[preferences.reason] && (
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium w-fit"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.70)',
                    }}
                  >
                    {REASON_LABELS[preferences.reason].emoji}{' '}
                    {REASON_LABELS[preferences.reason].label}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-white/40 text-sm">No preferences set yet.</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm px-4 py-1.5 rounded-full transition-all"
                  style={{
                    border: '1px solid rgba(184,134,11,0.50)',
                    background: 'rgba(184,134,11,0.10)',
                    color: '#B8860B',
                  }}
                >
                  Set preferences
                </button>
              </div>
            )}
          </div>

          {/* ── SECTION 4: QUICK LINKS ── */}
          <div className="p-6 mb-4" style={cardStyle()}>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Quick Links</p>
            {quickLinks.map((link, i) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="w-full flex items-center justify-between py-3 px-2 -mx-2
                  rounded-lg transition-all text-left"
                style={{
                  borderBottom: i < quickLinks.length - 1
                    ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="text-white/80 text-sm">
                  {link.emoji} {link.label}
                </span>
                <span className="text-white/30">→</span>
              </button>
            ))}
          </div>

          {/* ── SECTION 5: SIGN OUT ── */}
          <div className="text-center pt-2 pb-8">
            <button
              onClick={handleSignOut}
              className="px-6 py-2 rounded-xl text-sm transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.50)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.80)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.50)'
              }}
            >
              Sign Out
            </button>
            <p className="text-white/20 text-xs mt-3">
              LexGlobe v1.0 · lexglobe-eight.vercel.app
            </p>
          </div>

        </div>
      </div>
    </PageBackground>
  )
}
