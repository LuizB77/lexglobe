import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadCode } from '../utils/searchEngine'
import BookmarkButton from '../components/ui/BookmarkButton'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

const CODE_META = {
  constituicaoSP:  { label: 'Constituição do Estado de São Paulo', color: '#5B8DB8', spine: '#FFD700' },
  constituicaoRJ:  { label: 'Constituição do Estado do Rio de Janeiro', color: '#2E7D32', spine: '#FFD700' },
  constituicao:    { label: 'Constituição Federal',          color: '#6B8CAE', spine: '#FFD700' },
  codigoPenal:     { label: 'Código Penal',                  color: '#9B1C1C', spine: '#E53E3E' },
  codigoCivil:     { label: 'Código Civil',                  color: '#4C3494', spine: '#7F77DD' },
  clt:             { label: 'CLT',                           color: '#145A3A', spine: '#1D9E75' },
  eca:             { label: 'ECA',                           color: '#923B05', spine: '#F6AD55' },
  cdc:             { label: 'CDC',                           color: '#1a4a7a', spine: '#63B3ED' },
  constituicaoPT:      { label: 'Constituição da República',     color: '#6B8CAE', spine: '#FFD700' },
  codigoPenalPT:       { label: 'Código Penal (PT)',             color: '#9B1C1C', spine: '#E53E3E' },
  codigoCivilPT:       { label: 'Código Civil (PT)',             color: '#4C3494', spine: '#7F77DD' },
  codigoTrabalho:      { label: 'Código do Trabalho',            color: '#145A3A', spine: '#1D9E75' },
  codigoProcessoPenal: { label: 'Código de Processo Penal',      color: '#9B1C1C', spine: '#C53030' },
  codigoProcessoCivil: { label: 'Código de Processo Civil',      color: '#1a365d', spine: '#2B6CB0' },
  codigoComercial:     { label: 'Código Comercial',              color: '#744210', spine: '#D69E2E' },
  codigoEstrada:       { label: 'Código da Estrada',             color: '#7B341E', spine: '#C05621' },
  constitucionES:      { label: 'Constitución Española',         color: '#8B6914', spine: '#C8A000' },
  codigoPenalES:       { label: 'Código Penal (ES)',             color: '#9B1C1C', spine: '#C53030' },
  codigoCivilES:       { label: 'Código Civil (ES)',             color: '#44337A', spine: '#553C9A' },
  estatutoTrabajadores:{ label: 'Estatuto de los Trabajadores',  color: '#1C4532', spine: '#276749' },
  usConstitution:      { label: 'U.S. Constitution',             color: '#8B6914', spine: '#B7791F' },
  title18Criminal:     { label: 'Title 18 — Crimes',            color: '#9B1C1C', spine: '#C53030' },
  title42CivilRights:  { label: 'Title 42 — Civil Rights',      color: '#1a365d', spine: '#2B6CB0' },
  title29Labor:        { label: 'Title 29 — Labor',             color: '#1C4532', spine: '#276749' },
  title26Tax:          { label: 'Title 26 — Internal Revenue',  color: '#744210', spine: '#D69E2E' },
  title15Commerce:     { label: 'Title 15 — Commerce',          color: '#44337A', spine: '#553C9A' },
  title8Immigration:   { label: 'Title 8 — Immigration',        color: '#1D4044', spine: '#2C7A7B' },
  title20Education:    { label: 'Title 20 — Education',         color: '#7B341E', spine: '#C05621' },
  title31Finance:      { label: 'Title 31 — Finance',           color: '#1A365D', spine: '#2B6CB0' },
  title49Transportation:{ label: 'Title 49 — Transportation',   color: '#2D3748', spine: '#4A5568' },
}

