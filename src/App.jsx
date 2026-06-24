import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/ui/NavBar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import LibraryPage from './pages/LibraryPage'
import ArticleViewPage from './pages/ArticleViewPage'
import AIAssistantPage from './pages/AIAssistantPage'
import DailyLawPage from './pages/DailyLawPage'
import BookmarksPage from './pages/BookmarksPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import TravelGuidePage from './pages/TravelGuidePage'

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
    <AuthProvider>
      <BrowserRouter>
        <TitleUpdater />
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/library/:countryCode" element={<LibraryPage />} />
          <Route path="/article/:countryCode/:articleId" element={<ArticleViewPage />} />
          <Route path="/assistant/:countryCode" element={<AIAssistantPage />} />
          <Route path="/daily" element={<DailyLawPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/travel" element={<TravelGuidePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
