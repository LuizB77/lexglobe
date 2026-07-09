import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Buffer } from 'buffer'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE = 'http://alerjln1.alerj.rj.gov.br'
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }

// ── Fetchers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function fetchLatin1(url, opts = {}, retries = 4) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, ...opts })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
      return Buffer.from(await res.arrayBuffer()).toString('latin1')
    } catch (e) {
      if (attempt === retries) throw e
      const wait = 1500 * attempt
      process.stderr.write(` [retry ${attempt}/${retries-1} after ${wait}ms] `)
      await sleep(wait)
    }
  }
}

// ── Entity decoding ───────────────────────────────────────────────────────────

function decodeEntities(str) {
  const named = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
    '&nbsp;': ' ',
  }
  return str
    .replace(/&[a-zA-Z]+;/g, e => named[e] ?? e)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

// ── URL discovery ─────────────────────────────────────────────────────────────
// Strategy:
//  1. The index page (IndiceInt?OpenForm) returns first ~12 docs in order.
//  2. A search for "arts." returns 62/64 docs unordered (misses single-article chapters).
//  3. We combine both, keeping insertion order from the index, then appending extras.

async function getChapterUrls() {
  const seen = new Set()
  const ordered = []

  const addUrl = (path) => {
    // Normalise: strip &Highlight=... if present
    const clean = `${BASE}${path.split('?')[0]}?OpenDocument`
    if (!seen.has(clean)) { seen.add(clean); ordered.push(clean) }
  }

  // Step 1: Parse the index page (document order, up to ~12 entries)
  const indexHtml = await fetchLatin1(`${BASE}/constest.nsf/IndiceInt?OpenForm`)
  const indexRe = /href="(\/constest\.nsf\/1171c5bc55cc861b032568f50070cfb6\/[a-f0-9]+\?OpenDocument)"/gi
  let m
  while ((m = indexRe.exec(indexHtml)) !== null) addUrl(m[1])

  // Step 2: POST the search form to get the remaining chapters.
  // The search form lives at $searchForm?SearchView (different from the index page),
  // so we must fetch that page first to get its form action URL.
  const searchFormLinkM = indexHtml.match(/href="(\/constest\.nsf\/[^"]+\/\$searchForm\?SearchView)"/)
  if (searchFormLinkM) {
    const searchFormHtml = await fetchLatin1(`${BASE}${searchFormLinkM[1]}`)
    const searchActionM = searchFormHtml.match(/action="(\/constest\.nsf\/[a-f0-9]+\?CreateDocument)"/)
    if (searchActionM) {
      const searchHtml = await fetchLatin1(`${BASE}${searchActionM[1]}`, {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'Busca=arts.&MaxResults=0&%25%25Surrogate_MaxResults=1',
      })
      // Search results append &Highlight=... after ?OpenDocument — match the full href value
      const searchRe = /href="(\/constest\.nsf\/1171c5bc55cc861b032568f50070cfb6\/[a-f0-9]+\?OpenDocument[^"]*)"/gi
      while ((m = searchRe.exec(searchHtml)) !== null) addUrl(m[1])
    }
  }

  return ordered
}

// ── ADCT detection ────────────────────────────────────────────────────────────
// Returns true when the raw HTML is the "Ato das Disposições Constitucionais
// Transitórias" document.  We check for the heading text that appears in the
// chapter-header div at the top of every ADCT page.

function isAdct(rawHtml) {
  return /DISPOSI[CÇ][OÕ]ES\s+CONSTITUCIONAIS\s+TRANSIT[OÓ]RIAS/i.test(rawHtml)
}

// ── Article extraction from a single chapter HTML ─────────────────────────────
// idPrefix   : 'crj_'   for main body,  'crj_t_' for ADCT
// numPrefix  : null     for main body,  'T'      for ADCT  (number becomes "T-3")

