import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TARGETS = [
  {
    key: 'codigoPenal',
    displayName: 'Código Penal',
    color: '#E53E3E',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm',
    prefix: 'cp',
    outputPath: 'brazil',
  },
  {
    key: 'codigoCivil',
    displayName: 'Código Civil',
    color: '#7F77DD',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
    prefix: 'cc',
    outputPath: 'brazil',
  },
  {
    key: 'clt',
    displayName: 'CLT',
    color: '#1D9E75',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
    prefix: 'clt',
    outputPath: 'brazil',
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
    .replace(/<script[^>]*>[^]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[^]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const plain = stripTags(html)

  // Strategy 1: Standard "Art. X" pattern
  const regex1 = /Art\.\s*(\d+(?:-[A-Za-z])?)[º°o]?\s*[-–.]?\s*([\s\S]*?)(?=Art\.\s*\d+(?:-[A-Za-z])?[º°o]?\s*[-–.]|$)/gi
  let m
  while ((m = regex1.exec(plain)) !== null) {
    const number = m[1].trim()
    if (seen.has(number)) continue
    seen.add(number)
    let text = cleanText(m[0])
    if (text.length < 10) continue
    if (text.length > 1500) text = text.slice(0, 1500) + '...'

    const titleMatch = text.match(/Art\.\s*\d+[^\s]*\s*[-–]?\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕ][^.\n:]{4,70})/)
    let title = titleMatch ? cleanText(titleMatch[1]).replace(/[.:]+$/, '') : `Artigo ${number}`
    if (title.length > 80 || title.length < 4) title = `Artigo ${number}`

    const words = text.toLowerCase()
      .replace(/[^a-záéíóúâêîôûãõàèìòùç\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 5)
    const freq = {}
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
    const tags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([w]) => w)

    articles.push({
      id: `${prefix}_${number.replace('-', '_')}`,
      number,
      title,
      text,
      tags,
      relatedArticles: [],
    })

    if (articles.length >= 2500) break
  }

  // Strategy 2: "Artigo X" pattern (some codes use full word)
  const regex2 = /Artigo\s+(\d+)[º°o]?\s*[-–.]?\s*([\s\S]*?)(?=Artigo\s+\d+[º°o]?\s*[-–.]|Art\.\s*\d+|$)/gi
  while ((m = regex2.exec(plain)) !== null) {
    const number = m[1].trim()
    if (seen.has(number)) continue
    seen.add(number)
    let text = cleanText(m[0])
    if (text.length < 10) continue
    if (text.length > 1500) text = text.slice(0, 1500) + '...'

    articles.push({
      id: `${prefix}_${number.replace('-', '_')}`,
      number,
      title: `Artigo ${number}`,
      text,
      tags: [],
      relatedArticles: [],
    })

    if (articles.length >= 2500) break
  }

  articles.sort((a, b) => {
    const nA = parseInt(a.number, 10)
    const nB = parseInt(b.number, 10)
    return nA - nB
  })

  return articles
}

async function processCode(target) {
  console.log(`\nFetching ${target.displayName}...`)
  console.log(`URL: ${target.url}`)

  // Load existing file to compare
  const existingPath = join(__dirname, '..', 'src', 'data', target.outputPath, `${target.key}.json`)
  let existingCount = 0
  try {
    const existing = JSON.parse(readFileSync(existingPath, 'utf8'))
    existingCount = existing.articles?.length || 0
    console.log(`  Current: ${existingCount} articles`)
  } catch {}

  try {
    const res = await fetch(target.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      }
    })

    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status}`)
      return null
    }

    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('iso-8859-1').decode(buffer)
    console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB`)

    const articles = extractArticles(html, target.prefix)
    console.log(`  ✓ Extracted ${articles.length} articles (was ${existingCount})`)

    if (articles.length <= existingCount) {
      console.log(`  → No improvement, keeping existing file`)
      return null
    }

    const data = {
      country: 'BR',
      code: target.key,
      displayName: target.displayName,
      color: target.color,
      articles,
    }

    const outputDir = join(__dirname, '..', 'src', 'data', target.outputPath)
    mkdirSync(outputDir, { recursive: true })
    const outputPath = join(outputDir, `${target.key}.json`)
    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`  ✓ Saved ${articles.length} articles (+${articles.length - existingCount})`)

    return { key: target.key, before: existingCount, after: articles.length }
  } catch (err) {
    console.error(`  ✗ Error:`, err.message)
    return null
  }
}

async function main() {
  console.log('LexGlobe — Fill Missing Articles')
  console.log('==================================')

  const results = []
  for (const target of TARGETS) {
    const result = await processCode(target)
    if (result) results.push(result)
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log('\n==================================')
  console.log('Summary:')
  if (results.length === 0) {
    console.log('  No improvements found — existing files kept')
  } else {
    results.forEach(r => {
      console.log(`  ${r.key}: ${r.before} → ${r.after} (+${r.after - r.before})`)
    })
  }
  console.log('\nRestart dev server to see changes.')
}

main().catch(console.error)
