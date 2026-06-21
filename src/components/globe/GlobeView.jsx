import { useEffect, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import countries from '../../data/countries.json'

const ACTIVE_CODES = new Set(
  countries.filter(c => c.active).map(c => c.code)
)

const EARTH_DAY_TEXTURE = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
const EARTH_NIGHT_TEXTURE = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
const EARTH_BUMP_TEXTURE = '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

function isNightTime() {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 6
}


export default function GlobeView({ onCountryClick, onCountryHover, globeRef: externalRef, onMobileCountryTap }) {
  const internalRef = useRef()
  const globeRef = externalRef || internalRef
  const [globeData, setGlobeData] = useState([])
  const [hoveredFeat, setHoveredFeat] = useState(null)
  const [nightMode, setNightMode] = useState(isNightTime())
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Check time every minute for day/night transition
  useEffect(() => {
    const interval = setInterval(() => {
      setNightMode(isNightTime())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Load topojson
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/topojson-client@3/dist/topojson-client.min.js'
    script.onload = () => {
      fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
        .then(r => r.json())
        .then(world => {
          const features = window.topojson.feature(world, world.objects.countries).features
          setGlobeData(features)
        })
    }
    document.head.appendChild(script)
    return () => { if (document.head.contains(script)) document.head.removeChild(script) }
  }, [])

  // Resize
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Globe controls
  useEffect(() => {
    const globe = globeRef.current
    if (!globe || globeData.length === 0) return
    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.35
    globe.controls().enableZoom = true
    globe.controls().minDistance = 150
    globe.controls().maxDistance = 550
  }, [globeData])

  // Initial camera
  useEffect(() => {
    const globe = globeRef.current
    if (!globe || globeData.length === 0) return
    const timer = setTimeout(() => {
      globe.pointOfView({ lat: -14.2, lng: -51.9, altitude: 1.8 }, 1500)
    }, 600)
    return () => clearTimeout(timer)
  }, [globeData])

  const getCountryCode = useCallback((feat) => {
    const numericToAlpha2 = {
      '076': 'BR', '840': 'US', '484': 'MX', '032': 'AR',
      '276': 'DE', '250': 'FR', '392': 'JP', '356': 'IN',
      '156': 'CN', '826': 'GB', '124': 'CA', '036': 'AU',
      '620': 'PT', '380': 'IT', '724': 'ES',
    }
    return numericToAlpha2[String(feat?.id ?? '').padStart(3, '0')] || null
  }, [])

  const getCountryData = useCallback((feat) => {
    const code = getCountryCode(feat)
    return countries.find(c => c.code === code) || null
  }, [getCountryCode])

  const hoveredId = hoveredFeat?.id

  const polygonCapColor = useCallback((feat) => {
    const code = getCountryCode(feat)
    const isHovered = feat.id === hoveredId
    const isActive = code ? ACTIVE_CODES.has(code) : false

    if (isHovered && isActive) return 'rgba(180, 230, 200, 0.55)'
    if (isHovered) return 'rgba(255, 255, 255, 0.25)'
    if (isActive) return 'rgba(127, 119, 221, 0.18)'
    return 'rgba(0, 0, 0, 0)'
  }, [hoveredId, getCountryCode])

  const polygonAltitude = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code) && feat.id === hoveredId) return 0.02
    if (code && ACTIVE_CODES.has(code)) return 0.008
    return 0.001
  }, [hoveredId, getCountryCode])

  const polygonStroke = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code)) {
      return nightMode ? 'rgba(150, 200, 255, 0.6)' : 'rgba(127, 119, 221, 0.6)'
    }
    return 'rgba(255,255,255,0.1)'
  }, [getCountryCode, nightMode])

  const handleHover = useCallback((feat) => {
    const globe = globeRef.current
    if (globe) globe.controls().autoRotate = !feat
    setHoveredFeat(feat || null)
    document.body.style.cursor = feat ? 'pointer' : 'default'
    if (onCountryHover) {
      const code = feat ? getCountryCode(feat) : null
      const data = code ? countries.find(c => c.code === code) : null
      onCountryHover(data || null)
    }
  }, [getCountryCode, onCountryHover])

  const isMobile = window.innerWidth < 768

  const handleClick = useCallback((feat) => {
    const data = getCountryData(feat)
    if (!data) return
    setTimeout(() => {
      if (globeRef.current) globeRef.current.controls().autoRotate = true
    }, 100)
    if (isMobile && onMobileCountryTap) {
      onMobileCountryTap(data)
    } else {
      onCountryClick(data, globeRef.current)
    }
  }, [getCountryData, onCountryClick, onMobileCountryTap, isMobile])

  return (
    <div className="absolute inset-0" style={{
      background: nightMode ? '#000005' : '#f5f5f0',
      transition: 'background 2s ease'
    }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={nightMode ? EARTH_NIGHT_TEXTURE : EARTH_DAY_TEXTURE}
        bumpImageUrl={EARTH_BUMP_TEXTURE}
        showGraticules={false}
        showAtmosphere={true}
        atmosphereColor={nightMode ? '#3a6ea5' : '#8ec5e8'}
        atmosphereAltitude={0.15}
        polygonsData={globeData}
        polygonGeoJsonGeometry={feat => feat.geometry}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={polygonStroke}
        polygonAltitude={polygonAltitude}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        polygonLabel={feat => {
          const data = getCountryData(feat)
          if (!data) return ''
          const dotColor = data.active
            ? (nightMode ? '#60a5fa' : '#B8860B')
            : '#666'
          const label = data.active ? '● Law library available' : 'Coming soon'
          return `<div style="
            background:${nightMode ? 'rgba(5,13,26,0.92)' : 'rgba(255,255,255,0.95)'};
            border:1px solid ${nightMode ? 'rgba(96,165,250,0.4)' : 'rgba(0,0,0,0.1)'};
            border-radius:10px;padding:8px 14px;
            color:${nightMode ? 'white' : '#1a1a1a'};
            font-family:system-ui;font-size:13px;
            pointer-events:none;backdrop-filter:blur(8px)
          ">
            <span style="font-size:18px">${data.flag || ''}</span>
            <strong style="margin-left:8px">${data.name}</strong>
            <div style="color:${dotColor};font-size:11px;margin-top:3px">${label}</div>
          </div>`
        }}
      />

      {/* Day/night indicator */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5
        px-2.5 py-1.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
          color: nightMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
        }}>
        {nightMode ? '🌙 Night' : '☀️ Day'}
      </div>
    </div>
  )
}
