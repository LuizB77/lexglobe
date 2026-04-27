export default function CodeIllustration({ codeKey, color, spine }) {
  const illustrations = {
    constituicao: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Balance beam */}
        <rect x="38" y="18" width="4" height="36" rx="2" fill={spine} opacity="0.9"/>
        <rect x="20" y="20" width="40" height="3" rx="1.5" fill={spine} opacity="0.9"/>
        {/* Left pan */}
        <path d="M22 24 Q18 34 14 36 Q18 38 22 36 Q26 34 22 24Z" fill={spine} opacity="0.6"/>
        <ellipse cx="22" cy="36" rx="7" ry="2" fill={spine} opacity="0.5"/>
        {/* Right pan */}
        <path d="M58 24 Q62 34 66 36 Q62 38 58 36 Q54 34 58 24Z" fill={spine} opacity="0.6"/>
        <ellipse cx="58" cy="36" rx="7" ry="2" fill={spine} opacity="0.5"/>
        {/* Base */}
        <rect x="30" y="54" width="20" height="3" rx="1.5" fill={spine} opacity="0.7"/>
        <rect x="33" y="51" width="14" height="4" rx="2" fill={spine} opacity="0.5"/>
        {/* Stars */}
        <circle cx="20" cy="14" r="2" fill={spine} opacity="0.4"/>
        <circle cx="40" cy="10" r="2.5" fill={spine} opacity="0.5"/>
        <circle cx="60" cy="14" r="2" fill={spine} opacity="0.4"/>
        {/* Glow base */}
        <ellipse cx="40" cy="68" rx="18" ry="3" fill={spine} opacity="0.1"/>
      </svg>
    ),

    codigoPenal: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lock body */}
        <rect x="22" y="38" width="36" height="28" rx="6" fill={spine} opacity="0.85"/>
        {/* Lock shackle */}
        <path d="M29 38 L29 28 Q29 16 40 16 Q51 16 51 28 L51 38"
          stroke={spine} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
        {/* Keyhole */}
        <circle cx="40" cy="50" r="5" fill="white" opacity="0.25"/>
        <rect x="38" y="50" width="4" height="8" rx="2" fill="white" opacity="0.25"/>
        {/* Bars behind */}
        <rect x="14" y="30" width="3" height="38" rx="1.5" fill={spine} opacity="0.2"/>
        <rect x="63" y="30" width="3" height="38" rx="1.5" fill={spine} opacity="0.2"/>
        {/* Shadow */}
        <ellipse cx="40" cy="68" rx="16" ry="2.5" fill={spine} opacity="0.15"/>
      </svg>
    ),

    codigoCivil: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Document */}
        <rect x="18" y="14" width="32" height="42" rx="4" fill={spine} opacity="0.15"/>
        <rect x="18" y="14" width="32" height="42" rx="4" stroke={spine} strokeWidth="2" opacity="0.6"/>
        {/* Document lines */}
        <rect x="24" y="24" width="20" height="2.5" rx="1.25" fill={spine} opacity="0.5"/>
        <rect x="24" y="31" width="16" height="2.5" rx="1.25" fill={spine} opacity="0.4"/>
        <rect x="24" y="38" width="18" height="2.5" rx="1.25" fill={spine} opacity="0.4"/>
        <rect x="24" y="45" width="12" height="2.5" rx="1.25" fill={spine} opacity="0.3"/>
        {/* Handshake */}
        <path d="M36 52 Q42 46 50 48 Q56 50 58 56 Q52 62 46 60 Q40 58 36 52Z"
          fill={spine} opacity="0.7"/>
        <path d="M44 52 Q38 46 30 48 Q24 50 22 56 Q28 62 34 60 Q40 58 44 52Z"
          fill={spine} opacity="0.6"/>
        {/* Clasped hands detail */}
        <circle cx="40" cy="56" r="4" fill={spine} opacity="0.9"/>
        <ellipse cx="40" cy="68" rx="15" ry="2.5" fill={spine} opacity="0.1"/>
      </svg>
    ),

    clt: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hard hat */}
        <path d="M18 42 Q18 26 40 24 Q62 26 62 42Z" fill={spine} opacity="0.85"/>
        <rect x="14" y="40" width="52" height="6" rx="3" fill={spine} opacity="0.9"/>
        {/* Hat brim shadow */}
        <path d="M20 46 Q40 50 60 46" stroke={spine} strokeWidth="2" opacity="0.3" fill="none"/>
        {/* Gear */}
        <circle cx="40" cy="62" r="8" fill="none" stroke={spine} strokeWidth="3" opacity="0.7"/>
        <circle cx="40" cy="62" r="4" fill={spine} opacity="0.5"/>
        {/* Gear teeth */}
        {[0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 40 + 8 * Math.cos(rad)
          const y1 = 62 + 8 * Math.sin(rad)
          const x2 = 40 + 11 * Math.cos(rad)
          const y2 = 62 + 11 * Math.sin(rad)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={spine} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        })}
        {/* Hat stripe */}
        <rect x="34" y="28" width="12" height="4" rx="2" fill="white" opacity="0.2"/>
        <ellipse cx="40" cy="72" rx="14" ry="2" fill={spine} opacity="0.1"/>
      </svg>
    ),

    eca: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Adult figure */}
        <circle cx="30" cy="22" r="7" fill={spine} opacity="0.8"/>
        <path d="M18 56 Q18 38 30 36 Q42 38 42 56Z" fill={spine} opacity="0.7"/>
        {/* Child figure */}
        <circle cx="52" cy="28" r="5" fill={spine} opacity="0.6"/>
        <path d="M43 56 Q43 42 52 40 Q61 42 61 56Z" fill={spine} opacity="0.55"/>
        {/* Protective arc / shield */}
        <path d="M14 34 Q14 16 40 14 Q66 16 66 34"
          stroke={spine} strokeWidth="2.5" fill="none" opacity="0.3"
          strokeLinecap="round" strokeDasharray="4 3"/>
        {/* Heart */}
        <path d="M38 62 Q40 58 44 60 Q48 58 48 62 Q48 66 44 70 Q40 66 38 62Z"
          fill={spine} opacity="0.5"/>
        <ellipse cx="40" cy="72" rx="16" ry="2" fill={spine} opacity="0.1"/>
      </svg>
    ),

    cdc: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield */}
        <path d="M40 12 L62 22 L62 44 Q62 60 40 68 Q18 60 18 44 L18 22 Z"
          fill={spine} opacity="0.15" stroke={spine} strokeWidth="2" opacity2="0.6"/>
        <path d="M40 12 L62 22 L62 44 Q62 60 40 68 Q18 60 18 44 L18 22 Z"
          stroke={spine} strokeWidth="2.5" fill="none" opacity="0.7"/>
        {/* Checkmark inside shield */}
        <path d="M28 40 L36 50 L54 30"
          stroke={spine} strokeWidth="4" strokeLinecap="round"
          strokeLinejoin="round" fill="none" opacity="0.85"/>
        {/* Shopping cart */}
        <path d="M14 16 L20 16 L26 34 L52 34 L56 22 L24 22"
          stroke={spine} strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round" fill="none" opacity="0.35"/>
        <circle cx="30" cy="38" r="2.5" fill={spine} opacity="0.35"/>
        <circle cx="46" cy="38" r="2.5" fill={spine} opacity="0.35"/>
        <ellipse cx="40" cy="72" rx="16" ry="2" fill={spine} opacity="0.1"/>
      </svg>
    ),
  }

  return (
    <div className="w-full flex items-center justify-center"
      style={{ height: '90px' }}>
      {illustrations[codeKey] || (
        <div className="text-4xl opacity-60">📜</div>
      )}
    </div>
  )
}
