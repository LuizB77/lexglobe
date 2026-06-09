import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ onSuccess, onClose, countryName }) {
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name'); return }
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        signUp(email, password, name)
      } else {
        signIn(email, password)
      }
      onSuccess()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function handleGoogle() {
    signInWithGoogle()
    onSuccess()
  }

  function handleApple() {
    signInWithApple()
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center
      justify-center p-0 sm:p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-white
        rounded-t-3xl sm:rounded-3xl shadow-2xl"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @media (min-width: 640px) {
            @keyframes slideUp {
              from { transform: translateY(20px) scale(0.96); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
          }
        `}</style>

        {/* Handle bar on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pb-8 pt-4 sm:pt-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🌐</div>
            <h2 className="text-xl font-bold text-gray-900">
              {countryName
                ? `Sign in to explore ${countryName}`
                : mode === 'signin' ? 'Welcome back' : 'Create account'
              }
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {countryName
                ? 'Create a free account to access the law library'
                : 'Access 10,000+ legal articles from 2 countries'
              }
            </p>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4
                rounded-xl border border-gray-200 text-gray-700 font-medium text-sm
                hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleApple}
              className="w-full flex items-center justify-center gap-3 py-3 px-4
                rounded-xl bg-black text-white font-medium text-sm
                hover:bg-gray-900 active:bg-gray-800 transition-colors min-h-[48px]"
            >
              <svg width="16" height="16" viewBox="0 0 814 1000" fill="white">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-110.7C45.1 725.7 1 577.3 1 441.9c0-233.4 152.4-357.2 301.8-357.2 79.8 0 146.2 52.5 196.4 52.5 47.8 0 122.6-55.5 213.7-55.5zm-130.9-199.8c39.5-47.6 68.1-113.7 68.1-179.8 0-9-.6-18.1-2.6-25.4-64.4 2.6-140.9 43.5-186.3 98-35.9 41.6-70.5 107.7-70.5 174.5 0 9.6 1.9 19.2 2.6 22.4 3.9.6 10.3 1.3 16.6 1.3 57.8 0 130.3-38.8 172.1-91z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <div className="flex flex-col gap-2.5">
            {mode === 'signup' && (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                  text-gray-800 text-sm placeholder-gray-400
                  focus:outline-none focus:border-gray-400 min-h-[48px]"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                text-gray-800 text-sm placeholder-gray-400
                focus:outline-none focus:border-gray-400 min-h-[48px]"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                text-gray-800 text-sm placeholder-gray-400
                focus:outline-none focus:border-gray-400 min-h-[48px]"
            />

            {error && (
              <p className="text-xs text-red-500 px-1">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold
                text-sm transition-colors min-h-[48px] mt-1"
              style={{ backgroundColor: '#7F77DD' }}
            >
              {loading ? '...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
              className="font-semibold underline"
              style={{ color: '#7F77DD' }}
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
