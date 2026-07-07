export default function PageBackground({ children, className = '' }) {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.4)',
          transform: 'scale(1.05)',
        }}
      />
      <div
        className="fixed inset-0 z-0"
        style={{ background: 'rgba(5, 10, 20, 0.55)' }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
      />
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>
    </div>
  )
}
