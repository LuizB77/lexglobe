import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GlobeView from '../components/globe/GlobeView'
import ComingSoonPanel from '../components/panels/ComingSoonPanel'
import DailyLawBanner from '../components/ui/DailyLawBanner'

function BrazilPanel({ visible, onEnter }) {
  if (!visible) return null
  return (
    <div
      className="absolute left-6 bottom-6 z-20 rounded-2xl overflow-hidden shadow-2xl
        transition-all duration-300"
      style={{
        width: '280px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <img
        src="/illustrations/brazil-hover.png"
        alt="Brazil"
        className="w-full object-cover"
        style={{ height: '140px', objectPosition: 'center' }}
      />
      <div className="bg-white px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🇧🇷</span>
          <span className="font-bold text-gray-900 text-sm">Brasil</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full
            bg-green-50 text-green-700 border border-green-200">
            Available
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          6 legal codes · Constitution, Penal, Civil, Labor, Child, Consumer
        </p>
        <button
          onClick={onEnter}
          className="w-full py-2 rounded-xl text-white text-xs font-semibold
            transition-colors"
          style={{ backgroundColor: '#7F77DD' }}
        >
          Enter Law Library →
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const globeRef = useRef()
  const homeRef = useRef(null)
  const [comingSoonCountry, setComingSoonCountry] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [brazilHovered, setBrazilHovered] = useState(false)

  function handleCountryClick(country, globeInstance) {
    if (country.active) {
      // Zoom into the country, then flash white, then navigate
      if (globeInstance) {
        const latMap = { BR: -14.2, US: 38, MX: 23.6, AR: -38, DE: 51, FR: 46, JP: 36, IN: 20, CN: 35, GB: 54, CA: 56, AU: -25, PT: 39, IT: 42, ES: 40 }
        const lngMap = { BR: -51.9, US: -97, MX: -102, AR: -63, DE: 10, FR: 2, JP: 138, IN: 78, CN: 105, GB: -2, CA: -96, AU: 133, PT: -8, IT: 12, ES: -3 }
        const lat = latMap[country.code] || 0
        const lng = lngMap[country.code] || 0
        globeInstance.pointOfView({ lat, lng, altitude: 0.4 }, 900)
      }
      setTransitioning(true)
      setTimeout(() => navigate(`/library/${country.code}`), 1100)
    } else {
      setComingSoonCountry(country)
    }
  }

  return (
    <div ref={homeRef} className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#f5f5f0' }}>

      <DailyLawBanner />

      <GlobeView
        onCountryClick={handleCountryClick}
        onCountryHover={(country) => setBrazilHovered(country?.code === 'BR')}
        globeRef={globeRef}
      />

      {/* White flash transition overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-500"
        style={{ backgroundColor: 'white', opacity: transitioning ? 1 : 0 }}
      />

      {comingSoonCountry && (
        <ComingSoonPanel
          country={comingSoonCountry}
          onClose={() => setComingSoonCountry(null)}
        />
      )}

      <BrazilPanel
        visible={brazilHovered}
        onEnter={() => handleCountryClick(
          { code: 'BR', name: 'Brazil', nameLocal: 'Brasil',
            flag: '🇧🇷', active: true,
            codes: ['constituicao','codigoPenal','codigoCivil','clt','eca','cdc'] },
          globeRef.current
        )}
      />
    </div>
  )
}
