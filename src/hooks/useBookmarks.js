import { useState, useCallback } from 'react'

const STORAGE_KEY = 'lexglobe_bookmarks'

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(getStored)

  const isBookmarked = useCallback((countryCode, articleId) => {
    return (bookmarks[countryCode] || []).includes(articleId)
  }, [bookmarks])

  const toggle = useCallback((countryCode, articleId) => {
    setBookmarks(prev => {
      const current = prev[countryCode] || []
      const next = current.includes(articleId)
        ? current.filter(id => id !== articleId)
        : [...current, articleId]
      const updated = { ...prev, [countryCode]: next }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getAll = useCallback(() => bookmarks, [bookmarks])

  return { isBookmarked, toggle, getAll }
}
