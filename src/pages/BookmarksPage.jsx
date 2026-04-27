import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import { loadCode } from '../utils/searchEngine'

const CODE_META = {
  constituicao: { label: 'Constituição Federal', spine: '#FFD700', color: '#B8860B' },
  codigoPenal:  { label: 'Código Penal',          spine: '#E53E3E', color: '#9B1C1C' },
  codigoCivil:  { label: 'Código Civil',           spine: '#7F77DD', color: '#4C3494' },
  clt:          { label: 'CLT',                    spine: '#1D9E75', color: '#145A3A' },
  eca:          { label: 'ECA',                    spine: '#F6AD55', color: '#923B05' },
  cdc:          { label: 'CDC',                    spine: '#63B3ED', color: '#1a4a7a' },
}

const PREFIX_TO_CODE = {
  cf: 'constituicao', cp: 'codigoPenal', cc: 'codigoCivil',
  clt: 'clt', eca: 'eca', cdc: 'cdc',
}

function getCodeKeyFromId(id) {
  return PREFIX_TO_CODE[id?.split('_')[0]] || null
}

export default function BookmarksPage() {
  const navigate = useNavigate()
  const { getAll, toggle } = useBookmarks()
  const [resolvedArticles, setResolvedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    async function loadBookmarks() {
      const all = getAll()
      const articles = []
      for (const [countryCode, ids] of Object.entries(all)) {
        for (const id of ids) {
          const codeKey = getCodeKeyFromId(id)
          if (!codeKey) continue
          try {
            const data = await loadCode(codeKey)
            const found = data?.articles?.find(a => a.id === id)
            if (found) articles.push({ ...found, countryCode, codeKey })
          } catch {}
        }
      }
      setResolvedArticles(articles)
      setLoading(false)
      setTimeout(() => setEntered(true), 50)
    }
    loadBookmarks()
  }, [])

  // Group by code
  const grouped = resolvedArticles.reduce((acc, a) => {
    if (!acc[a.codeKey]) acc[a.codeKey] = []
    acc[a.codeKey].push(a)
    return acc
  }, {})

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{
        background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 40%)',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(12px)',
      }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Globe
          </button>
          <span className="text-sm font-semibold text-gray-700">Saved Articles</span>
          <span className="text-xs text-gray-400 ml-1">
            {resolvedArticles.length} saved
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400 text-sm">
            Loading bookmarks...
          </div>
        ) : resolvedArticles.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl">☆</div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">No saved articles yet</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Browse the law library and tap the star icon on any article to save it here.
              </p>
            </div>
            <Link
              to="/library/BR"
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#7F77DD' }}
            >
              Browse Library →
            </Link>
          </div>
        ) : (
          // Grouped by code
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([codeKey, articles]) => {
              const meta = CODE_META[codeKey]
              return (
                <div key={codeKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.spine }} />
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                      {meta.label}
                    </h3>
                    <span className="text-xs text-gray-400">· {articles.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {articles.map(article => (
                      <div
                        key={article.id}
                        className="bg-white rounded-xl border border-gray-100
                          hover:border-gray-300 transition-all flex gap-0 overflow-hidden"
                        style={{ borderLeft: `4px solid ${meta.spine}` }}
                      >
                        <Link
                          to={`/article/${article.countryCode}/${article.id}`}
                          className="flex-1 px-4 py-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold"
                              style={{ color: meta.color }}>
                              Art. {article.number}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{article.title}</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {article.text.slice(0, 90)}...
                          </p>
                        </Link>
                        <button
                          onClick={() => {
                            toggle(article.countryCode, article.id)
                            setResolvedArticles(prev => prev.filter(a => a.id !== article.id))
                          }}
                          className="px-4 text-amber-400 hover:text-gray-400 transition-colors
                            border-l border-gray-100 flex-shrink-0"
                          title="Remove bookmark"
                        >
                          ★
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
