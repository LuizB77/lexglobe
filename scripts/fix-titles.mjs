import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync as readF } from 'fs'
import { join as j, dirname as d } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read key directly from .env file
function getApiKey() {
  try {
    const envPath = j(d(fileURLToPath(import.meta.url)), '..', '.env')
    const env = readF(envPath, 'utf8')
    const match = env.match(/VITE_CLAUDE_API_KEY=(.+)/)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

const API_KEY = getApiKey()

const FILES = [
  'constituicao',
  'codigoPenal',
  'codigoCivil',
  'clt',
  'eca',
  'cdc',
]

function isGenericTitle(title, number) {
  return (
    title === `Artigo ${number}` ||
    title === `Art. ${number}` ||
    title.toLowerCase().startsWith('artigo') ||
    title.length < 5
  )
}

async function generateTitle(article, codeName) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: `Você é um especialista em direito brasileiro.
Leia o texto abaixo do Art. ${article.number} do ${codeName} e gere um título curto e descritivo (máximo 6 palavras) que capture o assunto principal do artigo.
Responda APENAS com o título, sem pontuação final, sem aspas, sem explicações.

Texto: ${article.text.slice(0, 400)}`,
      }],
    }),
  })

  const data = await response.json()
  if (data?.error) {
    console.error('API error:', data.error.message)
    return null
  }
  const title = data?.content?.[0]?.text?.trim()
  return title && title.length > 3 && title.length < 80 ? title : null
}

async function processFile(codeKey) {
  const filePath = join(__dirname, '..', 'src', 'data', 'brazil', `${codeKey}.json`)
  const data = JSON.parse(readFileSync(filePath, 'utf8'))

  const genericArticles = data.articles.filter(a => isGenericTitle(a.title, a.number))
  console.log(`\n${data.displayName}: ${genericArticles.length} generic titles to fix`)

  if (genericArticles.length === 0) return

  let fixed = 0
  let failed = 0

  for (let i = 0; i < genericArticles.length; i++) {
    const article = genericArticles[i]
    process.stdout.write(`  [${i + 1}/${genericArticles.length}] Art. ${article.number}... `)

    try {
      const newTitle = await generateTitle(article, data.displayName)
      if (newTitle) {
        // Update in the main articles array
        const idx = data.articles.findIndex(a => a.id === article.id)
        if (idx !== -1) data.articles[idx].title = newTitle
        process.stdout.write(`✓ "${newTitle}"\n`)
        fixed++
      } else {
        process.stdout.write(`✗ (kept original)\n`)
        failed++
      }
    } catch (err) {
      process.stdout.write(`✗ ${err.message}\n`)
      failed++
    }

    // Save progress every 20 articles in case of interruption
    if ((i + 1) % 20 === 0) {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
      console.log(`  → Progress saved (${i + 1}/${genericArticles.length})`)
    }

    // Rate limit — Haiku is fast but be polite
    await new Promise(r => setTimeout(r, 150))
  }

  // Final save
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`  ✓ Done: ${fixed} fixed, ${failed} failed`)
}

async function main() {
  console.log('LexGlobe Title Fixer')
  console.log('====================')

  if (API_KEY === 'your-key-here') {
    console.error('ERROR: Set your API key first.')
    console.error('Run: ANTHROPIC_API_KEY=sk-ant-... node scripts/fix-titles.mjs')
    console.error('Or edit the API_KEY variable in the script directly.')
    process.exit(1)
  }

  for (const codeKey of FILES) {
    await processFile(codeKey)
  }

  console.log('\n====================')
  console.log('All done! Restart dev server to see updated titles.')
}

main().catch(console.error)
