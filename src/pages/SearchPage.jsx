import { useNavigate } from 'react-router-dom'

export default function SearchPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #f0ede8 0%, #f8f7f4 100%)' }}>
      <div className="text-center px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
          Full search with country and code filters coming soon.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#7F77DD' }}
        >
          Browse the Globe →
        </button>
      </div>
    </div>
  )
}
