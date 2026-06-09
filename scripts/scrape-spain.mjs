import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CODES = [
  {
    key: 'constitucionES',
    displayName: 'Constitución Española',
    color: '#C8A000',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229',
    prefix: 'ces',
  },
  {
    key: 'codigoPenalES',
    displayName: 'Código Penal',
    color: '#C53030',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444',
    prefix: 'cpes',
  },
  {
    key: 'codigoCivilES',
    displayName: 'Código Civil',
    color: '#553C9A',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763',
    prefix: 'cces',
  },
  {
    key: 'estatutoTrabajadores',
    displayName: 'Estatuto de los Trabajadores',
    color: '#276749',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
    prefix: 'etes',
  },
]

function cleanText(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractArticles(html, prefix) {
  const articles = []
  const seen = new Set()

  const stripTags = (str) => str
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const plain = stripTags(html)
  const CHUNK_SIZE = 50000
  const OVERLAP = 2000
  let pos = 0

  while (pos < plain.length) {
    const end = Math.min(pos + CHUNK_SIZE, plain.length)
    const chunk = plain.slice(pos, end)
    const splits = chunk.split(/(?=Art(?:ículo|iculo|\.)\s*\d+(?:\s*bis)?\.?\s)/i)

    for (const part of splits) {
      const numMatch = part.match(/^Art(?:ículo|iculo|\.)\s*(\d+(?:\s*bis)?)[.\s]/i)
      if (!numMatch) continue
      const number = numMatch[1].trim().replace(/\s+/g, '')
      if (seen.has(number)) continue
      seen.add(number)

      let text = cleanText(part)
      if (text.length < 15) continue
      if (text.length > 1500) text = text.slice(0, 1500) + '...'

      const titleMatch = text.match(/Art(?:ículo|iculo|\.)\s*\d+[^\s]*\s*[-–.]?\s*([A-ZÁÉÍÓÚÀÈÌÒÙÑÜ][^.\n:;]{4,65})/)
      let title = titleMatch
        ? cleanText(titleMatch[1]).replace(/[.:;]+$/, '').trim()
        : `Artículo ${number}`
      if (title.length > 80 || title.length < 4) title = `Artículo ${number}`

      const words = text.toLowerCase()
        .replace(/[^a-záéíóúàèìòùñü\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 5)
      const freq = {}
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
      const tags = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w)

      articles.push({
        id: `${prefix}_${number}`,
        number,
        title,
        text,
        tags,
        relatedArticles: [],
      })
    }
    pos += CHUNK_SIZE - OVERLAP
  }

  articles.sort((a, b) => parseInt(a.number) - parseInt(b.number))
  return articles
}

async function scrapeCode(code) {
  console.log(`\nFetching ${code.displayName}...`)
  try {
    const res = await fetch(code.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9',
      }
    })
    if (!res.ok) { console.error(`  ✗ HTTP ${res.status}`); return null }
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('utf-8').decode(buffer)
    console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB`)
    const articles = extractArticles(html, code.prefix)
    console.log(`  ✓ Extracted ${articles.length} articles`)
    return {
      country: 'ES',
      code: code.key,
      displayName: code.displayName,
      color: code.color,
      articles
    }
  } catch (err) {
    console.error(`  ✗ Error:`, err.message)
    return null
  }
}

async function main() {
  console.log('LexGlobe Spain Scraper')
  console.log('======================')
  const outputDir = join(__dirname, '..', 'src', 'data', 'spain')
  mkdirSync(outputDir, { recursive: true })
  const results = []
  for (const code of CODES) {
    const data = await scrapeCode(code)
    if (data && data.articles.length > 0) {
      const outputPath = join(outputDir, `${code.key}.json`)
      writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Saved to src/data/spain/${code.key}.json`)
      results.push({ code: code.key, count: data.articles.length })
    }
    await new Promise(r => setTimeout(r, 1500))
  }
  console.log('\n======================')
  console.log('Done!')
  results.forEach(r => console.log(`  ${r.code}: ${r.count} articles`))
}

main().catch(console.error)
