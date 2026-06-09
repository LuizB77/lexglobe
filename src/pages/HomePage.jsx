import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GlobeView from '../components/globe/GlobeView'
import ComingSoonPanel from '../components/panels/ComingSoonPanel'
import DailyLawBanner from '../components/ui/DailyLawBanner'
import UserMenu from '../components/ui/UserMenu'
import AuthModal from '../components/ui/AuthModal'
import HeroOverlay from '../components/ui/HeroOverlay'
import { useAuth } from '../context/AuthContext'

function BrazilPanel({ visible, onEnter }) {
  return (
    <div
      className="absolute bottom-6 left-4 z-20 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        width: 'min(260px, calc(100vw - 32px))',
      }}
    >
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
        <img
          src="/illustrations/brazil-hover.png"
          alt="Brazil"
          className="w-full object-cover"
          style={{ height: '120px', objectPosition: 'center' }}
        />
        <div className="bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🇧🇷</span>
            <span className="font-bold text-gray-900 text-sm">Brasil</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full
              bg-green-50 text-green-700 border border-green-200">
              Available
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            6 legal codes · 4,281 articles
          </p>
          <button
            onClick={onEnter}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
              min-h-[44px]"
            style={{ backgroundColor: '#B8860B' }}
          >
            Enter Law Library →
          </button>
        </div>
      </div>
    </div>
  )
}

function PortugalPanel({ visible, onEnter }) {
  return (
    <div
      className="absolute bottom-6 right-4 z-20 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        width: 'min(260px, calc(100vw - 32px))',
      }}
    >
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
        <img
          src="/illustrations/portugal-hover.png"
          alt="Portugal"
          className="w-full object-cover"
          style={{ height: '120px', objectPosition: 'center' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div className="bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🇵🇹</span>
            <span className="font-bold text-gray-900 text-sm">Portugal</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full
              bg-green-50 text-green-700 border border-green-200">
              Available
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            8 legal codes · 5,993 articles
          </p>
          <button
            onClick={onEnter}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
              min-h-[44px]"
            style={{ backgroundColor: '#B8860B' }}
          >
            Enter Law Library →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const globeRef = useRef()
  const [comingSoonCountry, setComingSoonCountry] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [brazilHovered, setBrazilHovered] = useState(false)
  const [portugalHovered, setPortugalHovered] = useState(false)
  const [authModal, setAuthModal] = useState(null) // { country, globeInstance }
  const [showHero, setShowHero] = useState(() => {
    const lastVisit = localStorage.getItem('lexglobe_last_visit')
    if (!lastVisit) return true
    const hoursSince = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60)
    return hoursSince > 24
  })

  function handleHeroDismiss() {
    localStorage.setItem('lexglobe_last_visit', Date.now().toString())
    setShowHero(false)
  }
  const isMobile = window.innerWidth < 768

  function enterCountry(country, globeInstance) {
    if (globeInstance) {
      const latMap = {
        BR: -14.2, PT: 39.5, US: 38, MX: 23.6, AR: -38,
        DE: 51, FR: 46, JP: 36, IN: 20, CN: 35,
        GB: 54, CA: 56, AU: -25, IT: 42, ES: 40
      }
      const lngMap = {
        BR: -51.9, PT: -8, US: -97, MX: -102, AR: -63,
        DE: 10, FR: 2, JP: 138, IN: 78, CN: 105,
        GB: -2, CA: -96, AU: 133, IT: 12, ES: -3
      }
      globeInstance.pointOfView({
        lat: latMap[country.code] || 0,
        lng: lngMap[country.code] || 0,
        altitude: 0.4
      }, 900)
    }
    setTransitioning(true)
    setTimeout(() => navigate(`/library/${country.code}`), 1100)
  }

  function handleCountryClick(country, globeInstance) {
    if (!country.active) {
      setComingSoonCountry(country)
      return
    }
    if (!user) {
      setBrazilHovered(false)
      setPortugalHovered(false)
      setAuthModal({ country, globeInstance })
      return
    }
    enterCountry(country, globeInstance)
  }

  function handleAuthSuccess(country, globeInstance) {
    setAuthModal(null)
    enterCountry(country, globeInstance)
  }

  const brazilCountry = {
    code: 'BR', name: 'Brazil', nameLocal: 'Brasil', flag: '🇧🇷', active: true,
    codes: ['constituicao', 'codigoPenal', 'codigoCivil', 'clt', 'eca', 'cdc']
  }
  const portugalCountry = {
    code: 'PT', name: 'Portugal', nameLocal: 'Portugal', flag: '🇵🇹', active: true,
    codes: ['constituicaoPT', 'codigoPenalPT', 'codigoCivilPT', 'codigoTrabalho',
      'codigoProcessoPenal', 'codigoProcessoCivil', 'codigoComercial', 'codigoEstrada']
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#f5f5f0' }}>

      <DailyLawBanner />

      {/* User menu top right */}
      <div className="absolute top-4 right-4 z-20">
        <UserMenu />
      </div>

      <GlobeView
        onCountryClick={handleCountryClick}
        onCountryHover={(country) => {
          if (isMobile) return
          setBrazilHovered(country?.code === 'BR')
          setPortugalHovered(country?.code === 'PT')
        }}
        globeRef={globeRef}
        onMobileCountryTap={(country) => {
          if (country?.code === 'BR') {
            setBrazilHovered(true)
            setPortugalHovered(false)
          } else if (country?.code === 'PT') {
            setPortugalHovered(true)
            setBrazilHovered(false)
          } else if (country?.active) {
            handleCountryClick(country, globeRef.current)
          } else {
            setComingSoonCountry(country)
          }
        }}
      />

      {/* White flash transition */}
      <div
        className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-500"
        style={{ backgroundColor: 'white', opacity: transitioning ? 1 : 0 }}
      />

      {showHero && (
        <HeroOverlay onDismiss={handleHeroDismiss} />
      )}

      <BrazilPanel
        visible={brazilHovered && !authModal}
        onEnter={() => handleCountryClick(brazilCountry, globeRef.current)}
      />

      <PortugalPanel
        visible={portugalHovered && !authModal}
        onEnter={() => handleCountryClick(portugalCountry, globeRef.current)}
      />

      {/* Auth modal — globe stays visible behind */}
      {authModal && (
        <AuthModal
          countryName={authModal.country?.nameLocal || authModal.country?.name}
          onSuccess={() => handleAuthSuccess(authModal.country, authModal.globeInstance)}
          onClose={() => setAuthModal(null)}
        />
      )}

      {comingSoonCountry && (
        <ComingSoonPanel
          country={comingSoonCountry}
          onClose={() => setComingSoonCountry(null)}
        />
      )}
    </div>
  )
}
