import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const URL = 'https://al.sp.gov.br/repositorio/legislacao/constituicao/1989/constituicao-0-05.10.1989.html'

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#167;/g, '§')
    .replace(/&#176;/g, '°')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&[a-zA-Z]+;/g, c => {
      const map = {
        '&atilde;': 'ã', '&otilde;': 'õ', '&ccedil;': 'ç', '&eacute;': 'é',
        '&ecirc;': 'ê', '&oacute;': 'ó', '&ocirc;': 'ô', '&aacute;': 'á',
        '&agrave;': 'à', '&acirc;': 'â', '&iacute;': 'í', '&uacute;': 'ú',
        '&uuml;': 'ü', '&ntilde;': 'ñ', '&Atilde;': 'Ã', '&Otilde;': 'Õ',
        '&Ccedil;': 'Ç', '&Eacute;': 'É', '&Ecirc;': 'Ê', '&Oacute;': 'Ó',
        '&Ocirc;': 'Ô', '&Aacute;': 'Á', '&Acirc;': 'Â', '&Iacute;': 'Í',
        '&Uacute;': 'Ú', '&aelig;': 'æ', '&ordm;': 'º', '&ordf;': 'ª',
      }
      return map[c] || c
    })
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseSection(html, idPrefix, numberPrefix) {
  const artRegex = /<strong>Artigo\s+(\d+(?:-[A-Z])?)[°º]?\s*-<\/strong>([\s\S]*?)(?=<strong>Artigo\s+\d+(?:-[A-Z])?[°º]?\s*-<\/strong>|$)/gi
  const articles = []

  let match
  while ((match = artRegex.exec(html)) !== null) {
    const number = match[1]
    const rawBody = match[2]

    const text = stripTags(rawBody).replace(/\s+/g, ' ').trim()
    if (!text) continue

    const displayNumber = numberPrefix ? `${numberPrefix}-${number}` : number
    const fullText = `Artigo ${displayNumber}° - ${text}`
    const title = text.length > 80 ? text.slice(0, 80) + '…' : text
    const tags = text
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 5)
      .map(w => w.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç]/g, ''))
      .filter(Boolean)

    articles.push({
      id: `${idPrefix}${number.toLowerCase().replace('-', '_')}`,
      number: displayNumber,
      title,
      text: fullText,
      tags,
      relatedArticles: [],
    })
  }

  return articles
}

function extractArticles(html) {
  // Remove script/style blocks
  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Remove strikethrough blocks — these are superseded article versions
  html = html.replace(/<s>[\s\S]*?<\/s>/gi, '')

  // Decode entities before parsing text
  html = decodeEntities(html)

  // Split main body from transitional provisions (ADCT) — both restart numbering at Art. 1
  const adctMarker = /ATO DAS DISPOSI[CÇ][OÕ]ES CONSTITUCIONAIS TRANSIT[OÓ]RIAS/i
  const adctIdx = html.search(adctMarker)

  const mainHtml = adctIdx > 0 ? html.slice(0, adctIdx) : html
  const adctHtml = adctIdx > 0 ? html.slice(adctIdx) : ''

  const mainArticles = parseSection(mainHtml, 'csp_', null)
  const adctArticles = adctHtml ? parseSection(adctHtml, 'csp_t_', 'T') : []

  return [...mainArticles, ...adctArticles]
}

async function main() {
  console.log('Fetching SP Constitution...')
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  console.log(`Downloaded ${html.length} bytes`)

  const articles = extractArticles(html)
  console.log(`Extracted ${articles.length} articles`)
  console.log(`Max article number: ${articles.map(a => parseInt(a.number)).reduce((a, b) => Math.max(a, b), 0)}`)

  // Sample output
  console.log('\n--- Sample: Art. 1 ---')
  console.log(JSON.stringify(articles[0], null, 2))
  console.log('\n--- Sample: Art. 10 ---')
  const art10 = articles.find(a => a.number === '10')
  console.log(JSON.stringify(art10, null, 2))
  console.log('\n--- Sample: Art. 52-A ---')
  const art52a = articles.find(a => a.number === '52-A')
  console.log(JSON.stringify(art52a, null, 2))

  // Check for duplicates
  const ids = articles.map(a => a.id)
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dupes.length) console.warn('DUPLICATE IDs:', dupes)
  else console.log('No duplicate IDs.')

  // Check for HTML tag leakage
  const hasHtml = articles.filter(a => /<[^>]+>/.test(a.text))
  if (hasHtml.length) console.warn('HTML tags leaked in:', hasHtml.map(a => a.id))
  else console.log('No HTML tag leakage.')

  const output = {
    country: 'BR',
    state: 'SP',
    code: 'constituicaoSP',
    displayName: 'Constituição do Estado de São Paulo',
    color: '#FFD700',
    articles,
  }

  const outDir = join(__dirname, '../src/data/brazil-states/sao-paulo')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'constituicaoSP.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\nSaved to ${outPath}`)
}

main().catch(e => { console.error(e); process.exit(1) })
