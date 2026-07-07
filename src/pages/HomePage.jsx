import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import GlobeView from '../components/globe/GlobeView'
import ComingSoonPanel from '../components/panels/ComingSoonPanel'
import AuthModal from '../components/ui/AuthModal'
import HeroOverlay from '../components/ui/HeroOverlay'
import { useAuth } from '../context/AuthContext'

const COUNTRY_PANEL_DATA = {
  BR: { flag: '🇧🇷', name: 'Brasil', subtitle: '6 legal codes · 4,281 articles', img: '/illustrations/brazil-hover.png', cta: 'Enter Law Library →' },
  PT: { flag: '🇵🇹', name: 'Portugal', subtitle: '8 legal codes · 5,993 articles', img: '/illustrations/portugal-hover.png', cta: 'Enter Law Library →' },
  ES: { flag: '🇪🇸', name: 'España', subtitle: '4 legal codes · Constitution, Penal, Civil, Labor', img: '/illustrations/spain-hover.png', cta: 'Explorar Biblioteca →' },
  US: { flag: '🇺🇸', name: 'United States', subtitle: '10 legal codes · Constitution, Criminal, Civil Rights +', img: '/illustrations/usa-hover.png', cta: 'Explore US Law →' },
}

function CountryHoverPanel({ visible, countryCode, onEnter }) {
  const data = COUNTRY_PANEL_DATA[countryCode]
  if (!data) return null
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
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(5,10,20,0.70)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Illustration with gradient overlay */}
        <div className="relative">
          <img
            src={data.img}
            alt={data.name}
            className="w-full object-cover"
            style={{ height: '110px', objectPosition: 'center' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.20), rgba(5,10,20,0.60))',
          }} />
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{data.flag}</span>
            <span className="font-bold text-white text-sm">{data.name}</span>
            <span
              className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(107,140,174,0.20)',
                border: '1px solid rgba(107,140,174,0.40)',
                color: '#6B8CAE',
              }}
            >
              Available
            </span>
          </div>
          <p className="text-xs text-white/50 mb-3">{data.subtitle}</p>
          <button
            onClick={onEnter}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]"
            style={{
              border: '1px solid rgba(107,140,174,0.60)',
              background: 'rgba(107,140,174,0.15)',
              color: '#6B8CAE',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,140,174,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(107,140,174,0.15)'}
          >
            {data.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

function TapHint() {
  const [opacity, setOpacity] = useState(1)
  const [show, setShow] = useState(() => !localStorage.getItem('lexglobe_hint_shown'))

  useEffect(() => {
    if (!show) return
    localStorage.setItem('lexglobe_hint_shown', '1')
    const fadeTimer = setTimeout(() => setOpacity(0), 3000)
    const hideTimer = setTimeout(() => setShow(false), 3800)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [show])

  if (!show) return null
  return (
    <div
      className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-10"
      style={{ transition: 'opacity 0.8s ease', opacity }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.10)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <span className="text-white/60 text-xs">✦ Tap a country to explore</span>
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
  const [isZooming, setIsZooming] = useState(false)
  const [brazilHovered, setBrazilHovered] = useState(false)
  const [portugalHovered, setPortugalHovered] = useState(false)
  const [spainHovered, setSpainHovered] = useState(false)
  const [usaHovered, setUsaHovered] = useState(false)
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
    if (globeInstance) {
      globeInstance.pointOfView({
        lat: latMap[country.code] || 0,
        lng: lngMap[country.code] || 0,
        altitude: 0.5,
      }, 1800)
    }
    setIsZooming(true)
    // Fade-to-black begins at 1400ms so camera move is fully visible first
    setTimeout(() => setTransitioning(true), 1400)
    setTimeout(() => navigate(`/library/${country.code}`), 1800)
  }

  function handleCountryClick(country, globeInstance) {
    if (!country.active) {
      setComingSoonCountry(country)
      return
    }
    if (!user) {
      setBrazilHovered(false)
      setPortugalHovered(false)
      setSpainHovered(false)
      setUsaHovered(false)
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

      <GlobeView
        onCountryClick={handleCountryClick}
        onCountryHover={(country) => {
          if (isMobile) return
          setBrazilHovered(country?.code === 'BR')
          setPortugalHovered(country?.code === 'PT')
          setSpainHovered(country?.code === 'ES')
          setUsaHovered(country?.code === 'US')
        }}
        globeRef={globeRef}
        onMobileCountryTap={(country) => {
          if (country?.code === 'BR') {
            setBrazilHovered(true)
            setPortugalHovered(false)
            setSpainHovered(false)
            setUsaHovered(false)
          } else if (country?.code === 'PT') {
            setPortugalHovered(true)
            setBrazilHovered(false)
            setSpainHovered(false)
            setUsaHovered(false)
          } else if (country?.code === 'ES') {
            setSpainHovered(true)
            setBrazilHovered(false)
            setPortugalHovered(false)
            setUsaHovered(false)
          } else if (country?.code === 'US') {
            setUsaHovered(true)
            setBrazilHovered(false)
            setPortugalHovered(false)
            setSpainHovered(false)
          } else if (country?.active) {
            handleCountryClick(country, globeRef.current)
          } else {
            setComingSoonCountry(country)
          }
        }}
      />

      {/* Fade-to-black transition overlay — mounts at 1400ms into the fly-to, gone when unused */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ backgroundColor: 'black' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      {showHero && (
        <HeroOverlay onDismiss={handleHeroDismiss} />
      )}

      <CountryHoverPanel
        visible={brazilHovered && !authModal}
        countryCode="BR"
        onEnter={() => handleCountryClick(brazilCountry, globeRef.current)}
      />
      <CountryHoverPanel
        visible={portugalHovered && !authModal}
        countryCode="PT"
        onEnter={() => handleCountryClick(portugalCountry, globeRef.current)}
      />
      <CountryHoverPanel
        visible={spainHovered && !authModal}
        countryCode="ES"
        onEnter={() => handleCountryClick(
          { code: 'ES', name: 'Spain', nameLocal: 'España', flag: '🇪🇸', active: true,
            codes: ['constitucionES', 'codigoPenalES', 'codigoCivilES', 'estatutoTrabajadores'] },
          globeRef.current
        )}
      />
      <CountryHoverPanel
        visible={usaHovered && !authModal}
        countryCode="US"
        onEnter={() => handleCountryClick(
          { code: 'US', name: 'United States', nameLocal: 'United States',
            flag: '🇺🇸', active: true,
            codes: ['usConstitution', 'title18Criminal', 'title42CivilRights',
              'title29Labor', 'title26Tax', 'title15Commerce',
              'title8Immigration', 'title20Education', 'title31Finance',
              'title49Transportation'] },
          globeRef.current
        )}
      />

      <TapHint />

      {/* Auth modal — globe stays visible behind */}
      {authModal && (
        <AuthModal
          countryName={authModal.country?.nameLocal || authModal.country?.name}
          countryCode={authModal.country?.code}
          onSuccess={() => handleAuthSuccess(authModal.country, authModal.globeInstance)}
          onClose={() => {
            // Guest mode — close modal and enter country anyway
            const country = authModal.country
            const globeInstance = authModal.globeInstance
            setAuthModal(null)
            enterCountry(country, globeInstance)
          }}
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
