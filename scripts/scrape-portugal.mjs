import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CODES = [
  {
    key: 'constituicaoPT',
    displayName: 'Constituição da República Portuguesa',
    color: '#FFD700',
    url: 'https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=4&tabela=leis&so_miolo=',
    prefix: 'cfpt',
  },
  {
    key: 'codigoPenalPT',
    displayName: 'Código Penal',
    color: '#E53E3E',
    url: 'https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=109&tabela=leis&so_miolo=',
    prefix: 'cppt',
  },
  {
    key: 'codigoCivilPT',
    displayName: 'Código Civil',
    color: '#7F77DD',
    url: 'https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=775&tabela=leis&so_miolo=',
    prefix: 'ccpt',
  },
  {
    key: 'codigoTrabalho',
    displayName: 'Código do Trabalho',
    color: '#1D9E75',
    url: 'https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php?nid=1047&tabela=leis&so_miolo=',
    prefix: 'ctpt',
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
    .replace(/ /g, ' ')
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
    const splits = chunk.split(/(?=Art(?:igo)?\.?\s*\d+(?:\.\d+)?[º°o]?\s*[-–. ])/i)

    for (const part of splits) {
      const numMatch = part.match(/^Art(?:igo)?\.?\s*(\d+(?:\.\d+)?)[º°o]?\s*[-–. ]?/i)
      if (!numMatch) continue
      const rawNum = numMatch[1].replace('.', '')
      const number = rawNum.trim()
      if (seen.has(number)) continue
      seen.add(number)

      let text = cleanText(part)
      if (text.length < 15) continue
      if (text.length > 1500) text = text.slice(0, 1500) + '...'

      const titleMatch = text.match(/Art(?:igo)?\.?\s*\d+[^\s]*\s*[-–.]?\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][^.\n:;]{4,65})/)
      let title = titleMatch
        ? cleanText(titleMatch[1]).replace(/[.:;]+$/, '').trim()
        : `Artigo ${number}`
      if (title.length > 80 || title.length < 4) title = `Artigo ${number}`

      const words = text.toLowerCase()
        .replace(/[^a-záéíóúâêîôûãõàèìòùç\s]/g, ' ')
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
        'Accept-Language': 'pt-PT,pt;q=0.9',
      }
    })
    if (!res.ok) { console.error(`  ✗ HTTP ${res.status}`); return null }
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('iso-8859-1').decode(buffer)
    console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB`)
    const articles = extractArticles(html, code.prefix)
    console.log(`  ✓ Extracted ${articles.length} articles`)
    return { country: 'PT', code: code.key, displayName: code.displayName, color: code.color, articles }
  } catch (err) {
    console.error(`  ✗ Error:`, err.message)
    return null
  }
}

async function main() {
  console.log('LexGlobe Portugal Scraper')
  console.log('=========================')
  const outputDir = join(__dirname, '..', 'src', 'data', 'portugal')
  mkdirSync(outputDir, { recursive: true })
  const results = []
  for (const code of CODES) {
    const data = await scrapeCode(code)
    if (data && data.articles.length > 0) {
      const outputPath = join(outputDir, `${code.key}.json`)
      writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Saved to src/data/portugal/${code.key}.json`)
      results.push({ code: code.key, count: data.articles.length })
    }
    await new Promise(r => setTimeout(r, 1500))
  }
  console.log('\n===================')
  console.log('Done!')
  results.forEach(r => console.log(`  ${r.code}: ${r.count} articles`))
}

main().catch(console.error)
