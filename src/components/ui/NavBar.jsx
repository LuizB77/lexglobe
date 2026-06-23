import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ExpandableTabs } from './ExpandableTabs'
import { Globe, Sun, Search, Bookmark, LogIn } from 'lucide-react'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isGlobe = location.pathname === '/'

  const tabs = [
    { title: 'Globe', icon: Globe, path: '/' },
    { title: 'Daily Law', icon: Sun, path: '/daily' },
    { type: 'separator' },
    { title: 'Search', icon: Search, path: '/search' },
    { title: 'Saved', icon: Bookmark, path: '/bookmarks' },
  ]

  function handleTabChange(index) {
    if (index === null) return
    const tab = tabs[index]
    if (tab?.path) navigate(tab.path)
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center
        justify-between px-4 py-2"
      style={{
        background: isGlobe ? 'transparent' : 'rgba(255,255,255,0.85)',
        backdropFilter: isGlobe ? 'none' : 'blur(20px)',
        borderBottom: isGlobe ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <span className="text-lg">🌐</span>
        <span
          className="font-black text-sm tracking-tight hidden sm:block"
          style={{ color: isGlobe ? 'rgba(255,255,255,0.9)' : '#1a1a1a' }}
        >
          LexGlobe
        </span>
      </button>

      {/* Expandable center tabs */}
      <ExpandableTabs
        tabs={tabs}
        isGlobe={isGlobe}
        activeColor="#7F77DD"
        onChange={handleTabChange}
      />

      {/* Right — profile or sign in */}
      {user ? (
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl
            transition-colors flex-shrink-0"
          style={{
            backgroundColor: location.pathname === '/profile'
              ? isGlobe ? 'rgba(255,255,255,0.15)' : 'rgba(127,119,221,0.1)'
              : 'transparent',
          }}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <span
            className="text-xs font-semibold hidden sm:block max-w-[70px] truncate"
            style={{ color: isGlobe ? 'white' : '#374151' }}
          >
            {user.name.split(' ')[0]}
          </span>
        </button>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            text-xs font-semibold transition-colors border flex-shrink-0"
          style={{
            backgroundColor: isGlobe ? 'rgba(255,255,255,0.1)' : 'white',
            borderColor: isGlobe ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
            color: isGlobe ? 'white' : '#374151',
          }}
        >
          <LogIn size={14} />
          <span className="hidden sm:block">Sign in</span>
        </button>
      )}
    </div>
  )
}
