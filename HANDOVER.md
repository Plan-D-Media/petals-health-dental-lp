# Petals Health Dental Clinic landing page — handover

Date of this document: 25 November 2026. It describes the files as they stand, not a plan.

---

## 1. READ FIRST: the form does not work yet. Every submission fails.

**`ENDPOINT` in `assets/js/main.js` is still a placeholder.** As the files stand:

- A visitor who fills in either form and presses **Book Consultation** gets a visible error asking them to call
  instead. Nothing is sent. **No lead is stored anywhere** — not in a sheet, not in an inbox, not in the browser's
  retry queue (a placeholder endpoint is deliberately never queued).
- `GTM_ID` is also a placeholder, so **no tag fires and no conversion is counted**, including `generate_lead`.

**This page must not take paid traffic until `ENDPOINT` is a deployed Apps Script `/exec` URL and a test submission
has been seen arriving.** Sending ads to it in this state spends budget on leads that are thrown away.

The failure is loud on purpose: the page never pretends a submission succeeded. But a visitor who gives up before
reading the error is still a lost enquiry, which is why this is the first thing in this document.

Four values in `CONFIG`, at the top of `assets/js/main.js`, must be set before launch:

| Key | What it needs |
|---|---|
| `ENDPOINT` | The deployed Apps Script `/exec` URL. Until then every submission shows an error |
| `GTM_ID` | The real container id. Until then no tags or conversions run |
| `SITE_URL` | The hosting URL, with a trailing slash |
| `PRIVACY_URL` | `privacy-policy.html` (the local interim notice), or the client's own URL once it exists |

`node tools/launch-check.mjs` fails while any of these is unset. Run it before every deploy.

---

## 2. What the client still owes us

**Six items, down from eight.** On 25 November 2026 he answered two of them:

- **Children: yes.** Paediatric dentistry is a running service. It is now a visible FAQ answer and a seventh treatments
  card, "Children's Dentistry". No age range, no named dentist and no claim about the child's experience: he confirmed
  none of that. "Paediatric" has come off the launch check's held-wording list.
- **Public holidays: closed.** It is now stated in the timings answer, in the emergency answer and in its own FAQ entry,
  and the wording comes from `CONFIG.HOURS_HOLIDAYS` like the rest of the hours. It is **not** in the structured data;
  see section 4, item 6.

Both were moved out of `CONFIG.BLOCKED_FAQS` and written into `index.html` as ordinary markup, so a crawler that does
not run JavaScript sees them, and `node tools/regen-faq-schema.mjs` put them into the FAQ structured data.

Nothing below has been written around or guessed. In each case the structure is built and left empty, the page shows
nothing at all, and `node tools/launch-check.mjs` fails and names it.

| # | Needed from the client | Where it goes once we have it |
|---|---|---|
| 1 | **Dentist details** — per dentist: name, photo, qualification (BDS/MDS), speciality, Dental Council registration number | `assets/js/dentists.js`. The whole "Meet Your Dentists" section does not exist until this file has an entry |
| 2 | **Insurance / cashless treatment** — do they accept it? | `CONFIG.BLOCKED_FAQS` in `main.js`, the "Do you accept insurance or cashless treatment?" entry |
| 3 | **Walk-in or appointment only?** | `CONFIG.BLOCKED_FAQS`, the "Do I need an appointment, or can I just walk in?" entry |
| 4 | **Payment options.** He wrote "UPI, cards, EMI (?)". The question mark is his, so nothing is published — not EMI, not any method | `CONFIG.BLOCKED_FAQS`, the "What payment methods do you accept?" entry |
| 5 | **Does the dentist's 10:00 AM – 7:30 PM apply on Sunday,** when the clinic closes at 2:00 PM? The two sets of hours overlap only partly | The page states both separately and claims nothing about the overlap. **This now needs an answer.** The rewritten emergency answer puts "Sunday, 8:00 AM to 2:00 PM (half day)" and "A dentist is in from 10:00 AM to 7:30 PM" in consecutive sentences, so a reader meets the contradiction head-on |
| 6 | **Do the clinic hours apply to all three Kolkata clinics, or only some?** The timings FAQ says "all three Kolkata clinics", which is a claim about all of them | Clinic cards and the timings FAQ, if the answer differs per clinic |

