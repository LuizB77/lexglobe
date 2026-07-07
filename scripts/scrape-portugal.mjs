import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// nid = pgdlisboa.pt internal document ID used in all URL parameters
const CODES = [
  { key: 'constituicaoPT',    nid: 4,    displayName: 'Constituição da República Portuguesa', color: '#FFD700', prefix: 'cfpt'  },
  { key: 'codigoPenalPT',     nid: 109,  displayName: 'Código Penal',                         color: '#E53E3E', prefix: 'cppt'  },
  { key: 'codigoCivilPT',     nid: 775,  displayName: 'Código Civil',                         color: '#7F77DD', prefix: 'ccpt'  },
  { key: 'codigoTrabalho',    nid: 1047, displayName: 'Código do Trabalho',                   color: '#1D9E75', prefix: 'ctpt'  },
  { key: 'codigoProcessoPenal', nid: 199, displayName: 'Código de Processo Penal',            color: '#C53030', prefix: 'cpppt' },
  { key: 'codigoProcessoCivil', nid: 1959, displayName: 'Código de Processo Civil',           color: '#2B6CB0', prefix: 'cpcpt' },
  { key: 'codigoComercial',   nid: 524,  displayName: 'Código Comercial',                     color: '#744210', prefix: 'ccmpt' },
  { key: 'codigoEstrada',     nid: 349,  displayName: 'Código da Estrada',                    color: '#C05621', prefix: 'cept'  },
]

