import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Globe', shortLabel: 'Globe', path: '/' },
  { label: 'Daily Law', shortLabel: 'Daily', path: '/daily' },
  { label: 'Search', shortLabel: 'Search', path: '/search' },
  { label: 'Travel', shortLabel: 'Travel', path: '/travel' },
  { label: 'Saved', shortLabel: 'Saved', path: '/bookmarks' },
]

function Tab({ children, setPosition, onClick, isActive, isGlobe }) {
  const ref = useRef(null)
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return
        const { width } = ref.current.getBoundingClientRect()
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft })
      }}
      className="relative z-10 block cursor-pointer px-2.5 py-1.5
        sm:px-4 sm:py-2 text-xs font-semibold uppercase tracking-wide
        select-none whitespace-nowrap"
      style={{
        color: 'rgba(255,255,255,0.80)',
        transition: 'color 0.2s',
        fontWeight: 600,
      }}
    >
      {children}
    </li>
  )
}

function SlidingCursor({ position, isGlobe }) {
  return (
    <motion.li
      animate={position}
      initial={{ opacity: 0 }}
      className="absolute z-0 h-8 rounded-full"
      style={{
        backgroundColor: 'rgba(255,255,255,0.18)',
        top: '50%',
        translateY: '-50%',
      }}
    />
  )
}

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isGlobe = location.pathname === '/'

  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 })

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center
        justify-between px-4 py-2"
      style={{
        background: 'rgba(5,10,20,0.55)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 flex-shrink-0"
      >
        <span className="text-lg">🌐</span>
        <span
          className="font-black text-sm tracking-tight hidden md:block"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          LexGlobe
        </span>
      </button>

      {/* Sliding cursor nav */}
      <ul
        className="relative flex w-fit rounded-full p-1 border-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderColor: 'rgba(255,255,255,0.20)',
          backdropFilter: 'blur(16px)',
        }}
        onMouseLeave={() => setPosition(pv => ({ ...pv, opacity: 0 }))}
      >
        {NAV_ITEMS.map(item => (
          <Tab
            key={item.path}
            setPosition={setPosition}
            onClick={() => navigate(item.path)}
            isActive={location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))}
            isGlobe={isGlobe}
          >
            <span className="sm:hidden">{item.shortLabel}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Tab>
        ))}
        <SlidingCursor position={position} isGlobe={isGlobe} />
      </ul>

      {/* Right — initials avatar or sign in */}
      {user ? (
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center
            flex-shrink-0 font-bold text-sm transition-all"
          style={{
            background: 'rgba(107,140,174,0.20)',
            border: '1px solid rgba(107,140,174,0.40)',
            color: '#6B8CAE',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,140,174,0.30)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(107,140,174,0.20)'}
          title={user.name}
        >
          {(() => {
            const name = user.name || user.email || '?'
            const parts = name.trim().split(' ')
            return parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : name[0].toUpperCase()
          })()}
        </button>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="px-3 py-2 rounded-full text-xs font-semibold
            uppercase tracking-wide transition-colors border-2
            flex-shrink-0 whitespace-nowrap"
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.30)',
            color: 'white',
            backdropFilter: 'blur(16px)',
          }}
        >
          Sign in
        </button>
      )}
    </div>
  )
}
