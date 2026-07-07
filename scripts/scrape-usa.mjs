import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://www.law.cornell.edu'
const DELAY_MS = 1000

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function stripTags(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ─── CONSTITUTION SCRAPER ────────────────────────────────────────────────────

const CONSTITUTION_PAGES = [
  { slug: 'preamble',       label: 'Preamble' },
  { slug: 'articlei',       label: 'Article I' },
  { slug: 'articleii',      label: 'Article II' },
  { slug: 'articleiii',     label: 'Article III' },
  { slug: 'articleiv',      label: 'Article IV' },
  { slug: 'articlev',       label: 'Article V' },
  { slug: 'articlevi',      label: 'Article VI' },
  { slug: 'articlevii',     label: 'Article VII' },
  { slug: 'first_amendment',    label: 'Amendment I' },
  { slug: 'second_amendment',   label: 'Amendment II' },
  { slug: 'third_amendment',    label: 'Amendment III' },
  { slug: 'fourth_amendment',   label: 'Amendment IV' },
  { slug: 'fifth_amendment',    label: 'Amendment V' },
  { slug: 'sixth_amendment',    label: 'Amendment VI' },
  { slug: 'seventh_amendment',  label: 'Amendment VII' },
  { slug: 'eighth_amendment',   label: 'Amendment VIII' },
  { slug: 'ninth_amendment',    label: 'Amendment IX' },
  { slug: 'tenth_amendment',    label: 'Amendment X' },
  { slug: 'amendmentxi',    label: 'Amendment XI' },
  { slug: 'amendmentxii',   label: 'Amendment XII' },
  { slug: 'amendmentxiii',  label: 'Amendment XIII' },
  { slug: 'amendmentxiv',   label: 'Amendment XIV' },
  { slug: 'amendmentxv',    label: 'Amendment XV' },
  { slug: 'amendmentxvi',   label: 'Amendment XVI' },
  { slug: 'amendmentxvii',  label: 'Amendment XVII' },
  { slug: 'amendmentxviii', label: 'Amendment XVIII' },
  { slug: 'amendmentxix',   label: 'Amendment XIX' },
  { slug: 'amendmentxx',    label: 'Amendment XX' },
  { slug: 'amendmentxxi',   label: 'Amendment XXI' },
  { slug: 'amendmentxxii',  label: 'Amendment XXII' },
  { slug: 'amendmentxxiii', label: 'Amendment XXIII' },
  { slug: 'amendmentxxiv',  label: 'Amendment XXIV' },
  { slug: 'amendmentxxv',   label: 'Amendment XXV' },
  { slug: 'amendmentxxvi',  label: 'Amendment XXVI' },
  { slug: 'amendmentxxvii', label: 'Amendment XXVII' },
]

function extractConstitutionArticles(html, pageLabel, pageSlug) {
  // Extract div.field-item.even — contains all section text for this page
  const fieldMatch = html.match(
    /class="field-item\s+even"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>|<div class="field-items">)/i
  )
  if (!fieldMatch) {
    // Some pages (preamble) may not use field-item — fall back to broader extraction
    // Try extracting between the h1 and the notes/footer
    const h1Match = html.match(/<h1[^>]*>[\s\S]*?<\/h1>([\s\S]*?)(?:<div class="notes"|<div id="footer)/)
    if (!h1Match) return []
    const text = stripTags(h1Match[1]).trim()
    if (text.length < 20) return []
    return [{
      id: `usc_${pageSlug}`,
      number: pageSlug,
      title: pageLabel,
      text: text.slice(0, 3000),
      tags: [],
      relatedArticles: [],
    }]
  }

  const content = fieldMatch[1]

  // Split on <h2> tags — each h2 marks a new section/clause heading
  // Handles: "Section 1." / "Section 1" / "Clause 1." / bare amendment text
  const chunks = content.split(/(?=<h2\b)/i)

  const articles = []
  let sectionIndex = 0

  for (const chunk of chunks) {
    const headingMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    const rawHeading = headingMatch ? stripTags(headingMatch[1]).trim() : ''

    // Get body text after the heading
    const bodyHtml = headingMatch
      ? chunk.slice(chunk.indexOf('</h2>') + 5)
      : chunk
    const bodyText = stripTags(bodyHtml).trim()

    if (bodyText.length < 20) continue

    // Derive a clean title
    let title = rawHeading || pageLabel
    // "Section 1." → "Section 1"
    title = title.replace(/\.$/, '').trim()
    if (!title || title.length < 2) title = `${pageLabel} — Part ${sectionIndex + 1}`

    // Derive a stable id/number
    const secNumMatch = rawHeading.match(/section\s+(\d+)/i)
    const clauseNumMatch = rawHeading.match(/clause\s+(\d+)/i)
    let number
    if (secNumMatch) {
      number = `${pageSlug}_s${secNumMatch[1]}`
    } else if (clauseNumMatch) {
      number = `${pageSlug}_c${clauseNumMatch[1]}`
    } else if (!rawHeading) {
      number = pageSlug
    } else {
      number = `${pageSlug}_${sectionIndex}`
    }

    articles.push({
      id: `usc_${number}`,
      number,
      title: `${pageLabel} — ${title}`,
      text: bodyText.slice(0, 4000),
      tags: [],
      relatedArticles: [],
    })
    sectionIndex++
  }

  // If no h2 splits found, treat whole page as one article
  if (articles.length === 0) {
    const fullText = stripTags(content).trim()
    if (fullText.length >= 20) {
      articles.push({
        id: `usc_${pageSlug}`,
        number: pageSlug,
        title: pageLabel,
        text: fullText.slice(0, 4000),
        tags: [],
        relatedArticles: [],
      })
    }
  }

  return articles
}

async function scrapeConstitution() {
  console.log('\n── U.S. Constitution ──────────────────────────')
  const allArticles = []

  for (const page of CONSTITUTION_PAGES) {
    const url = `${BASE}/constitution/${page.slug}`
    try {
      const html = await fetchPage(url)
      const articles = extractConstitutionArticles(html, page.label, page.slug)
      console.log(`  ${page.label}: ${articles.length} section(s)`)
      allArticles.push(...articles)
    } catch (err) {
      console.error(`  ✗ ${page.label}: ${err.message}`)
    }
    await sleep(DELAY_MS)
  }

  return allArticles
}

// ─── USC TITLE SCRAPER (written, not yet run) ─────────────────────────────────

async function collectChapterUrls(titleNum) {
  const parts = []
  // Fetch the top-level title page to find part links
  const topHtml = await fetchPage(`${BASE}/uscode/text/${titleNum}`)
  const partLinks = [...new Set(
    (topHtml.match(/href="(\/uscode\/text\/\d+\/part-[^"]+)"/g) || [])
      .map(m => m.match(/href="([^"]+)"/)[1])
  )]

  if (partLinks.length === 0) {
    // Some titles have no parts — chapters are at the top level
    return collectChaptersFromHtml(topHtml, titleNum)
  }

  for (const partPath of partLinks) {
    await sleep(DELAY_MS)
    const partHtml = await fetchPage(`${BASE}${partPath}`)
    const chapters = collectChaptersFromHtml(partHtml, titleNum)
    parts.push(...chapters)
  }
  return parts
}

function collectChaptersFromHtml(html, titleNum) {
  const pattern = new RegExp(`href="(/uscode/text/${titleNum}/[^"]+chapter[^"]+)"`, 'g')
  return [...new Set(
    (html.match(pattern) || []).map(m => m.match(/href="([^"]+)"/)[1])
  )]
}

async function collectSectionUrls(chapterPath, titleNum) {
  const html = await fetchPage(`${BASE}${chapterPath}`)
  const pattern = new RegExp(`href="(/uscode/text/${titleNum}/(\\d[^"]*?))"`, 'g')
  const matches = [...html.matchAll(new RegExp(`href="(/uscode/text/${titleNum}/(\\d[^"]*?))"`, 'g'))]
  return [...new Map(matches.map(m => [m[2], m[1]])).values()]
}

async function fetchSection(sectionPath, prefix) {
  const html = await fetchPage(`${BASE}${sectionPath}`)

  // Title: from <h1>
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = h1Match ? stripTags(h1Match[1]).replace(/\s+/g, ' ').trim() : sectionPath

  // Body: everything between </h1> and <div class="notes"> or <div id="footer"
  const bodyMatch = html.match(/<\/h1>([\s\S]*?)(?:<div[^>]+class="notes"|<div[^>]+id="footer)/)
  const text = bodyMatch ? stripTags(bodyMatch[1]).trim() : ''
  if (text.length < 10) return null

  // Section number from path: /uscode/text/18/2 → "2"
  const numMatch = sectionPath.match(/\/(\d[\w-]*)$/)
  const number = numMatch ? numMatch[1] : sectionPath.split('/').pop()

  return {
    id: `${prefix}_${number}`,
    number,
    title,
    text: text.slice(0, 4000),
    tags: [],
    relatedArticles: [],
  }
}

async function scrapeUSCTitle({ titleNum, key, displayName, color, prefix }) {
  console.log(`\n── ${displayName} ──────────────────────────`)
  const articles = []
  const seen = new Set()

  console.log('  Collecting chapter URLs...')
  const chapterPaths = await collectChapterUrls(titleNum)
  console.log(`  Found ${chapterPaths.length} chapters`)

  for (const chapterPath of chapterPaths) {
    await sleep(DELAY_MS)
    let sectionPaths
    try {
      sectionPaths = await collectSectionUrls(chapterPath, titleNum)
    } catch (err) {
      console.error(`  ✗ Chapter ${chapterPath}: ${err.message}`)
      continue
    }

    for (const secPath of sectionPaths) {
      if (seen.has(secPath)) continue
      seen.add(secPath)
      await sleep(DELAY_MS)
      try {
        const article = await fetchSection(secPath, prefix)
        if (article) {
          articles.push(article)
          if (articles.length % 50 === 0) {
            console.log(`  ... ${articles.length} sections so far`)
          }
        }
      } catch (err) {
        console.error(`  ✗ ${secPath}: ${err.message}`)
      }
    }
  }

  articles.sort((a, b) => parseInt(a.number) - parseInt(b.number))
  console.log(`  ✓ Total: ${articles.length} sections`)
  return { country: 'US', code: key, displayName, color, articles }
}

// ─── USC TITLE DEFINITIONS ────────────────────────────────────────────────────

const USC_TITLES = [
  { titleNum: 18, key: 'title18Criminal',      displayName: 'Title 18 — Crimes & Criminal Procedure', color: '#C53030', prefix: 't18' },
  { titleNum: 42, key: 'title42CivilRights',   displayName: 'Title 42 — Civil Rights & Public Health', color: '#2B6CB0', prefix: 't42' },
  { titleNum: 29, key: 'title29Labor',          displayName: 'Title 29 — Labor',                       color: '#276749', prefix: 't29' },
  { titleNum: 26, key: 'title26Tax',            displayName: 'Title 26 — Internal Revenue Code',       color: '#744210', prefix: 't26' },
  { titleNum: 15, key: 'title15Commerce',       displayName: 'Title 15 — Commerce & Trade',            color: '#553C9A', prefix: 't15' },
  { titleNum: 8,  key: 'title8Immigration',     displayName: 'Title 8 — Immigration',                  color: '#2C7A7B', prefix: 't8'  },
  { titleNum: 20, key: 'title20Education',      displayName: 'Title 20 — Education',                   color: '#C05621', prefix: 't20' },
  { titleNum: 31, key: 'title31Finance',        displayName: 'Title 31 — Money & Finance',             color: '#1A365D', prefix: 't31' },
  { titleNum: 49, key: 'title49Transportation', displayName: 'Title 49 — Transportation',              color: '#4A5568', prefix: 't49' },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('LexGlobe USA Scraper — Title 18 Crawl')
  console.log('======================================')

  const outputDir = join(__dirname, '..', 'src', 'data', 'usa')
  mkdirSync(outputDir, { recursive: true })

  // Constitution already validated and saved — skip re-run

  // ── Title 18 only ──
  const t18 = USC_TITLES.find(t => t.titleNum === 18)
  const data = await scrapeUSCTitle(t18)
  if (data.articles.length > 0) {
    const p = join(outputDir, `${t18.key}.json`)
    writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
    console.log(`\n✓ Saved ${data.articles.length} sections → ${p}`)

    console.log('\n── Sample entries ──────────────────────────────')
    for (const s of data.articles.slice(0, 3)) {
      console.log(`\n  id:    ${s.id}`)
      console.log(`  title: ${s.title}`)
      console.log(`  text:  ${s.text.slice(0, 180)}...`)
    }
  } else {
    console.log('⚠ No articles extracted')
  }

  // Other USC titles remain disabled until Title 18 is validated:
  /*
  for (const titleDef of USC_TITLES.filter(t => t.titleNum !== 18)) {
    const d = await scrapeUSCTitle(titleDef)
    if (d.articles.length > 0) {
      const p = join(outputDir, `${titleDef.key}.json`)
      writeFileSync(p, JSON.stringify(d, null, 2), 'utf8')
      console.log(`✓ Saved ${d.articles.length} → ${p}`)
    }
  }
  */

  console.log('\n======================================')
  console.log('Title 18 crawl complete.')
}

main().catch(console.error)
