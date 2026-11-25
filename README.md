# Petals Health Dental Clinic landing page

Paid-traffic page. Pure HTML, CSS and vanilla JS with no build step: double-click `index.html`, or host the folder as it is.

```
index.html                 the page, with all its CSS inline (inlining is deliberate; see the comment in the CSS)
thank-you/index.html       conversion page: noindex, its own small stylesheet
assets/js/main.js          forms, attribution, sticky rail, flagged sections. CONFIG at the top is the one place to set things
assets/js/dentists.js      the Meet Your Dentists data. Empty: the client has supplied none of it
assets/fonts, img          Bricolage Grotesque subset and images, from petals-web
privacy-policy.html        interim privacy notice, written to what this page actually does
tools/launch-check.mjs     terminal check, run before any deploy. Renders nothing on the page
tools/regen-faq-schema.mjs rewrites the FAQ structured data from the visible FAQ. Run after editing the FAQ
HANDOVER.md                what the client still owes, what is flagged off, and the open conflicts
DEVIATIONS.md              everything on the page that is not verbatim from a source, and why
```

`HANDOVER.md` opens with the one thing that must not be missed: `ENDPOINT` is still a placeholder, so **every form
submission currently fails and no lead is stored**. The page must not take paid traffic until it is wired.

## Before launch

Run `node tools/launch-check.mjs`. It exits 1 if the config is unset, `noindex` is lost, held wording is on the page, the hours
have drifted from `CONFIG.HOURS_*`, the FAQ and its schema disagree, two CTA blocks sit in a row, or client data listed in
`HANDOVER.md` is still missing. It also lists what is held with the client and which published lines may draw an ad
disapproval; those are reports, not failures.

Nothing on the page depends on this check. Once `GTM_ID` is real, tags load and conversions count.

Set in `CONFIG`, at the top of `assets/js/main.js`:

| Key | Value |
|---|---|
| `ENDPOINT` | the Apps Script `/exec` URL. While it is a placeholder, every submission shows an error: nothing is simulated |
| `GTM_ID` | the container id |
| `SITE_URL` | the hosting URL, with a trailing slash |
| `PRIVACY_URL` | `privacy-policy.html`, the local interim notice. Replace that file's body when the client's text arrives |

In GTM, keep Meta's automatic advanced matching and Google's enhanced conversions off, or the privacy notice must change. It
says the page passes those tools a reference number and not the visitor's name, mobile number, email address or message.

## Hours: one source of truth

