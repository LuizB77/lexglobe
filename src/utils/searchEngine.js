import Fuse from 'fuse.js'

const CODE_MAP = {
  constituicao: () => import('../data/brazil/constituicao.json'),
  codigoPenal:  () => import('../data/brazil/codigoPenal.json'),
  codigoCivil:  () => import('../data/brazil/codigoCivil.json'),
  clt:          () => import('../data/brazil/clt.json'),
  eca:          () => import('../data/brazil/eca.json'),
  cdc:          () => import('../data/brazil/cdc.json'),
  constituicaoPT:      () => import('../data/portugal/constituicaoPT.json'),
  codigoPenalPT:       () => import('../data/portugal/codigoPenalPT.json'),
  codigoCivilPT:       () => import('../data/portugal/codigoCivilPT.json'),
  codigoTrabalho:      () => import('../data/portugal/codigoTrabalho.json'),
  codigoProcessoPenal: () => import('../data/portugal/codigoProcessoPenal.json'),
  codigoProcessoCivil: () => import('../data/portugal/codigoProcessoCivil.json'),
  codigoComercial:     () => import('../data/portugal/codigoComercial.json'),
  codigoEstrada:       () => import('../data/portugal/codigoEstrada.json'),
  constitucionES:       () => import('../data/spain/constitucionES.json'),
  codigoPenalES:        () => import('../data/spain/codigoPenalES.json'),
  codigoCivilES:        () => import('../data/spain/codigoCivilES.json'),
  estatutoTrabajadores: () => import('../data/spain/estatutoTrabajadores.json'),
  usConstitution:        () => import('../data/usa/usConstitution.json'),
  title18Criminal:       () => import('../data/usa/title18Criminal.json'),
  title42CivilRights:    () => import('../data/usa/title42CivilRights.json'),
  title29Labor:          () => import('../data/usa/title29Labor.json'),
  title26Tax:            () => import('../data/usa/title26Tax.json'),
  title15Commerce:       () => import('../data/usa/title15Commerce.json'),
  title8Immigration:     () => import('../data/usa/title8Immigration.json'),
  title20Education:      () => import('../data/usa/title20Education.json'),
  title31Finance:        () => import('../data/usa/title31Finance.json'),
  title49Transportation: () => import('../data/usa/title49Transportation.json'),
}

const COUNTRY_CODES = {
  BR: ['constituicao', 'codigoPenal', 'codigoCivil', 'clt', 'eca', 'cdc'],
  PT: [
    'constituicaoPT', 'codigoPenalPT', 'codigoCivilPT', 'codigoTrabalho',
    'codigoProcessoPenal', 'codigoProcessoCivil', 'codigoComercial',
    'codigoEstrada',
  ],
  ES: ['constitucionES', 'codigoPenalES', 'codigoCivilES', 'estatutoTrabajadores'],
  US: [
    'usConstitution', 'title18Criminal', 'title42CivilRights',
    'title29Labor', 'title26Tax', 'title15Commerce',
    'title8Immigration', 'title20Education', 'title31Finance',
    'title49Transportation',
  ],
}

const cache = {}

export async function loadCode(codeKey) {
  if (cache[codeKey]) return cache[codeKey]
  const mod = await CODE_MAP[codeKey]()
  cache[codeKey] = mod.default || mod
  return cache[codeKey]
}

export async function loadAllCodes(countryCode) {
  const keys = COUNTRY_CODES[countryCode] || COUNTRY_CODES['BR']
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
    articles = (data.articles || []).map(a => ({
      ...a, codeKey, codeName: data.displayName, codeColor: data.color
    }))
  } else {
    const allCodes = await loadAllCodes(countryCode)
    for (const [key, data] of Object.entries(allCodes)) {
      const withMeta = (data.articles || []).map(a => ({
        ...a, codeKey: key, codeName: data.displayName, codeColor: data.color,
      }))
      articles.push(...withMeta)
    }
  }
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
  if (exactMatch) return [exactMatch, ...fuseResults.filter(a => a.id !== exactMatch.id)]
  return fuseResults
}
