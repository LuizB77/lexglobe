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
    .replace(/<[^>]+>/g, ' ')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractArticles(html, prefix) {
  const articles = []
  // Keyed by div id (e.g. "a1", "a31bis") — only added after body quality check.
  const seen = new Set()

  // Locate every <div class="bloque" id="aN..."> — these are the article containers.
  // Non-article bloques (sections, chapters) use ids like "s1", "c1", etc. and are skipped.
  // BOE uses id="aN" on Penal/Estatuto and id="artN" on Civil — match both.
  const BLOQUE_RX = /<div\b[^>]*\bclass="bloque"[^>]*\bid="(a(?:rt)?\d[^"]*)"[^>]*>/gi
  const positions = []
  let m
  while ((m = BLOQUE_RX.exec(html)) !== null) {
    positions.push({ divId: m[1], tagStart: m.index, tagEnd: m.index + m[0].length })
  }

  for (let i = 0; i < positions.length; i++) {
    const { divId, tagEnd } = positions[i]
    // Content runs from end of this bloque's opening tag to start of next bloque's opening tag.
    const contentEnd = i + 1 < positions.length ? positions[i + 1].tagStart : html.length

    // Grab the HTML segment for this bloque.
    const segment = html.slice(tagEnd, contentEnd)

    // Must have an h5.articulo header.
    const h5m = segment.match(/<h5[^>]*class="articulo"[^>]*>([\s\S]*?)<\/h5>/i)
    if (!h5m) continue
    const headerRaw = cleanText(h5m[1])

    // Only numeric articles: "Artículo 1", "Artículo 31 bis", etc.
    const numMatch = headerRaw.match(/^Art(?:ículo|iculo)\s+(\d+(?:\s*(?:bis|ter|qu[áa]ter|qu[íi]nquies|sexies|septies|octies))?)\b/i)
    if (!numMatch) continue
    const number = numMatch[1].trim().replace(/\s+/g, '')

    // Collect p.parrafo and p.parrafo_N body paragraphs; skip p.nota_pie and p.bloque.
    const bodyParts = []
    const pRx = /<p\b[^>]*class="parrafo(?:_\d+)?"[^>]*>([\s\S]*?)<\/p>/gi
    let pm
    while ((pm = pRx.exec(segment)) !== null) {
      const t = cleanText(pm[1])
      if (t) bodyParts.push(t)
    }

    const body = bodyParts.join(' ')
    // Skip articles with no substantive body (repealed articles show empty or near-empty).
    if (body.length < 10) continue

    // Quality check passed — now commit to seen using the stable div id.
    if (seen.has(divId)) continue
    seen.add(divId)

    let text = cleanText(`${headerRaw}. ${body}`)
    if (text.length > 1500) text = text.slice(0, 1500) + '...'

    // Title: strip the full article identifier from the header, keep whatever follows.
    const articleLabel = `Artículo ${numMatch[1]}`  // e.g. "Artículo 127 bis"
    const titleRest = headerRaw.slice(articleLabel.length).replace(/^[.\s\u2013\u2014-]+/, '').trim()
    let title = (titleRest.length >= 4 && titleRest.length <= 80) ? titleRest.replace(/[.:;]+$/, '') : `Artículo ${number}`

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

  articles.sort((a, b) => {
    const an = parseInt(a.number), bn = parseInt(b.number)
    return an !== bn ? an - bn : a.number.localeCompare(b.number)
  })
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
  const targetKey = process.argv[2] ?? null
  const codesToRun = targetKey ? CODES.filter(c => c.key === targetKey) : CODES
  if (targetKey && codesToRun.length === 0) {
    console.error(`Unknown code key: ${targetKey}`)
    process.exit(1)
  }
  for (const code of codesToRun) {
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
