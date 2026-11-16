// Launch check: node tools/launch-check.mjs
// Terminal only. It renders nothing on the page and nothing on the page depends on it.
// Exits 1 if something would break the launch: config not set, noindex lost, or held wording on the page.
// Lists what is still held with the client and what may draw an ad disapproval; those are reports, not failures.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')
const index = read('index.html'), thanks = read('thank-you/index.html'), js = read('assets/js/main.js'), privacy = read('privacy-policy.html')
const fail = []

// 1. config is real
const cfg = (k) => (js.match(new RegExp(`${k}:\\s*'([^']*)'`)) || [])[1] || ''
if (/PLACEHOLDER/.test(cfg('ENDPOINT')) || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(cfg('ENDPOINT'))) fail.push('ENDPOINT is not a deployed Apps Script /exec URL. Every submission shows an error until it is')
if (!/^GTM-[A-Z0-9]+$/.test(cfg('GTM_ID')) || /PLACEHOLDER/.test(cfg('GTM_ID'))) fail.push('GTM_ID is not a real container id. No tags or conversions run until it is')
if (!/^https:\/\//.test(cfg('SITE_URL'))) fail.push('SITE_URL (hosting URL) is not set')
if (/vercel\.app/.test(cfg('PRIVACY_URL'))) fail.push('PRIVACY_URL points at a vercel.app preview host, which goes behind a sign-in when the main site is protected')
if (!/^https?:/.test(cfg('PRIVACY_URL')) && !existsSync(resolve(root, cfg('PRIVACY_URL')))) fail.push(`PRIVACY_URL file is missing: ${cfg('PRIVACY_URL')}`)
if (/href="https:\/\/petals-health-website/.test(index)) fail.push('index.html still links to the main site host')

// 2. the things that must always hold
for (const [name, html] of [['index.html', index], ['thank-you/index.html', thanks]]) {
  if (!/<meta name="robots" content="noindex, nofollow">/.test(html)) fail.push(`${name} has lost its noindex`)
}
for (const f of ['sitemap.xml', 'robots.txt']) if (existsSync(resolve(root, f))) fail.push(`${f} exists; this page stays out of sitemaps, and a robots block would hide the noindex`)
if (/data-pending|data-launch-ribbon|class="pending/.test(index)) fail.push('a review marker or ribbon is back on the page; held content is removed, not marked')
if (/<iframe/i.test(index)) fail.push('index.html has an iframe in its source; the map must load only on click')

// 2a. everything in assets/img deploys to a public URL, used or not, so nothing unused may sit there.
const pages = index + thanks + privacy + js
const imgRoot = resolve(root, 'assets/img')
const stray = readdirSync(imgRoot, { withFileTypes: true, recursive: true }).filter((e) => e.isFile())
  .map((e) => resolve(e.parentPath, e.name).slice(imgRoot.length + 1).replace(/\\/g, '/'))
  .filter((n) => !pages.includes(n) && !pages.includes(n.replace(/-\d+\.webp$/, '')))
if (stray.length) fail.push(`images in assets/img that no page uses, which would still deploy to a public URL: ${stray.join(', ')}`)

// 2b. the helpline number is in the Loudon Street block and nowhere else, and it is never a dial.
const panelAt = index.indexOf('id="panel-loudon"')
const panel = panelAt < 0 ? '' : index.slice(panelAt, index.indexOf('<footer', panelAt))
const helpline = /9147405960|91474 05960/
if ((panel.match(/\+91 91474 05960/g) || []).length !== 1) fail.push('the Loudon Street block must show +91 91474 05960 once')
if (/href="(tel:|https:\/\/wa\.me\/)[^"]*5960/.test(panel)) fail.push('the helpline number is a link in the Loudon Street block; every dial on the page stays +91 91477 69585')
for (const [name, text] of [['index.html outside the Loudon Street block', index.replace(panel, '')], ['thank-you/index.html', thanks], ['privacy-policy.html', privacy], ['assets/js/main.js', js]]) {
  if (helpline.test(text)) fail.push(`the helpline number is in ${name}; it belongs only in the Loudon Street block`)
}
if ([...(index + thanks + privacy).matchAll(/href="tel:([^"]+)"/g)].some((m) => m[1] !== '+919147769585')) fail.push('a tel: link dials something other than +91 91477 69585')
if (js.indexOf("PHONE_TEL: '+919147769585'") < 0 || js.indexOf("PHONE_DISPLAY: '+91 91477 69585'") < 0) fail.push('main.js CONFIG phone is not +91 91477 69585')
// 2e. the number and name that were replaced on 2026-11-16 stay gone, in every file, in every spelling
for (const [name, text] of [['index.html', index], ['thank-you/index.html', thanks], ['privacy-policy.html', privacy], ['assets/js/main.js', js]]) {
  if (/9147\s?405\s?955|91474\s?05955/.test(text)) fail.push(`the old phone number is in ${name}; every number is +91 91477 69585`)
  if (/Petals Dental\b/.test(text)) fail.push(`"Petals Dental" is in ${name}; the name is Petals Health Dental Clinic, or Petals Health mid-sentence`)
}
// 2f. the FAQ schema repeats the visible FAQ word for word
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const visibleFaq = [...index.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<div class="faq__a">([\s\S]*?)<\/div>/g)].map((m) => [text(m[1]), text(m[2])])
const ld = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const faqPage = ld.flatMap((d) => d['@graph'] || [d]).find((n) => n['@type'] === 'FAQPage')
if (!faqPage) fail.push('the FAQPage schema is missing')
else {
  const schemaFaq = faqPage.mainEntity.map((q) => [q.name.trim(), q.acceptedAnswer.text.trim()])
  if (JSON.stringify(schemaFaq) !== JSON.stringify(visibleFaq)) fail.push(`the FAQPage schema does not match the visible FAQ (${schemaFaq.length} in schema, ${visibleFaq.length} on the page)`)
}
if (!visibleFaq.length) fail.push('no FAQ on the page')
if (!/name="format-detection" content="telephone=no"/.test(index)) fail.push('format-detection is gone, so phones may turn the helpline number into a dial')

// 2c. before and after, and testimonials: off by default. A listed case must be complete and carry a consent reference, flag on or off.
const configAt = js.indexOf('var CONFIG = ') + 'var CONFIG = '.length
const config = runInNewContext(`(${js.slice(configAt, js.indexOf('\n  };', configAt) + 4)})`)
const baOn = config.SHOW_BEFORE_AFTER === true, tmOn = config.SHOW_TESTIMONIALS === true
const baCases = config.BEFORE_AFTER_CASES, tmCases = config.TESTIMONIAL_CASES
for (const [id, label] of [['before-after', 'before and after'], ['testimonials', 'testimonials']]) {
  const tpl = (index.match(new RegExp(`<template id="${id}">[\\s\\S]*?</template>`)) || [''])[0]
  if (!tpl) fail.push(`the ${label} template is missing`)
  if (/<img|<blockquote/.test(tpl)) fail.push(`the ${label} template has content in it; images and quotes belong in the case list`)
}
if (baOn && !baCases.length) fail.push('SHOW_BEFORE_AFTER is true but BEFORE_AFTER_CASES is empty')
if (tmOn && !tmCases.length) fail.push('SHOW_TESTIMONIALS is true but TESTIMONIAL_CASES is empty')
baCases.forEach((c, i) => {
  if (!c.consentRef) fail.push(`before and after case ${i + 1} has no consentRef`)
  for (const k of ['before', 'after']) for (const size of ['400', '800']) if (!c[k] || !existsSync(resolve(root, `${c[k]}-${size}.webp`))) fail.push(`before and after case ${i + 1}: ${k} image ${size} is missing`)
})
tmCases.forEach((c, i) => {
  if (!c.consentRef) fail.push(`testimonial case ${i + 1} has no consentRef`)
  for (const k of ['quote', 'name', 'treatment']) if (!c[k]) fail.push(`testimonial case ${i + 1} has no ${k}`)
  if (c.photo && (!c.photoAlt || !existsSync(resolve(root, `${c.photo}-160.webp`)))) fail.push(`testimonial case ${i + 1}: photo file or alt text is missing`)
})

// 2d. the reference page's three named testimonials stay out of the code. Hashed, so the names are not in this file either.
const NAMED = new Set(['af4426313946aecb', 'ffdcdecd246e7d54', '6074dcfee9b6ecae'])
const words = pages.toLowerCase().match(/[a-z]+/g) || []
if (words.some((w, i) => NAMED.has(createHash('sha256').update(`${w} ${words[i + 1]}`).digest('hex').slice(0, 16)))) fail.push('a named testimonial from the reference page is in the code')
if (/testi[123]\.png/.test(pages)) fail.push('a testimonial photo from the reference page is in the code')

// 3. no held line has crept back in. Lifting a phrase from this list is a decision: only after the client clears it.
const held = [
  // figures and guarantees
  'Success Rate', 'Happy Patients', 'Google Rating', 'Satisfaction', '90% less', 'painless', 'stress-free', 'Most Trusted', 'cutting-edge', 'Real results', 'zero compromise', 'good dentistry', 'Best Smile', 'Honest pricing', 'Experts in', 'perfectly aligned', 'exact smile',
  // the client's own outcome promises, left out by decision
  'long-lasting', 'Permanent solution', 'ensuring a healthier', 'always wanted',
  // removed sections and headings. The two section headings are allowed only inside their inert templates, which this search skips
  'Before and After', 'What Patients Say', 'Proven Outcomes', 'Results You Can See', 'Results You', 'Testimonial', 'Sedation', 'sedation',
  // unconfirmed services and details
  'Invisalign', 'Paediatric', 'Sunday', 'Rawdon', 'State of Art', 'Experienced Dental Team', 'Hospital-grade sanitisation', 'Fully Sterilised', 'Digital X-Ray',
  // equipment the client confirmed in writing they do not have (2026-11-16)
  '3D imaging', '3D Imaging', 'intraoral', 'Intraoral', 'scanner',
  // wording that reads as a guarantee, kept off the rewritten copy
  'guarantee', 'Guarantee', 'same-day', 'Same-day', 'same day', 'free consultation', 'Free consultation', 'Free Consultation',
]
const live = index.replace(/<template[\s\S]*?<\/template>/g, '')
const hits = held.filter((p) => live.includes(p) || thanks.includes(p))
if (hits.length) fail.push(`held wording on the page: ${hits.join(', ')}`)

// 4. what is unresolved with the client. Each is off the page until the client supplies what is listed.
const SIGNOFF = 'written sign-off from a dental-regulatory adviser that publishing is permitted under the National Dental Commission advisory of 14 Oct 2026'
const HOLDS = [
  ['Before and after section', `A consent record per case, and ${SIGNOFF}`],
  ['Testimonials section', `A consent record per case, and the same ${SIGNOFF}. A testimonial about a child also needs a parent's written consent`],
  ['99% success, 100% satisfaction, 500+ patients, 4.9 rating', 'A dated source for each; a profile link for the rating'],
  ['"Up to 90% less radiation"', 'A published source for the figure'],
  ['Sedation Dentistry card', 'Confirmation they offer it and who administers it. "Completely painless" stays out regardless'],
  ['Paediatric Dentistry', 'Confirmation they offer it; their dental pages list General and Cosmetic only'],
  ['Invisalign', 'Confirmation they are an authorised provider'],
  ['Sunday hours', 'Confirmation a dentist is in on Sundays; their doctor list shows none'],
  ['"Expert care. Honest pricing. Zero judgment."', 'Nothing needed: deleted'],
  ['"Advanced tools like 3D imaging and intraoral scanners"', 'Nothing needed: the client confirmed in writing (Nov 2026) they have neither. Removed 2026-11-16; stays out'],
  ['Same-day or emergency appointments', 'Confirmation of the policy. The emergency FAQ only says to call and say it is urgent'],
  ['Visits and durations per treatment', 'Typical visit counts and chair time for root canal, crown, aligners, veneers. The visits FAQ only describes the staged plan'],
  ['Free first consultation', 'The client\'s booking form says "Your First consultation is on US". Not on the page: confirm it applies to dental, and to walk-in as well as video'],
  ['Local anaesthetic for root canals', 'Confirmation, so the pain FAQ can say the tooth is numbed first'],
]
const CONFIRM = [
  'Loudon Street address: from the client\'s dental page. Its CMC unit page gives 11 A Sarojini Naidu Sarani and its forms say Rawdon Street',
  'Loudon Street name and phone: neither is on the dental page\'s card for this clinic',
  'Loudon Street map: the pin and live map are Google\'s "Calcutta Medical Centre Limited" listing, not a link from the client',
  'Phone: this page dials +91 91477 69585 (client\'s revision brief, 2026-11-16). The main site\'s Diagnostic Services page shows 1800 1205 1600 and 9147405960, and its dental pages 9147405955. Unresolved: which number is the dental line everywhere',
  '"Skilled dentists" tile: "BDS-qualified dentists in clinic Monday to Saturday" is read from the client\'s doctor list (two BDS dentists, one Mon-Sat, one Mon-Fri)',
  '"Costs are discussed at your consultation, before any treatment starts": the page\'s reading of the client\'s "no hidden charges"',
]
const RISKS = ['no hidden charges', 'hospital-grade', 'Internationally trusted']
const RISK_NOTES = { 'no hidden charges': 'pricing-promise language; recommend dropping, or softening to pricing discussed before treatment', 'hospital-grade': 'the client\'s own phrase; fine on the page, keep it out of ad copy', 'Internationally trusted': 'unsourced' }

console.log(`\nHeld with the client (${HOLDS.length}; none of it is on the page):`)
for (const [what, needs] of HOLDS) console.log(`  - ${what}\n      needs: ${needs}`)

console.log('\nOn the page, awaiting the client\'s confirmation:')
for (const c of CONFIRM) console.log(`  - ${c}`)

const state = (on, n) => (on ? `ON, ${n} case(s). Confirm the regulatory sign-off is on file: the National Dental Commission advisory of 14 Oct 2026 names these` : 'off, renders nothing')
console.log(`\nBefore and after section: ${state(baOn, baCases.length)}`)
console.log(`Testimonials section: ${state(tmOn, tmCases.length)}`)

console.log('\nOn the page, client\'s published words, may draw an ad disapproval:')
for (const r of RISKS) console.log(`  - "${r}"${index.toLowerCase().includes(r.toLowerCase()) ? '' : ' (no longer on the page)'}: ${RISK_NOTES[r]}`)

if (privacy.includes('data-interim-notice')) console.log('\nNote: the privacy notice is still the interim text. Replace it when the client sends theirs.')

if (fail.length) {
  console.error(`\nNOT READY TO LAUNCH (${fail.length})`)
  for (const f of fail) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nReady to launch: config set, noindex in place, no held wording.')
