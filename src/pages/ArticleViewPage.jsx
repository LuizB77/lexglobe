import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadCode } from '../utils/searchEngine'
import BookmarkButton from '../components/ui/BookmarkButton'

const CODE_META = {
  constituicao:    { label: 'Constituição Federal',          color: '#B8860B', spine: '#FFD700', bg: '#fffbe6' },
  codigoPenal:     { label: 'Código Penal',                  color: '#9B1C1C', spine: '#E53E3E', bg: '#fff0f0' },
  codigoCivil:     { label: 'Código Civil',                  color: '#4C3494', spine: '#7F77DD', bg: '#f3f0ff' },
  clt:             { label: 'CLT',                           color: '#145A3A', spine: '#1D9E75', bg: '#f0fff8' },
  eca:             { label: 'ECA',                           color: '#923B05', spine: '#F6AD55', bg: '#fff7ed' },
  cdc:             { label: 'CDC',                           color: '#1a4a7a', spine: '#63B3ED', bg: '#eff8ff' },
  constituicaoPT:      { label: 'Constituição da República',     color: '#B8860B', spine: '#FFD700', bg: '#fffbe6' },
  codigoPenalPT:       { label: 'Código Penal (PT)',             color: '#9B1C1C', spine: '#E53E3E', bg: '#fff0f0' },
  codigoCivilPT:       { label: 'Código Civil (PT)',             color: '#4C3494', spine: '#7F77DD', bg: '#f3f0ff' },
  codigoTrabalho:      { label: 'Código do Trabalho',            color: '#145A3A', spine: '#1D9E75', bg: '#f0fff8' },
  codigoProcessoPenal: { label: 'Código de Processo Penal',      color: '#9B1C1C', spine: '#C53030', bg: '#fff5f5' },
  codigoProcessoCivil: { label: 'Código de Processo Civil',      color: '#1a365d', spine: '#2B6CB0', bg: '#ebf8ff' },
  codigoComercial:     { label: 'Código Comercial',              color: '#744210', spine: '#D69E2E', bg: '#fffaf0' },
  codigoEstrada:       { label: 'Código da Estrada',             color: '#7B341E', spine: '#C05621', bg: '#fff8f0' },
  constitucionES:      { label: 'Constitución Española',         color: '#8B6914', spine: '#C8A000', bg: '#fffdf0' },
  codigoPenalES:       { label: 'Código Penal (ES)',             color: '#9B1C1C', spine: '#C53030', bg: '#fff5f5' },
  codigoCivilES:       { label: 'Código Civil (ES)',             color: '#44337A', spine: '#553C9A', bg: '#faf5ff' },
  estatutoTrabajadores:{ label: 'Estatuto de los Trabajadores',  color: '#1C4532', spine: '#276749', bg: '#f0fff4' },
  usConstitution:      { label: 'U.S. Constitution',             color: '#8B6914', spine: '#B7791F', bg: '#fffdf0' },
  title18Criminal:     { label: 'Title 18 — Crimes',            color: '#9B1C1C', spine: '#C53030', bg: '#fff5f5' },
  title42CivilRights:  { label: 'Title 42 — Civil Rights',      color: '#1a365d', spine: '#2B6CB0', bg: '#ebf8ff' },
  title29Labor:        { label: 'Title 29 — Labor',             color: '#1C4532', spine: '#276749', bg: '#f0fff4' },
  title26Tax:          { label: 'Title 26 — Internal Revenue',  color: '#744210', spine: '#D69E2E', bg: '#fffaf0' },
  title15Commerce:     { label: 'Title 15 — Commerce',          color: '#44337A', spine: '#553C9A', bg: '#faf5ff' },
  title8Immigration:   { label: 'Title 8 — Immigration',        color: '#1D4044', spine: '#2C7A7B', bg: '#e6fffa' },
  title20Education:    { label: 'Title 20 — Education',         color: '#7B341E', spine: '#C05621', bg: '#fff8f0' },
  title31Finance:      { label: 'Title 31 — Finance',           color: '#1A365D', spine: '#2B6CB0', bg: '#ebf8ff' },
  title49Transportation:{ label: 'Title 49 — Transportation',   color: '#2D3748', spine: '#4A5568', bg: '#f7fafc' },
}

