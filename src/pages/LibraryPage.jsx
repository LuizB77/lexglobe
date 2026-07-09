import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadCode } from '../utils/searchEngine'
import { search } from '../utils/searchEngine'
import countries from '../data/countries.json'
import { useAuth } from '../context/AuthContext'
import PageBackground from '../components/ui/PageBackground'

const CODE_ILLUSTRATIONS = {
  // Brazil (federal)
  constituicao:        '/illustrations/constituicao.png',
  // Brazil (state — São Paulo)
  constituicaoSP:      '/illustrations/constituicaoSP.png',
  codigoPenal:         '/illustrations/codigoPenal.png',
  codigoCivil:         '/illustrations/codigoCivil.png',
  clt:                 '/illustrations/clt.png',
  eca:                 '/illustrations/eca.png',
  cdc:                 '/illustrations/cdc.png',
  // Portugal
  constituicaoPT:      '/illustrations/constituicaoPT.png',
  codigoPenalPT:       '/illustrations/codigoPenalPT.png',
  codigoCivilPT:       '/illustrations/codigoCivilPT.png',
  codigoTrabalho:      '/illustrations/codigoTrabalhoPT.png',
  codigoProcessoPenal: '/illustrations/codigoProcessoPenal.png',
  codigoProcessoCivil: '/illustrations/codigoProcessoCivil.png',
  codigoComercial:     '/illustrations/codigoComercial.png',
  codigoEstrada:       '/illustrations/codigoEstrada.png',
  // Spain
  constitucionES:       '/illustrations/constitucionES.png',
  codigoPenalES:        '/illustrations/codigoPenalES.png',
  codigoCivilES:        '/illustrations/codigoCivilES.png',
  estatutoTrabajadores: '/illustrations/estatutoTrabajadores.png',
  // USA
  usConstitution:        '/illustrations/usConstitution.png',
  title18Criminal:       '/illustrations/title18Criminal.png',
  title42CivilRights:    '/illustrations/title42CivilRights.png',
  title29Labor:          '/illustrations/title29Labor.png',
  title26Tax:            '/illustrations/title26Tax.png',
  title15Commerce:       '/illustrations/title15Commerce.png',
  title8Immigration:     '/illustrations/title8Immigration.png',
  title20Education:      '/illustrations/title20Education.png',
  title31Finance:        '/illustrations/title31Finance.png',
  title49Transportation: '/illustrations/title49Transportation.png',
}

const CODE_ORDER_BY_COUNTRY = {
  BR: ['constituicao', 'codigoPenal', 'codigoCivil', 'clt', 'eca', 'cdc'],
  PT: [
    'constituicaoPT', 'codigoPenalPT', 'codigoCivilPT', 'codigoTrabalho',
    'codigoProcessoPenal', 'codigoProcessoCivil', 'codigoComercial',
    'codigoEstrada',
  ],
  ES: ['constitucionES', 'codigoPenalES', 'codigoCivilES', 'estatutoTrabajadores'],
  US: [
    'usConstitution', 'title18Criminal', 'title42CivilRights',
    'title29Labor', 'title26Tax', 'title15Commerce',
    'title8Immigration', 'title20Education', 'title31Finance',
    'title49Transportation',
  ],
}

const SP_STATES = [
  { code: 'SP', name: 'São Paulo', flag: '🏙️', codes: ['constituicaoSP'] },
  { code: 'RJ', name: 'Rio de Janeiro', flag: '🌊', codes: [], soon: true },
  { code: 'AL', name: 'Alagoas', flag: '🌴', codes: [], soon: true },
  { code: 'BA', name: 'Bahia', flag: '⭐', codes: [], soon: true },
]

