import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('lexglobe_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  function signUp(email, password, name) {
    const newUser = {
      uid: `user_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      createdAt: new Date().toISOString(),
      provider: 'email',
    }
    localStorage.setItem('lexglobe_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  function signIn(email, password) {
    const existingUser = {
      uid: `user_${email.replace(/[^a-z0-9]/gi, '')}`,
      email,
      name: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
      provider: 'email',
    }
    localStorage.setItem('lexglobe_user', JSON.stringify(existingUser))
    setUser(existingUser)
    return existingUser
  }

  function signInWithGoogle() {
    const googleUser = {
      uid: `google_${Date.now()}`,
      email: 'demo@gmail.com',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo',
      createdAt: new Date().toISOString(),
      provider: 'google',
    }
    localStorage.setItem('lexglobe_user', JSON.stringify(googleUser))
    setUser(googleUser)
    return googleUser
  }

  function signInWithApple() {
    const appleUser = {
      uid: `apple_${Date.now()}`,
      email: 'demo@icloud.com',
      name: 'Demo User',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Apple',
      createdAt: new Date().toISOString(),
      provider: 'apple',
    }
    localStorage.setItem('lexglobe_user', JSON.stringify(appleUser))
    setUser(appleUser)
    return appleUser
  }

  function signOut() {
    localStorage.removeItem('lexglobe_user')
    setUser(null)
  }

  function updateStreak() {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const streakKey = 'lexglobe_streak'
    const streak = JSON.parse(localStorage.getItem(streakKey) || '{"count":0,"lastDate":null}')

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newCount = streak.count
    if (streak.lastDate === today) {
      return streak
    } else if (streak.lastDate === yesterdayStr) {
      newCount = streak.count + 1
    } else {
      newCount = 1
    }

    const newStreak = { count: newCount, lastDate: today }
    localStorage.setItem(streakKey, JSON.stringify(newStreak))
    return newStreak
  }

  function getStreak() {
    const streak = JSON.parse(localStorage.getItem('lexglobe_streak') || '{"count":0,"lastDate":null}')
    return streak
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      signUp, signIn, signInWithGoogle, signInWithApple,
      signOut, updateStreak, getStreak,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
