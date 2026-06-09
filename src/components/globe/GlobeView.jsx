import { useEffect, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import countries from '../../data/countries.json'

const ACTIVE_CODES = new Set(
  countries.filter(c => c.active).map(c => c.code)
)

let cachedDayTexture = null
let cachedNightTexture = null

function getOceanTexture(nightMode) {
  if (nightMode) {
    if (!cachedNightTexture) cachedNightTexture = createOceanTexture(true)
    return cachedNightTexture
  } else {
    if (!cachedDayTexture) cachedDayTexture = createOceanTexture(false)
    return cachedDayTexture
  }
}

function isNightTime() {
  const hour = new Date().getHours()
  return hour >= 19 || hour < 6
}

function getNightColor(feat, isHovered, isActive) {
  if (isHovered && isActive) return 'rgba(180, 230, 200, 0.95)'
  if (isHovered) return 'rgba(80, 100, 140, 0.9)'
  const id = Number(feat?.id || 0)
  if (isActive) return 'rgba(60, 80, 120, 0.85)'
  if ([76, 840, 156, 356, 276, 250, 643, 36, 124, 826].includes(id))
    return 'rgba(25, 35, 55, 0.9)'
  return 'rgba(20, 28, 45, 0.85)'
}

function getDayColor(feat, isHovered, isActive) {
  if (isHovered && isActive) return 'rgba(180, 230, 200, 0.95)'
  if (isHovered) return 'rgba(200, 235, 215, 0.85)'
  const id = Number(feat?.id || 0)

  if ([304, 10].includes(id)) return 'rgba(230, 240, 255, 0.9)'

  if ([76, 170, 218, 604, 862, 858, 600, 192, 332].includes(id))
    return 'rgba(74, 122, 74, 0.85)'
  if ([356, 144, 50, 104, 116, 418, 408, 704, 764, 360, 458].includes(id))
    return 'rgba(82, 130, 70, 0.85)'
  if ([566, 288, 384, 430, 694, 624, 466].includes(id))
    return 'rgba(88, 138, 60, 0.8)'
  if ([710, 508, 834, 800, 646, 450].includes(id))
    return 'rgba(96, 130, 60, 0.8)'
  if ([404, 231, 706, 686, 226, 120].includes(id))
    return 'rgba(100, 124, 56, 0.8)'

  if ([12, 434, 788, 818, 729, 706, 887, 682, 400, 368, 364, 784].includes(id))
    return 'rgba(180, 150, 100, 0.85)'
  if ([4, 586, 860].includes(id))
    return 'rgba(170, 145, 100, 0.8)'

  if ([840, 124, 484, 32, 152, 68, 600, 858, 320, 340, 222, 558, 214, 188].includes(id))
    return 'rgba(130, 145, 85, 0.85)'
  if ([276, 250, 380, 724, 620, 528, 56, 756, 40, 203, 703, 616, 348].includes(id))
    return 'rgba(110, 140, 90, 0.85)'

  if ([643, 398, 860, 762, 795, 496, 417].includes(id))
    return 'rgba(148, 138, 100, 0.8)'

  if ([156].includes(id)) return 'rgba(120, 145, 80, 0.85)'
  if ([392].includes(id)) return 'rgba(100, 138, 90, 0.85)'
  if ([36, 554].includes(id)) return 'rgba(90, 148, 80, 0.85)'
  if ([826].includes(id)) return 'rgba(100, 140, 88, 0.85)'

  return 'rgba(105, 128, 78, 0.8)'
}

function createOceanTexture(nightMode) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (nightMode) {
    const gradient = ctx.createLinearGradient(0, 0, 512, 256)
    gradient.addColorStop(0, '#050d1f')
    gradient.addColorStop(0.3, '#071528')
    gradient.addColorStop(0.6, '#060e20')
    gradient.addColorStop(1, '#040c1a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const r = Math.random() * 1.5
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(30, 80, 160, ${Math.random() * 0.15})`
      ctx.fill()
    }

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (Math.random() - 0.5) * 20, y + Math.random() * 8)
      ctx.strokeStyle = `rgba(100, 150, 255, ${Math.random() * 0.08})`
      ctx.lineWidth = Math.random() * 1.5
      ctx.stroke()
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#2171b5')
    gradient.addColorStop(0.2, '#3182bd')
    gradient.addColorStop(0.5, '#4292c6')
    gradient.addColorStop(0.8, '#5ba3d0')
    gradient.addColorStop(1, '#74b9e0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)

    for (let y = 0; y < 256; y += 3) {
      ctx.beginPath()
      for (let x = 0; x < 512; x += 4) {
        const wave = Math.sin((x + y * 2) * 0.05) * 1.5
        if (x === 0) ctx.moveTo(x, y + wave)
        else ctx.lineTo(x, y + wave)
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.02})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const rx = 20 + Math.random() * 60
      const ry = 10 + Math.random() * 30
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rx)
      grad.addColorStop(0, `rgba(10, 60, 120, ${Math.random() * 0.15})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.12})`
      ctx.fill()
    }

    const coastGrad = ctx.createRadialGradient(256, 128, 80, 256, 128, 200)
    coastGrad.addColorStop(0, 'rgba(0,0,0,0)')
    coastGrad.addColorStop(1, 'rgba(100, 200, 220, 0.08)')
    ctx.fillStyle = coastGrad
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas.toDataURL()
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
    return nightMode
      ? getNightColor(feat, isHovered, isActive)
      : getDayColor(feat, isHovered, isActive)
  }, [hoveredId, getCountryCode, nightMode])

  const polygonAltitude = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code) && feat.id === hoveredId) return 0.06
    if (code && ACTIVE_CODES.has(code)) return 0.018
    return 0.006
  }, [hoveredId, getCountryCode])

  const polygonStroke = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (nightMode) {
      if (code && ACTIVE_CODES.has(code)) return 'rgba(120, 180, 255, 0.5)'
      return 'rgba(255,255,255,0.04)'
    }
    if (code && ACTIVE_CODES.has(code)) return 'rgba(120, 200, 160, 0.7)'
    return 'rgba(255,255,255,0.06)'
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

  const oceanTexture = getOceanTexture(nightMode)
  const bgColor = nightMode ? '#050d1a' : '#f5f5f0'
  const atmosphereColor = nightMode ? '#1a3a6a' : '#c8d8e8'

  return (
    <div className="absolute inset-0"
      style={{ background: bgColor, transition: 'background 2s ease' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={oceanTexture}
        showGraticules={false}
        showAtmosphere={true}
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.12}
        polygonsData={globeData}
        polygonGeoJsonGeometry={feat => feat.geometry}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => nightMode
          ? 'rgba(20,40,80,0.4)'
          : 'rgba(0,0,0,0.2)'}
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
