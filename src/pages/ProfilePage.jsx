import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
          <p className="text-2xl font-bold text-gray-900">{streak.count}</p>
          <p className="text-sm text-gray-500">day streak</p>
        </div>
        {streak.count >= 7 && (
          <div className="ml-auto px-3 py-1 rounded-full text-xs font-semibold
            bg-orange-50 text-orange-600 border border-orange-200">
            🏆 {streak.count >= 30 ? 'Month Master' : streak.count >= 14 ? 'Two Week Champion' : 'Week Warrior'}
          </div>
        )}
      </div>

      {/* Month labels */}
      <div className="flex gap-1 mb-1 ml-0">
        {monthLabels.map((m, i) => (
          <div key={i} className="text-xs text-gray-400 w-4 text-center"
            style={{ minWidth: '14px' }}>
            {m.label}
          </div>
        ))}
      </div>

      {/* Grid */}
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
                        : '#e5e7eb',
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
        <span className="text-xs text-gray-400">Less</span>
        {['#e5e7eb', '#fed7aa', '#fb923c', '#f97316', '#ea580c'].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut, getStreak } = useAuth()
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const streak = getStreak()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const bookmarks = JSON.parse(localStorage.getItem('lexglobe_bookmarks') || '{}')
    const total = Object.values(bookmarks).reduce((sum, arr) => sum + arr.length, 0)
    setBookmarkCount(total)
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen pt-14"
      style={{ background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 40%)' }}>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* User card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-gray-100"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">
                {user.provider === 'google' ? '🔵 Google account' :
                 user.provider === 'apple' ? '⚫ Apple account' :
                 '✉️ Email account'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{streak.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">Day streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{bookmarkCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Saved articles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-xs text-gray-500 mt-0.5">Countries</p>
            </div>
          </div>
        </div>

        {/* Streak calendar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-5">Daily Law Streak</h2>
          <StreakCalendar />
          <p className="text-xs text-gray-400 mt-4">
            Visit the Daily Law page each day to build your streak
          </p>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => navigate('/bookmarks')}
            className="w-full text-left px-5 py-4 flex items-center gap-3
              hover:bg-gray-50 transition-colors border-b border-gray-100">
            <span className="text-lg">☆</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Saved Articles</p>
              <p className="text-xs text-gray-500">{bookmarkCount} articles saved</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </button>
          <button onClick={() => navigate('/daily')}
            className="w-full text-left px-5 py-4 flex items-center gap-3
              hover:bg-gray-50 transition-colors">
            <span className="text-lg">✦</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Daily Law</p>
              <p className="text-xs text-gray-500">Today's featured article</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={() => { signOut(); navigate('/') }}
          className="w-full py-3 rounded-xl border border-red-200 text-red-500
            text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
