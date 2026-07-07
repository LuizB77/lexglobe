export default function GlassCard({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`rounded-2xl ${hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
      }}
    >
      {children}
    </div>
  )
}