// articleId format: "cp_121", "cf_5", "cc_927", etc.
// prefix maps to code key
const PREFIX_TO_CODE = {
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

  const LANG_LABELS = {
    original: 'Original',
    en: 'English',
    pt: 'Português',
    es: 'Español',
  }

  async function handleTranslate(lang) {
    if (lang === 'original') {
      setSelectedLang('original')
      setTranslatedText(null)
      return
    }

    setSelectedLang(lang)

    // Check localStorage cache first
    const cacheKey = `lexglobe_translation_${articleId}_${lang}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setTranslatedText(cached)
      return
    }

    // Check if API key is available
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
    if (!apiKey || apiKey === 'your_key_here') {
      setTranslatedText(
        lang === 'pt'
          ? '🔐 Tradução em breve — esta funcionalidade requer uma conta ativa. Crie uma conta gratuita para acessar traduções automáticas.'
          : lang === 'es'
          ? '🔐 Traducción próximamente — esta función requiere una cuenta activa. Crea una cuenta gratuita para acceder a traducciones automáticas.'
          : '🔐 Translation coming soon — this feature requires an active account. Sign up for free to access automatic translations.'
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const translated = data?.content?.[0]?.text?.trim()

      if (translated) {
        setTranslatedText(translated)
        localStorage.setItem(cacheKey, translated)
      } else {
        throw new Error('No translation returned')
      }
    } catch (err) {
      console.error('Translation error:', err)
      setTranslatedText(
        lang === 'pt'
          ? '⚠️ Não foi possível traduzir agora. Tente novamente mais tarde.'
          : lang === 'es'
          ? '⚠️ No se pudo traducir ahora. Inténtalo de nuevo más tarde.'
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
    if (cached) {
      setExplanation(cached)
      setLoadingExplanation(false)
      return
    }

    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
      if (!apiKey || apiKey === 'your_key_here') {
        setExplanation('🔐 Add your API key to enable AI explanations.')
        setLoadingExplanation(false)
        return
      }

      const prompt = lang === 'pt'
        ? `Explique o Art. ${article.number} (${article.title}) do direito brasileiro de forma clara e simples, como se estivesse explicando para alguém sem formação jurídica. Use linguagem do dia a dia, dê um exemplo prático se possível. Máximo 3 parágrafos curtos.\n\nTexto do artigo: ${article.text.slice(0, 800)}`
        : `Explain Art. ${article.number} (${article.title}) of Brazilian law in plain English, as if explaining to someone with no legal background. Use everyday language and give a practical example if possible. Maximum 3 short paragraphs.\n\nArticle text: ${article.text.slice(0, 800)}`

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
        setExplanation('Não foi possível gerar uma explicação. Verifique sua chave de API.')
      }
    } catch (err) {
      console.error('Explain error:', err)
      setExplanation('Erro ao conectar com o assistente. Tente novamente.')
    }

    setLoadingExplanation(false)
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
      className="min-h-screen pt-14 transition-all duration-500"
      style={{
        background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 30%)',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(12px)',
      }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-40">
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
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-block text-3xl sm:text-4xl font-black mb-3"
            style={{ color: meta.spine }}
          >
            Art. {article.number}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
          <div
            className="h-1 w-16 rounded-full"
            style={{ backgroundColor: meta.spine }}
          />

          {/* Translation toggle */}
          <div className="flex items-center gap-2 mt-5 mb-1 flex-wrap
            p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 mr-1">
              🌐 Translate:
            </span>
            {['original', 'en', 'pt', 'es'].map(lang => (
              <button
                key={lang}
                onClick={() => handleTranslate(lang)}
                disabled={translating && selectedLang === lang}
                className="px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 border"
                style={{
                  backgroundColor: selectedLang === lang ? meta.spine : 'white',
                  color: selectedLang === lang ? 'white' : '#6b7280',
                  borderColor: selectedLang === lang ? meta.spine : '#e5e7eb',
                }}
              >
                {lang === 'original' ? '📄 Original' :
                 lang === 'en' ? '🇺🇸 EN' :
                 lang === 'pt' ? '🇧🇷 PT' :
                 '🇪🇸 ES'}
              </button>
            ))}
            {translating && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="animate-spin">⟳</span> Translating...
              </span>
            )}
          </div>
        </div>

        {/* Article text */}
        <div
          className="rounded-2xl p-6 mb-6 leading-relaxed text-gray-800"
          style={{ background: meta.bg, borderLeft: `4px solid ${meta.spine}` }}
        >
          {translating ? (
            <div className="flex items-center gap-3 py-4">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400"
                  style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400"
                  style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400"
                  style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-400">Translating article...</span>
            </div>
          ) : (
            <>
              <p className="text-base leading-loose whitespace-pre-line">
                {translatedText || article.text}
              </p>
              {translatedText && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                  ✦ Translated by LexGlobe AI ·
                  <button
                    onClick={() => handleTranslate('original')}
                    className="ml-1 underline hover:text-gray-600"
                  >
                    View original
                  </button>
                </p>
              )}
            </>
          )}
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

        {/* Explain this law section */}
        <div
          className="rounded-2xl mb-8 overflow-hidden"
          style={{ border: `1px solid ${meta.spine}33` }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: meta.bg }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: meta.spine + '33' }}
              >
                ✦
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: meta.color }}>
                  Explain this law
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Plain language, no legal jargon
                </p>
              </div>
            </div>
            {!explanation && !loadingExplanation && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExplain('pt')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                  style={{ backgroundColor: meta.spine }}
                >
                  🇧🇷 Português
                </button>
                <button
                  onClick={() => handleExplain('en')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                  style={{ borderColor: meta.spine + '66', color: meta.color }}
                >
                  🇺🇸 English
                </button>
              </div>
            )}
            {explanation && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExplain('pt')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: explanationLang === 'pt' ? meta.spine : 'transparent',
                    color: explanationLang === 'pt' ? 'white' : meta.color,
                    border: `1px solid ${meta.spine}66`,
                  }}
                >
                  PT
                </button>
                <button
                  onClick={() => handleExplain('en')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: explanationLang === 'en' ? meta.spine : 'transparent',
                    color: explanationLang === 'en' ? 'white' : meta.color,
                    border: `1px solid ${meta.spine}66`,
                  }}
                >
                  EN
                </button>
                <button
                  onClick={() => { setExplanation(null) }}
                  className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loadingExplanation && (
            <div className="px-5 py-5 bg-white flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-300"
                  style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-300"
                  style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-300"
                  style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-gray-400">Generating explanation...</span>
            </div>
          )}

          {/* Explanation text */}
          {explanation && !loadingExplanation && (
            <div className="px-5 py-5 bg-white">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {explanation}
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  ✦ AI · For educational purposes only
                </p>
                <Link
                  to={`/assistant/${countryCode}?article=${articleId}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: meta.color }}
                >
                  Ask follow-up →
                </Link>
              </div>
            </div>
          )}
        </div>

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