Items 2–4 are each **one line to switch on**: fill the `a` field of that entry in `CONFIG.BLOCKED_FAQS`. The question
then appears in the FAQ and is added to the FAQ structured data in the same pass, so the two cannot disagree. Move it
into `index.html` at the next content round as well, so that a crawler which does not run JavaScript also sees it —
that is what was done for the children and public-holiday answers above.

---

## 3. Three sections built, flagged off, each one line to switch on

All three are inert `<template>` blocks: while they are off there is no markup, no text, no images and no requests.

### a. Google reviews — a link to the clinic's own Google Business Profile

**This is the one we recommend putting to the client first.** It reproduces no review text and no rating on the page:
it links out to the clinic's own public listing, so the words and the star rating stay Google's data rather than copy
we wrote. That is a materially smaller exposure than testimonials on the page.

**It is still not risk-free.** The National Dental Commission advisory of 14 October 2026 covers a dentist publishing
patient testimonials, and pointing visitors at a page of patient reviews is arguably within that. **The same adviser
sign-off applies before it goes on.**

| To switch on | |
|---|---|
| 1 | Written sign-off from a dental-regulatory adviser or dental council that this specific use is permitted under the advisory of 14 October 2026 |
| 2 | The clinic's Google Business Profile review URL |
| 3 | Set `SHOW_GOOGLE_REVIEWS: true` and `GOOGLE_REVIEWS_URL: '<the URL>'` in `CONFIG` |

Note: the reviews block sits directly after the booking prompt, and both carry a call to action. Switching it on
therefore trips the "never two CTA blocks in a row" rule, and the launch check will say so. Drop or move one of the two
pairs at the same time.

### b. Before and after photographs

| To switch on | |
|---|---|
| 1 | Written sign-off from a dental-regulatory adviser or dental council. The advisory of 14 October 2026 names before-and-after photographs directly |
| 2 | A consent record per case, held by the client in its patient records. Only the register number goes in this repo |
| 3 | The image files, to the spec in `README.md` |
| 4 | Fill `BEFORE_AFTER_CASES` and set `SHOW_BEFORE_AFTER: true` |

**Written patient consent alone does not answer this.** Consent addresses the patient's privacy. The advisory is about
what a registered dentist may publish, and the risk sits with the client's registered dentist, not with us. The client
has asked for this section directly and has himself written "only with written patient consent"; our position has not
changed on the strength of that.

The four unverified before/after images are **not** in this repo. They are in
`Petals_Health/_not-for-deploy/dental-lp-unverified-before-after/`. Do not move them back in.

### c. Patient testimonials

| To switch on | |
|---|---|
| 1 | The same written sign-off. The advisory names testimonials as well as photographs |
| 2 | A consent record per case; a testimonial about a child also needs a parent's or guardian's written consent, and a lawyer's view first |
| 3 | The quote as the patient approved it, the name as the patient agreed to show it, and the treatment |
| 4 | Fill `TESTIMONIAL_CASES` and set `SHOW_TESTIMONIALS: true` |

No testimonial text, name or photograph is anywhere in this code. The launch check fails the three named testimonials
from the reference page by name hash, so they cannot come back by accident.

---

## 4. Conflicts and decisions to put to the client

These are on the page as the client instructed, but they disagree with something else he publishes. Each needs a
decision from him, not from us.

1. **Hours differ from the main site.** This page uses his final word for this landing page: clinic Monday to Saturday
   8:00 AM – 8:00 PM, Sunday 8:00 AM – 2:00 PM (half day), dentist 10:00 AM – 7:30 PM. The Loudon Street / Calcutta
   Medical Centre block **on the main site** states Monday to Saturday 07:30 AM – 07:30 PM. We did not change the main
   site. Two different sets of hours for the same clinic are live.

