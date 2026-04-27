import { useEffect, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import countries from '../../data/countries.json'

const ACTIVE_CODES = new Set(
  countries.filter(c => c.active).map(c => c.code)
)

// Natural country colors by region/type — gives the stylized Earth look
function getNaturalColor(feat, isHovered, isActive) {
  if (isHovered && isActive) return 'rgba(180, 230, 200, 0.95)'  // pale mint green
  if (isHovered) return 'rgba(200, 235, 215, 0.85)'              // light mint for any hover

  // Assign colors by numeric ID ranges (rough geographic groupings)
  const id = Number(feat?.id || 0)

  // Greens — forested tropical countries
  if ([76, 170, 218, 604, 862, 858, 600, 192, 332].includes(id))
    return 'rgba(74, 122, 74, 0.85)'   // deep green (South America)

  if ([356, 144, 50, 104, 116, 418, 408, 704, 764, 360, 458, 764].includes(id))
    return 'rgba(82, 130, 70, 0.85)'   // green (South/SE Asia)

  if ([566, 288, 384, 430, 694, 624, 466, 288].includes(id))
    return 'rgba(88, 138, 60, 0.8)'    // green (West Africa)

  if ([710, 508, 834, 800, 646, 450].includes(id))
    return 'rgba(96, 130, 60, 0.8)'    // East/Southern Africa

  if ([404, 231, 706, 686, 226, 120].includes(id))
    return 'rgba(100, 124, 56, 0.8)'   // Central Africa

  // Browns/tans — arid/desert countries
  if ([12, 434, 788, 818, 729, 706, 887, 682, 400, 368, 364, 784].includes(id))
    return 'rgba(180, 150, 100, 0.85)' // sandy brown (North Africa / Middle East)

  if ([4, 586, 860].includes(id))
    return 'rgba(170, 145, 100, 0.8)'  // tan (Central Asia / Afghanistan)

  // Khaki/olive — temperate
  if ([840, 124, 484, 32, 152, 68, 600, 858, 320, 340, 222, 558, 214, 388, 188, 591].includes(id))
    return 'rgba(130, 145, 85, 0.85)'  // olive (North America, Central America)

  if ([276, 250, 380, 724, 620, 528, 56, 756, 40, 203, 703, 616, 348].includes(id))
    return 'rgba(110, 140, 90, 0.85)'  // muted green (Europe)

  if ([643, 398, 860, 762, 795, 496, 417].includes(id))
    return 'rgba(148, 138, 100, 0.8)'  // steppe (Russia/Central Asia)

  if ([156].includes(id))
    return 'rgba(120, 145, 80, 0.85)'  // China

  if ([392].includes(id))
    return 'rgba(100, 138, 90, 0.85)'  // Japan

  if ([36, 554].includes(id))
    return 'rgba(90, 148, 80, 0.85)'   // Australia/NZ

  if ([826].includes(id))
    return 'rgba(100, 140, 88, 0.85)'  // UK

  // Default fallback — muted olive/green
  return 'rgba(105, 128, 78, 0.8)'
}

function solidColorImageUrl(hex) {
  const canvas = document.createElement('canvas')
  canvas.width = 2; canvas.height = 2
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, 2, 2)
  return canvas.toDataURL()
}

export default function GlobeView({ onCountryClick, onCountryHover, globeRef: externalRef }) {
  const internalRef = useRef()
  const globeRef = externalRef || internalRef
  const [globeData, setGlobeData] = useState([])
  const [hoveredFeat, setHoveredFeat] = useState(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

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

  // Initial camera — point at Brazil
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
    return getNaturalColor(feat, isHovered, isActive)
  }, [hoveredId, getCountryCode])

  const polygonAltitude = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code) && feat.id === hoveredId) return 0.06
    if (code && ACTIVE_CODES.has(code)) return 0.015
    return 0.005
  }, [hoveredId, getCountryCode])

  const polygonStroke = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code)) return 'rgba(120, 200, 160, 0.7)'
    return 'rgba(255,255,255,0.06)'
  }, [getCountryCode])

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

  const handleClick = useCallback((feat) => {
    const data = getCountryData(feat)
    if (data) onCountryClick(data, globeRef.current)
  }, [getCountryData, onCountryClick])

  return (
    <div className="absolute inset-0" style={{ background: '#f5f5f0' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={solidColorImageUrl('#4a90c4')}
        showGraticules={false}
        showAtmosphere={true}
        atmosphereColor="#c8d8e8"
        atmosphereAltitude={0.12}
        polygonsData={globeData}
        polygonGeoJsonGeometry={feat => feat.geometry}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0.3)'}
        polygonStrokeColor={polygonStroke}
        polygonAltitude={polygonAltitude}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        polygonLabel={feat => {
          const data = getCountryData(feat)
          if (!data) return ''
          return `<div style="
            background:rgba(6,13,31,0.92);
            border:1px solid rgba(127,119,221,0.5);
            border-radius:10px;padding:8px 14px;
            color:white;font-family:system-ui;font-size:13px;
            pointer-events:none;backdrop-filter:blur(8px)
          ">
            <span style="font-size:18px">${data.flag||''}</span>
            <strong style="margin-left:8px">${data.name}</strong>
            ${data.active
              ? '<div style="color:#B8860B;font-size:11px;margin-top:3px">● Law library available</div>'
              : '<div style="color:#666;font-size:11px;margin-top:3px">Coming soon</div>'}
          </div>`
        }}
        onGlobeReady={() => {
          const globe = globeRef.current
          if (!globe) return
          // Paint the globe sphere blue (ocean color)
          const scene = globe.scene()
          scene.traverse(obj => {
            if (obj.isMesh && obj.geometry?.type === 'SphereGeometry') {
              obj.material.color?.setHex(0x3a82c4)
            }
          })
        }}
      />
    </div>
  )
}
