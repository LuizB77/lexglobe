import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadCode } from '../utils/searchEngine'
import { search } from '../utils/searchEngine'
import countries from '../data/countries.json'
import { useAuth } from '../context/AuthContext'
import PageBackground from '../components/ui/PageBackground'

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

const SPINE_COLORS = [
  'linear-gradient(to bottom, #1a3a5c, #0d2137)',
  'linear-gradient(to bottom, #5c1a1a, #3a0d0d)',
  'linear-gradient(to bottom, #1a4a2a, #0d2d18)',
  'linear-gradient(to bottom, #3a2a5c, #1f1637)',
  'linear-gradient(to bottom, #5c3a1a, #3a2010)',
  'linear-gradient(to bottom, #1a4a4a, #0d2d2d)',
]

const CODE_META = {
  constituicao: {
    label: 'Constituição Federal',
    shortLabel: 'Constituição',
    year: '1988',
    color: '#B8860B',
    spine: '#FFD700',
    icon: '⚖️',
    desc: 'Lei maior da República Federativa do Brasil',
    spineGradient: SPINE_COLORS[0],
  },
  codigoPenal: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1940',
    color: '#9B1C1C',
    spine: '#E53E3E',
    icon: '🔒',
    desc: 'Crimes e penalidades no direito brasileiro',
    spineGradient: SPINE_COLORS[1],
  },
  codigoCivil: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '2002',
    color: '#4C3494',
    spine: '#7F77DD',
    icon: '📜',
    desc: 'Relações civis, contratos, família e propriedade',
    spineGradient: SPINE_COLORS[2],
  },
  clt: {
    label: 'CLT',
    shortLabel: 'CLT',
    year: '1943',
    color: '#145A3A',
    spine: '#1D9E75',
    icon: '👷',
    desc: 'Consolidação das Leis do Trabalho',
    spineGradient: SPINE_COLORS[3],
  },
  eca: {
    label: 'ECA',
    shortLabel: 'ECA',
    year: '1990',
    color: '#923B05',
    spine: '#F6AD55',
    icon: '🧒',
    desc: 'Estatuto da Criança e do Adolescente',
    spineGradient: SPINE_COLORS[4],
  },
  cdc: {
    label: 'CDC',
    shortLabel: 'CDC',
    year: '1990',
    color: '#1a4a7a',
    spine: '#63B3ED',
    icon: '🛒',
    desc: 'Código de Defesa do Consumidor',
    spineGradient: SPINE_COLORS[5],
  },
  constituicaoPT: {
    label: 'Constituição da República',
    shortLabel: 'Constituição',
    year: '1976',
    color: '#B8860B',
    spine: '#FFD700',
    icon: '⚖️',
    desc: 'Lei fundamental da República Portuguesa',
    spineGradient: SPINE_COLORS[0],
  },
  codigoPenalPT: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1982',
    color: '#9B1C1C',
    spine: '#E53E3E',
    icon: '🔒',
    desc: 'Crimes e penalidades no direito português',
    spineGradient: SPINE_COLORS[1],
  },
  codigoCivilPT: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '1966',
    color: '#4C3494',
    spine: '#7F77DD',
    icon: '📜',
    desc: 'Relações civis, contratos e família',
    spineGradient: SPINE_COLORS[2],
  },
  codigoTrabalho: {
    label: 'Código do Trabalho',
    shortLabel: 'Cód. Trabalho',
    year: '2003',
    color: '#145A3A',
    spine: '#1D9E75',
    icon: '👷',
    desc: 'Lei laboral portuguesa',
    spineGradient: SPINE_COLORS[3],
  },
  codigoProcessoPenal: {
    label: 'Código de Processo Penal',
    shortLabel: 'Proc. Penal',
    year: '1987',
    color: '#9B1C1C',
    spine: '#C53030',
    icon: '⚖️',
    desc: 'Procedimento criminal português',
    spineGradient: SPINE_COLORS[4],
  },
  codigoProcessoCivil: {
    label: 'Código de Processo Civil',
    shortLabel: 'Proc. Civil',
    year: '2013',
    color: '#1a365d',
    spine: '#2B6CB0',
    icon: '📋',
    desc: 'Procedimento civil português',
    spineGradient: SPINE_COLORS[5],
  },
  codigoComercial: {
    label: 'Código Comercial',
    shortLabel: 'Cód. Comercial',
    year: '1888',
    color: '#744210',
    spine: '#D69E2E',
    icon: '⚓',
    desc: 'Direito comercial e mercantil',
    spineGradient: SPINE_COLORS[0],
  },
  codigoEstrada: {
    label: 'Código da Estrada',
    shortLabel: 'Cód. Estrada',
    year: '1994',
    color: '#7B341E',
    spine: '#C05621',
    icon: '🚗',
    desc: 'Regulação do trânsito e condução',
    spineGradient: SPINE_COLORS[1],
  },
  constitucionES: {
    label: 'Constitución Española',
    shortLabel: 'Constitución',
    year: '1978',
    color: '#8B6914',
    spine: '#C8A000',
    icon: '⚖️',
    desc: 'Ley fundamental del Reino de España',
    spineGradient: SPINE_COLORS[0],
  },
  codigoPenalES: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1995',
    color: '#9B1C1C',
    spine: '#C53030',
    icon: '🔒',
    desc: 'Delitos y penas en el derecho español',
    spineGradient: SPINE_COLORS[1],
  },
  codigoCivilES: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '1889',
    color: '#44337A',
    spine: '#553C9A',
    icon: '📜',
    desc: 'Relaciones civiles, contratos y familia',
    spineGradient: SPINE_COLORS[2],
  },
  estatutoTrabajadores: {
    label: 'Estatuto de los Trabajadores',
    shortLabel: 'Estatuto',
    year: '2015',
    color: '#1C4532',
    spine: '#276749',
    icon: '👷',
    desc: 'Derechos y deberes laborales en España',
    spineGradient: SPINE_COLORS[3],
  },
  usConstitution: {
    label: 'U.S. Constitution',
    shortLabel: 'Constitution',
    year: '1788',
    color: '#8B6914',
    spine: '#B7791F',
    icon: '🦅',
    desc: 'The supreme law of the United States',
    spineGradient: SPINE_COLORS[0],
  },
  title18Criminal: {
    label: 'Title 18 — Crimes',
    shortLabel: 'Criminal',
    year: '1948',
    color: '#9B1C1C',
    spine: '#C53030',
    icon: '🔒',
    desc: 'Federal crimes and criminal procedure',
    spineGradient: SPINE_COLORS[1],
  },
  title42CivilRights: {
    label: 'Title 42 — Civil Rights',
    shortLabel: 'Civil Rights',
    year: '1964',
    color: '#1a365d',
    spine: '#2B6CB0',
    icon: '⚖️',
    desc: 'Civil rights, public health and welfare',
    spineGradient: SPINE_COLORS[2],
  },
  title29Labor: {
    label: 'Title 29 — Labor',
    shortLabel: 'Labor',
    year: '1938',
    color: '#1C4532',
    spine: '#276749',
    icon: '👷',
    desc: 'Labor standards, unions and workplace rights',
    spineGradient: SPINE_COLORS[3],
  },
  title26Tax: {
    label: 'Title 26 — Tax Code',
    shortLabel: 'Tax Code',
    year: '1986',
    color: '#744210',
    spine: '#D69E2E',
    icon: '💰',
    desc: 'Internal Revenue Code and federal taxation',
    spineGradient: SPINE_COLORS[4],
  },
  title15Commerce: {
    label: 'Title 15 — Commerce',
    shortLabel: 'Commerce',
    year: '1890',
    color: '#44337A',
    spine: '#553C9A',
    icon: '🏛️',
    desc: 'Commerce, trade and consumer protection',
    spineGradient: SPINE_COLORS[5],
  },
  title8Immigration: {
    label: 'Title 8 — Immigration',
    shortLabel: 'Immigration',
    year: '1952',
    color: '#1D4044',
    spine: '#2C7A7B',
    icon: '✈️',
    desc: 'Immigration and nationality law',
    spineGradient: SPINE_COLORS[0],
  },
  title20Education: {
    label: 'Title 20 — Education',
    shortLabel: 'Education',
    year: '1965',
    color: '#7B341E',
    spine: '#C05621',
    icon: '🎓',
    desc: 'Federal education law and student rights',
    spineGradient: SPINE_COLORS[1],
  },
  title31Finance: {
    label: 'Title 31 — Finance',
    shortLabel: 'Finance',
    year: '1982',
    color: '#1A365D',
    spine: '#2B6CB0',
    icon: '🏦',
    desc: 'Money, banking and federal finance',
    spineGradient: SPINE_COLORS[2],
  },
  title49Transportation: {
    label: 'Title 49 — Transportation',
    shortLabel: 'Transportation',
    year: '1994',
    color: '#2D3748',
    spine: '#4A5568',
    icon: '🚗',
    desc: 'Federal transportation law and safety',
    spineGradient: SPINE_COLORS[3],
  },
}

