import Fuse from 'fuse.js'

const CODE_MAP = {
  constituicao: () => import('../data/brazil/constituicao.json'),
  codigoPenal:  () => import('../data/brazil/codigoPenal.json'),
  codigoCivil:  () => import('../data/brazil/codigoCivil.json'),
  clt:          () => import('../data/brazil/clt.json'),
  eca:          () => import('../data/brazil/eca.json'),
  cdc:          () => import('../data/brazil/cdc.json'),
}

const cache = {}

export async function loadCode(codeKey) {
  if (cache[codeKey]) return cache[codeKey]
  const mod = await CODE_MAP[codeKey]()
  cache[codeKey] = mod.default || mod
  return cache[codeKey]
}

export async function loadAllCodes(countryCode) {
  // For now Brazil only; extend when more countries added
  const keys = Object.keys(CODE_MAP)
  const results = await Promise.all(keys.map(k => loadCode(k)))
  return keys.reduce((acc, k, i) => {
    acc[k] = results[i]
    return acc
  }, {})
}

export async function search(query, countryCode, codeKey = null) {
  if (!query || query.trim().length < 2) return []

  let articles = []

  if (codeKey && CODE_MAP[codeKey]) {
    const data = await loadCode(codeKey)
    articles = (data.articles || []).map(a => ({ ...a, codeKey, codeName: data.displayName, codeColor: data.color }))
  } else {
    const allCodes = await loadAllCodes(countryCode)
    for (const [key, data] of Object.entries(allCodes)) {
      const withMeta = (data.articles || []).map(a => ({
        ...a,
        codeKey: key,
        codeName: data.displayName,
        codeColor: data.color,
      }))
      articles.push(...withMeta)
    }
  }

  // Exact article number match first
  const exactMatch = articles.find(a => a.number === query.trim())
  
  const fuse = new Fuse(articles, {
    keys: [
      { name: 'number', weight: 0.4 },
      { name: 'title', weight: 0.3 },
      { name: 'text', weight: 0.2 },
      { name: 'tags', weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
  })

  const fuseResults = fuse.search(query).slice(0, 10).map(r => r.item)

  if (exactMatch) {
    return [exactMatch, ...fuseResults.filter(a => a.id !== exactMatch.id)]
  }

  return fuseResults
}
