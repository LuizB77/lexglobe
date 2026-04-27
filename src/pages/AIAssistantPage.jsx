import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { search, loadCode } from '../utils/searchEngine'
import countries from '../data/countries.json'

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

function CitedArticle({ text }) {
  // Highlight "Art. X do/da CODE" patterns in purple
  const parts = text.split(/(Art\.\s*\d+[^\s,;.]*(?:\s+d[ao]\s+[\wÀ-ú\s]+?)?(?=\s|,|;|\.|$))/gi)
  return (
    <span>
      {parts.map((part, i) =>
        /^Art\.\s*\d+/i.test(part)
          ? <span key={i} className="font-semibold" style={{ color: '#7F77DD' }}>{part}</span>
          : part
      )}
    </span>
  )
}

export default function AIAssistantPage() {
  const { countryCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preloadArticleId = searchParams.get('article')

  const country = countries.find(c => c.code === countryCode)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [preloadedArticle, setPreloadedArticle] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Load preloaded article if coming from article page
  useEffect(() => {
    if (!preloadArticleId) return
    const codeKey = getCodeKeyFromId(preloadArticleId)
    if (!codeKey) return
    loadCode(codeKey).then(data => {
      const found = data?.articles?.find(a => a.id === preloadArticleId)
      if (found) {
        setPreloadedArticle(found)
        const meta = CODE_META[codeKey]
        setMessages([{
          role: 'assistant',
          content: `Olá! Estou pronto para explicar o **Art. ${found.number} — ${found.title}** (${meta?.label || codeKey}). O que você gostaria de saber? Pode perguntar em português ou inglês.`,
          articleRef: found,
        }])
      }
    })
  }, [preloadArticleId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])

    try {
      // 1. Fuse.js search for relevant articles
      const relevant = await search(q, countryCode)
      const topArticles = relevant.slice(0, 8)

      // 2. Build context string
      const context = topArticles.map(a =>
        `[${a.codeName} - Art. ${a.number} - ${a.title}]\n${a.text}`
      ).join('\n\n---\n\n')

      // 3. Include preloaded article if present
      let systemExtra = ''
      if (preloadedArticle) {
        const ck = getCodeKeyFromId(preloadedArticle.id)
        const m = CODE_META[ck]
        systemExtra = `\n\nO usuário está visualizando especificamente: Art. ${preloadedArticle.number} - ${preloadedArticle.title} (${m?.label || ck}): ${preloadedArticle.text}`
      }

      const systemPrompt = `Você é um assistente jurídico especializado em direito brasileiro. Use apenas os artigos fornecidos como contexto. Sempre cite o número do artigo e o código (ex: Art. 157 do Código Penal). Responda em português se a pergunta for em português, em inglês se for em inglês. Seja claro, objetivo e educativo. Sempre inclua ao final: 'Esta informação é apenas para fins educativos e não substitui aconselhamento jurídico profissional.'${systemExtra}`

      // 4. Call Claude API
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
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: `Contexto dos artigos relevantes:\n\n${context}\n\nPergunta: ${q}` }
          ],
        }),
      })

      const data = await response.json()
      const reply = data?.content?.[0]?.text || 'Não foi possível gerar uma resposta. Tente novamente.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('AI error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ocorreu um erro ao conectar com o assistente. Verifique sua chave de API e tente novamente.',
      }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestions = [
    'Qual a pena por roubo?',
    'Quais são meus direitos como trabalhador?',
    'O que é devido processo legal?',
    'Quais são os direitos do consumidor?',
    'What are the fundamental rights in Brazil?',
  ]

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0f0f1a' }}>
      {/* Header */}
      <div className="bg-black/40 border-b border-white/10 backdrop-blur px-4 py-3
        flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-white/50 hover:text-white transition-colors text-sm"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{country?.flag}</span>
          <span className="text-white font-semibold text-sm">AI Legal Assistant</span>
          <span className="text-white/30 text-xs">— {country?.nameLocal || country?.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40">Claude</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12">
            <div className="text-5xl">⚖️</div>
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-1">Brazilian Law Assistant</h2>
              <p className="text-white/40 text-sm max-w-xs">
                Ask any question about Brazilian law in Portuguese or English.
                I'll find the relevant articles and explain them clearly.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="text-left px-4 py-2.5 rounded-xl border border-white/10
                    text-white/60 text-sm hover:border-white/30 hover:text-white/80
                    transition-all bg-white/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30
                flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0"
                style={{ color: '#7F77DD' }}>
                ✦
              </div>
            )}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand/20 text-white border border-brand/20 rounded-tr-sm'
                  : 'bg-white/8 text-white/90 border border-white/10 rounded-tl-sm'
              }`}
              style={msg.role === 'user' ? { backgroundColor: 'rgba(127,119,221,0.2)' } : { backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <CitedArticle text={msg.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30
              flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0"
              style={{ color: '#7F77DD' }}>
              ✦
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/6 border border-white/10"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2 border-t border-white/10">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any Brazilian law... (Enter to send)"
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl resize-none
              bg-white/8 border border-white/10 text-white text-sm
              placeholder-white/30 focus:outline-none focus:border-white/30
              transition-colors leading-relaxed"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', maxHeight: '120px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center
              transition-all duration-200 flex-shrink-0"
            style={{
              backgroundColor: input.trim() && !loading ? '#7F77DD' : 'rgba(255,255,255,0.08)',
              color: input.trim() && !loading ? 'white' : 'rgba(255,255,255,0.3)',
            }}
          >
            ↑
          </button>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">
          For educational purposes only · Not legal advice
        </p>
      </div>
    </div>
  )
}
