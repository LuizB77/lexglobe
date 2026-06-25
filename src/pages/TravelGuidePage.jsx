import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'
import { TRAVEL_GUIDE } from '../data/travelGuide'

const COUNTRIES = [
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'US', label: 'USA', flag: '🇺🇸' },
]

function TopicCard({ topic }) {
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-sm"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{topic.icon}</span>
        <h3 className="font-bold text-white text-sm">{topic.title}</h3>
      </div>
      <ul className="flex flex-col gap-1.5">
        {topic.bullets.map((b, i) => (
          <li key={i} className="text-white/70 text-sm leading-relaxed flex gap-2">
            <span className="text-white/30 mt-0.5 flex-shrink-0">·</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QAItem({ item, open, onToggle }) {
  return (
    <div
      className="rounded-xl overflow-hidden backdrop-blur-sm cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
      onClick={onToggle}
    >
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <p className="text-white/90 text-sm font-medium">{item.q}</p>
        <span className="text-white/40 flex-shrink-0 text-lg leading-none select-none">
          {open ? '−' : '+'}
        </span>
      </div>
      {open && (
        <div
          className="px-5 pb-4 border-l-2 ml-5"
          style={{ borderColor: '#B8860B' }}
        >
          <p className="text-white/60 text-sm leading-relaxed pl-3">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function TravelGuidePage() {
  const [searchParams] = useSearchParams()
  const initialCountry = searchParams.get('country')
  const matchedCode = COUNTRIES.find(
    c => c.label.toLowerCase() === initialCountry?.toLowerCase() || c.code === initialCountry
  )?.code || 'BR'

  const [selected, setSelected] = useState(matchedCode)
  const [openIndex, setOpenIndex] = useState(null)
  const guide = TRAVEL_GUIDE[selected]

  function handleCountryChange(code) {
    setSelected(code)
    setOpenIndex(null)
  }

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Travel Guide</h1>
          <p className="text-sm text-white/60">Know the rules before you land.</p>
        </div>

        {/* Country selector */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {COUNTRIES.map(c => {
            const isSelected = c.code === selected
            return (
              <button
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm
                  font-semibold transition-all backdrop-blur-sm"
                style={{
                  border: `1px solid ${isSelected ? '#B8860B' : 'rgba(255,255,255,0.20)'}`,
                  color: isSelected ? '#B8860B' : 'rgba(255,255,255,0.60)',
                  background: isSelected ? 'rgba(184,134,11,0.10)' : 'transparent',
                }}
              >
                <span>{c.flag}</span>
                <span>{c.label}</span>
              </button>
            )
          })}
        </div>

        {/* Topic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {guide.topics.map((topic, i) => (
            <TopicCard key={i} topic={topic} />
          ))}
        </div>

        {/* Q&A */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {guide.qa.map((item, i) => (
              <QAItem
                key={`${selected}-${i}`}
                item={item}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </GlassCard>

        <p className="text-white/30 text-xs text-center mt-8 pb-8 max-w-2xl mx-auto">
          Information sourced from official government portals: gov.br, portalconsular.mre.gov.br,
          administracion.gob.es, travel.state.gov, and europa.eu. Last reviewed June 2026.
          LexGlobe is a legal reference tool, not legal advice. Always verify with official sources before travel.
        </p>
      </div>
    </PageBackground>
  )
}
