import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const COUNTRIES = [
  { code: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { code: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', label: 'Spain', flag: '🇪🇸' },
  { code: 'US', label: 'USA', flag: '🇺🇸' },
]

const REASONS = [
  { id: 'travel', emoji: '🧳', label: "I'm traveling" },
  { id: 'immigrant', emoji: '🌎', label: "I'm an immigrant" },
  { id: 'studying', emoji: '📚', label: "I'm studying law" },
  { id: 'business', emoji: '💼', label: 'Business & work' },
]

const inputClass = `w-full bg-white/10 border border-white/15 text-white placeholder-white/40
  rounded-xl px-4 py-3 focus:border-white/30 focus:outline-none text-sm transition-colors`

const socialBtnClass = `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
  text-white transition-all`

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 814 1000" fill="white" className="flex-shrink-0">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-110.7C45.1 725.7 1 577.3 1 441.9c0-233.4 152.4-357.2 301.8-357.2 79.8 0 146.2 52.5 196.4 52.5 47.8 0 122.6-55.5 213.7-55.5zm-130.9-199.8c39.5-47.6 68.1-113.7 68.1-179.8 0-9-.6-18.1-2.6-25.4-64.4 2.6-140.9 43.5-186.3 98-35.9 41.6-70.5 107.7-70.5 174.5 0 9.6 1.9 19.2 2.6 22.4 3.9.6 10.3 1.3 16.6 1.3 57.8 0 130.3-38.8 172.1-91z"/>
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="flex-shrink-0">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23a11.5 11.5 0 013-.405c1.02 0 2.04.135 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

export default function AuthModal({ onSuccess, onClose, countryName, countryCode: initialCountryCode }) {
  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithGitHub } = useAuth()

  const [authMode, setAuthMode] = useState('signin')
  const [step, setStep] = useState('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [selectedCountries, setSelectedCountries] = useState(
    initialCountryCode ? [initialCountryCode] : []
  )
  const [selectedReason, setSelectedReason] = useState('')

  function savePreferences() {
    localStorage.setItem('lexglobe_preferences', JSON.stringify({
      countries: selectedCountries,
      reason: selectedReason,
    }))
  }

  function switchMode(newMode) {
    setAuthMode(newMode)
    setStep('credentials')
    setError('')
  }

  async function handleSubmit() {
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (authMode === 'signup') {
      if (!name) { setError('Please enter your name'); return }
      if (password !== confirmPassword) { setError('Passwords do not match'); return }
    }
    setLoading(true)
    setError('')
    try {
      if (authMode === 'signup') {
        signUp(email, password, name)
        setStep('interests')
        setLoading(false)
        return
      } else {
        signIn(email, password)
        onSuccess()
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function handleSocial(provider) {
    if (provider === 'google') signInWithGoogle()
    else if (provider === 'apple') signInWithApple()
    else if (provider === 'github') signInWithGitHub?.()
    onSuccess()
  }

  function handleFinish() {
    savePreferences()
    onSuccess()
  }

  function toggleCountry(code) {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const glassCard = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '24px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

      {/* Backdrop — thin blur only, keeps globe visible */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md p-8"
        style={{ ...glassCard, animation: 'authSlideUp 0.3s ease-out' }}
      >
        <style>{`
          @keyframes authSlideUp {
            from { transform: translateY(24px) scale(0.97); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center
            rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all text-lg"
        >
          ✕
        </button>

        {/* ── CREDENTIALS STEP ── */}
        {step === 'credentials' && (
          <>
            {/* Header */}
            <div className="text-center mb-7">
              <div className="text-3xl mb-3">🌐</div>
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'signin'
                  ? (countryName ? `Sign in to explore ${countryName}` : 'Welcome back')
                  : 'Create your account'}
              </h2>
              <p className="text-sm text-white/50 mt-1">
                {authMode === 'signin'
                  ? 'Sign in to LexGlobe'
                  : 'Join to access 10,000+ legal articles'}
              </p>
            </div>

            {/* Social buttons */}
            <div className="flex flex-col gap-2.5 mb-5">
              <button
                onClick={() => handleSocial('google')}
                className={socialBtnClass}
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              >
                <GoogleLogo />
                Continue with Google
              </button>

              <button
                onClick={() => handleSocial('apple')}
                className={socialBtnClass}
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              >
                <AppleLogo />
                Continue with Apple
              </button>

              <button
                onClick={() => handleSocial('github')}
                className={socialBtnClass}
                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              >
                <GitHubLogo />
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
              <span className="text-xs text-white/30">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
            </div>

            {/* Form */}
            <div className="flex flex-col gap-2.5">
              {authMode === 'signup' && (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              )}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className={inputClass}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={e => authMode === 'signin' && e.key === 'Enter' && handleSubmit()}
                className={inputClass}
              />
              {authMode === 'signup' && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className={inputClass}
                />
              )}

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-[#B8860B]/60 bg-[#B8860B]/15
                  text-[#B8860B] font-semibold hover:bg-[#B8860B]/25 hover:border-[#B8860B]/80
                  transition-all backdrop-blur-sm mt-1 text-sm"
              >
                {loading ? '…' : authMode === 'signin' ? 'Sign In' : 'Continue →'}
              </button>
            </div>

            {/* Toggle */}
            <p className="text-center text-xs text-white/40 mt-5">
              {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="font-semibold"
                style={{ color: '#B8860B' }}
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {/* Guest */}
            <div className="text-center mt-3">
              <button
                onClick={onClose}
                className="text-xs text-white/30 hover:text-white/50 transition-colors py-1"
              >
                Continue as guest
              </button>
            </div>
          </>
        )}

        {/* ── INTERESTS STEP ── */}
        {step === 'interests' && (
          <>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white">What interests you?</h2>
              <p className="text-sm text-white/50 mt-1">Personalize your LexGlobe experience</p>
            </div>

            {/* Country pills */}
            <div className="mb-6">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Which countries?</p>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(c => {
                  const sel = selectedCountries.includes(c.code)
                  return (
                    <button
                      key={c.code}
                      onClick={() => toggleCountry(c.code)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm
                        font-medium transition-all"
                      style={{
                        background: sel ? 'rgba(184,134,11,0.20)' : 'rgba(255,255,255,0.10)',
                        border: `1px solid ${sel ? '#B8860B' : 'rgba(255,255,255,0.15)'}`,
                        color: sel ? '#B8860B' : 'rgba(255,255,255,0.70)',
                      }}
                    >
                      <span>{c.flag}</span>
                      <span>{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reason cards */}
            <div className="mb-7">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">What brings you here?</p>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map(r => {
                  const sel = selectedReason === r.id
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReason(sel ? '' : r.id)}
                      className="flex flex-col items-center p-4 rounded-2xl transition-all"
                      style={{
                        background: sel ? 'rgba(184,134,11,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${sel ? 'rgba(184,134,11,0.60)' : 'rgba(255,255,255,0.10)'}`,
                      }}
                    >
                      <span className="text-3xl">{r.emoji}</span>
                      <span className="text-white/80 text-xs mt-2 font-medium text-center leading-tight">
                        {r.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl border border-[#B8860B]/60 bg-[#B8860B]/15
                text-[#B8860B] font-semibold hover:bg-[#B8860B]/25 hover:border-[#B8860B]/80
                transition-all backdrop-blur-sm text-sm mb-3"
            >
              Finish →
            </button>

            <div className="text-center">
              <button
                onClick={handleFinish}
                className="text-xs text-white/30 hover:text-white/50 transition-colors py-1"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
