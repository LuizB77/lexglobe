import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadCode } from '../utils/searchEngine'
import { search } from '../utils/searchEngine'
import countries from '../data/countries.json'
import CodeIllustration from '../components/ui/CodeIllustration'
import { useAuth } from '../context/AuthContext'

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

const CODE_META = {
  constituicao: {
    label: 'Constituição Federal',
    shortLabel: 'Constituição',
    year: '1988',
    color: '#B8860B',
    bg: '#fffbe6',
    spine: '#FFD700',
    icon: '⚖️',
    desc: 'Lei maior da República Federativa do Brasil',
  },
  codigoPenal: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1940',
    color: '#9B1C1C',
    bg: '#fff0f0',
    spine: '#E53E3E',
    icon: '🔒',
    desc: 'Crimes e penalidades no direito brasileiro',
  },
  codigoCivil: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '2002',
    color: '#4C3494',
    bg: '#f3f0ff',
    spine: '#7F77DD',
    icon: '📜',
    desc: 'Relações civis, contratos, família e propriedade',
  },
  clt: {
    label: 'CLT',
    shortLabel: 'CLT',
    year: '1943',
    color: '#145A3A',
    bg: '#f0fff8',
    spine: '#1D9E75',
    icon: '👷',
    desc: 'Consolidação das Leis do Trabalho',
  },
  eca: {
    label: 'ECA',
    shortLabel: 'ECA',
    year: '1990',
    color: '#923B05',
    bg: '#fff7ed',
    spine: '#F6AD55',
    icon: '🧒',
    desc: 'Estatuto da Criança e do Adolescente',
  },
  cdc: {
    label: 'CDC',
    shortLabel: 'CDC',
    year: '1990',
    color: '#1a4a7a',
    bg: '#eff8ff',
    spine: '#63B3ED',
    icon: '🛒',
    desc: 'Código de Defesa do Consumidor',
  },
  constituicaoPT: {
    label: 'Constituição da República',
    shortLabel: 'Constituição',
    year: '1976',
    color: '#B8860B',
    bg: '#fffbe6',
    spine: '#FFD700',
    icon: '⚖️',
    desc: 'Lei fundamental da República Portuguesa',
  },
  codigoPenalPT: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1982',
    color: '#9B1C1C',
    bg: '#fff0f0',
    spine: '#E53E3E',
    icon: '🔒',
    desc: 'Crimes e penalidades no direito português',
  },
  codigoCivilPT: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '1966',
    color: '#4C3494',
    bg: '#f3f0ff',
    spine: '#7F77DD',
    icon: '📜',
    desc: 'Relações civis, contratos e família',
  },
  codigoTrabalho: {
    label: 'Código do Trabalho',
    shortLabel: 'Cód. Trabalho',
    year: '2003',
    color: '#145A3A',
    bg: '#f0fff8',
    spine: '#1D9E75',
    icon: '👷',
    desc: 'Lei laboral portuguesa',
  },
  codigoProcessoPenal: {
    label: 'Código de Processo Penal',
    shortLabel: 'Proc. Penal',
    year: '1987',
    color: '#9B1C1C',
    bg: '#fff5f5',
    spine: '#C53030',
    icon: '⚖️',
    desc: 'Procedimento criminal português',
  },
  codigoProcessoCivil: {
    label: 'Código de Processo Civil',
    shortLabel: 'Proc. Civil',
    year: '2013',
    color: '#1a365d',
    bg: '#ebf8ff',
    spine: '#2B6CB0',
    icon: '📋',
    desc: 'Procedimento civil português',
  },
  codigoComercial: {
    label: 'Código Comercial',
    shortLabel: 'Cód. Comercial',
    year: '1888',
    color: '#744210',
    bg: '#fffaf0',
    spine: '#D69E2E',
    icon: '⚓',
    desc: 'Direito comercial e mercantil',
  },
  codigoEstrada: {
    label: 'Código da Estrada',
    shortLabel: 'Cód. Estrada',
    year: '1994',
    color: '#7B341E',
    bg: '#fff8f0',
    spine: '#C05621',
    icon: '🚗',
    desc: 'Regulação do trânsito e condução',
  },
  constitucionES: {
    label: 'Constitución Española',
    shortLabel: 'Constitución',
    year: '1978',
    color: '#8B6914',
    bg: '#fffdf0',
    spine: '#C8A000',
    icon: '⚖️',
    desc: 'Ley fundamental del Reino de España',
  },
  codigoPenalES: {
    label: 'Código Penal',
    shortLabel: 'Código Penal',
    year: '1995',
    color: '#9B1C1C',
    bg: '#fff5f5',
    spine: '#C53030',
    icon: '🔒',
    desc: 'Delitos y penas en el derecho español',
  },
  codigoCivilES: {
    label: 'Código Civil',
    shortLabel: 'Código Civil',
    year: '1889',
    color: '#44337A',
    bg: '#faf5ff',
    spine: '#553C9A',
    icon: '📜',
    desc: 'Relaciones civiles, contratos y familia',
  },
  estatutoTrabajadores: {
    label: 'Estatuto de los Trabajadores',
    shortLabel: 'Estatuto',
    year: '2015',
    color: '#1C4532',
    bg: '#f0fff4',
    spine: '#276749',
    icon: '👷',
    desc: 'Derechos y deberes laborales en España',
  },
  usConstitution: {
    label: 'U.S. Constitution',
    shortLabel: 'Constitution',
    year: '1788',
    color: '#8B6914',
    bg: '#fffdf0',
    spine: '#B7791F',
    icon: '🦅',
    desc: 'The supreme law of the United States',
  },
  title18Criminal: {
    label: 'Title 18 — Crimes',
    shortLabel: 'Criminal',
    year: '1948',
    color: '#9B1C1C',
    bg: '#fff5f5',
    spine: '#C53030',
    icon: '🔒',
    desc: 'Federal crimes and criminal procedure',
  },
  title42CivilRights: {
    label: 'Title 42 — Civil Rights',
    shortLabel: 'Civil Rights',
    year: '1964',
    color: '#1a365d',
    bg: '#ebf8ff',
    spine: '#2B6CB0',
    icon: '⚖️',
    desc: 'Civil rights, public health and welfare',
  },
  title29Labor: {
    label: 'Title 29 — Labor',
    shortLabel: 'Labor',
    year: '1938',
    color: '#1C4532',
    bg: '#f0fff4',
    spine: '#276749',
    icon: '👷',
    desc: 'Labor standards, unions and workplace rights',
  },
  title26Tax: {
    label: 'Title 26 — Internal Revenue Code',
    shortLabel: 'Tax Code',
    year: '1986',
    color: '#744210',
    bg: '#fffaf0',
    spine: '#D69E2E',
    icon: '💰',
    desc: 'Internal Revenue Code and federal taxation',
  },
  title15Commerce: {
    label: 'Title 15 — Commerce',
    shortLabel: 'Commerce',
    year: '1890',
    color: '#44337A',
    bg: '#faf5ff',
    spine: '#553C9A',
    icon: '🏛️',
    desc: 'Commerce, trade and consumer protection',
  },
  title8Immigration: {
    label: 'Title 8 — Immigration',
    shortLabel: 'Immigration',
    year: '1952',
    color: '#1D4044',
    bg: '#e6fffa',
    spine: '#2C7A7B',
    icon: '✈️',
    desc: 'Immigration and nationality law',
  },
  title20Education: {
    label: 'Title 20 — Education',
    shortLabel: 'Education',
    year: '1965',
    color: '#7B341E',
    bg: '#fff8f0',
    spine: '#C05621',
    icon: '🎓',
    desc: 'Federal education law and student rights',
  },
  title31Finance: {
    label: 'Title 31 — Finance',
    shortLabel: 'Finance',
    year: '1982',
    color: '#1A365D',
    bg: '#ebf8ff',
    spine: '#2B6CB0',
    icon: '🏦',
    desc: 'Money, banking and federal finance',
  },
  title49Transportation: {
    label: 'Title 49 — Transportation',
    shortLabel: 'Transportation',
    year: '1994',
    color: '#2D3748',
    bg: '#f7fafc',
    spine: '#4A5568',
    icon: '🚗',
    desc: 'Federal transportation law and safety',
  },
}

