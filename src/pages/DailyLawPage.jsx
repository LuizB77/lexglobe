import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getDailyLaw } from '../utils/dailyLawPicker'

const CODE_META = {
  constituicao: { label: 'Constituição Federal', spine: '#FFD700', color: '#B8860B', bg: '#fffbe6' },
  codigoPenal:  { label: 'Código Penal',          spine: '#E53E3E', color: '#9B1C1C', bg: '#fff0f0' },
  codigoCivil:  { label: 'Código Civil',           spine: '#7F77DD', color: '#4C3494', bg: '#f3f0ff' },
  clt:          { label: 'CLT',                    spine: '#1D9E75', color: '#145A3A', bg: '#f0fff8' },
  eca:          { label: 'ECA',                    spine: '#F6AD55', color: '#923B05', bg: '#fff7ed' },
  cdc:          { label: 'CDC',                    spine: '#63B3ED', color: '#1a4a7a', bg: '#eff8ff' },
}

export default function DailyLawPage() {
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [copied, setCopied] = useState(false)
  const [entered, setEntered] = useState(false)

  const meta = article ? (CODE_META[article.codeKey] || CODE_META.constituicao) : null
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    getDailyLaw('BR').then(async (law) => {
      setArticle(law)
      setTimeout(() => setEntered(true), 50)

      // Check if explanation already cached for today
      if (law.explanation) {
        setExplanation(law.explanation)
        return
      }

      // Generate explanation via Claude
      setLoadingExplanation(true)
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `Explique este artigo de lei brasileiro de forma clara e acessível para estudantes.
Use linguagem simples, dê um exemplo prático do cotidiano, e explique por que este artigo importa.
Máximo 3 parágrafos curtos. Responda em português.

Artigo: Art. ${law.number} - ${law.title} (${law.codeName})
Texto: ${law.text}`,
            }],
          }),
        })
        const data = await response.json()
        const text = data?.content?.[0]?.text || ''

        // Cache explanation
        const CACHE_KEY = 'lexglobe_daily'
        const todayKey = new Date().toISOString().split('T')[0]
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
        if (cached[todayKey]) {
          cached[todayKey].explanation = text
          localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
        }
        setExplanation(text)
      } catch (err) {
        console.error('Explanation error:', err)
        setExplanation(null)
      }
      setLoadingExplanation(false)
    })
  }, [])

  function handleShare() {
    const text = article
      ? `Today I learned: Art. ${article.number} of ${article.codeName} (Brazilian Law)\n\n"${article.title}"\n\nExplore Brazilian law at LexGlobe`
      : 'Exploring Brazilian law at LexGlobe'
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#f8f7f4' }}>
        <div className="text-gray-400 text-sm">Loading today's law...</div>
      </div>
    )
  }

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
          <span className="text-sm font-semibold text-gray-700">Daily Law</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500
                hover:border-gray-400 text-xs font-medium transition-colors"
            >
              {copied ? '✓ Copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Date badge */}
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-6 capitalize">
          {today}
        </p>

        {/* Article header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: meta.spine + '22', color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-xs text-gray-400">Lei do dia</span>
          </div>
          <div className="text-5xl font-black mb-2" style={{ color: meta.spine }}>
            Art. {article.number}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
        </div>

        {/* Article text */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: meta.bg, borderLeft: `4px solid ${meta.spine}` }}
        >
          <p className="text-sm text-gray-700 leading-loose whitespace-pre-line">
            {article.text}
          </p>
        </div>

        {/* Plain English explanation */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">✦</span>
            <h2 className="font-bold text-gray-900 text-sm">Plain Language Explanation</h2>
            <span className="text-xs text-gray-400 ml-auto">AI-generated</span>
          </div>
          {loadingExplanation ? (
            <div className="flex gap-1 items-center py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : explanation ? (
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          ) : (
            <p className="text-sm text-gray-400">
              Add your Claude API key to .env to enable AI explanations.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-10">
          <Link
            to={`/article/BR/${article.id}`}
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold
              text-white transition-colors"
            style={{ backgroundColor: meta.spine }}
          >
            View Full Article →
          </Link>
          <Link
            to={`/assistant/BR?article=${article.id}`}
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold
              border transition-colors"
            style={{ borderColor: meta.spine + '66', color: meta.color }}
          >
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </div>
  )
}
