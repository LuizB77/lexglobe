import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const URL = 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm'
const OUTPUT = join(__dirname, '..', 'src', 'data', 'brazil', 'codigoCivil.json')

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

function stripTags(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFromChunk(text, seen) {
  const articles = []
  // Match both "Art. 999" and "Art. 1.000" (Portuguese dot-thousands separator)
  const splits = text.split(/(?=Art\.\s*\d{1,3}(?:\.\d{3})?(?:-[A-Za-z])?[º°o]?\s*[-–. ])/i)

  for (const chunk of splits) {
    const numMatch = chunk.match(/^Art\.\s*(\d{1,3}(?:\.\d{3})?(?:-[A-Za-z])?)[º°o]?\s*[-–. ]?/i)
    if (!numMatch) continue

    // Normalise: strip dot thousands separator so "1.000" becomes "1000"
    const number = numMatch[1].replace(/^(\d{1,3})\.(\d{3})/, '$1$2').trim()
    if (seen.has(number)) continue
    seen.add(number)

    let text = cleanText(chunk)
    if (text.length < 15) continue
    if (text.length > 1500) text = text.slice(0, 1500) + '...'

    const titleMatch = text.match(/Art\.\s*\d+[^\s]*\s*[-–.]?\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][^.\n:;]{4,65})/)
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
      id: `cc_${number.replace('-', '_')}`,
      number,
      title,
      text,
      tags,
      relatedArticles: [],
    })
  }

  return articles
}

async function main() {
  console.log('Fetching Código Civil...')

  const res = await fetch(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    }
  })

  if (!res.ok) {
    console.error(`HTTP ${res.status}`)
    process.exit(1)
  }

  const buffer = await res.arrayBuffer()
  const html = new TextDecoder('iso-8859-1').decode(buffer)
  console.log(`Fetched ${Math.round(html.length / 1024)}KB`)

  const plain = stripTags(html)
  console.log(`Plain text: ${Math.round(plain.length / 1024)}KB`)

  const CHUNK_SIZE = 50000
  const OVERLAP = 2000
  const seen = new Set()
  const allArticles = []

  let pos = 0
  let chunkNum = 0
  while (pos < plain.length) {
    const end = Math.min(pos + CHUNK_SIZE, plain.length)
    const chunk = plain.slice(pos, end)
    const found = extractFromChunk(chunk, seen)
    allArticles.push(...found)
    chunkNum++
    if (chunkNum % 10 === 0) {
      console.log(`  Processed ${chunkNum} chunks, ${allArticles.length} articles so far...`)
    }
    pos += CHUNK_SIZE - OVERLAP
  }

  allArticles.sort((a, b) => parseInt(a.number) - parseInt(b.number))

  let existingCount = 0
  try {
    const existing = JSON.parse(readFileSync(OUTPUT, 'utf8'))
    existingCount = existing.articles?.length || 0
  } catch {}

  console.log(`\nExtracted: ${allArticles.length} articles`)
  console.log(`Existing:  ${existingCount} articles`)

  if (allArticles.length > existingCount) {
    const data = {
      country: 'BR',
      code: 'codigoCivil',
      displayName: 'Código Civil',
      color: '#7F77DD',
      articles: allArticles,
    }
    writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf8')
    console.log(`✓ Saved ${allArticles.length} articles (+${allArticles.length - existingCount})`)
  } else {
    console.log(`→ No improvement, keeping existing ${existingCount} articles`)
  }
}

main().catch(console.error)