const SPINE_WIDTHS = {
  constituicao: 68, codigoPenal: 58, codigoCivil: 80, clt: 75, eca: 55, cdc: 52,
}
function getSpineWidth(codeKey) { return SPINE_WIDTHS[codeKey] || 65 }

function BookSpine({ codeKey, meta, articleCount, onClick }) {
  const width = getSpineWidth(codeKey)
  return (
    <div
      className="group relative flex flex-col items-center cursor-pointer"
      style={{ width: `${width}px`, flexShrink: 0, filter: 'drop-shadow(3px 0 6px rgba(0,0,0,0.5)) drop-shadow(-1px 0 2px rgba(0,0,0,0.3))' }}
      onClick={onClick}
    >
      {/* Tooltip */}
      <div
        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2
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
          <p className="mt-1 font-medium" style={{ fontSize: '10px', color: '#B8860B' }}>
            {articleCount} articles
          </p>
        )}
      </div>

      {/* Book body */}
      <div
        className="relative transition-all duration-300 ease-out
          group-hover:-translate-y-5 group-hover:brightness-125"
        style={{
          width: `${width}px`,
          height: '220px',
          background: meta.spineGradient,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.4)',
          borderRadius: '2px 2px 0 0',
        }}
      >
        {/* Page edge — top of book */}
        <div className="absolute top-0 left-0 right-0 h-3 pointer-events-none" style={{
          background: 'repeating-linear-gradient(90deg, #f5f0e8 0px, #f5f0e8 1px, #e8e0d0 1px, #e8e0d0 2px)',
          opacity: 0.9,
          borderRadius: '2px 2px 0 0',
        }} />
        {/* Left board edge (thick spine border) */}
        <div className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none" style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.1), transparent)',
        }} />
        {/* Gold label strip */}
        <div className="absolute left-0 top-3 bottom-0 w-1 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(184,134,11,0.60), rgba(184,134,11,0.20))',
        }} />
        {/* Cloth weave texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px), repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
          mixBlendMode: 'multiply',
        }} />
        {/* Worn center highlight */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 80% at 50% 40%, rgba(255,255,255,0.12) 0%, transparent 70%)',
          mixBlendMode: 'screen',
        }} />
        {/* Right edge highlight */}
        <div className="absolute top-0 right-0 bottom-0 w-px pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05), transparent)',
        }} />

        {/* Rotated title */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <span
            className="text-white/90 font-semibold tracking-wide text-center leading-tight"
            style={{
              fontSize: '11px',
              maxWidth: '180px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {meta.label}
          </span>
        </div>

        {/* Year at bottom */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="text-white/40 font-mono"
            style={{ fontSize: '10px', transform: 'rotate(-90deg)', display: 'block' }}>
            {meta.year}
          </span>
        </div>
      </div>

      {/* Book shadow on shelf */}
      <div className="w-full h-2 mb-1" style={{
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,0,0,0.6) 0%, transparent 100%)',
      }} />
    </div>
  )
}

