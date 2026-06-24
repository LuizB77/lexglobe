import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getDailyLaw } from '../utils/dailyLawPicker'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

const CODE_META = {
  constituicao:    { label: 'Constituição Federal', spine: '#FFD700', color: '#FFD700' },
  codigoPenal:     { label: 'Código Penal',          spine: '#E53E3E', color: '#ff6b6b' },
  codigoCivil:     { label: 'Código Civil',           spine: '#7F77DD', color: '#a89fe8' },
  clt:             { label: 'CLT',                    spine: '#1D9E75', color: '#4ecba4' },
  eca:             { label: 'ECA',                    spine: '#F6AD55', color: '#f6ad55' },
  cdc:             { label: 'CDC',                    spine: '#63B3ED', color: '#63b3ed' },
  constituicaoPT:  { label: 'Constituição da República', spine: '#FFD700', color: '#FFD700' },
  codigoPenalPT:   { label: 'Código Penal PT',        spine: '#E53E3E', color: '#ff6b6b' },
  codigoCivilPT:   { label: 'Código Civil PT',        spine: '#7F77DD', color: '#a89fe8' },
  codigoTrabalho:  { label: 'Código do Trabalho',     spine: '#1D9E75', color: '#4ecba4' },
  constitucionES:  { label: 'Constitución Española',  spine: '#C8A000', color: '#f0c420' },
  codigoPenalES:   { label: 'Código Penal ES',        spine: '#C53030', color: '#ff6b6b' },
  codigoCivilES:   { label: 'Código Civil ES',        spine: '#553C9A', color: '#a89fe8' },
  estatutoTrabajadores: { label: 'Estatuto Trabajadores', spine: '#276749', color: '#4ecba4' },
  usConstitution:  { label: 'U.S. Constitution',      spine: '#B7791F', color: '#f0c420' },
  title18Criminal: { label: 'Title 18 — Crimes',      spine: '#C53030', color: '#ff6b6b' },
  title42CivilRights: { label: 'Title 42 — Civil Rights', spine: '#2B6CB0', color: '#63b3ed' },
  title29Labor:    { label: 'Title 29 — Labor',       spine: '#276749', color: '#4ecba4' },
}

export default function DailyLawPage() {
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [copied, setCopied] = useState(false)
  const [entered, setEntered] = useState(false)

  const meta = article
    ? (CODE_META[article.codeKey] || { label: article.codeName, spine: '#7F77DD', color: '#a89fe8' })
    : null

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    getDailyLaw('BR').then(async (law) => {
      setArticle(law)
      setTimeout(() => setEntered(true), 50)
      if (law.explanation) {
        setExplanation(law.explanation)
        return
      }
      setLoadingExplanation(true)
      try {
        const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
        if (!apiKey || apiKey === 'your_key_here') {
          setLoadingExplanation(false)
          return
        }
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
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `Explique este artigo de lei de forma clara para estudantes e imigrantes. Use linguagem simples, dê um exemplo prático. Máximo 3 parágrafos curtos. Responda em português.\n\nArtigo: Art. ${law.number} - ${law.title}\nTexto: ${law.text}`,
            }],
          }),
        })
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const data = await response.json()
        const text = data?.content?.[0]?.text || ''
        const CACHE_KEY = 'lexglobe_daily'
        const todayKey = new Date().toISOString().split('T')[0]
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
          if (cached[todayKey]) {
            cached[todayKey].explanation = text
            localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
          }
        } catch {}
        setExplanation(text)
      } catch (err) {
        console.error('Explanation error:', err)
      }
      setLoadingExplanation(false)
    })
  }, [])

  function handleShare() {
    const text = article
      ? `Today I learned: Art. ${article.number} of ${article.codeName}\n"${article.title}"\n\nExplore law at LexGlobe: lexglobe-eight.vercel.app`
      : 'Exploring law at LexGlobe'
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!article) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center pt-14">
          <div className="text-white/40 text-sm">Loading today's law...</div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <div
        className="max-w-2xl mx-auto px-4 pt-20 pb-12 transition-all duration-500"
        style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(12px)' }}
      >
        {/* Date + share */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-white/50 uppercase tracking-widest capitalize">
            {today}
          </p>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {copied ? '✓ Copied' : 'Share'}
          </button>
        </div>

        {/* Article header */}
        <GlassCard className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: meta.spine + '33', color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-white/40 text-xs">Lei do dia</span>
          </div>
          <div className="text-5xl font-black mb-2" style={{ color: meta.spine }}>
            Art. {article.number}
          </div>
          <h1 className="text-xl font-bold text-white mb-4">{article.title}</h1>
          <p className="text-sm text-white/70 leading-loose whitespace-pre-line
            border-l-2 pl-4" style={{ borderColor: meta.spine }}>
            {article.text}
          </p>
        </GlassCard>

        {/* AI Explanation */}
        <GlassCard className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span style={{ color: meta.spine }}>✦</span>
            <h2 className="font-bold text-white text-sm">Plain Language Explanation</h2>
            <span className="text-white/30 text-xs ml-auto">LexGlobe AI</span>
          </div>
          {loadingExplanation ? (
            <div className="flex gap-1 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                style={{ animationDelay: '300ms' }} />
            </div>
          ) : explanation ? (
            <p className="text-sm text-white/80 leading-relaxed">{explanation}</p>
          ) : (
            <p className="text-sm text-white/40">
              Add your API key to enable AI explanations.
            </p>
          )}
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-3">
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
              transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
            }}
          >
            Ask AI
          </Link>
        </div>
      </div>
    </PageBackground>
  )
}
