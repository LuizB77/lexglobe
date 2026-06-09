export function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export async function getDailyLaw(countryCode = 'BR') {
  const CACHE_KEY = 'lexglobe_daily'
  const today = new Date().toISOString().split('T')[0]
  const cacheKey = `${today}_${countryCode}`
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  if (cached[cacheKey]) return cached[cacheKey]

  let modules = []
  if (countryCode === 'PT') {
    modules = await Promise.all([
      import('../data/portugal/constituicaoPT.json'),
      import('../data/portugal/codigoPenalPT.json'),
      import('../data/portugal/codigoCivilPT.json'),
      import('../data/portugal/codigoTrabalho.json'),
      import('../data/portugal/codigoProcessoPenal.json'),
      import('../data/portugal/codigoProcessoCivil.json'),
      import('../data/portugal/codigoComercial.json'),
      import('../data/portugal/codigoEstrada.json'),
    ])
  } else if (countryCode === 'US') {
    modules = await Promise.all([
      import('../data/usa/usConstitution.json'),
      import('../data/usa/title18Criminal.json'),
      import('../data/usa/title42CivilRights.json'),
      import('../data/usa/title29Labor.json'),
      import('../data/usa/title26Tax.json'),
      import('../data/usa/title15Commerce.json'),
      import('../data/usa/title8Immigration.json'),
      import('../data/usa/title20Education.json'),
      import('../data/usa/title31Finance.json'),
      import('../data/usa/title49Transportation.json'),
    ])
  } else if (countryCode === 'ES') {
    modules = await Promise.all([
      import('../data/spain/constitucionES.json'),
      import('../data/spain/codigoPenalES.json'),
      import('../data/spain/codigoCivilES.json'),
      import('../data/spain/estatutoTrabajadores.json'),
    ])
  } else {
    modules = await Promise.all([
      import('../data/brazil/constituicao.json'),
      import('../data/brazil/codigoPenal.json'),
      import('../data/brazil/codigoCivil.json'),
      import('../data/brazil/clt.json'),
      import('../data/brazil/eca.json'),
      import('../data/brazil/cdc.json'),
    ])
  }

  const allArticles = []
  for (const mod of modules) {
    const data = mod.default || mod
    for (const article of data.articles || []) {
      allArticles.push({
        ...article,
        codeKey: data.code,
        codeName: data.displayName,
        codeColor: data.color,
      })
    }
  }

  if (allArticles.length === 0) return null
  const dayIndex = getDayOfYear()
  const picked = allArticles[dayIndex % allArticles.length]
  const entry = { ...picked, date: today, explanation: null }
  cached[cacheKey] = entry
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  return entry
}
