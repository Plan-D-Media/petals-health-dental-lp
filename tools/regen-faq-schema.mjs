// Regenerates the FAQPage JSON-LD from the visible FAQ: node tools/regen-faq-schema.mjs
// The extraction below is byte-for-byte the same as the one in tools/launch-check.mjs, so a run of this script
// always leaves the two matching. Edit the FAQ in index.html, run this, then run the launch check.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const file = resolve(root, 'index.html')
const html = readFileSync(file, 'utf8')

const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const visible = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<div class="faq__a">([\s\S]*?)<\/div>/g)].map((m) => [text(m[1]), text(m[2])])
if (!visible.length) throw new Error('no FAQ found in index.html')

const m = html.match(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/)
if (!m) throw new Error('no JSON-LD block in index.html')
const data = JSON.parse(m[2])
const graph = data['@graph'] || [data]
const faqPage = graph.find((n) => n['@type'] === 'FAQPage')
if (!faqPage) throw new Error('no FAQPage node in the JSON-LD')

faqPage.mainEntity = visible.map(([name, answer]) => ({
  '@type': 'Question',
  name,
  acceptedAnswer: { '@type': 'Answer', text: answer },
}))

writeFileSync(file, html.replace(m[0], m[1] + JSON.stringify(data) + m[3]), 'utf8')
console.log(`FAQPage schema rewritten from the page: ${visible.length} question(s).`)
for (const [q] of visible) console.log(`  - ${q}`)