function extractArticles(rawHtml, idPrefix = 'crj_', numPrefix = null) {
  let html = rawHtml

  // Remove noise blocks
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
             // Strip header div (chapter title / section title header at top)
             .replace(/<div[^>]*align="center"[^>]*>[\s\S]*?<\/div>/gi, '')

  // Strip amendment citation links (they leave annotation text we don't want)
  html = html.replace(/<a\s[^>]*href="[^"]*contlei[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
             .replace(/<a\s[^>]*href="https?:\/\/portal\.stf[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
             .replace(/<a\s[^>]*href="https?:\/\/www\.stf[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
             .replace(/<a\s[^>]*href="https?:\/\/[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
             .replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, '')  // remove bullet regulation notes

  // ① Strip ALL <s>...</s> (superseded/repealed text)
  html = html.replace(/<s[^>]*>[\s\S]*?<\/s>/gi, '')

  // Strip annotation-colored content:
  //   red  #FF0000 = court decision references (inline ADI notices)
  //   green #008000 = regulation notes
  // NOTE: do NOT strip #000080 (dark navy) — some articles use it for body text (arts 19-21)
  // NOTE: do NOT strip #0060A0 (teal) — chapter title headers are already removed by div stripping above
  html = html.replace(/<font\s[^>]*color="#FF0000"[^>]*>[\s\S]*?<\/font>/gi, '')
             .replace(/<font\s[^>]*color="#008000"[^>]*>[\s\S]*?<\/font>/gi, '')

  // ② Convert block elements to newlines before stripping tags
  html = html.replace(/<br\s*\/?>/gi, '\n')
             .replace(/<\/p>/gi, '\n')
             .replace(/<p[^>]*>/gi, '\n')
             .replace(/<\/div>/gi, '\n')
             .replace(/<div[^>]*>/gi, '\n')

  // Strip all remaining tags
  html = html.replace(/<[^>]+>/g, '')

  // ③ Decode entities
  html = decodeEntities(html)

  // Normalize whitespace per line
  const lines = html.split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // Filter out annotation lines
  const ANNO = [
    /^\*?\s*Nova redação/i,
    /^\*?\s*Redação dada/i,
    /^Artigo regulamentado/i,
    /^Regulamentado/i,
    /^\(NR\)\s*$/,
    /^D\.O\.\s+de\s+\d/i,
    /^https?:\/\//i,
    /^\*?\s*$/, // lone asterisk or empty
  ]
  const cleaned = lines.filter(l => !ANNO.some(p => p.test(l))).join('\n')

  // ④ Find article sections — both delimiters:
  //    Early:  Art. N°. or Art. N°  (degree symbol, bold font)
  //    Mid:    Art. N.              (period only, no degree symbol)
  //    Late:   Art. N -             (hyphen, plain font)
  //    Amended: * Art. N [-.]       (asterisk prefix for amended version)
  //
  // Regex: optional * prefix, "Art.", number, optional letter, optional °/º, then ., -, or just end of token
  const ART_RE = /(\*\s*)?Art\.\s+(\d+[A-Z]?)[°º]?\s*(?:[-.]|\s)/g

  const segs = []
  let lastIdx = 0
  let lastAmended = false
  let lastNum = null
  let lastBodyStart = 0

  for (const m of cleaned.matchAll(ART_RE)) {
    if (lastNum !== null) {
      segs.push({ number: lastNum, amended: lastAmended, raw: cleaned.slice(lastBodyStart, m.index) })
    }
    lastAmended = !!(m[1] && m[1].includes('*'))
    lastNum = m[2]
    lastBodyStart = m.index + m[0].length
  }
  if (lastNum !== null) {
    segs.push({ number: lastNum, amended: lastAmended, raw: cleaned.slice(lastBodyStart) })
  }

  // ⑤ Build article map, deduplicate: prefer amended > more text
  const map = new Map()
  for (const s of segs) {
    // Clean body text
    let body = s.raw
      // Remove inline court decisions — multiple surface forms:
      // "- Decisão:" or "Decisão:" (STF rulings embedded in annotations)
      .replace(/\s*[-–]?\s*Decisão:[\s\S]*/gi, '')
      // "Acórdão proferido" or "A C Ó R D Ã O Vistos" (old-style spaced-letter format)
      .replace(/\s*Acórdão\s+(?:proferido|pelo\s+Plen)[\s\S]*/gi, '')
      .replace(/\s*A\s*C\s*[ÓO]\s*R\s*D\s*[ÃA]\s*O\s+Vistos[\s\S]*/gi, '')
      // Remove (NR), (D.O...) markers
      .replace(/\s*\(NR\)\s*/g, ' ')
      .replace(/\s*\(D\.O\.[^)]*\)\s*/g, ' ')
      // Remove stray lone asterisks
      .replace(/(?:^|\s)\*(?=\s|$)/g, ' ')

    // Remove orphaned paragraph headers: "Parágrafo único -" or "* Parágrafo único. ."
    // These appear when intermediate amendments had body text in <s> (stripped), leaving just the header.
    // Pattern: "Parágrafo único" (or "§ N") immediately followed by another occurrence.
    body = body
      .replace(/(?:\*\s*)?Parágrafo único\s*[-.]?\s*\.?\s*(?=(?:\*\s*)?Parágrafo único)/gi, '')
      .replace(/(?:\*\s*)?§\s*\d+[°º]?\s*[-.]?\s*(?=(?:\*\s*)?§\s*\d+[°º]?)/g, '')

    body = body.replace(/\s+/g, ' ').trim()

    if (body.length < 8) continue // skip depleted originals (just punctuation or empty headers)

    const existing = map.get(s.number)
    if (!existing) {
      map.set(s.number, { ...s, body })
    } else if (s.amended && !existing.amended) {
      map.set(s.number, { ...s, body }) // prefer amended
    } else if (!s.amended && !existing.amended && body.length > existing.body.length) {
      map.set(s.number, { ...s, body }) // both original: keep longer
    }
  }

  // ⑥ Build output
  const articles = []
  for (const [num, s] of map) {
    const n = parseInt(num)
    if (isNaN(n)) continue

    // Apply number prefix: main body → "3", ADCT → "T-3"
    const displayNumber = numPrefix ? `${numPrefix}-${num}` : num
    const fullText = `Art. ${displayNumber} - ${s.body}`.replace(/\s+/g, ' ').trim()
    const title = fullText.length > 80 ? fullText.slice(0, 80) + '…' : fullText
    const tags = s.body.split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 5)
      .map(w => w.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/g, ''))
      .filter(Boolean)

    // id uses idPrefix + raw number (e.g. crj_3, crj_t_3)
    articles.push({ id: `${idPrefix}${num.toLowerCase()}`, number: displayNumber, title, text: fullText, tags, relatedArticles: [] })
  }

  articles.sort((a, b) => parseInt(a.number) - parseInt(b.number))
  return articles
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching chapter URL list from index...')
  const urls = await getChapterUrls()
  console.log(`Discovered ${urls.length} chapter URLs — running full scrape\n`)

  const mainArticles = []
  const adctArticles = []
  let adctCount = 0

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const docId = url.split('/').pop().replace('?OpenDocument', '')
    process.stdout.write(`  [${i+1}/${urls.length}] ${docId} ... `)
    if (i > 0) await sleep(400)
    const html = await fetchLatin1(url)

    if (isAdct(html)) {
      const arts = extractArticles(html, 'crj_t_', 'T')
      adctCount++
      console.log(`${arts.length} articles [ADCT]`)
      adctArticles.push(...arts)
    } else {
      const arts = extractArticles(html, 'crj_', null)
      console.log(`${arts.length} articles`)
      mainArticles.push(...arts)
    }
  }

  // ── Cross-chapter deduplication (keep first seen within each group) ──────────
  const dedupGroup = (articles) => {
    const seen = new Set()
    const dupes = []
    const out = []
    for (const a of articles) {
      if (seen.has(a.id)) dupes.push(a.id)
      else { seen.add(a.id); out.push(a) }
    }
    return { out, dupes }
  }

  const { out: mainDeduped, dupes: mainDupes } = dedupGroup(mainArticles)
  const { out: adctDeduped, dupes: adctDupes } = dedupGroup(adctArticles)

  // Sort: main body by integer number, ADCT by integer portion of "T-N"
  mainDeduped.sort((a, b) => parseInt(a.number) - parseInt(b.number))
  adctDeduped.sort((a, b) => parseInt(a.number.replace('T-', '')) - parseInt(b.number.replace('T-', '')))

  // Final combined array: main body first, then ADCT
  const allDeduped = [...mainDeduped, ...adctDeduped]

  // ── ID collision check across main + ADCT ───────────────────────────────────
  const allIds = allDeduped.map(a => a.id)
  const idSet = new Set(allIds)
  const idCollisions = allIds.filter((id, i) => allIds.indexOf(id) !== i)

  // ── Validation ──────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════')
  console.log('VALIDATION REPORT')
  console.log('════════════════════════════════════════')
  console.log(`Main body articles : ${mainDeduped.length}`)
  console.log(`ADCT articles      : ${adctDeduped.length}  (from ${adctCount} ADCT doc(s))`)
  console.log(`Total              : ${allDeduped.length}`)

  if (mainDupes.length) console.warn('⚠ Main cross-chapter dupes:', mainDupes)
  else console.log('✓ No cross-chapter duplicate IDs (main)')

  if (adctDupes.length) console.warn('⚠ ADCT cross-chapter dupes:', adctDupes)
  else console.log('✓ No cross-chapter duplicate IDs (ADCT)')

  if (idCollisions.length) console.warn('⚠ ID collisions main↔ADCT:', idCollisions)
  else console.log('✓ No ID collisions between main and ADCT')

  const htmlLeaks = allDeduped.filter(a => /<[^>]+>/.test(a.text))
  if (htmlLeaks.length) console.warn('⚠ HTML tags leaked in:', htmlLeaks.map(a => a.id))
  else console.log('✓ No HTML tag leakage')

  const strikeLeaks = allDeduped.filter(a => /<s>|<\/s>/i.test(a.text))
  if (strikeLeaks.length) console.warn('⚠ <s> strikethrough leaked in:', strikeLeaks.map(a => a.id))
  else console.log('✓ No <s> strikethrough leakage')

  // Bare Ã is a legitimate Portuguese capital (ACÓRDÃO, DISPOSIÇÃO) — only flag compound sequences
  const mojibake = allDeduped.filter(a => /Â[°º]|Ã[£§©¡â]/.test(a.text))
  if (mojibake.length) console.warn('⚠ Possible mojibake in:', mojibake.map(a => a.id).slice(0, 5))
  else console.log('✓ No mojibake encoding artifacts')

  const hasNR = allDeduped.filter(a => /\(NR\)/.test(a.text))
  if (hasNR.length) console.warn('⚠ (NR) markers in:', hasNR.map(a => a.id))
  else console.log('✓ No (NR) markers in output')

  // Edge case checks from the sample phase
  const art42 = allDeduped.find(a => a.id === 'crj_42')
  console.log(`✓ Art. 42 (fully repealed) excluded: ${!art42}`)

  const art8 = allDeduped.find(a => a.id === 'crj_8')
  const parasIn8 = (art8?.text.match(/Parágrafo único/g) || []).length
  console.log(`✓ Art. 8 orphaned Parágrafo único cleaned: ${parasIn8 === 1} (${parasIn8} occurrence)`)

  // ── Samples ─────────────────────────────────────────────────────────────────
  const sampleIds = ['crj_1', 'crj_45', 'crj_t_1']
  for (const id of sampleIds) {
    const a = allDeduped.find(x => x.id === id)
    if (a) {
      console.log(`\n──── ${id} ────`)
      console.log(JSON.stringify(a, null, 2))
    } else {
      console.log(`\n──── ${id}: NOT FOUND ────`)
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const outDir = join(__dirname, '../src/data/brazil-states/rio-de-janeiro')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'constituicaoRJ.json')

  const output = {
    country: 'BR',
    state: 'RJ',
    code: 'constituicaoRJ',
    displayName: 'Constituição do Estado do Rio de Janeiro',
    color: '#009B3A',
    articles: allDeduped,
  }

  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\n✓ Saved ${allDeduped.length} articles to ${outPath}`)
  console.log(`  Main body range : Art. ${mainDeduped[0]?.number} – Art. ${mainDeduped[mainDeduped.length-1]?.number}`)
  if (adctDeduped.length) {
    console.log(`  ADCT range      : Art. ${adctDeduped[0]?.number} – Art. ${adctDeduped[adctDeduped.length-1]?.number}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