const PREFIX_TO_CODE = {
  csp:  'constituicaoSP',
  crj:  'constituicaoRJ',
  cf:   'constituicao',
  cp:   'codigoPenal',
  cc:   'codigoCivil',
  clt:  'clt',
  eca:  'eca',
  cdc:  'cdc',
  cfpt:  'constituicaoPT',
  cppt:  'codigoPenalPT',
  ccpt:  'codigoCivilPT',
  ctpt:  'codigoTrabalho',
  cpppt: 'codigoProcessoPenal',
  cpcpt: 'codigoProcessoCivil',
  ccmpt: 'codigoComercial',
  cept:  'codigoEstrada',
  ces:  'constitucionES',
  cpes: 'codigoPenalES',
  cces: 'codigoCivilES',
  etes: 'estatutoTrabajadores',
  usc: 'usConstitution',
  t18: 'title18Criminal',
  t42: 'title42CivilRights',
  t29: 'title29Labor',
  t26: 'title26Tax',
  t15: 'title15Commerce',
  t8:  'title8Immigration',
  t20: 'title20Education',
  t31: 'title31Finance',
  t49: 'title49Transportation',
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
  const [explanation, setExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [explanationLang, setExplanationLang] = useState('pt')
  const [translatedText, setTranslatedText] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [selectedLang, setSelectedLang] = useState('original')

  const codeKey = getCodeKeyFromId(articleId)
  const meta = CODE_META[codeKey] || { label: 'Legal Code', color: '#6B8CAE', spine: '#FFD700' }

  useEffect(() => {
    if (!codeKey) return
    loadCode(codeKey).then(data => {
      const found = data?.articles?.find(a => a.id === articleId)
      setArticle(found || null)
      if (found?.relatedArticles?.length) {
        const related = found.relatedArticles.map(relId => {
          const relCodeKey = getCodeKeyFromId(relId)
          return loadCode(relCodeKey).then(d => d?.articles?.find(a => a.id === relId))
        })
        Promise.all(related).then(results => {
          setRelatedArticles(results.filter(Boolean))
        }).catch(err => console.error('Related articles failed:', err))
      }
    }).catch(err => console.error('loadCode failed:', err))
    const t = setTimeout(() => setEntered(true), 50)
    return () => clearTimeout(t)
  }, [articleId, codeKey])

  useEffect(() => {
    setTranslatedText(null)
    setSelectedLang('original')
    setTranslating(false)
  }, [articleId])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleTranslate(lang) {
    if (lang === 'original') {
      setSelectedLang('original')
      setTranslatedText(null)
      return
    }
    setSelectedLang(lang)
    const cacheKey = `lexglobe_translation_${articleId}_${lang}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) { setTranslatedText(cached); return }

    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      setTranslatedText(
        lang === 'pt' ? '🔐 Tradução em breve — esta funcionalidade requer uma conta ativa.'
        : lang === 'es' ? '🔐 Traducción próximamente — esta función requiere una cuenta activa.'
        : '🔐 Translation coming soon — this feature requires an active account.'
      )
      return
    }

    setTranslating(true)
    try {
      const langNames = { en: 'English', pt: 'Brazilian Portuguese', es: 'Spanish' }
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Translate the following legal article text to ${langNames[lang]}. Keep legal terminology accurate. Keep article numbers and section references exactly as they appear. Return only the translated text, nothing else.\n\nArticle: ${article.text}`,
          }],
        }),
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      const translated = data?.content?.[0]?.text?.trim()
      if (translated) {
        setTranslatedText(translated)
        localStorage.setItem(cacheKey, translated)
      } else throw new Error('No translation returned')
    } catch (err) {
      console.error('Translation error:', err)
      setTranslatedText(
        lang === 'pt' ? '⚠️ Não foi possível traduzir agora. Tente novamente mais tarde.'
        : lang === 'es' ? '⚠️ No se pudo traducir ahora. Inténtalo de nuevo más tarde.'
        : '⚠️ Translation unavailable right now. Please try again later.'
      )
    }
    setTranslating(false)
  }

  async function handleExplain(lang) {
    if (loadingExplanation) return
    setExplanationLang(lang)
    setLoadingExplanation(true)
    setExplanation(null)

    const cacheKey = `lexglobe_explain_${articleId}_${lang}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) { setExplanation(cached); setLoadingExplanation(false); return }

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
      if (!apiKey || apiKey === 'your_key_here') {
        setExplanation('🔐 Add your API key to enable AI explanations.')
        setLoadingExplanation(false)
        return
      }
      const prompt = lang === 'pt'
        ? `Explique o Art. ${article.number} (${article.title}) de forma clara e simples, como se estivesse explicando para alguém sem formação jurídica. Use linguagem do dia a dia, dê um exemplo prático se possível. Máximo 3 parágrafos curtos.\n\nTexto do artigo: ${article.text.slice(0, 800)}`
        : `Explain Art. ${article.number} (${article.title}) in plain English, as if explaining to someone with no legal background. Use everyday language and give a practical example if possible. Maximum 3 short paragraphs.\n\nArticle text: ${article.text.slice(0, 800)}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      const text = data?.content?.[0]?.text?.trim()
      if (text) {
        setExplanation(text)
        localStorage.setItem(cacheKey, text)
      } else {
        setExplanation('Could not generate explanation. Check your API key.')
      }
    } catch (err) {
      console.error('Explain error:', err)
      setExplanation('Error connecting to AI assistant. Please try again.')
    }
    setLoadingExplanation(false)
  }

  if (!article) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-white/40 text-sm">Loading article...</div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <div
        className="min-h-screen text-white relative transition-all duration-500"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'none' : 'translateY(12px)',
        }}
      >
        {/* Sticky top bar */}
        <div
          className="sticky top-14 z-40"
          style={{
            background: 'rgba(5,10,20,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              ←
            </button>
            <div
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: meta.spine + '22', color: meta.spine }}
            >
              {meta.label}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/bookmarks"
                className="text-xs text-white/40 hover:text-white/70 transition-colors px-2">
                ☆ Saved
              </Link>
              <BookmarkButton countryCode={countryCode} articleId={articleId} size="sm" />
              <button
                onClick={handleShare}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.80)',
                }}
              >
                {copied ? '✓ Copied' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Article header card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <GlassCard className="p-6 mb-4">
            <div
              className="text-4xl font-display font-bold mb-1"
              style={{ color: '#6B8CAE' }}
            >
              Art. {article.number}
            </div>
            <h1 className="text-white font-display font-bold text-xl mt-1 mb-3">{article.title}</h1>
            <span
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }}
            >
              {meta.label}
            </span>
          </GlassCard>
          </motion.div>

          {/* Translation toggle */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <GlassCard className="p-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-white/50 mr-1">🌐 Translate:</span>
              {['original', 'en', 'pt', 'es'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleTranslate(lang)}
                  disabled={translating && selectedLang === lang}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                  style={{
                    background: selectedLang === lang ? meta.spine : 'rgba(255,255,255,0.08)',
                    color: selectedLang === lang ? 'white' : 'rgba(255,255,255,0.60)',
                    border: `1px solid ${selectedLang === lang ? meta.spine : 'rgba(255,255,255,0.12)'}`,
                  }}
                >
                  {lang === 'original' ? '📄 Original' :
                   lang === 'en' ? '🇺🇸 EN' :
                   lang === 'pt' ? '🇧🇷 PT' : '🇪🇸 ES'}
                </button>
              ))}
              {translating && (
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <span className="animate-spin">⟳</span> Translating...
                </span>
              )}
            </div>
          </GlassCard>
          </motion.div>

          {/* Article body */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16 }}>
          <GlassCard className="p-6 mb-4">
            {translating ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-white/40">Translating article...</span>
              </div>
            ) : (
              <>
                <p className="text-white/80 leading-relaxed text-sm whitespace-pre-line">
                  {translatedText || article.text}
                </p>
                {translatedText && (
                  <p className="text-xs text-white/30 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    ✦ Translated by LexGlobe AI ·{' '}
                    <button onClick={() => handleTranslate('original')} className="underline hover:text-white/50">
                      View original
                    </button>
                  </p>
                )}
              </>
            )}
          </GlassCard>

          </motion.div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: meta.spine + '22', color: meta.spine }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Explanation */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.24 }}>
          <GlassCard className="mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: explanation || loadingExplanation ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: meta.spine + '22' }}
                >
                  ✦
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Plain Language Explanation</p>
                  <p className="text-xs text-white/40 mt-0.5">LexGlobe AI · No legal jargon</p>
                </div>
              </div>
              {!explanation && !loadingExplanation && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExplain('pt')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                    style={{ backgroundColor: meta.spine }}
                  >
                    🇧🇷 PT
                  </button>
                  <button
                    onClick={() => handleExplain('en')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      border: `1px solid rgba(255,255,255,0.15)`,
                      color: 'rgba(255,255,255,0.80)',
                    }}
                  >
                    🇺🇸 EN
                  </button>
                </div>
              )}
              {explanation && (
                <div className="flex gap-2">
                  {['pt', 'en'].map(l => (
                    <button key={l} onClick={() => handleExplain(l)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: explanationLang === l ? meta.spine : 'rgba(255,255,255,0.08)',
                        color: explanationLang === l ? 'white' : 'rgba(255,255,255,0.60)',
                        border: `1px solid ${explanationLang === l ? meta.spine : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                  <button onClick={() => setExplanation(null)}
                    className="px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors">
                    ✕
                  </button>
                </div>
              )}
            </div>

            {loadingExplanation && (
              <div className="px-5 py-5 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/30" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-white/40">Generating explanation...</span>
              </div>
            )}

            {explanation && !loadingExplanation && (
              <div className="px-5 py-5">
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                  {explanation}
                </p>
                <div className="mt-4 pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-white/30">✦ AI · For educational purposes only</p>
                  <Link
                    to={`/assistant/${countryCode}?article=${articleId}`}
                    className="text-xs font-medium transition-colors hover:text-white/80"
                    style={{ color: '#6B8CAE' }}
                  >
                    Ask follow-up →
                  </Link>
                </div>
              </div>
            )}
          </GlassCard>

          </motion.div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-medium mb-3">
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
                      className="flex gap-3 p-3 rounded-xl transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderLeft: `3px solid ${relMeta.spine}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <span className="text-xs font-mono font-bold whitespace-nowrap mt-0.5"
                        style={{ color: relMeta.spine }}>
                        Art. {rel.number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{rel.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">{relMeta.label}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  )
}
