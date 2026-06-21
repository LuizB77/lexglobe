import { useEffect, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import * as solar from 'solar-calculator'
import countries from '../../data/countries.json'

const ACTIVE_CODES = new Set(
  countries.filter(c => c.active).map(c => c.code)
)

const EARTH_DAY_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
const EARTH_NIGHT_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
const EARTH_BUMP_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

const VELOCITY = 1 // minutes per frame — controls real-time sun movement speed

const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;
    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float a) {
      return a * PI / 180.0;
    }

    vec3 Polar2Cartesian(in vec2 c) {
      float theta = toRad(90.0 - c.x);
      float phi = toRad(90.0 - c.y);
      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);
      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );
      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );
      vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.1, 0.1, intensity);
      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `
}

function sunPosAt(dt) {
  const day = new Date(+dt).setUTCHours(0, 0, 0, 0)
  const t = solar.century(dt)
  const longitude = (day - dt) / 864e5 * 360 - 180
  return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)]
}

export default function GlobeView({ onCountryClick, onCountryHover, globeRef: externalRef, onMobileCountryTap }) {
  const internalRef = useRef()
  const globeRef = externalRef || internalRef
  const [globeData, setGlobeData] = useState([])
  const [hoveredFeat, setHoveredFeat] = useState(null)
  const [globeMaterial, setGlobeMaterial] = useState(null)
  const [dt, setDt] = useState(+new Date())
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // Advance simulated time for sun movement (real-time-ish day/night drift)
  useEffect(() => {
    let frame
    function iterateTime() {
      setDt(prev => prev + VELOCITY * 60 * 1000)
      frame = requestAnimationFrame(iterateTime)
    }
    iterateTime()
    return () => cancelAnimationFrame(frame)
  }, [])

  // Load day/night textures and build shader material once
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    Promise.all([
      loader.loadAsync(EARTH_DAY_TEXTURE),
      loader.loadAsync(EARTH_NIGHT_TEXTURE),
    ]).then(([dayTexture, nightTexture]) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTexture },
          nightTexture: { value: nightTexture },
          sunPosition: { value: new THREE.Vector2() },
          globeRotation: { value: new THREE.Vector2() },
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader,
      })
      setGlobeMaterial(material)
    })
  }, [])

  // Update sun position uniform every frame tick
  useEffect(() => {
    if (!globeMaterial) return
    const [lng, lat] = sunPosAt(dt)
    globeMaterial.uniforms.sunPosition.value.set(lng, lat)
  }, [dt, globeMaterial])

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

  // Update globeRotation uniform whenever camera moves
  const handleZoom = useCallback(({ lng, lat }) => {
    if (globeMaterial) {
      globeMaterial.uniforms.globeRotation.value.set(lng, lat)
    }
  }, [globeMaterial])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    const controls = globe.controls()
    function onChange() {
      const pov = globe.pointOfView()
      handleZoom({ lng: pov.lng, lat: pov.lat })
    }
    controls.addEventListener('change', onChange)
    return () => controls.removeEventListener('change', onChange)
  }, [handleZoom, globeData])

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

  const polygonStroke = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code)) {
      return 'rgba(150, 200, 255, 0.6)'
    }
    return 'rgba(255,255,255,0.1)'
  }, [getCountryCode])

  const polygonAltitude = useCallback((feat) => {
    const code = getCountryCode(feat)
    if (code && ACTIVE_CODES.has(code) && feat.id === hoveredId) return 0.02
    if (code && ACTIVE_CODES.has(code)) return 0.008
    return 0.001
  }, [hoveredId, getCountryCode])

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

  if (!globeMaterial) {
    return (
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#0a0a1a' }}>
        <div className="text-white/40 text-sm">Loading globe...</div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0" style={{ background: '#05070d' }}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        bumpImageUrl={EARTH_BUMP_TEXTURE}
        showGraticules={false}
        showAtmosphere={true}
        atmosphereColor="#6ba8d8"
        atmosphereAltitude={0.15}
        polygonsData={globeData}
        polygonGeoJsonGeometry={feat => feat.geometry}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={polygonStroke}
        polygonAltitude={polygonAltitude}
        onPolygonHover={handleHover}
        onPolygonClick={handleClick}
        onZoom={handleZoom}
        polygonLabel={feat => {
          const data = getCountryData(feat)
          if (!data) return ''
          const dotColor = data.active ? '#60a5fa' : '#666'
          const label = data.active ? '● Law library available' : 'Coming soon'
          return `<div style="
            background:rgba(5,13,26,0.92);
            border:1px solid rgba(96,165,250,0.4);
            border-radius:10px;padding:8px 14px;
            color:white;font-family:system-ui;font-size:13px;
            pointer-events:none;backdrop-filter:blur(8px)
          ">
            <span style="font-size:18px">${data.flag||''}</span>
            <strong style="margin-left:8px">${data.name}</strong>
            <div style="color:${dotColor};font-size:11px;margin-top:3px">${label}</div>
          </div>`
        }}
      />
    </div>
  )
}
