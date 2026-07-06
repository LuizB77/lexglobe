import { useNavigate } from 'react-router-dom'

const CODE_COLORS = {
  constituicao: '#FFD700',
  codigoPenal: '#E53E3E',
  codigoCivil: '#7F77DD',
  clt: '#1D9E75',
  eca: '#F6AD55',
  cdc: '#63B3ED',
}

const CODE_LABELS = {
  constituicao: 'Constituição Federal',
  codigoPenal: 'Código Penal',
  codigoCivil: 'Código Civil',
  clt: 'CLT',
  eca: 'ECA',
  cdc: 'CDC',
}

export default function CountryPanel({ country, onClose, onEnterLibrary }) {
  const navigate = useNavigate()

  return (
    <div
      className="absolute right-0 top-0 h-full w-full sm:w-96 z-30
        flex flex-col shadow-2xl"
      style={{
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.15)',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{country.flag}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{country.nameLocal || country.name}</h2>
            <p className="text-sm text-white/50">{country.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full
            text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Legal codes */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-widest">Available Legal Codes</p>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(184,134,11,0.20)',
              border: '1px solid rgba(184,134,11,0.40)',
              color: '#B8860B',
            }}
          >
            Available
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {country.codes?.map(code => (
            <div
              key={code}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-2 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: CODE_COLORS[code] || '#888' }}
              />
              <span className="text-white/80 text-sm">{CODE_LABELS[code] || code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/10 flex flex-col gap-3">
        <button
          onClick={() => onEnterLibrary ? onEnterLibrary(country.code, country.lat, country.lng) : navigate(`/library/${country.code}`)}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all backdrop-blur-sm"
          style={{
            border: '1px solid rgba(184,134,11,0.60)',
            background: 'rgba(184,134,11,0.15)',
            color: '#B8860B',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,134,11,0.15)'}
        >
          Enter Law Library →
        </button>
        <button
          onClick={() => navigate(`/assistant/${country.code}`)}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'rgba(255,255,255,0.80)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        >
          Ask AI Assistant
        </button>
        <button
          onClick={() => navigate('/travel', { state: { openPlanner: true, destination: country.code } })}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'rgba(255,255,255,0.80)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
        >
          Plan a Trip ✈
        </button>
      </div>
    </div>
  )
}
