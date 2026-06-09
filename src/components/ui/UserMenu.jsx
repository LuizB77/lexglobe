import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function UserMenu() {
  const { user, signOut, getStreak } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const streak = getStreak()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-white/90 backdrop-blur border border-gray-200
          text-gray-700 text-xs font-semibold hover:bg-white
          transition-colors shadow-sm min-h-[36px]"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-white/90 backdrop-blur border border-gray-200
          hover:bg-white transition-colors shadow-sm min-h-[36px]"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate">
          {user.name}
        </span>
        {streak.count > 0 && (
          <span className="text-xs">🔥 {streak.count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl
          shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {streak.count > 0 && (
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <span className="text-base">🔥</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {streak.count} day streak
                </p>
                <p className="text-xs text-gray-400">Keep it up!</p>
              </div>
            </div>
          )}

          <button
            onClick={() => { navigate('/profile'); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700
              hover:bg-gray-50 transition-colors flex items-center gap-2
              border-b border-gray-100"
          >
            👤 Profile
          </button>

          <button
            onClick={() => { navigate('/bookmarks'); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700
              hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            ☆ Saved Articles
          </button>

          <button
            onClick={() => { navigate('/daily'); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700
              hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            ✦ Daily Law
          </button>

          <button
            onClick={() => { signOut(); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-500
              hover:bg-red-50 transition-colors border-t border-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
