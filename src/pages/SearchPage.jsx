import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { search } from '../utils/searchEngine'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

const COUNTRIES = [
  { code: 'BR', label: 'Brazil', flag: '🇧🇷', color: '#6B8CAE' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹', color: '#1a3a5c' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸', color: '#5c2a1a' },
  { code: 'US', label: 'USA', flag: '🇺🇸', color: '#1a2a4a' },
]

const CODEKEY_TO_COUNTRY = {
  constituicao: 'BR', codigoPenal: 'BR', codigoCivil: 'BR', clt: 'BR', eca: 'BR', cdc: 'BR',
  constituicaoSP: 'BR',
  constituicaoPT: 'PT', codigoPenalPT: 'PT', codigoCivilPT: 'PT', codigoTrabalho: 'PT',
  codigoProcessoPenal: 'PT', codigoProcessoCivil: 'PT', codigoComercial: 'PT', codigoEstrada: 'PT',
  constitucionES: 'ES', codigoPenalES: 'ES', codigoCivilES: 'ES', estatutoTrabajadores: 'ES',
  usConstitution: 'US', title18Criminal: 'US', title42CivilRights: 'US', title29Labor: 'US',
  title26Tax: 'US', title15Commerce: 'US', title8Immigration: 'US', title20Education: 'US',
  title31Finance: 'US', title49Transportation: 'US',
}

const SUGGESTIONS = [
  { label: 'tenant rights', emoji: '🏠' },
  { label: 'direitos do consumidor', emoji: '🛒' },
  { label: 'contrato de trabalho', emoji: '📋' },
  { label: 'freedom of speech', emoji: '🗣️' },
  { label: 'privacy', emoji: '🔒' },
]

function getCountryColor(countryCode) {
  return COUNTRIES.find(c => c.code === countryCode)?.color ?? '#555'
}

function ResultCard({ article, countryCode, onClick }) {
  const borderColor = getCountryColor(countryCode)
  const country = COUNTRIES.find(c => c.code === countryCode)
  const snippet = article.text
    ? article.text.replace(/\s+/g, ' ').slice(0, 120) + '…'
    : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-all backdrop-blur-sm"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderLeft: `3px solid ${borderColor}`,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-xs font-bold" style={{ color: '#6B8CAE' }}>
            {article.number}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.60)',
            }}
          >
            {country?.flag} {article.codeName}
          </span>
        </div>
        {article.title && (
          <p className="text-white text-sm font-semibold leading-snug mb-1">
            {article.title}
          </p>
        )}
        {snippet && (
          <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
            {snippet}
          </p>
        )}
      </div>
    </button>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('ALL')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const runSearch = useCallback(async (q, filter) => {
    if (q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      let merged = []
      if (filter === 'ALL') {
        const perCountry = await Promise.all(
          COUNTRIES.map(c => search(q, c.code))
        )
        for (const hits of perCountry) {
          for (const hit of hits) {
            const cc = CODEKEY_TO_COUNTRY[hit.codeKey]
            merged.push({ ...hit, countryCode: cc })
          }
        }
      } else {
        const hits = await search(q, filter)
        merged = hits.map(h => ({ ...h, countryCode: filter }))
      }
      const seen = new Set()
      const deduped = []
      for (const item of merged) {
        const key = `${item.codeKey}:${item.id}`
        if (!seen.has(key)) { seen.add(key); deduped.push(item) }
      }
      setResults(deduped.slice(0, 50))
    } finally {
      setLoading(false)
    }
  }, [])

  function handleQueryChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q, countryFilter), 300)
  }

  function handleFilterChange(code) {
    setCountryFilter(code)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query, code), 100)
  }

  function handleSuggestion(label) {
    setQuery(label)
    runSearch(label, countryFilter)
  }

  const showResults = query.trim().length >= 2
  const showEmpty = showResults && !loading && results.length === 0

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white mb-1">Search</h1>
          <p className="text-sm text-white/50">Search across all laws and codes.</p>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg select-none pointer-events-none">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search articles, rights, laws…"
            className="w-full outline-none text-white placeholder-white/30 text-base
              rounded-2xl pl-12 pr-5 py-4"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs">
              …
            </span>
          )}
        </div>

        {/* Country filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => handleFilterChange('ALL')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-sm"
            style={{
              border: `1px solid ${countryFilter === 'ALL' ? '#6B8CAE' : 'rgba(255,255,255,0.18)'}`,
              color: countryFilter === 'ALL' ? '#6B8CAE' : 'rgba(255,255,255,0.55)',
              background: countryFilter === 'ALL' ? 'rgba(107,140,174,0.10)' : 'transparent',
            }}
          >
            All
          </button>
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => handleFilterChange(c.code)}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-sm"
              style={{
                border: `1px solid ${countryFilter === c.code ? '#6B8CAE' : 'rgba(255,255,255,0.18)'}`,
                color: countryFilter === c.code ? '#6B8CAE' : 'rgba(255,255,255,0.55)',
                background: countryFilter === c.code ? 'rgba(107,140,174,0.10)' : 'transparent',
              }}
            >
              <span>{c.flag}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Suggestion chips (no query) */}
        {!showResults && (
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Try searching for</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  onClick={() => handleSuggestion(s.label)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.70)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-white font-semibold mb-1">No results for "{query}"</p>
            <p className="text-white/40 text-sm">
              Try different keywords or search in another language —
              articles are available in Portuguese, Spanish, and English.
            </p>
          </GlassCard>
        )}

        {/* Results */}
        {showResults && results.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((article, i) => (
              <ResultCard
                key={`${article.codeKey}:${article.id}:${i}`}
                article={article}
                countryCode={article.countryCode}
                onClick={() => navigate(`/article/${article.countryCode}/${article.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </PageBackground>
  )
}
