import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

function StreakCalendar() {
  const { getStreak } = useAuth()
  const streak = getStreak()

  const today = new Date()
  const days = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }

  const checkins = JSON.parse(localStorage.getItem('lexglobe_checkins') || '[]')
  const checkinSet = new Set(checkins)

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const monthLabels = []
  weeks.forEach((week, i) => {
    const firstDay = new Date(week[0])
    const month = firstDay.toLocaleDateString('en', { month: 'short' })
    if (i === 0 || new Date(weeks[i - 1][0]).getMonth() !== firstDay.getMonth()) {
      monthLabels.push({ index: i, label: month })
    } else {
      monthLabels.push({ index: i, label: '' })
    }
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🔥</div>
        <div>
          <p className="text-2xl font-bold text-white">{streak.count}</p>
          <p className="text-sm text-white/50">day streak</p>
        </div>
        {streak.count >= 7 && (
          <div className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
            🏆 {streak.count >= 30 ? 'Month Master' : streak.count >= 14 ? 'Two Week Champion' : 'Week Warrior'}
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-1 ml-0">
        {monthLabels.map((m, i) => (
          <div key={i} className="text-xs text-white/40 w-4 text-center"
            style={{ minWidth: '14px' }}>
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const isToday = day === today.toISOString().split('T')[0]
              const checked = checkinSet.has(day)
              const isFuture = new Date(day) > today
              return (
                <div
                  key={di}
                  title={day}
                  className="w-3.5 h-3.5 rounded-sm"
                  style={{
                    backgroundColor: isFuture
                      ? 'transparent'
                      : checked
                        ? '#f97316'
                        : 'rgba(255,255,255,0.1)',
                    border: isToday ? '1.5px solid #f97316' : '1px solid transparent',
                    opacity: isFuture ? 0 : 1,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-white/40">Less</span>
        {['rgba(255,255,255,0.1)', '#fed7aa', '#fb923c', '#f97316', '#ea580c'].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-white/40">More</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut, getStreak } = useAuth()
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [entered, setEntered] = useState(false)
  const streak = getStreak()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const bookmarks = JSON.parse(localStorage.getItem('lexglobe_bookmarks') || '{}')
    const total = Object.values(bookmarks).reduce((sum, arr) => sum + arr.length, 0)
    setBookmarkCount(total)
    setTimeout(() => setEntered(true), 50)
  }, [user, navigate])

  if (!user) return null

  return (
    <PageBackground>
      <div
        className="transition-all duration-500"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'none' : 'translateY(12px)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 pt-20 pb-12 flex flex-col gap-6">

          {/* User card */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full"
                style={{ border: '2px solid rgba(255,255,255,0.2)' }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <p className="text-sm text-white/50">{user.email}</p>
                <p className="text-xs text-white/40 mt-1 capitalize">
                  {user.provider === 'google' ? '🔵 Google account' :
                   user.provider === 'apple' ? '⚫ Apple account' :
                   '✉️ Email account'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{streak.count}</p>
                <p className="text-xs text-white/50 mt-0.5">Day streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{bookmarkCount}</p>
                <p className="text-xs text-white/50 mt-0.5">Saved articles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-xs text-white/50 mt-0.5">Countries</p>
              </div>
            </div>
          </GlassCard>

          {/* Streak calendar */}
          <GlassCard className="p-6">
            <h2 className="font-bold text-white mb-5">Daily Law Streak</h2>
            <StreakCalendar />
            <p className="text-xs text-white/40 mt-4">
              Visit the Daily Law page each day to build your streak
            </p>
          </GlassCard>

          {/* Quick links */}
          <GlassCard className="overflow-hidden">
            <button onClick={() => navigate('/bookmarks')}
              className="w-full text-left px-5 py-4 flex items-center gap-3 transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-lg">☆</span>
              <div>
                <p className="text-sm font-semibold text-white/90">Saved Articles</p>
                <p className="text-xs text-white/50">{bookmarkCount} articles saved</p>
              </div>
              <span className="ml-auto text-white/40">→</span>
            </button>
            <button onClick={() => navigate('/daily')}
              className="w-full text-left px-5 py-4 flex items-center gap-3 transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-lg">✦</span>
              <div>
                <p className="text-sm font-semibold text-white/90">Daily Law</p>
                <p className="text-xs text-white/50">Today's featured article</p>
              </div>
              <span className="ml-auto text-white/40">→</span>
            </button>
          </GlassCard>

          {/* Sign out */}
          <button
            onClick={() => { signOut(); navigate('/') }}
            className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              background: 'rgba(239,68,68,0.08)',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </PageBackground>
  )
}
