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

export default function CountryPanel({ country, onClose }) {
  const navigate = useNavigate()

  return (
    <div
      className="absolute right-0 top-0 h-full w-full sm:w-96 z-30
        bg-space/95 backdrop-blur-md border-l border-brand/20
        flex flex-col shadow-2xl
        animate-[slideInRight_0.3s_ease-out]"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
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
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Available Legal Codes</p>
        <div className="flex flex-col gap-2">
          {country.codes?.map(code => (
            <div
              key={code}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
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
          onClick={() => navigate(`/library/${country.code}`)}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold
            hover:bg-brand/80 transition-colors"
        >
          Enter Library →
        </button>
        <button
          onClick={() => navigate(`/assistant/${country.code}`)}
          className="w-full py-3 rounded-xl border border-brand/40 text-brand
            font-semibold hover:bg-brand/10 transition-colors text-sm"
        >
          Ask AI Assistant
        </button>
      </div>
    </div>
  )
}