function Shelf({ codes, countryCode, articleCounts, onCodeClick }) {
  return (
    <div className="flex flex-col">
      {/* Books row */}
      <div className="flex items-end justify-between gap-3 px-4 overflow-visible">
        {codes.map(code => {
          const meta = CODE_META[code]
          if (!meta) return null
          return (
            <BookSpine
              key={code}
              codeKey={code}
              meta={meta}
              articleCount={articleCounts[code] || 0}
              onClick={() => onCodeClick(code)}
            />
          )
        })}
      </div>
      {/* Shelf plank */}
      <div
        className="w-full h-6 rounded-sm mt-0 mb-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #c4832a 0%, #a06020 15%, #7a4a18 40%, #5c3610 70%, #3a200a 100%)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,220,120,0.2), inset 0 -1px 0 rgba(0,0,0,0.5)',
        }}
      >
        {/* Wood grain lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(0,0,0,0.15) 12px, rgba(0,0,0,0.15) 13px, transparent 13px, transparent 28px, rgba(255,255,255,0.04) 28px, rgba(255,255,255,0.04) 29px, transparent 29px, transparent 45px, rgba(0,0,0,0.1) 45px, rgba(0,0,0,0.1) 46px)',
        }} />
        {/* Light reflection on top edge */}
        <div className="absolute inset-x-0 top-0 h-1" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }} />
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
              {displayArticles.map(article => (
                <button
                  key={article.id}
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
                </button>
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

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setArticleCounts({})
    Promise.all(
      CODE_ORDER.map(async k => {
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

  // Split codes into rows of 3
  const rows = []
  for (let i = 0; i < CODE_ORDER.length; i += 3) {
    rows.push(CODE_ORDER.slice(i, i + 3))
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
                <h1 className="text-xl font-bold text-white">
                  {country.nameLocal || country.name} Law Library
                </h1>
                <p className="text-xs text-white/60">{CODE_ORDER.length} legal codes available</p>
              </div>
            </div>
            <Link to="/bookmarks"
              className="text-white/60 hover:text-white transition-colors px-2 text-lg">
              ☆
            </Link>
            <button
              onClick={() => navigate(`/assistant/${countryCode}`)}
              className="ml-auto px-4 py-2 rounded-full text-sm font-medium text-white
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

        {/* Search */}
        <div className="max-w-5xl mx-auto px-4 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-xs uppercase tracking-widest text-white/40 font-medium">
              Hover a book to preview · Click to open
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

        {/* Bookshelf */}
        <div className="max-w-3xl mx-auto px-8 pt-6 pb-16">
          {rows.map((rowCodes, i) => (
            <Shelf
              key={i}
              codes={rowCodes}
              countryCode={countryCode}
              articleCounts={articleCounts}
              onCodeClick={setOpenCode}
            />
          ))}
        </div>
      </div>
    </PageBackground>
  )
}
