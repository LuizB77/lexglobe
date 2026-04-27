import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GlobeView from '../components/globe/GlobeView'
import ComingSoonPanel from '../components/panels/ComingSoonPanel'
import DailyLawBanner from '../components/ui/DailyLawBanner'

export default function HomePage() {
  const navigate = useNavigate()
  const homeRef = useRef(null)
  const [comingSoonCountry, setComingSoonCountry] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

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

      <GlobeView onCountryClick={handleCountryClick} />

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
    </div>
  )
}
