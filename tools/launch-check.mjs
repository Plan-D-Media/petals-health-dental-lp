// Launch check: node tools/launch-check.mjs
// Terminal only. It renders nothing on the page and nothing on the page depends on it.
// Exits 1 if something would break the launch: config not set, noindex lost, held wording on the page,
// client data still missing, or the hours drifting from their single source of truth.
// Lists what is still held with the client and what may draw an ad disapproval; those are reports, not failures.
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(resolve(root, p), 'utf8')
const index = read('index.html'), thanks = read('thank-you/index.html'), js = read('assets/js/main.js'), privacy = read('privacy-policy.html')
const docsData = read('assets/js/dentists.js')
const fail = []
const missing = []     // client data we do not have: each one fails the launch

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
if ((index.match(/<h1\b/g) || []).length !== 1) fail.push(`index.html must have exactly one h1 (found ${(index.match(/<h1\b/g) || []).length})`)

// 2a. everything in assets/img deploys to a public URL, used or not, so nothing unused may sit there.
const pages = index + thanks + privacy + js + docsData
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
for (const [name, text] of [['index.html outside the Loudon Street block', index.replace(panel, '')], ['thank-you/index.html', thanks], ['privacy-policy.html', privacy], ['assets/js/main.js', js], ['assets/js/dentists.js', docsData]]) {
  if (helpline.test(text)) fail.push(`the helpline number is in ${name}; it belongs only in the Loudon Street block`)
}
if ([...(index + thanks + privacy).matchAll(/href="tel:([^"]+)"/g)].some((m) => m[1] !== '+919147769585')) fail.push('a tel: link dials something other than +91 91477 69585')
if (js.indexOf("PHONE_TEL: '+919147769585'") < 0 || js.indexOf("PHONE_DISPLAY: '+91 91477 69585'") < 0) fail.push('main.js CONFIG phone is not +91 91477 69585')

// 2e. the number and name that were replaced on 2026-11-16 stay gone, in every file, in every spelling
for (const [name, text] of [['index.html', index], ['thank-you/index.html', thanks], ['privacy-policy.html', privacy], ['assets/js/main.js', js], ['assets/js/dentists.js', docsData]]) {
  if (/9147\s?405\s?955|91474\s?05955/.test(text)) fail.push(`the old phone number is in ${name}; every number is +91 91477 69585`)
  if (/Petals Dental\b/.test(text)) fail.push(`"Petals Dental" is in ${name}; the name is Petals Health Dental Clinic, or Petals Health mid-sentence`)
  // "Centre", the British spelling, everywhere. Changing it only here would make a NAP mismatch with the client's Google
  // Business Profile and signage, so this is flagged for the client as well; see CONFIRM below.
  if (/\bCenter\b/.test(text)) fail.push(`the US spelling "Center" is in ${name}; this page uses "Centre" throughout`)
}

// 2f. the FAQ schema repeats the visible FAQ word for word. node tools/regen-faq-schema.mjs rebuilds it from the page.
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const visibleFaq = [...index.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<div class="faq__a">([\s\S]*?)<\/div>/g)].map((m) => [text(m[1]), text(m[2])])
const ld = [...index.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
const graph = ld.flatMap((d) => d['@graph'] || [d])
const faqPage = graph.find((n) => n['@type'] === 'FAQPage')
if (!faqPage) fail.push('the FAQPage schema is missing')
else {
  const schemaFaq = faqPage.mainEntity.map((q) => [q.name.trim(), q.acceptedAnswer.text.trim()])
  if (JSON.stringify(schemaFaq) !== JSON.stringify(visibleFaq)) fail.push(`the FAQPage schema does not match the visible FAQ (${schemaFaq.length} in schema, ${visibleFaq.length} on the page). Run: node tools/regen-faq-schema.mjs`)
}
if (!visibleFaq.length) fail.push('no FAQ on the page')
if (!/name="format-detection" content="telephone=no"/.test(index)) fail.push('format-detection is gone, so phones may turn the helpline number into a dial')
// the one clinically urgent answer is set apart, not buried at the end of a paragraph
if (!/class="faq__urgent"/.test(index)) fail.push('the emergency answer has lost its set-apart line about swelling spreading to the face or neck')

// 2c. before and after, testimonials and google reviews: off by default. A listed case must be complete and carry a
// consent reference, flag on or off.
const configAt = js.indexOf('var CONFIG = ') + 'var CONFIG = '.length
const config = runInNewContext(`(${js.slice(configAt, js.indexOf('\n  };', configAt) + 4)})`)
const baOn = config.SHOW_BEFORE_AFTER === true, tmOn = config.SHOW_TESTIMONIALS === true, grOn = config.SHOW_GOOGLE_REVIEWS === true
const baCases = config.BEFORE_AFTER_CASES, tmCases = config.TESTIMONIAL_CASES
for (const [id, label] of [['before-after', 'before and after'], ['testimonials', 'testimonials'], ['google-reviews', 'google reviews'], ['dentists', 'meet your dentists']]) {
  const tpl = (index.match(new RegExp(`<template id="${id}">[\\s\\S]*?</template>`)) || [''])[0]
  if (!tpl) fail.push(`the ${label} template is missing`)
  if (/<img|<blockquote/.test(tpl)) fail.push(`the ${label} template has content in it; images, quotes and dentist details belong in the data`)
}
if (baOn && !baCases.length) fail.push('SHOW_BEFORE_AFTER is true but BEFORE_AFTER_CASES is empty')
if (tmOn && !tmCases.length) fail.push('SHOW_TESTIMONIALS is true but TESTIMONIAL_CASES is empty')
if (grOn && !/^https:\/\//.test(config.GOOGLE_REVIEWS_URL || '')) fail.push('SHOW_GOOGLE_REVIEWS is true but GOOGLE_REVIEWS_URL is not an https URL')
if (/\d(\.\d)?\s*(star|out of 5)|rated \d/i.test(index)) fail.push('a rating figure is on the page; the Google reviews block links to the profile and quotes no rating')
baCases.forEach((c, i) => {
  if (!c.consentRef) fail.push(`before and after case ${i + 1} has no consentRef`)
  for (const k of ['before', 'after']) for (const size of ['400', '800']) if (!c[k] || !existsSync(resolve(root, `${c[k]}-${size}.webp`))) fail.push(`before and after case ${i + 1}: ${k} image ${size} is missing`)
})
tmCases.forEach((c, i) => {
  if (!c.consentRef) fail.push(`testimonial case ${i + 1} has no consentRef`)
  for (const k of ['quote', 'name', 'treatment']) if (!c[k]) fail.push(`testimonial case ${i + 1} has no ${k}`)
  if (c.photo && (!c.photoAlt || !existsSync(resolve(root, `${c.photo}-160.webp`)))) fail.push(`testimonial case ${i + 1}: photo file or alt text is missing`)
})

// 2g. MEET YOUR DENTISTS. The client has supplied none of this, so an empty list fails the launch.
const dentists = runInNewContext(`var window = {}; ${docsData}; window.PETALS_DENTISTS`)
if (!Array.isArray(dentists)) fail.push('assets/js/dentists.js does not set window.PETALS_DENTISTS to an array')
else if (!dentists.length) missing.push('Dentist details. assets/js/dentists.js is empty, so the Meet Your Dentists section does not exist on the page. Per dentist: name, photo, qualification (BDS/MDS), speciality, Dental Council registration number')
else dentists.forEach((d, i) => {
  for (const k of ['name', 'qualification', 'speciality', 'registration', 'photo', 'photoAlt']) {
    if (!d || !d[k]) fail.push(`dentist ${i + 1} has no ${k}; the card does not render until all six fields are filled`)
  }
  if (d && d.photo && !existsSync(resolve(root, d.photo))) fail.push(`dentist ${i + 1}: photo file is missing: ${d.photo}`)
})

// 2h. HOURS: one source of truth. CONFIG.HOURS_* in assets/js/main.js is it; every mention on the page must match.
// A <br> is a line break on the page, so it counts as a space when the text is read.
const pageText = text(index.replace(/<br\s*\/?>/gi, ' ').replace(/<script[\s\S]*?<\/script>/g, ''))
const H = { week: config.HOURS_WEEK, sun: config.HOURS_SUN, dentist: config.HOURS_DENTIST }
for (const [k, v] of Object.entries(H)) {
  if (!v) fail.push(`CONFIG.HOURS_${k.toUpperCase()} is not set in main.js`)
  else if (!pageText.includes(v)) fail.push(`the page never states the ${k} hours in their canonical wording: "${v}"`)
}
// the public-holiday closure the client confirmed on 2026-11-25. Page-wide, not per clinic card: he asked for it in the
// timings and emergency answers, and it also has its own FAQ entry.
if (!config.HOURS_HOLIDAYS) fail.push('CONFIG.HOURS_HOLIDAYS is not set in main.js')
else if (!pageText.includes(config.HOURS_HOLIDAYS)) fail.push(`the page never states the public-holiday closure in its canonical wording: "${config.HOURS_HOLIDAYS}"`)
// no stale hours in any spelling, anywhere
for (const [name, body] of [['index.html', index], ['thank-you/index.html', thanks], ['privacy-policy.html', privacy]]) {
  for (const bad of ['07:30', '19:30', '7:30 AM', '7.30', '3:30 PM', 'twelve hours']) {
    if (body.includes(bad)) fail.push(`stale hours wording "${bad}" is in ${name}; the hours come from CONFIG.HOURS_* only`)
  }
}
// every clock time on the page is one of the four the client gave
const ALLOWED_TIMES = new Set(['8:00', '2:00', '10:00', '7:30'])
const badTimes = [...new Set([...pageText.matchAll(/\b(\d{1,2}:\d{2})\b/g)].map((m) => m[1]))].filter((t) => !ALLOWED_TIMES.has(t))
if (badTimes.length) fail.push(`clock times on the page that are not the client's hours: ${badTimes.join(', ')}`)
// each clinic card carries the full set
const panelIds = ['panel-kankurgachi', 'panel-tollygunge', 'panel-loudon']
for (const id of panelIds) {
  const at = index.indexOf(`id="${id}"`)
  const block = at < 0 ? '' : text(index.slice(at, at + 2600).replace(/<br\s*\/?>/gi, ' '))
  for (const [k, v] of Object.entries(H)) if (v && !block.includes(v)) fail.push(`${id} does not carry the ${k} hours: "${v}"`)
}
// the schema's opening hours are generated from the same place
const wantHours = (config.HOURS_SCHEMA || []).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes }))
const gotHours = (graph.find((n) => n['@type'] === 'Dentist') || {}).openingHoursSpecification
if (JSON.stringify(gotHours) !== JSON.stringify(wantHours)) fail.push(`the schema's openingHoursSpecification does not match CONFIG.HOURS_SCHEMA\n      schema: ${JSON.stringify(gotHours)}\n      config: ${JSON.stringify(wantHours)}`)
// the meta and sharing descriptions carry the same hours
for (const m of [...index.matchAll(/(?:name="description"|property="og:description") content="([^"]*)"/g)]) {
  for (const t of ['8:00 AM to 8:00 PM', '8:00 AM to 2:00 PM']) if (!m[1].includes(t)) fail.push(`a page description does not carry "${t}"`)
}

