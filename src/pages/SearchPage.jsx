import { useNavigate } from 'react-router-dom'
import PageBackground from '../components/ui/PageBackground'
import GlassCard from '../components/ui/GlassCard'

export default function SearchPage() {
  const navigate = useNavigate()
  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center pt-14 px-4">
        <GlassCard className="p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">Search</h1>
          <p className="text-sm text-white/50 mb-6">
            Full search with country and code filters coming soon.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#7F77DD' }}
          >
            Browse the Globe →
          </button>
        </GlassCard>
      </div>
    </PageBackground>
  )
}