const CODE_META = {
  // ── BRAZIL STATE — SÃO PAULO ──
  constituicaoSP: {
    label: 'Constituição do Estado de São Paulo', shortLabel: 'Const. SP', year: '1989',
    color: '#5B8DB8', spine: '#FFD700',
    desc: 'Lei maior do Estado de São Paulo (ALESP)',
    fallbackGradient: 'linear-gradient(to bottom, #0f2a4a, #071828)',
  },
  // ── BRAZIL ──
  constituicao: {
    label: 'Constituição Federal', shortLabel: 'Constituição', year: '1988',
    color: '#6B8CAE', spine: '#FFD700',
    desc: 'Lei maior da República Federativa do Brasil',
    fallbackGradient: 'linear-gradient(to bottom, #1a3a5c, #0d2137)',
  },
  codigoPenal: {
    label: 'Código Penal', shortLabel: 'Código Penal', year: '1940',
    color: '#9B1C1C', spine: '#E53E3E',
    desc: 'Crimes e penalidades no direito brasileiro',
    fallbackGradient: 'linear-gradient(to bottom, #5c1a1a, #3a0d0d)',
  },
  codigoCivil: {
    label: 'Código Civil', shortLabel: 'Código Civil', year: '2002',
    color: '#4C3494', spine: '#7F77DD',
    desc: 'Relações civis, contratos, família e propriedade',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a2a, #0d2d18)',
  },
  clt: {
    label: 'CLT', shortLabel: 'CLT', year: '1943',
    color: '#145A3A', spine: '#1D9E75',
    desc: 'Consolidação das Leis do Trabalho',
    fallbackGradient: 'linear-gradient(to bottom, #3a2a5c, #1f1637)',
  },
  eca: {
    label: 'ECA', shortLabel: 'ECA', year: '1990',
    color: '#923B05', spine: '#F6AD55',
    desc: 'Estatuto da Criança e do Adolescente',
    fallbackGradient: 'linear-gradient(to bottom, #5c3a1a, #3a2010)',
  },
  cdc: {
    label: 'CDC', shortLabel: 'CDC', year: '1990',
    color: '#1a4a7a', spine: '#63B3ED',
    desc: 'Código de Defesa do Consumidor',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a4a, #0d2d2d)',
  },
  // ── PORTUGAL ──
  constituicaoPT: {
    label: 'Constituição da República', shortLabel: 'Constituição', year: '1976',
    color: '#6B8CAE', spine: '#FFD700',
    desc: 'Lei fundamental da República Portuguesa',
    fallbackGradient: 'linear-gradient(to bottom, #1a3a5c, #0d2137)',
  },
  codigoPenalPT: {
    label: 'Código Penal', shortLabel: 'Código Penal', year: '1982',
    color: '#9B1C1C', spine: '#E53E3E',
    desc: 'Crimes e penalidades no direito português',
    fallbackGradient: 'linear-gradient(to bottom, #5c1a1a, #3a0d0d)',
  },
  codigoCivilPT: {
    label: 'Código Civil', shortLabel: 'Código Civil', year: '1966',
    color: '#4C3494', spine: '#7F77DD',
    desc: 'Relações civis, contratos e família',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a2a, #0d2d18)',
  },
  codigoTrabalho: {
    label: 'Código do Trabalho', shortLabel: 'Cód. Trabalho', year: '2003',
    color: '#145A3A', spine: '#1D9E75',
    desc: 'Lei laboral portuguesa',
    fallbackGradient: 'linear-gradient(to bottom, #3a2a5c, #1f1637)',
  },
  codigoProcessoPenal: {
    label: 'Código de Processo Penal', shortLabel: 'Proc. Penal', year: '1987',
    color: '#9B1C1C', spine: '#C53030',
    desc: 'Procedimento criminal português',
    fallbackGradient: 'linear-gradient(to bottom, #3a1a2a, #200d18)',
  },
  codigoProcessoCivil: {
    label: 'Código de Processo Civil', shortLabel: 'Proc. Civil', year: '2013',
    color: '#1a365d', spine: '#2B6CB0',
    desc: 'Procedimento civil português',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a4a, #0d2d2d)',
  },
  codigoComercial: {
    label: 'Código Comercial', shortLabel: 'Cód. Comercial', year: '1888',
    color: '#744210', spine: '#D69E2E',
    desc: 'Direito comercial e mercantil',
    fallbackGradient: 'linear-gradient(to bottom, #4a3a1a, #2d2010)',
  },
  codigoEstrada: {
    label: 'Código da Estrada', shortLabel: 'Cód. Estrada', year: '1994',
    color: '#7B341E', spine: '#C05621',
    desc: 'Regulação do trânsito e condução',
    fallbackGradient: 'linear-gradient(to bottom, #2a1a4a, #160d2d)',
  },
  // ── SPAIN ──
  constitucionES: {
    label: 'Constitución Española', shortLabel: 'Constitución', year: '1978',
    color: '#8B6914', spine: '#C8A000',
    desc: 'Ley fundamental del Reino de España',
    fallbackGradient: 'linear-gradient(to bottom, #5c2a1a, #3a1508)',
  },
  codigoPenalES: {
    label: 'Código Penal', shortLabel: 'Código Penal', year: '1995',
    color: '#9B1C1C', spine: '#C53030',
    desc: 'Delitos y penas en el derecho español',
    fallbackGradient: 'linear-gradient(to bottom, #4a1a1a, #2d0d0d)',
  },
  codigoCivilES: {
    label: 'Código Civil', shortLabel: 'Código Civil', year: '1889',
    color: '#44337A', spine: '#553C9A',
    desc: 'Relaciones civiles, contratos y familia',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a2a, #0d2d18)',
  },
  estatutoTrabajadores: {
    label: 'Estatuto de los Trabajadores', shortLabel: 'Estatuto', year: '2015',
    color: '#1C4532', spine: '#276749',
    desc: 'Derechos y deberes laborales en España',
    fallbackGradient: 'linear-gradient(to bottom, #1a3a4a, #0d2030)',
  },
  // ── USA ──
  usConstitution: {
    label: 'U.S. Constitution', shortLabel: 'Constitution', year: '1788',
    color: '#8B6914', spine: '#B7791F',
    desc: 'The supreme law of the United States',
    fallbackGradient: 'linear-gradient(to bottom, #1a2a4a, #0d1830)',
  },
  title18Criminal: {
    label: 'Title 18 — Crimes', shortLabel: 'Criminal', year: '1948',
    color: '#9B1C1C', spine: '#C53030',
    desc: 'Federal crimes and criminal procedure',
    fallbackGradient: 'linear-gradient(to bottom, #4a2a1a, #2d1508)',
  },
  title42CivilRights: {
    label: 'Title 42 — Civil Rights', shortLabel: 'Civil Rights', year: '1964',
    color: '#1a365d', spine: '#2B6CB0',
    desc: 'Civil rights, public health and welfare',
    fallbackGradient: 'linear-gradient(to bottom, #2a3a1a, #182210)',
  },
  title29Labor: {
    label: 'Title 29 — Labor', shortLabel: 'Labor', year: '1938',
    color: '#1C4532', spine: '#276749',
    desc: 'Labor standards, unions and workplace rights',
    fallbackGradient: 'linear-gradient(to bottom, #3a3a1a, #222210)',
  },
  title26Tax: {
    label: 'Title 26 — Tax Code', shortLabel: 'Tax Code', year: '1986',
    color: '#744210', spine: '#D69E2E',
    desc: 'Internal Revenue Code and federal taxation',
    fallbackGradient: 'linear-gradient(to bottom, #5c3a1a, #3a2010)',
  },
  title15Commerce: {
    label: 'Title 15 — Commerce', shortLabel: 'Commerce', year: '1890',
    color: '#44337A', spine: '#553C9A',
    desc: 'Commerce, trade and consumer protection',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a4a, #0d2d2d)',
  },
  title8Immigration: {
    label: 'Title 8 — Immigration', shortLabel: 'Immigration', year: '1952',
    color: '#1D4044', spine: '#2C7A7B',
    desc: 'Immigration and nationality law',
    fallbackGradient: 'linear-gradient(to bottom, #1a3a5c, #0d2137)',
  },
  title20Education: {
    label: 'Title 20 — Education', shortLabel: 'Education', year: '1965',
    color: '#7B341E', spine: '#C05621',
    desc: 'Federal education law and student rights',
    fallbackGradient: 'linear-gradient(to bottom, #5c1a1a, #3a0d0d)',
  },
  title31Finance: {
    label: 'Title 31 — Finance', shortLabel: 'Finance', year: '1982',
    color: '#1A365D', spine: '#2B6CB0',
    desc: 'Money, banking and federal finance',
    fallbackGradient: 'linear-gradient(to bottom, #1a4a2a, #0d2d18)',
  },
  title49Transportation: {
    label: 'Title 49 — Transportation', shortLabel: 'Transportation', year: '1994',
    color: '#2D3748', spine: '#4A5568',
    desc: 'Federal transportation law and safety',
    fallbackGradient: 'linear-gradient(to bottom, #3a2a5c, #1f1637)',
  },
}