// 2i. CTA repetition. The client circled two consecutive Book Consultation / Call us pairs: one inline CTA block per major
// section, and never two with nothing but a heading between them. The sticky rail and the floating call button are always
// present and are not counted here.
// A template whose flag is ON really will render, so its CTA block counts. One that is off is deleted outright.
let ctaSource = index
for (const [id, on] of [['dentists', Array.isArray(dentists) && dentists.length > 0], ['before-after', baOn], ['google-reviews', grOn], ['testimonials', tmOn]]) {
  ctaSource = ctaSource.replace(new RegExp(`<template id="${id}">([\\s\\S]*?)</template>`), on ? '$1' : '')
}
const ctaAt = [...ctaSource.matchAll(/<div class="next[^"]*">/g)].map((m) => m.index)
for (let i = 1; i < ctaAt.length; i++) {
  const between = text(ctaSource.slice(ctaAt[i - 1], ctaAt[i]))
  if (between.length < 400) fail.push(`two inline CTA blocks with only ${between.length} characters between them; one pair per major section, never two in a row. Switching a flagged section on can cause this: move or drop one pair`)
}

// 2d. the reference page's three named testimonials stay out of the code. Hashed, so the names are not in this file either.
const NAMED = new Set(['af4426313946aecb', 'ffdcdecd246e7d54', '6074dcfee9b6ecae'])
const words = pages.toLowerCase().match(/[a-z]+/g) || []
if (words.some((w, i) => NAMED.has(createHash('sha256').update(`${w} ${words[i + 1]}`).digest('hex').slice(0, 16)))) fail.push('a named testimonial from the reference page is in the code')
if (/testi[123]\.png/.test(pages)) fail.push('a testimonial photo from the reference page is in the code')

const live = index.replace(/<template[\s\S]*?<\/template>/g, '')

// 3. no held line has crept back in. Lifting a phrase from this list is a decision: only after the client clears it.
const held = [
  // figures and guarantees
  'Success Rate', 'Happy Patients', 'Google Rating', 'Satisfaction', '90% less', 'painless', 'stress-free', 'Most Trusted', 'cutting-edge', 'Real results', 'zero compromise', 'good dentistry', 'Best Smile', 'Honest pricing', 'Experts in', 'perfectly aligned', 'exact smile',
  // the client's own outcome promises, left out by decision
  'long-lasting', 'Permanent solution', 'ensuring a healthier', 'always wanted',
  // removed sections and headings. The two section headings are allowed only inside their inert templates, which this search skips
  'Before and After', 'What Patients Say', 'Proven Outcomes', 'Results You Can See', 'Results You', 'Testimonial', 'Sedation', 'sedation',
  // unconfirmed services and details
  'Invisalign', 'Rawdon', 'State of Art', 'Experienced Dental Team', 'Hospital-grade sanitisation', 'Fully Sterilised', 'Digital X-Ray',
  // equipment the client confirmed in writing they do not have (2026-11-16)
  '3D imaging', '3D Imaging', 'intraoral', 'Intraoral', 'scanner',
  // pricing-promise wording the client himself took out (2026-11-25): publish starting-from prices or reword. There are no
  // prices, so it is reworded to "Costs explained before treatment starts".
  'no hidden charges', 'hidden charges', 'affordable', 'Affordable', 'packages', 'Packages', 'Internationally trusted',
  // wording that reads as a guarantee, kept off the rewritten copy
  'guarantee', 'Guarantee', 'same-day', 'Same-day', 'same day', 'free consultation', 'Free consultation', 'Free Consultation',
  // emergency cover the client has not claimed
  '24/7', 'round-the-clock', 'Round-the-clock',
]
const hits = held.filter((p) => live.includes(p) || thanks.includes(p))
if (hits.length) fail.push(`held wording on the page: ${hits.join(', ')}`)

// 4. client data we are still missing. Each one fails the launch; none of it is written around on the page.
const blocked = (config.BLOCKED_FAQS || [])
for (const f of blocked) if (!f.a) missing.push(`FAQ answer: "${f.q}" — the entry renders nothing until CONFIG.BLOCKED_FAQS in main.js carries the client's answer`)
missing.push('Whether the dentist’s 10:00 AM to 7:30 PM applies on Sunday, when the clinic closes at 2:00 PM. The page states both hours separately and claims nothing about the overlap')
missing.push('Whether the clinic hours apply to ALL THREE Kolkata clinics or only some. The page and the timings FAQ state them for all three, which is a claim about all of them')

// 5. what is unresolved with the client. Each is off the page until the client supplies what is listed.
const SIGNOFF = 'written sign-off from a dental-regulatory adviser that publishing is permitted under the National Dental Commission advisory of 14 Oct 2026'
const HOLDS = [
  ['Before and after section', `A consent record per case, and ${SIGNOFF}`],
  ['Testimonials section', `A consent record per case, and the same ${SIGNOFF}. A testimonial about a child also needs a parent's written consent`],
  ['Google reviews block (link to the clinic\'s own Google Business Profile)', `The profile URL, and the same ${SIGNOFF}. It reproduces no review text or rating, which is why it is the option most likely to be permissible, but the advisory still names a dentist publishing testimonials`],
  ['99% success, 100% satisfaction, 500+ patients, 4.9 rating', 'A dated source for each; a profile link for the rating'],
  ['"Up to 90% less radiation"', 'A published source for the figure'],
  ['Sedation Dentistry card', 'Confirmation they offer it and who administers it. "Completely painless" stays out regardless'],
  ['Invisalign', 'Confirmation they are an authorised provider'],
  ['Payment options', 'The client wrote "UPI, cards, EMI (?)". The question mark is his. Nothing is published until he confirms which methods are accepted'],
  ['Insurance and cashless treatment', 'Unknown. Nothing on the page either way'],
  ['Walk-in or appointment only', 'Unknown. Nothing on the page either way'],
  ['Starting-from prices', 'His own instruction was prices or a reword. There are no prices, so card 04 of Why Choose reads "Costs explained before treatment starts"'],
  ['"Expert care. Honest pricing. Zero judgment."', 'Nothing needed: deleted'],
  ['"Advanced tools like 3D imaging and intraoral scanners"', 'Nothing needed: the client confirmed in writing (Nov 2026) they have neither. Removed 2026-11-16; stays out'],
  ['Same-day or emergency appointments', 'Confirmation of the policy. The emergency FAQ says to call and say it is urgent, gives the clinic and dentist hours and the public-holiday closure, and says that a call outside those hours is answered and the caller directed to the nearest hospital emergency department'],
  ['Durations per treatment', 'Chair time per treatment. The visits FAQ now carries his rough visit counts, as guides rather than promises, and no durations'],
  ['Free first consultation', 'The client\'s booking form says "Your First consultation is on US". Not on the page: confirm it applies to dental, and to walk-in as well as video'],
  ['Local anaesthetic for root canals', 'Confirmation, so the pain FAQ can say the tooth is numbed first'],
]
const CONFIRM = [
  'Public holidays: the client confirmed on 2026-11-25 that the clinic is closed, and the page says so in the timings answer, the emergency answer and its own FAQ entry. It is NOT in the structured data: schema.org can only express a closed day as a specialOpeningHoursSpecification with validFrom and validThrough dates, so it needs a list from the client of the dates the clinic shuts. Ask for the dates if he wants it marked up',
  'Loudon Street address: from the client\'s dental page. Its CMC unit page gives 11 A Sarojini Naidu Sarani and its forms say Rawdon Street',
  'Loudon Street name and phone: neither is on the dental page\'s card for this clinic',
  'Loudon Street map: the pin and live map are Google\'s "Calcutta Medical Centre Limited" listing, not a link from the client',
  'Phone: this page dials +91 91477 69585 (client\'s revision brief, 2026-11-16). The main site\'s Diagnostic Services page shows 1800 1205 1600 and 9147405960, and its dental pages 9147405955. Unresolved: which number is the dental line everywhere',
  '"Centre" vs "Center": this page now spells it "Centre" throughout, on the client\'s instruction. If their Google Business Profile, signage or registration uses "Center", changing it only here creates a NAP mismatch, which affects local map ranking. Worth making it consistent everywhere, or telling us which spelling is official',
  'Hours: Mon-Sat 8:00 AM to 8:00 PM, Sun 8:00 AM to 2:00 PM (half day), dentist 10:00 AM to 7:30 PM, all from the client\'s final word for this LP (2026-11-25). The Loudon Street / Calcutta Medical Centre block on the MAIN SITE states Monday to Saturday 07:30 AM to 07:30 PM. These differ and the main site was not changed',
  '"Experienced BDS and MDS dentists, with specialists for different treatments." is the client\'s own replacement wording for Why Choose card 01. Its supporting line is the dentist hours he gave',
  'Hero subline "Skilled Hands. Caring Approach." is still live. It is the same generic phrasing he objected to in card 01, and it is flagged for his decision; it was not changed without one',
]
const RISKS = ['hospital-grade']
const RISK_NOTES = { 'hospital-grade': 'the client\'s own phrase; fine on the page, keep it out of ad copy' }

console.log(`\nHeld with the client (${HOLDS.length}; none of it is on the page):`)
for (const [what, needs] of HOLDS) console.log(`  - ${what}\n      needs: ${needs}`)

console.log('\nOn the page, awaiting the client\'s confirmation:')
for (const c of CONFIRM) console.log(`  - ${c}`)

const state = (on, n) => (on ? `ON, ${n} case(s). Confirm the regulatory sign-off is on file: the National Dental Commission advisory of 14 Oct 2026 names these` : 'off, renders nothing')
console.log(`\nBefore and after section: ${state(baOn, baCases.length)}`)
console.log(`Testimonials section: ${state(tmOn, tmCases.length)}`)
console.log(`Google reviews block: ${grOn ? `ON, ${config.GOOGLE_REVIEWS_URL || 'NO URL'}. Confirm the same sign-off is on file` : 'off, renders nothing'}`)
const docsComplete = (Array.isArray(dentists) ? dentists : []).filter((d) => d && d.name && d.photo && d.photoAlt && d.qualification && d.speciality && d.registration).length
console.log(`Meet Your Dentists section: ${Array.isArray(dentists) && dentists.length ? `${docsComplete} of ${dentists.length} entr(ies) complete and rendering` : 'off, renders nothing (assets/js/dentists.js is empty)'}`)

console.log('\nOn the page, client\'s published words, may draw an ad disapproval:')
for (const r of RISKS) console.log(`  - "${r}"${index.toLowerCase().includes(r.toLowerCase()) ? '' : ' (no longer on the page)'}: ${RISK_NOTES[r]}`)

if (privacy.includes('data-interim-notice')) console.log('\nNote: the privacy notice is still the interim text. Replace it when the client sends theirs.')

if (missing.length) {
  console.error(`\nCLIENT DATA MISSING (${missing.length}) — each of these is structure built and left empty, never written around:`)
  for (const m of missing) console.error(`  - ${m}`)
}

const all = [...fail, ...missing.map((m) => `client data missing: ${m}`)]
if (all.length) {
  console.error(`\nNOT READY TO LAUNCH (${all.length})`)
  for (const f of all) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\nReady to launch: config set, noindex in place, no held wording, hours consistent, client data complete.')