`CONFIG.HOURS_WEEK`, `HOURS_SUN`, `HOURS_DENTIST` and `HOURS_SCHEMA` in `assets/js/main.js` are the only place the
hours are set (client's final word for this LP, 25 November 2026):

| | |
|---|---|
| Clinic | Monday to Saturday, 8:00 AM to 8:00 PM |
| Clinic | Sunday, 8:00 AM to 2:00 PM (half day) |
| Dentist | A dentist is in from 10:00 AM to 7:30 PM |

`index.html` is a static page with no build step, so those strings are also written into its markup, meta description,
sharing tags and structured data. The launch check compares **every** mention against `CONFIG` and fails on any
difference, so the three canonical lines, the four clock times, each clinic card, the schema's
`openingHoursSpecification` and both descriptions can never drift apart. Change the hours in `CONFIG`, update the
markup to match, then run the check.

The main site's Loudon Street / Calcutta Medical Centre block still says 07:30 AM – 07:30 PM. That conflict is logged
in `HANDOVER.md` for the client, not fixed here.

## Meet Your Dentists

`assets/js/dentists.js` holds the data and is **empty**: the client has supplied none of it. While it is empty the
section does not exist on the page — no heading, no cards, no placeholder faces, no "Dr. Name", no stock photography.
The launch check **fails** while it is empty, and fails an entry missing any of its six fields.

| Needed per dentist | |
|---|---|
| `name` | As the dentist is registered |
| `qualification` | `BDS` or `BDS, MDS`, as awarded |
| `speciality` | What they treat, in the client's own words |
| `registration` | The Dental Council registration number. Shown as plain text next to the qualification, prefixed "Reg. no." |
| `photo` | `assets/img/dentists/<slug>.webp`, square, 480x480, up to 45 KB |
| `photoAlt` | A plain description of the photograph |

Cards are equal height per row (the grid stretches them), one column below 600 px, two to 1024, three above. Nothing
may sit in `assets/img` that no page uses: everything under `assets/` deploys to a public URL and the launch check
fails a stray file.

## Google reviews

A link out to the clinic's own Google Business Profile, **not** the testimonials section. It reproduces no review text
and no rating, so the words and the star rating stay Google's data rather than copy on this page. Off:
`SHOW_GOOGLE_REVIEWS` and `GOOGLE_REVIEWS_URL` in `CONFIG` turn it on. The same regulatory sign-off is needed first;
see `HANDOVER.md`.

## Blocked FAQ entries

`CONFIG.BLOCKED_FAQS` holds the questions the client has not answered. Each renders nothing while its `a` is empty.
Filling `a` puts the question on the page **and** into the FAQ structured data in the same pass, so the two cannot
disagree; move it into `index.html` at the next content round too, so a crawler that does not run JavaScript sees it.
The launch check lists every empty one and fails while any is empty.

## Calls to action

One inline CTA block per major section, and never two with nothing but a heading between them: that was the client's
objection in this round. The page has exactly one inline CTA pair, in the booking prompt. The sticky Book tab and the
floating call button are always present and are not counted against the rule — part of why the inline repetition read
as heavy. The hero has its own call button and form, and each treatment card has its own Book Consultation link.

The launch check fails two CTA blocks with less than 400 characters of text between them, and it counts the CTA inside
a flagged-off template as soon as that flag goes on.

## Clearing a hold

Held content is removed from the page, with no placeholder. `tools/launch-check.mjs` lists each hold and what the client must
supply, and it searches for the held wording, so publishing a held phrase means removing it from that list. The removal is
the record that the client cleared it.

## Clinic tabs and maps

Each clinic is a tab with its details and a map. Without JavaScript, or if `main.js` fails, the tab row stays hidden and all
clinics show stacked. To add a clinic, add one tab button and one panel in `index.html`. On narrow screens the tabs wrap to a second row.

A map is a picture until clicked; only then does `main.js` load the Google map, about 2 MB. There must be no `<iframe>` in
`index.html`, and the launch check fails one. `assets/img/map-*.webp` are 720×450, built from OpenStreetMap tiles with the pin
at the exact centre. Keep the visible OpenStreetMap credit: the licence requires it. Do not swap in a Google Maps screenshot:
its terms do not allow it. Kankurgachi and Tollygunge use the coordinates, embed and short link from the client's own pages.
The client publishes none for Loudon Street, so its pin (22.5428905, 88.3561401), live map and Get Direction come from Google's
"Calcutta Medical Centre Limited" listing at Maruti Buildings, 12 Sir UN Brahmachari Sarani. Replace them if the client sends a link.

The Loudon Street block is the only place `+91 91474 05960` appears, and it is plain text on purpose. Every call button, the
sticky widget, the error message and every `tel:` link dial +91 91477 69585 (changed from the earlier number on 2026-11-16).
`format-detection` stops phones auto-linking the number. The launch check fails if any of this changes, and fails the old
number or the old name "Petals Dental" anywhere in the deployed files.

## Names

The clinic is "Petals Health Dental Clinic" everywhere: eyebrow, headings, body, FAQ, title, description, sharing tags, schema. "Petals Health"
alone is fine where the full name reads heavy mid-sentence. "Petals Dental" appears nowhere.

## FAQ and structured data

The FAQ is plain `<details>` markup, so its text is in the HTML for crawlers and answer engines. The `FAQPage` JSON-LD in the
head must repeat the visible questions and answers word for word; the launch check fails a mismatch. **Do not hand-edit the
schema**: edit the FAQ in `index.html`, then run `node tools/regen-faq-schema.mjs`, which rebuilds the schema from the page
using the same text extraction the launch check uses. The same script carries a `Dentist` entry with the three addresses and
the hours.

One block element per line inside `.faq__a`, please. The extraction strips tags and collapses whitespace, so `</p><p>` with no
space between them would run two sentences together in the schema. There must also be no nested `<div>` inside `.faq__a`.

The emergency answer's last line — swelling spreading to the face or neck, or trouble breathing or swallowing — is
`.faq__urgent`, set apart with a red rule because it is the one answer that matters clinically. The launch check fails if that
class disappears.
Note for the client: Google no longer shows FAQ rich results, so the schema is for comprehension and other engines, not a
search dropdown. Every answer is built only from facts the client has published or confirmed; what is still unconfirmed is
listed by the launch check.

## Before and after section

Off. `SHOW_BEFORE_AFTER` in `CONFIG` is the one line that turns it on, once `BEFORE_AFTER_CASES` is filled. The layout is an
inert `<template>` in `index.html`, so off means no markup, no text and no requests. With the flag on, a case with no
`consentRef` or a missing image field never renders, and with no valid case the section stays absent. The launch check also
fails a case with no `consentRef` or no image file. Do not turn it on without the regulatory sign-off below.

| Needed | Spec |
|---|---|
| Sign-off | Written confirmation from a dental-regulatory adviser or dental council. The National Dental Commission's advisory of 14 October 2026 names before-and-after photos |
| Cases | 2 or 4, shown two across from 1024 px. One also works, centred. Each case is one before and one after |
| Originals | 4:3 landscape, at least 1200×900, as shot. Same angle, distance and lighting in both; tight on the mouth, because a tile is only 122 px wide at 320 |
| Files for the page | `<name>-800.webp` (800×600, up to 60 KB) and `<name>-400.webp` (400×300, up to 25 KB), for both images. In `assets/img/ba/` |
| Editing | Crop and resize only, the same in both |
| Text per case | Treatment name, and alt text for both images. No patient name, age or outcome claim |

One consent record per case, held by the client in its patient records. The page's `consentRef` is the register number only.
Nothing identifying goes in this repo.

- Register number, patient's name, the clinic and treating dentist with registration number, treatment and treatment dates.
- A signed, dated consent naming these two images, and each use: this page, Google ads, Meta ads.
- Whether the patient can be identified, how long the consent lasts, and how to withdraw it.
- Where the images came from: who took them, when, the original files, and the dentist's confirmation that they show this patient, unretouched.
- Any withdrawal, with its date and the date the images came down. A withdrawal means removing the case the same day.
- Adult patients only, unless a lawyer advises otherwise. A minor would at least need a parent's or guardian's written consent.

## Testimonials section

Off, and built the same way, after the Google reviews block. `SHOW_TESTIMONIALS` in `CONFIG` is the one line that turns it on,
once `TESTIMONIAL_CASES` is filled. The layout is an inert `<template>`. A case with no `consentRef`, quote, name or treatment
never renders, and the launch check fails it whether the flag is on or off. The same sign-off is required first: the advisory
names testimonials too. The reference page's three named testimonials, their photos and their wording do not go in this
code; the launch check fails their names and photo files, and holds the names only as hashes.

| Needed | Spec |
|---|---|
| Sign-off | The same written confirmation as before and after |
| Cases | 3 or 6, three across on wide screens, one column on phones. One also works, centred |
| Text per case | The quote as the patient approved it, name as the patient agreed to show it, and treatment. No outcome claim, and no word from the held list such as "painless" |
| Photo, optional | `<name>-160.webp`, 160×160, square, up to 12 KB, in `assets/img/tm/`, with alt text. Shown at 56 px |

One consent record per case, as for before and after, held by the client, with only the register number here. It names the
exact wording and any photo in place of the two images, and where the quote came from: a written, dated statement or a link to
the public review. A testimonial about a child needs a parent's or guardian's written consent, and a lawyer's view first.

## Sticky rail

The Book tab and call button live in a strip on the right edge, 52 px wide, that nothing but band backgrounds may enter.
Below 1024 `.inner` reserves it through `--rail-clear`; from 1024 the normal gutter already does. Anything new that breaks out
of `.inner` on the right will go under the rail. Below 1024 both hide while a text field has focus, for the keyboard. They
are not on the thank-you page or the privacy notice.

## Leads

`apps-script/Code.gs` in `petals-web` accepts this payload as it stands: `form` is `dental-lp`, `section` is `hero` or
`closing`. Success is only a response body of `{ "ok": true }`. A retry reuses the submission id, and the script skips an id
it has already written.

The conversion is `generate_lead`, pushed to the data layer on the thank-you page, once per delivered submission. It carries
`lead_id` for de-duplication and no personal data.

## Indexing

Noindex on both pages, no sitemap and no `robots.txt`. Do not add a `robots.txt` block, or Google cannot see the noindex. Do
not add a canonical to the main site. `.vercelignore` keeps `tools/`, `DEVIATIONS.md`, `HANDOVER.md` and this file off a Vercel
deploy; on
any other host, exclude them the same way.