function BookCard({ codeKey, meta, articleCount, onClick }) {
  const illustrationSrc = CODE_ILLUSTRATIONS[codeKey] || null

  return (
    <div className="group relative cursor-pointer" onClick={onClick}>
      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none z-50"
        style={{
          background: 'rgba(0,0,0,0.90)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '12px',
          padding: '12px',
          width: '176px',
        }}
      >
        <p className="text-white text-xs font-semibold leading-tight">{meta.label}</p>
        <p className="text-white/60 mt-1 leading-relaxed" style={{ fontSize: '10px' }}>{meta.desc}</p>
        {articleCount > 0 && (
          <p className="mt-1 font-medium" style={{ fontSize: '10px', color: '#6B8CAE' }}>
            {articleCount} articles
          </p>
        )}
      </div>

      {/* Card body */}
      <div
        className="relative overflow-hidden transition-all duration-200 ease-out
          group-hover:-translate-y-1 group-hover:shadow-[0_20px_48px_rgba(0,0,0,0.60)]"
        style={{
          aspectRatio: '4 / 3',
          borderRadius: '12px',
          background: meta.fallbackGradient || '#1a2a4a',
        }}
      >
        {/* Full-bleed illustration */}
        {illustrationSrc && (
          <img
            src={illustrationSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Gradient scrim — transparent top, dark bottom for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.80) 100%)',
          }}
        />

        {/* Title + year overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <p className="text-white font-display font-semibold leading-tight text-lg">
            {meta.label}
          </p>
          <p className="text-white/50 text-xs font-mono mt-1">
            {meta.year}
          </p>
        </div>
      </div>
    </div>
  )
}

function ArticleList({ codeKey, countryCode, onBack }) {
  const navigate = useNavigate()
  const meta = CODE_META[codeKey]
  const [codeData, setCodeData] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCode(codeKey).then(data => {
      setCodeData(data)
      setLoading(false)
    }).catch(err => {
      console.error('loadCode failed:', err)
      setLoading(false)
    })
  }, [codeKey])

  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return }
    const timer = setTimeout(async () => {
      const results = await search(query, countryCode, codeKey)
      setSearchResults(results)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, codeKey, countryCode])

  const displayArticles = searchResults ?? (codeData?.articles || [])

  return (
    <PageBackground>
      <div className="min-h-screen pt-14 text-white">
        {/* Article list header */}
        <div
          className="sticky top-14 z-10"
          style={{
            background: 'rgba(5,10,20,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={onBack}
                className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
              >
                ← All Codes
              </button>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.spine }} />
                <span className="font-bold text-white">{meta.label}</span>
                <span className="text-xs text-white/40">{meta.year}</span>
              </div>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${meta.shortLabel}...`}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
              }}
            />
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-20 text-white/40">Loading...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults && (
                <p className="text-xs text-white/40 mb-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                </p>
              )}
              {displayArticles.map((article, idx) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.6) }}
                  onClick={() => navigate(`/article/${countryCode}/${article.id}`)}
                  className="text-left px-5 py-4 rounded-xl flex gap-4 transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: `4px solid ${meta.spine}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <span className="text-xs font-mono font-bold whitespace-nowrap mt-0.5"
                    style={{ color: meta.spine }}>
                    Art. {article.number}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-white">{article.title}</p>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed line-clamp-2">
                      {article.text.slice(0, 130)}...
                    </p>
                  </div>
                </motion.button>
              ))}
              {displayArticles.length === 0 && (
                <div className="text-center py-20 text-white/40 text-sm">
                  {query ? `No results for "${query}"` : 'No articles yet.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  )
}

export default function LibraryPage() {
  const { countryCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const country = countries.find(c => c.code === countryCode)
  const CODE_ORDER = CODE_ORDER_BY_COUNTRY[countryCode] || CODE_ORDER_BY_COUNTRY['BR']

  const [openCode, setOpenCode] = useState(null)
  const [articleCounts, setArticleCounts] = useState({})
  const [entered, setEntered] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryResults, setLibraryResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [dropdownOpen])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setArticleCounts({})
    const stateCodes = countryCode === 'BR'
      ? SP_STATES.flatMap(s => s.codes)
      : []
    const allKeys = [...CODE_ORDER, ...stateCodes]
    Promise.all(
      allKeys.map(async k => {
        const data = await loadCode(k)
        return [k, data?.articles?.length || 0]
      })
    ).then(entries => setArticleCounts(Object.fromEntries(entries)))
  }, [countryCode])

  useEffect(() => {
    if (!libraryQuery.trim()) { setLibraryResults([]); setSearchOpen(false); return }
    const timer = setTimeout(async () => {
      const results = await search(libraryQuery, countryCode)
      setLibraryResults(results.slice(0, 6))
      setSearchOpen(results.length > 0)
    }, 300)
    return () => clearTimeout(timer)
  }, [libraryQuery, countryCode])

  if (!country) return null

  if (openCode) {
    return (
      <ArticleList
        codeKey={openCode}
        countryCode={countryCode}
        onBack={() => setOpenCode(null)}
      />
    )
  }

  return (
    <PageBackground>
      <div
        className="min-h-screen text-white relative transition-all duration-700"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'none' : 'scale(0.97)',
        }}
      >
        {/* Header */}
        <div className="pt-16 pb-4 px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h1 className="text-3xl font-display font-bold text-white leading-tight">
                  {country.nameLocal || country.name} Law Library
                </h1>
                <p className="text-xs text-white/60">{CODE_ORDER.length} legal codes available</p>
              </div>
            </div>
            <Link to="/bookmarks"
              className="text-white/60 hover:text-white transition-colors px-2 text-lg">
              ☆
            </Link>
            <div className="ml-auto flex items-center gap-2">
              {/* State Law dropdown — Brazil only */}
              {countryCode === 'BR' && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors backdrop-blur-sm"
                    style={{
                      border: selectedState
                        ? '1px solid rgba(91,141,184,0.60)'
                        : '1px solid rgba(255,255,255,0.20)',
                      background: selectedState
                        ? 'rgba(91,141,184,0.18)'
                        : 'rgba(255,255,255,0.10)',
                    }}
                  >
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>🗺️</span>
                    <span>
                      {selectedState
                        ? SP_STATES.find(s => s.code === selectedState)?.name
                        : 'State Law'}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.5 }}>{dropdownOpen ? '▲' : '▼'}</span>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden shadow-2xl z-30"
                      style={{
                        background: 'rgba(8,14,28,0.96)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {selectedState && (
                        <button
                          onClick={() => { setSelectedState(null); setDropdownOpen(false) }}
                          className="w-full text-left px-4 py-2.5 text-xs text-white/40 transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          ✕ Clear selection
                        </button>
                      )}
                      {SP_STATES.map(st => (
                        <button
                          key={st.code}
                          disabled={st.soon}
                          onClick={() => {
                            if (!st.soon) {
                              setSelectedState(st.code)
                              setDropdownOpen(false)
                            }
                          }}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            cursor: st.soon ? 'default' : 'pointer',
                          }}
                          onMouseEnter={e => {
                            if (!st.soon) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                          }}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>{st.flag}</span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: st.soon ? 'rgba(255,255,255,0.25)' : 'white' }}
                          >
                            {st.name}
                          </span>
                          {st.soon && (
                            <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
                              em breve
                            </span>
                          )}
                          {selectedState === st.code && (
                            <span className="ml-auto text-xs" style={{ color: '#5B8DB8' }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate(`/assistant/${countryCode}`)}
                className="px-4 py-2 rounded-full text-sm font-medium text-white
                  transition-colors backdrop-blur-sm"
                style={{
                  border: '1px solid rgba(255,255,255,0.20)',
                  background: 'rgba(255,255,255,0.10)',
                }}
              >
                AI Assistant
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs uppercase tracking-widest text-white/40 font-medium">
              Hover to preview · Click to open
            </p>
            <div className="sm:ml-auto relative w-full sm:w-72">
              <input
                type="text"
                value={libraryQuery}
                onChange={e => setLibraryQuery(e.target.value)}
                placeholder="Search all codes..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs">🔍</span>
              {libraryQuery && searchOpen && (
                <div
                  className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden z-20 shadow-2xl"
                  style={{
                    background: 'rgba(10,15,30,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {libraryResults.map(r => (
                    <button
                      key={r.id}
                      onClick={() => navigate(`/article/${countryCode}/${r.id}`)}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold"
                          style={{ color: r.codeColor }}>Art. {r.number}</span>
                        <span className="text-xs text-white/40">{r.codeName}</span>
                      </div>
                      <p className="text-sm text-white/80 font-medium mt-0.5">{r.title}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code grid — max-w-5xl keeps 3 cols at desktop (3×280 + 2×28 = 896 < 976px avail) */}
        <div className={`max-w-5xl mx-auto px-6 pt-2 ${selectedState ? 'pb-4' : 'pb-16'}`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {CODE_ORDER.map(code => {
              const meta = CODE_META[code]
              if (!meta) return null
              return (
                <BookCard
                  key={code}
                  codeKey={code}
                  meta={meta}
                  articleCount={articleCounts[code] || 0}
                  onClick={() => setOpenCode(code)}
                />
              )
            })}
          </div>
        </div>

        {/* State Law cards — shown below grid when a state is selected via dropdown */}
        {countryCode === 'BR' && selectedState && (() => {
          const st = SP_STATES.find(s => s.code === selectedState)
          if (!st || st.codes.length === 0) return null
          return (
            <div className="max-w-5xl mx-auto px-6 pb-20">
              <div
                className="mb-6 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs uppercase tracking-widest font-medium mt-4" style={{ color: '#5B8DB8' }}>
                  {st.flag} {st.name} · Legislação Estadual
                </p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '28px',
                  maxWidth: '320px',
                }}
              >
                {st.codes.map(code => {
                  const meta = CODE_META[code]
                  if (!meta) return null
                  return (
                    <BookCard
                      key={code}
                      codeKey={code}
                      meta={meta}
                      articleCount={articleCounts[code] || 0}
                      onClick={() => setOpenCode(code)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    </PageBackground>
  )
}
