import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadCode } from '../utils/searchEngine'
import BookmarkButton from '../components/ui/BookmarkButton'

const CODE_META = {
  constituicao: { label: 'Constituição Federal', color: '#B8860B', spine: '#FFD700', bg: '#fffbe6' },
  codigoPenal:  { label: 'Código Penal',          color: '#9B1C1C', spine: '#E53E3E', bg: '#fff0f0' },
  codigoCivil:  { label: 'Código Civil',           color: '#4C3494', spine: '#7F77DD', bg: '#f3f0ff' },
  clt:          { label: 'CLT',                    color: '#145A3A', spine: '#1D9E75', bg: '#f0fff8' },
  eca:          { label: 'ECA',                    color: '#923B05', spine: '#F6AD55', bg: '#fff7ed' },
  cdc:          { label: 'CDC',                    color: '#1a4a7a', spine: '#63B3ED', bg: '#eff8ff' },
}

// articleId format: "cp_121", "cf_5", "cc_927", etc.
// prefix maps to code key
const PREFIX_TO_CODE = {
  cf:  'constituicao',
  cp:  'codigoPenal',
  cc:  'codigoCivil',
  clt: 'clt',
  eca: 'eca',
  cdc: 'cdc',
}

function getCodeKeyFromId(articleId) {
  const prefix = articleId.split('_')[0]
  return PREFIX_TO_CODE[prefix] || null
}

export default function ArticleViewPage() {
  const { countryCode, articleId } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [copied, setCopied] = useState(false)
  const [entered, setEntered] = useState(false)

  const codeKey = getCodeKeyFromId(articleId)
  const meta = CODE_META[codeKey] || { label: 'Legal Code', color: '#666', spine: '#999', bg: '#f9f9f9' }

  useEffect(() => {
    if (!codeKey) return
    loadCode(codeKey).then(data => {
      const found = data?.articles?.find(a => a.id === articleId)
      setArticle(found || null)

      // Load related articles
      if (found?.relatedArticles?.length) {
        const related = found.relatedArticles.map(relId => {
          const relCodeKey = getCodeKeyFromId(relId)
          return loadCode(relCodeKey).then(d => d?.articles?.find(a => a.id === relId))
        })
        Promise.all(related).then(results => {
          setRelatedArticles(results.filter(Boolean))
        })
      }
    })
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [articleId, codeKey])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#f8f7f4' }}>
        <div className="text-gray-400 text-sm">Loading article...</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{
        background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 30%)',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(12px)',
      }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            ←
          </button>
          <div
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: meta.spine + '22', color: meta.color }}
          >
            {meta.label}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/bookmarks"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2">
              ☆ Saved
            </Link>
            <BookmarkButton countryCode={countryCode} articleId={articleId} size="sm" />
            <button
              onClick={handleShare}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500
                hover:border-gray-400 text-xs font-medium transition-colors"
            >
              {copied ? '✓ Copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-block text-4xl font-black mb-3"
            style={{ color: meta.spine }}
          >
            Art. {article.number}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
          <div
            className="h-1 w-16 rounded-full"
            style={{ backgroundColor: meta.spine }}
          />
        </div>

        {/* Article text */}
        <div
          className="rounded-2xl p-6 mb-6 leading-relaxed text-gray-800"
          style={{ background: meta.bg, borderLeft: `4px solid ${meta.spine}` }}
        >
          <p className="text-base leading-loose whitespace-pre-line">{article.text}</p>
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: meta.spine + '18', color: meta.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ask AI button */}
        <Link
          to={`/assistant/${countryCode}?article=${articleId}`}
          className="flex items-center gap-3 p-4 rounded-2xl mb-8 transition-all
            hover:shadow-md group"
          style={{ background: meta.bg, border: `1px solid ${meta.spine}44` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: meta.spine + '33' }}
          >
            ✦
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: meta.color }}>
              Ask AI about this article
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Get a plain-language explanation in Portuguese or English
            </p>
          </div>
          <span className="ml-auto text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
              Related Articles
            </h3>
            <div className="flex flex-col gap-2">
              {relatedArticles.map(rel => {
                const relCodeKey = getCodeKeyFromId(rel.id)
                const relMeta = CODE_META[relCodeKey] || meta
                return (
                  <Link
                    key={rel.id}
                    to={`/article/${countryCode}/${rel.id}`}
                    className="flex gap-3 p-3 rounded-xl bg-white border border-gray-100
                      hover:border-gray-300 hover:shadow-sm transition-all"
                    style={{ borderLeft: `3px solid ${relMeta.spine}` }}
                  >
                    <span
                      className="text-xs font-mono font-bold whitespace-nowrap mt-0.5"
                      style={{ color: relMeta.color }}
                    >
                      Art. {rel.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{rel.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{relMeta.label}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
