import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// The 6 legal codes with their official Planalto URLs
const CODES = [
  {
    key: 'constituicao',
    displayName: 'Constituição Federal',
    color: '#FFD700',
    url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
    prefix: 'cf',
  },
  {
    key: 'codigoPenal',
    displayName: 'Código Penal',
    color: '#E53E3E',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm',
    prefix: 'cp',
  },
  {
    key: 'codigoCivil',
    displayName: 'Código Civil',
    color: '#7F77DD',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
    prefix: 'cc',
  },
  {
    key: 'clt',
    displayName: 'CLT',
    color: '#1D9E75',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
    prefix: 'clt',
  },
  {
    key: 'eca',
    displayName: 'ECA',
    color: '#F6AD55',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm',
    prefix: 'eca',
  },
  {
    key: 'cdc',
    displayName: 'CDC',
    color: '#63B3ED',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm',
    prefix: 'cdc',
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
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractArticles(html, prefix) {
  const articles = []

  // Match patterns like "Art. 1º", "Art. 121.", "Art. 5º"
  const artRegex = /Art\.\s*(\d+(?:-[A-Z])?)[º°o\-.]?\s*([^]*?)(?=Art\.\s*\d+(?:-[A-Z])?[º°o\-.]|$)/gi

  // Strip HTML tags for text extraction
  const stripTags = (str) => str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // Remove script/style blocks first
  const cleanHtml = html
    .replace(/<script[^>]*>[^]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[^]*?<\/style>/gi, '')

  const plainText = stripTags(cleanHtml)

  let match
  const seen = new Set()

  while ((match = artRegex.exec(plainText)) !== null) {
    const number = match[1]
    if (seen.has(number)) continue
    seen.add(number)

    let rawText = cleanText(match[0])

    // Cap at 1200 chars to keep JSON manageable
    if (rawText.length > 1200) rawText = rawText.slice(0, 1200) + '...'

    // Try to extract a title from the first meaningful phrase
    // Many Brazilian laws have inline titles like "Homicídio simples"
    const titleMatch = rawText.match(/Art\.\s*\d+[º°\-.]?\s*[-–]?\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÈÌÒÙÇ][^.:\n]{3,60}[.:]?)/)
    let title = titleMatch ? cleanText(titleMatch[1]).replace(/[.:]+$/, '') : `Artigo ${number}`
    if (title.length > 80) title = `Artigo ${number}`

    // Generate basic tags from text
    const words = rawText.toLowerCase()
      .replace(/[^a-záéíóúâêîôûãõàèìòùç\s]/g, '')
      .split(' ')
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
      text: rawText,
      tags,
      relatedArticles: [],
    })

    // Stop at 500 articles per code to keep files reasonable
    if (articles.length >= 500) break
  }

  // Sort by article number numerically
  articles.sort((a, b) => {
    const numA = parseInt(a.number, 10)
    const numB = parseInt(b.number, 10)
    return numA - numB
  })

  return articles
}

async function scrapeCode(code) {
  console.log(`\nFetching ${code.displayName}...`)
  console.log(`URL: ${code.url}`)

  try {
    const res = await fetch(code.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexGlobe/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    })

    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} for ${code.displayName}`)
      return null
    }

    // Planalto uses ISO-8859-1 — decode as binary then re-encode
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('iso-8859-1').decode(buffer)
    console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB`)

    const articles = extractArticles(html, code.prefix)
    console.log(`  ✓ Extracted ${articles.length} articles`)

    return {
      country: 'BR',
      code: code.key,
      displayName: code.displayName,
      color: code.color,
      articles,
    }
  } catch (err) {
    console.error(`  ✗ Error fetching ${code.displayName}:`, err.message)
    return null
  }
}

async function main() {
  console.log('LexGlobe Article Scraper')
  console.log('========================')
  console.log('Fetching from planalto.gov.br...\n')

  const outputDir = join(__dirname, '..', 'src', 'data', 'brazil')
  mkdirSync(outputDir, { recursive: true })

  const results = []

  for (const code of CODES) {
    const data = await scrapeCode(code)

    if (data && data.articles.length > 0) {
      const outputPath = join(outputDir, `${code.key}.json`)
      writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Saved to src/data/brazil/${code.key}.json`)
      results.push({ code: code.key, count: data.articles.length })
    } else {
      console.log(`  ⚠ Skipped ${code.key} — no articles extracted or fetch failed`)
      console.log(`    (existing file preserved)`)
    }

    // Polite delay between requests
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n========================')
  console.log('Done!')
  results.forEach(r => console.log(`  ${r.code}: ${r.count} articles`))
  console.log('\nRestart your dev server to see the new content.')
}

main().catch(console.error)