function BookCard({ codeKey, meta, onClick, articleCount }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl overflow-hidden text-left
        transition-all duration-300 focus:outline-none bg-white"
      style={{
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.18), 0 4px 20px ${meta.spine}44`
          : '0 4px 20px rgba(0,0,0,0.08)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        border: `1px solid ${meta.spine}33`,
      }}
    >
      {/* Illustration */}
      <div className="relative">
        <CodeIllustration codeKey={codeKey} />
        <span
          className="absolute top-2 right-2 text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: 'white' }}
        >
          {meta.year}
        </span>
      </div>

      {/* Spine accent */}
      <div className="h-1 w-full" style={{ backgroundColor: meta.spine }} />

      {/* Book body */}
      <div className="flex-1 p-4 flex flex-col gap-2" style={{ background: meta.bg }}>
        <h3 className="font-bold text-sm leading-tight" style={{ color: meta.color }}>
          {meta.label}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: meta.color + 'aa' }}>
          {meta.desc}
        </p>
        <div className="mt-auto pt-2 border-t" style={{ borderColor: meta.spine + '33' }}>
          <span className="text-xs font-medium" style={{ color: meta.color + '88' }}>
            {articleCount} article{articleCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hover CTA */}
      {hovered && (
        <div
          className="absolute bottom-0 left-0 right-0 py-2.5 text-center
            text-sm font-semibold text-white"
          style={{ backgroundColor: meta.spine }}
        >
          Open Book →
        </div>
      )}
    </button>
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
    <div className="min-h-screen pt-14" style={{ background: '#f8f7f4' }}>
      {/* Article list header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              ← All Codes
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.spine }} />
              <span className="font-bold text-gray-800">{meta.label}</span>
              <span className="text-xs text-gray-400">{meta.year}</span>
            </div>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${meta.shortLabel}...`}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200
              text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {searchResults && (
              <p className="text-xs text-gray-400 mb-2">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
            {displayArticles.map(article => (
              <button
                key={article.id}
                onClick={() => navigate(`/article/${countryCode}/${article.id}`)}
                className="text-left px-5 py-4 rounded-xl bg-white border border-gray-100
                  hover:border-gray-300 hover:shadow-sm transition-all duration-150 flex gap-4"
                style={{ borderLeft: `4px solid ${meta.spine}` }}
              >
                <span className="text-xs font-mono font-bold whitespace-nowrap mt-0.5"
                  style={{ color: meta.color }}>
                  Art. {article.number}
                </span>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{article.title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                    {article.text.slice(0, 130)}...
                  </p>
                </div>
              </button>
            ))}
            {displayArticles.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">
                {query ? `No results for "${query}"` : 'No articles yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const { countryCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const country = countries.find(c => c.code === countryCode)
  const CODE_ORDER = CODE_ORDER_BY_COUNTRY[countryCode] || CODE_ORDER_BY_COUNTRY['BR']

  // Allow guest browsing — no redirect needed
  // Users just can't save bookmarks without an account

  const [openCode, setOpenCode] = useState(null)
  const [articleCounts, setArticleCounts] = useState({})
  const [entered, setEntered] = useState(false)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryResults, setLibraryResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)

  // Animate entry
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Load article counts for all codes
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

  return (
    <div
      className="min-h-screen pt-14 transition-all duration-700"
      style={{
        background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 40%)',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'scale(0.97)',
      }}
    >
      {/* Library header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {country.nameLocal || country.name} Law Library
              </h1>
              <p className="text-xs text-gray-400">{CODE_ORDER.length} legal codes available</p>
            </div>
          </div>
          <Link to="/bookmarks"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2">
            ☆
          </Link>
          <button
            onClick={() => navigate(`/assistant/${countryCode}`)}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#7F77DD' }}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {/* Shelf label */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Select a legal code to browse
          </p>
          <div className="sm:ml-auto relative w-full sm:w-72">
            <input
              type="text"
              value={libraryQuery}
              onChange={e => setLibraryQuery(e.target.value)}
              placeholder="Search all codes — article number or words..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-gray-200
                text-sm text-gray-800 placeholder-gray-400
                focus:outline-none focus:border-gray-400 shadow-sm"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            {libraryQuery && searchOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 rounded-xl
                bg-white shadow-2xl border border-gray-200 overflow-hidden z-20">
                {libraryResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/article/${countryCode}/${r.id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50
                      border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold"
                        style={{ color: r.codeColor }}>Art. {r.number}</span>
                      <span className="text-xs text-gray-400">{r.codeName}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mt-0.5">{r.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book grid */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CODE_ORDER.map(code => (
            <BookCard
              key={code}
              codeKey={code}
              meta={CODE_META[code]}
              articleCount={articleCounts[code] || 0}
              onClick={() => setOpenCode(code)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