2. **"Centre" or "Center".** He asked for "Centre", and this page now spells it that way throughout. If the clinic's
   Google Business Profile, signage or registration says "Center", changing it only here creates a **NAP mismatch**
   (name, address, phone inconsistency), which works against local map ranking. Better to make it consistent
   everywhere, or to tell us which spelling is the official one.

3. **The hero subline "Skilled Hands. Caring Approach." is still live.** It is the same generic phrasing he objected to
   in Why Choose card 01. We flagged it rather than rewriting it, because he did not ask for it to change. If he wants
   it replaced, it needs his wording or his approval of ours.

4. **Phone numbers.** This page dials +91 91477 69585 everywhere (his brief of 16 November 2026). The main site's
   Diagnostic Services page shows 1800 1205 1600 and 9147405960; his dental pages still show 9147405955. Which is the
   dental line?

5. **Loudon Street details.** The address is from his dental page; his CMC unit page gives a different one
   (11 A Sarojini Naidu Sarani) and his forms say Rawdon Street. The map pin, live map and Get Direction come from
   Google's own "Calcutta Medical Centre Limited" listing, because he has published no link for this clinic.

6. **Public holidays are not in the structured data.** The page says the clinic is closed on public holidays, in three
   places. Schema.org can only express a closed day as a `specialOpeningHoursSpecification` with `validFrom` and
   `validThrough` **dates** — there is no "closed on public holidays" value. Marking it up therefore needs his list of
   the dates the clinic shuts, and that list would need updating every year. Ask for the dates if he wants it; the
   visible text answers the question either way.

7. **FAQ structured data is not a search feature.** Google no longer shows FAQ rich results. The schema is there for
   comprehension and for answer engines, not for a dropdown in the search results. Please do not sell it as one.

---

## 5. Things deliberately not on the page

`node tools/launch-check.mjs` prints the full list with what each one needs. In short: no prices, no visit durations,
no outcome guarantees, no "painless", no percentages, no success rates, no star ratings, no "free consultation", no
"same-day", no 24/7 emergency cover, no 3D imaging or intraoral scanner (he confirmed in writing they have neither),
no Invisalign, no sedation, and no "affordable packages" or "no hidden charges".

The last one was his own instruction this round: publish starting-from prices or reword. There are no prices, so
Why Choose card 04 now reads **"Costs explained before treatment starts"**.

---

## 6. Running the checks

```
node tools/launch-check.mjs      # must pass before any deploy. Terminal only; renders nothing on the page
node tools/regen-faq-schema.mjs  # run after editing the FAQ, then run the launch check
```

The launch check fails on: unset config, lost `noindex`, held wording, a stray image in `assets/img`, the wrong phone
number, the old name, the US "Center" spelling, an FAQ/schema mismatch, hours that drift from `CONFIG.HOURS_*`, the
public-holiday closure missing from the page, more than one `h1`, two CTA blocks in a row, an incomplete dentist or
testimonial entry, and any of the client data in section 2 still being missing.

Hours live in exactly one place: `CONFIG.HOURS_WEEK`, `HOURS_SUN`, `HOURS_DENTIST`, `HOURS_HOLIDAYS` and
`HOURS_SCHEMA` in
`assets/js/main.js`. `index.html` is a static page with no build step, so the strings are also written into its markup,
meta description and structured data — and the launch check compares every one of them against `CONFIG` and fails on
any difference. Change the hours there, then re-run the check.

---

## 7. Hosting notes

- Both pages are `noindex, nofollow`. There is no sitemap and no `robots.txt`, and there must not be one: a robots
  block would stop Google seeing the `noindex`. Do not add a canonical to the main site.
- `.vercelignore` keeps `tools/`, `README.md`, `DEVIATIONS.md` and this file off a deploy. On any other host, exclude
  them the same way.
- The privacy notice is still the **interim** text, written to what this page actually does. Replace the body when the
  client sends theirs. In GTM, keep Meta's automatic advanced matching and Google's enhanced conversions **off**, or the
  privacy notice becomes untrue: it says the page passes those tools a reference number and not the visitor's name,
  mobile number, email address or message.
