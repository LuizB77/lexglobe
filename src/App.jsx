import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import ArticleViewPage from './pages/ArticleViewPage'
import AIAssistantPage from './pages/AIAssistantPage'
import DailyLawPage from './pages/DailyLawPage'
import BookmarksPage from './pages/BookmarksPage'

const PAGE_TITLES = {
  '/': 'LexGlobe — Explore Brazilian Law on a 3D Globe',
  '/library/BR': 'Brazil Law Library — LexGlobe',
  '/daily': 'Daily Law — LexGlobe',
  '/assistant/BR': 'AI Legal Assistant — LexGlobe',
  '/bookmarks': 'Saved Articles — LexGlobe',
}

function TitleUpdater() {
  const location = useLocation()
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname]
    if (title) document.title = title
    else if (location.pathname.startsWith('/article/')) {
      document.title = 'Article — LexGlobe'
    } else if (location.pathname.startsWith('/library/')) {
      document.title = 'Law Library — LexGlobe'
    }
  }, [location])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library/:countryCode" element={<LibraryPage />} />
        <Route path="/article/:countryCode/:articleId" element={<ArticleViewPage />} />
        <Route path="/assistant/:countryCode" element={<AIAssistantPage />} />
        <Route path="/daily" element={<DailyLawPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
      </Routes>
    </BrowserRouter>
  )
}
