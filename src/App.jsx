import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import ArticleViewPage from './pages/ArticleViewPage'
import AIAssistantPage from './pages/AIAssistantPage'
import DailyLawPage from './pages/DailyLawPage'
import BookmarksPage from './pages/BookmarksPage'

export default function App() {
  return (
    <BrowserRouter>
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
