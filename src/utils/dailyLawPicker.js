export function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export async function getDailyLaw(countryCode = 'BR') {
  const CACHE_KEY = 'lexglobe_daily'
  const today = new Date().toISOString().split('T')[0] // "2026-04-26"
  
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  if (cached[today]) return cached[today]

  // Dynamically load all articles
  const modules = await Promise.all([
    import('../data/brazil/constituicao.json'),
    import('../data/brazil/codigoPenal.json'),
    import('../data/brazil/codigoCivil.json'),
    import('../data/brazil/clt.json'),
    import('../data/brazil/eca.json'),
    import('../data/brazil/cdc.json'),
  ])

  const allArticles = []
  for (const mod of modules) {
    const data = mod.default || mod
    for (const article of data.articles || []) {
      allArticles.push({ ...article, codeKey: data.code, codeName: data.displayName, codeColor: data.color })
    }
  }

  const dayIndex = getDayOfYear()
  const picked = allArticles[dayIndex % allArticles.length]

  // Store without explanation yet — explanation added by DailyLawPage after Claude call
  const entry = { ...picked, date: today, explanation: null }
  cached[today] = entry
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached))

  return entry
}
