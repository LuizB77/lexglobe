import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDailyLaw } from '../../utils/dailyLawPicker'

export default function DailyLawBanner() {
  const [article, setArticle] = useState(null)

  useEffect(() => {
    getDailyLaw('BR').then(setArticle)
  }, [])

  const label = article
    ? `Art. ${article.number} — ${article.title}`
    : 'Art. 5 da Constituição Federal'

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
      <Link
        to="/daily"
        className="pointer-events-auto mt-4 px-5 py-2.5 rounded-full text-sm font-medium
          bg-black/60 backdrop-blur border border-white/20 text-white
          hover:border-white/40 hover:bg-black/80 transition-all duration-200
          flex items-center gap-2 shadow-lg"
      >
        <span style={{ color: '#7F77DD' }}>✦</span>
        <span>Today's Law: {label}</span>
        <span style={{ color: 'rgba(127,119,221,0.7)' }}>→</span>
      </Link>
    </div>
  )
}
