import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Globe', path: '/' },
  { label: 'Daily Law', path: '/daily' },
  { label: 'Search', path: '/search' },
  { label: 'Saved', path: '/bookmarks' },
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
      className="relative z-10 block cursor-pointer px-4 py-2 text-xs
        font-semibold uppercase tracking-wide select-none"
      style={{
        color: isGlobe ? 'white' : 'black',
        mixBlendMode: 'difference',
      }}
    >
      {children}
    </li>
  )
}

function SlidingCursor({ position }) {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-8 rounded-full"
      style={{ backgroundColor: 'black', top: '50%', translateY: '-50%' }}
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
        background: isGlobe ? 'transparent' : 'rgba(255,255,255,0.92)',
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

      {/* Sliding cursor nav */}
      <ul
        className="relative flex w-fit rounded-full p-1 border-2"
        style={{
          backgroundColor: isGlobe ? 'rgba(0,0,0,0.35)' : 'white',
          borderColor: isGlobe ? 'rgba(255,255,255,0.25)' : 'black',
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
            {item.label}
          </Tab>
        ))}
        <SlidingCursor position={position} />
      </ul>

      {/* Right — profile or sign in */}
      {user ? (
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full
            transition-colors flex-shrink-0 border-2"
          style={{
            borderColor: isGlobe ? 'rgba(255,255,255,0.25)' : 'black',
            backgroundColor: isGlobe ? 'rgba(0,0,0,0.35)' : 'white',
            backdropFilter: 'blur(16px)',
          }}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full"
          />
          <span
            className="text-xs font-semibold hidden sm:block max-w-[70px]
              truncate uppercase tracking-wide"
            style={{ color: isGlobe ? 'white' : 'black' }}
          >
            {user.name.split(' ')[0]}
          </span>
        </button>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 rounded-full text-xs font-semibold
            uppercase tracking-wide transition-colors border-2 flex-shrink-0"
          style={{
            backgroundColor: isGlobe ? 'rgba(0,0,0,0.35)' : 'white',
            borderColor: isGlobe ? 'rgba(255,255,255,0.25)' : 'black',
            color: isGlobe ? 'white' : 'black',
            backdropFilter: 'blur(16px)',
          }}
        >
          Sign in
        </button>
      )}
    </div>
  )
}