// Strip HTML tags and decode entities; used on raw innerHTML of extracted td elements.
function cleanText(raw) {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/ /g, ' ')   // literal non-breaking spaces after iso-8859-1 decode
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract all article objects from one page of HTML.
// `seen` is a shared Set across pages so duplicates are skipped.
function extractArticlesFromPage(html, prefix, seen) {
  const articles = []

  // ── Step 1: locate every td.txt_base_b_l that carries an article header ──
  // pgdlisboa.pt does NOT quote attribute values, so the pattern is literally:
  //   <td class=txt_base_b_l ...>  or  <td ... class=txt_base_b_l ...>
  const HEADER_RX = /<td\b[^>]*\bclass=txt_base_b_l\b[^>]*>([\s\S]*?)<\/td>/gi
  const headers = []
  let m
  while ((m = HEADER_RX.exec(html)) !== null) {
    const headerText = cleanText(m[1])
    // Match "Artigo N.º" with optional sub-letter suffix: "Artigo 368.º-A"
    const nm = headerText.match(/Artigo\s+(\d+)\.º(?:-([A-Z]))?/i)
    if (!nm) continue
    headers.push({
      headerEnd: m.index + m[0].length,  // position of </td> end
      headerStart: m.index,              // for bounding the look-ahead range
      headerText,
      numBase: nm[1],
      numSub: nm[2] || null,
    })
  }

  // ── Step 2: for each header find the body in the HTML range before the next header ──
  for (let i = 0; i < headers.length; i++) {
    const { headerEnd, headerStart, headerText, numBase, numSub } = headers[i]
    const number = numSub ? `${numBase}-${numSub}` : numBase

    if (seen.has(number)) continue

    // Look only as far as the next article header starts (or end of page).
    // This prevents accidentally picking up the body of a later article.
    const rangeEnd = i + 1 < headers.length ? headers[i + 1].headerStart : html.length
    const range = html.slice(headerEnd, rangeEnd)

    // ── Step 3: extract body from the next table bgcolor="#FFFFFF" ──
    // The page structure after each header td:
    //   </tr></table>                       ← closes header's enclosing table
    //   <table bgcolor="#FFFFFF" ...>
    //     <td colspan=4 class=txt_base_n_l>   ← BODY (what we want)
    //     <td class=txt_base_n_l>             ← amendment annotations (skip)
    //   </table>
    const tableMatch = range.match(/<table[^>]*bgcolor="#FFFFFF"[^>]*>([\s\S]*?)<\/table>/i)
    if (!tableMatch) continue

    const tableInner = tableMatch[1]

    // The body td always has colspan=4; annotation tds do not.
    // Attribute order on the site is "valign=top colspan=4 class=txt_base_n_l",
    // but match both orderings defensively.
    const bodyMatch =
      tableInner.match(/<td\b[^>]*\bcolspan=["']?4["']?[^>]*\btxt_base_n_l\b[^>]*>([\s\S]*?)<\/td>/i) ||
      tableInner.match(/<td\b[^>]*\btxt_base_n_l\b[^>]*\bcolspan=["']?4["']?[^>]*>([\s\S]*?)<\/td>/i)

    if (!bodyMatch) continue

    let bodyText = cleanText(bodyMatch[1])
    if (bodyText.length < 10) continue   // skip revoked/empty stubs

    seen.add(number)

    if (bodyText.length > 1500) bodyText = bodyText.slice(0, 1500) + '...'

    // ── Step 4: derive title from the header text ──
    // Header looks like: "Artigo 1.º Princípio da legalidade"
    //                 or: "Artigo 2.º (Estado de direito democrático)"
    const articleLabel = numSub ? `Artigo ${numBase}.º-${numSub}` : `Artigo ${numBase}.º`
    const labelIdx = headerText.toLowerCase().indexOf(articleLabel.toLowerCase())
    let titleRest = (labelIdx >= 0
      ? headerText.slice(labelIdx + articleLabel.length)
      : headerText.replace(/Artigo\s+\d+\.º(?:-[A-Z])?\s*/i, '')
    ).replace(/^[.\s–—]+/, '').trim()

    // Strip surrounding parentheses used by the Constitution format
    if (titleRest.startsWith('(') && titleRest.endsWith(')')) {
      titleRest = titleRest.slice(1, -1).trim()
    }

    const title = (titleRest.length >= 4 && titleRest.length <= 80)
      ? titleRest.replace(/[.:;]+$/, '')
      : `Artigo ${number}`

    // ── Step 5: keyword tags from body ──
    const words = bodyText.toLowerCase()
      .replace(/[^a-záéíóúâêîôûãõàèìòùç\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 5)
    const freq = {}
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
    const tags = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w)

    const fullText = cleanText(`${title}. ${bodyText}`)

    articles.push({
      id: `${prefix}_${number}`,
      number,
      title,
      text: fullText.length > 1500 ? fullText.slice(0, 1500) + '...' : fullText,
      tags,
      relatedArticles: [],
    })
  }

  return articles
}

// Count article headers on a page — used to detect the last page (< 100 headers).
function countArticleHeaders(html) {
  const RX = /<td\b[^>]*\bclass=txt_base_b_l\b[^>]*>([\s\S]*?)<\/td>/gi
  let count = 0
  let m
  while ((m = RX.exec(html)) !== null) {
    if (cleanText(m[1]).match(/Artigo\s+\d+\.º/i)) count++
  }
  return count
}

async function fetchPage(nid, ficha, pageNum) {
  const url = `https://www.pgdlisboa.pt/leis/lei_mostra_articulado.php` +
    `?nid=${nid}&ficha=${ficha}&pagina=${pageNum}&tabela=leis&nversao=&so_miolo=`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-PT,pt;q=0.9',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buffer = await res.arrayBuffer()
  return new TextDecoder('iso-8859-1').decode(buffer)
}

async function scrapeCode(code) {
  console.log(`\nFetching ${code.displayName} (nid=${code.nid})...`)
  const seen = new Set()
  const allArticles = []
  let pageNum = 1
  let ficha = 1

  while (true) {
    let html
    try {
      html = await fetchPage(code.nid, ficha, pageNum)
    } catch (err) {
      console.error(`  ✗ Page ${pageNum} fetch error: ${err.message}`)
      break
    }

    const headerCount = countArticleHeaders(html)
    console.log(`  Page ${pageNum} (ficha=${ficha}): ${Math.round(html.length / 1024)}KB, ${headerCount} headers`)

    if (headerCount === 0) break   // no articles — we've gone past the last page

    const pageArticles = extractArticlesFromPage(html, code.prefix, seen)
    console.log(`    → ${pageArticles.length} articles extracted`)
    allArticles.push(...pageArticles)

    if (headerCount < 100) break   // last page has fewer than 100 articles

    ficha += 100
    pageNum++
    await new Promise(r => setTimeout(r, 1000))
  }

  // Sort: numerically by base number, then alphabetically by sub-letter (A < B < C)
  allArticles.sort((a, b) => {
    const [an, as_] = a.number.split('-')
    const [bn, bs_] = b.number.split('-')
    const ni = parseInt(an), bi = parseInt(bn)
    if (ni !== bi) return ni - bi
    return (as_ || '') < (bs_ || '') ? -1 : (as_ || '') > (bs_ || '') ? 1 : 0
  })

  console.log(`  ✓ Total: ${allArticles.length} articles across ${pageNum} page(s)`)
  return allArticles
}

async function main() {
  const targetKey = process.argv[2] ?? null
  const codesToRun = targetKey ? CODES.filter(c => c.key === targetKey) : CODES

  if (targetKey && codesToRun.length === 0) {
    console.error(`Unknown code key: "${targetKey}". Valid keys: ${CODES.map(c => c.key).join(', ')}`)
    process.exit(1)
  }

  console.log('LexGlobe Portugal Scraper')
  console.log('=========================')

  const outputDir = join(__dirname, '..', 'src', 'data', 'portugal')
  mkdirSync(outputDir, { recursive: true })

  const results = []
  for (const code of codesToRun) {
    const articles = await scrapeCode(code)
    if (articles.length > 0) {
      const data = { country: 'PT', code: code.key, displayName: code.displayName, color: code.color, articles }
      const outputPath = join(outputDir, `${code.key}.json`)
      writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  ✓ Saved to src/data/portugal/${code.key}.json`)
      results.push({ code: code.key, count: articles.length })
    } else {
      console.error(`  ✗ No articles extracted for ${code.key}`)
    }
    if (codesToRun.indexOf(code) < codesToRun.length - 1) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  console.log('\n=========================')
  console.log('Done!')
  results.forEach(r => console.log(`  ${r.code}: ${r.count} articles`))
}

main().catch(console.error)
