import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CODES = [
  {
    key: 'usConstitution',
    displayName: 'U.S. Constitution',
    color: '#B7791F',
    url: 'https://www.law.cornell.edu/constitution',
    prefix: 'usc',
    altUrl: 'https://www.law.cornell.edu/constitution/overview',
  },
  {
    key: 'title18Criminal',
    displayName: 'Title 18 — Crimes & Criminal Procedure',
    color: '#C53030',
    url: 'https://www.law.cornell.edu/uscode/text/18',
    prefix: 't18',
    altUrl: 'https://www.law.cornell.edu/uscode/text/18',
  },
  {
    key: 'title42CivilRights',
    displayName: 'Title 42 — Civil Rights & Public Health',
    color: '#2B6CB0',
    url: 'https://www.law.cornell.edu/uscode/text/42',
    prefix: 't42',
  },
  {
    key: 'title29Labor',
    displayName: 'Title 29 — Labor',
    color: '#276749',
    url: 'https://www.law.cornell.edu/uscode/text/29',
    prefix: 't29',
  },
  {
    key: 'title26Tax',
    displayName: 'Title 26 — Internal Revenue Code',
    color: '#744210',
    url: 'https://www.law.cornell.edu/uscode/text/26',
    prefix: 't26',
  },
  {
    key: 'title15Commerce',
    displayName: 'Title 15 — Commerce & Trade',
    color: '#553C9A',
    url: 'https://www.law.cornell.edu/uscode/text/15',
    prefix: 't15',
  },
  {
    key: 'title8Immigration',
    displayName: 'Title 8 — Immigration',
    color: '#2C7A7B',
    url: 'https://www.law.cornell.edu/uscode/text/8',
    prefix: 't8',
  },
  {
    key: 'title20Education',
    displayName: 'Title 20 — Education',
    color: '#C05621',
    url: 'https://www.law.cornell.edu/uscode/text/20',
    prefix: 't20',
  },
  {
    key: 'title31Finance',
    displayName: 'Title 31 — Money & Finance',
    color: '#1A365D',
    url: 'https://www.law.cornell.edu/uscode/text/31',
    prefix: 't31',
  },
  {
    key: 'title49Transportation',
    displayName: 'Title 49 — Transportation',
    color: '#4A5568',
    url: 'https://www.law.cornell.edu/uscode/text/49',
    prefix: 't49',
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

function extractSections(html, prefix) {
  const articles = []
  const seen = new Set()

  const stripTags = (str) => str
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const plain = stripTags(html)
  const CHUNK_SIZE = 60000
  const OVERLAP = 3000
  let pos = 0

  while (pos < plain.length) {
    const end = Math.min(pos + CHUNK_SIZE, plain.length)
    const chunk = plain.slice(pos, end)

    // Match "§ 1234" or "Section 1234" or "Sec. 1234"
    const splits = chunk.split(/(?=(?:§\s*|Sec(?:tion|\.)\s*)\d+[a-z]?[\.\s])/i)

    for (const part of splits) {
      const numMatch = part.match(/^(?:§\s*|Sec(?:tion|\.)\s*)(\d+[a-z]?)[\.\s]/i)
      if (!numMatch) continue
      const number = numMatch[1].trim()
      if (seen.has(number)) continue
      seen.add(number)

      let text = cleanText(part)
      if (text.length < 15) continue
      if (text.length > 1500) text = text.slice(0, 1500) + '...'

      // Extract title after section number
      const titleMatch = text.match(/(?:§\s*|Sec(?:tion|\.)\s*)\d+[a-z]?[\.\s]+([A-Z][^.\n]{4,70})/)
      let title = titleMatch
        ? cleanText(titleMatch[1]).replace(/[.:;]+$/, '').trim()
        : `Section ${number}`
      if (title.length > 80 || title.length < 4) title = `Section ${number}`

      const words = text.toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
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

      if (articles.length >= 3000) break
    }
    if (articles.length >= 3000) break
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
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status}`)
      return null
    }
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('utf-8').decode(buffer)
    console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB`)
    const articles = extractSections(html, code.prefix)
    console.log(`  ✓ Extracted ${articles.length} sections`)
    return {
      country: 'US',
      code: code.key,
      displayName: code.displayName,
      color: code.color,
      articles,
    }
  } catch (err) {
    console.error(`  ✗ Error:`, err.message)
    return null
  }
}

async function main() {
  console.log('LexGlobe USA Scraper')
  console.log('====================')
  const outputDir = join(__dirname, '..', 'src', 'data', 'usa')
  mkdirSync(outputDir, { recursive: true })
  const results = []

  for (const code of CODES) {
    const data = await scrapeCode(code)
    if (data && data.articles.length > 0) {
      const outputPath = join(outputDir, `${code.key}.json`)
      writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Saved ${data.articles.length} sections`)
      results.push({ code: code.key, count: data.articles.length })
    } else {
      console.log(`  ⚠ No articles — stub file kept`)
    }
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log('\n====================')
  console.log('Done!')
  results.forEach(r => console.log(`  ${r.code}: ${r.count} sections`))
  const total = results.reduce((s, r) => s + r.count, 0)
  console.log(`  TOTAL: ${total} sections`)
}

main().catch(console.error)
