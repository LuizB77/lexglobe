import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import { loadCode } from '../utils/searchEngine'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

const CODE_META = {
  constituicao: { label: 'Constituição Federal', spine: '#FFD700', color: '#FFD700' },
  codigoPenal:  { label: 'Código Penal', spine: '#E53E3E', color: '#ff6b6b' },
  codigoCivil:  { label: 'Código Civil', spine: '#7F77DD', color: '#a89fe8' },
  clt:          { label: 'CLT', spine: '#1D9E75', color: '#4ecba4' },
  eca:          { label: 'ECA', spine: '#F6AD55', color: '#f6ad55' },
  cdc:          { label: 'CDC', spine: '#63B3ED', color: '#63b3ed' },
  constituicaoPT: { label: 'Constituição PT', spine: '#FFD700', color: '#FFD700' },
  codigoPenalPT:  { label: 'Código Penal PT', spine: '#E53E3E', color: '#ff6b6b' },
  codigoCivilPT:  { label: 'Código Civil PT', spine: '#7F77DD', color: '#a89fe8' },
  codigoTrabalho: { label: 'Código do Trabalho', spine: '#1D9E75', color: '#4ecba4' },
  constitucionES: { label: 'Constitución Española', spine: '#C8A000', color: '#f0c420' },
  codigoPenalES:  { label: 'Código Penal ES', spine: '#C53030', color: '#ff6b6b' },
  codigoCivilES:  { label: 'Código Civil ES', spine: '#553C9A', color: '#a89fe8' },
  estatutoTrabajadores: { label: 'Estatuto Trabajadores', spine: '#276749', color: '#4ecba4' },
  usConstitution: { label: 'U.S. Constitution', spine: '#B7791F', color: '#f0c420' },
  title18Criminal: { label: 'Title 18 — Crimes', spine: '#C53030', color: '#ff6b6b' },
  title42CivilRights: { label: 'Civil Rights', spine: '#2B6CB0', color: '#63b3ed' },
  title29Labor:   { label: 'Title 29 — Labor', spine: '#276749', color: '#4ecba4' },
}

const PREFIX_TO_CODE = {
  cf: 'constituicao', cp: 'codigoPenal', cc: 'codigoCivil',
  clt: 'clt', eca: 'eca', cdc: 'cdc',
  cfpt: 'constituicaoPT', cppt: 'codigoPenalPT', ccpt: 'codigoCivilPT',
  ctpt: 'codigoTrabalho', ces: 'constitucionES', cpes: 'codigoPenalES',
  cces: 'codigoCivilES', etes: 'estatutoTrabajadores',
  usc: 'usConstitution', t18: 'title18Criminal',
  t42: 'title42CivilRights', t29: 'title29Labor',
}

function getCodeKeyFromId(id) {
  return PREFIX_TO_CODE[id?.split('_')[0]] || null
}

export default function BookmarksPage() {
  const navigate = useNavigate()
  const { getAll, toggle } = useBookmarks()
  const [resolvedArticles, setResolvedArticles] = useState([])
  const [loading, setLoading] = useState(true)

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
    }
    loadBookmarks()
  }, [])

  const grouped = resolvedArticles.reduce((acc, a) => {
    if (!acc[a.codeKey]) acc[a.codeKey] = []
    acc[a.codeKey].push(a)
    return acc
  }, {})

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Saved Articles</h1>
          <span className="text-white/40 text-sm">{resolvedArticles.length} saved</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-white/40 text-sm">
            Loading...
          </div>
        ) : resolvedArticles.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <div className="text-5xl mb-4">☆</div>
            <h2 className="text-lg font-bold text-white mb-2">No saved articles yet</h2>
            <p className="text-sm text-white/50 mb-6 max-w-xs mx-auto">
              Browse the law library and tap the star icon on any article to save it here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full border border-white/20 bg-white/10
                text-white hover:bg-white/15 transition-all backdrop-blur-sm font-medium
                text-sm"
            >
              Browse Library →
            </button>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([codeKey, articles]) => {
              const meta = CODE_META[codeKey] || { label: codeKey, spine: '#7F77DD', color: '#a89fe8' }
              return (
                <div key={codeKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.spine }} />
                    <h3 className="text-xs uppercase tracking-widest text-white/50 font-medium">
                      {meta.label}
                    </h3>
                    <span className="text-white/30 text-xs">· {articles.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {articles.map(article => {
                      const m = CODE_META[article.codeKey] || meta
                      return (
                        <GlassCard key={article.id} className="flex overflow-hidden">
                          <Link
                            to={`/article/${article.countryCode}/${article.id}`}
                            className="flex-1 px-4 py-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold"
                                style={{ color: m.color }}>
                                Art. {article.number}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white">
                              {article.title}
                            </p>
                            <p className="text-xs text-white/40 mt-1 line-clamp-1">
                              {article.text.slice(0, 90)}...
                            </p>
                          </Link>
                          <button
                            onClick={() => {
                              toggle(article.countryCode, article.id)
                              setResolvedArticles(prev =>
                                prev.filter(a => a.id !== article.id))
                            }}
                            className="px-4 text-amber-400 hover:text-white/40
                              transition-colors border-l flex-shrink-0"
                            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                          >
                            ★
                          </button>
                        </GlassCard>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageBackground>
  )
}
