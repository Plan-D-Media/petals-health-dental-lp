# Deviations from the sources

Two sources, and where they differ the client's own site wins:

- The client's site: https://www.petalshealth.in/dental-clinic-kolkata/, with its `/general-dentistry/`, `/cosmetic-dentistry/`, `/contact/` and `/petals-health-cmc-unit/` pages.
- The reference: https://pland-media.com/projects/petal/.

Everything on the page is verbatim from one of them, or from the main site's Dentistry page, except what is listed here, so
nobody later assumes a source said these things. Held content is not on the page at all; `node tools/launch-check.mjs` lists it.

## Filled from the client's site (2026-11-04)

| Where | Text | Source |
|---|---|---|
| Hero intro | "We offer personalised care, from preventative treatments to cosmetic enhancements." | Dental page, cut before "ensuring a healthier, more confident you" |
| Crowns card | "Crowns restore the shape, size, and strength of damaged teeth." "Bridges replace missing teeth by attaching to adjacent teeth." | General |
| Braces card | "Clear, removable aligners to straighten teeth" "Comfortable and discreet alternative to traditional braces" | Cosmetic |
| Why Choose | "Skilled dentists", "Affordable treatment packages with no hidden charges", "Sterile, hospital-grade environment" | General. "Advanced tools like 3D imaging and intraoral scanners" was also taken from here and removed on 2026-11-16: the client confirmed in writing they have neither |
| Clinic cards | "Dental Examinations and X-rays", "X-rays to detect cavities, bone loss, or hidden dental problems.", "Internationally trusted and ethical dental protocols." | General. The "Intraoral Scanning Technology" card, with the same 3D imaging line, was removed on 2026-11-16 for the same reason |
| Booking prompt | "Your smile deserves the best." | General. The line under it was rewritten on 2026-11-16 (see 44) |
| FAQ | The X-ray safety answer, the six-month check-up answer, "scaling and root planing", "deep cleaning", "tooth-coloured or silver fillings", the staged treatment process, the recovery timeline behind the root canal pain answer | General. The FAQ was rebuilt on 2026-11-16 (see 45) |
| Hours | "Monday to Saturday, 7:30 AM to 7:30 PM" | Contact and CMC unit pages, reworded; their Sunday hours left off by decision |
| Clinics | Kankurgachi, Tollygunge and Loudon Street addresses | Kankurgachi from the site footer, Tollygunge and Loudon Street from the dental page (see 16) |
| Clinic block heading | "Our Locations" | Dental page |
| Maps | Live map on click: the client's Google embed for Kankurgachi and Tollygunge. Get Direction: the client's short link for each. Loudon Street: see 9e | Unit pages and contact page. For Tollygunge, the reference embeds a "Moore Heights" listing instead |

## Departures from both sources, approved by name (2026-11-04)

| # | Where | Sources said | The page says | Why |
|---|---|---|---|---|
| 1 | Clinic addresses | Reference starts each with "CMC:" | Prefix removed | Paste error on the reference |
| 2 | "Whether it's been months…" line | Reference has a broken character (byte 0x97), shown as "�" | Restored as an em dash | Encoding fault |
| 3 | Thank-you page | None | "Thank you", "Our team will confirm your consultation by phone or WhatsApp.", "Need us sooner? Call +91 91477 69585.", a reference number, "Back to Petals Health Dental Clinic" | Interface text. The WhatsApp sentence is the main site's form copy |
| 4 | Direct visit to thank-you page | None | "To book a consultation, use the form or call +91 91477 69585." and "Book Consultation" | Interface text, so a direct visit gets no false confirmation |
| 5 | Lead handling (code, not copy) | Not applicable | The main site's `?leadEndpoint=` test hook was not ported | A crafted link could have sent leads to someone else's server |
| 6 | Phone | Reference +91 91474 05960; client's dental pages 9147405955 | +91 91477 69585, except the Loudon Street block (see 16a) | Client's revision brief, 2026-11-16, replacing the user's 2026-11-04 choice of the dental pages' number. 9147405960 is the client's "Patient Helpline" and header WhatsApp. See 40 |
| 7 | Hero | Reference "Kolkata's Most Trusted Smile Destination" in its banner; client "Dental Clinic in Kolkata" | H1 "Dental Clinic in Kolkata", then "Skilled Hands. Caring Approach." from the reference's doctor block | User's decision. The superlative stays out |
| 8 | Sticky call | None | Icon button, labelled "Call +91 91477 69585" for screen readers | User's brief |
| 9 | Sticky tab | None | "Book your Appointment" | User's brief |
| 9a | Clinic labels | Reference "Operating Hours", "Contact Details" | "Address", "Operating Hours", "Phone", "Email" | Interface text; the reference's tab pattern in this page's own styling |
| 9b | Map | Reference loads three live Google maps | A static OpenStreetMap picture for each clinic, "View interactive map", the alt text and "Map data © OpenStreetMap contributors" | User's brief; the credit is a licence requirement |
| 9c | Before and after template, not rendered | Reference "Proven Outcomes", "Every smile you see here belongs to a real Petals Dental patient…" | "Before and After", "Before", "After", "Shown with each patient's written consent. Individual results vary." | Neutral wording for review. Nothing shows while the flag is off |
| 9d | Testimonials template, not rendered | Reference "What Patients Say?" and three named quotes | "What Patients Say" and "Shared with each patient's written consent. Individual experiences vary." | Layout only. No quote, name or photo from the reference is in the code. Nothing shows while the flag is off |
| 9e | Loudon Street map | No map on the client's dental page, and no map on its CMC unit page | Live map and Get Direction from a Google search of the address, the pin from the listing it finds, "Calcutta Medical Centre Limited" | Nothing from the client to use. To be replaced if the client sends a link |

## Cut or changed by decision (2026-11-04)

| # | Where | Sources said | The page says | Why |
|---|---|---|---|---|
| 10 | Full-mouth card | Reference: "…a complete treatment plan to restore your smile, bite, and confidence - top to bottom." | "For complex or multiple dental conditions, we design a complete treatment plan." | Outcome promise cut, full stop added. Not on the client's site |
| 11 | Braces title | Reference "Braces & Invisalign"; client "Invisalign® (Clear Aligners)" | "Braces & Clear Aligners" | Trademark held. Only the reference says they offer braces |
| 12 | Gums FAQ | Reference ends "Catching it early makes treatment simple and straightforward." | Sentence removed | Outcome promise |
| 13 | Clinic card title | Reference "Digital X-Ray Suite", "Fully Sterilised Treatment Rooms" | "Dental Examinations and X-rays", "Sterile, Hospital-Grade Environment" (capitalised from the client's line) | Client wins; "Digital" and "Fully" unbacked |
| 14 | Client's outcome promises | "ensuring a healthier, more confident you", "Permanent solution for missing teeth", "natural, long-lasting solution" | Not shown | User's decision, though the client published them |
| 15 | Hours | Client adds Sunday 7:30 AM to 3:30 PM | Monday to Saturday only | The client's doctor list shows no dentist on Sunday |
| 16 | Loudon Street clinic | Client's dental page: "Maruti Building, 1st Floor, 12, Loudon Street, Opp: Bellevue Hospital, Kolkata – 700017", under "Petals Health CMC" and "Petals Family Clinic". Client's CMC unit page: "11 A, Sarojini Naidu Sarani, Rawdon St", as "Woman's Clinic Rawdon Street". Client's forms: "Rawdon Street" | The dental page's address, as a third tab, named "Calcutta Medical Center — A Unit of Petals" | User's decision, 2026-11-04: the conflict is resolved in favour of the dental page. The name matches the reference, not the client's card. Stays on the client list for confirmation |
| 16a | Loudon Street phone | Reference's CMC block +91 91474 05960. The dental page's card has no phone; the client publishes 9147405960 as a site-wide number | "+91 91474 05960" in this block only, as plain text. Every dial on the page is +91 91477 69585 | User's decision, 2026-11-04. Plain text is the agent's reading of "every dial stays on" one number |
| 16b | Loudon Street hours | Reference and contact pages, formatted differently; client adds Sunday | "Monday to Saturday, 07:30 AM – 07:30 PM", worded as the user supplied it. The other two tabs read "7:30 AM to 7:30 PM" | User's text kept as given |
| 17 | Removed entirely | Reference's stats, doctor block, "We are Experts in", Outcomes, Testimonials, Sedation card, "Paediatric Dentistry", "Precision You Can Feel. Results You Can See." | Not shown | Held, or outside the approved sections |
| 18 | Page title | Reference "Petals Health"; client "Dental Treatment in Kolkata \| Book Appointment!!" | "Dental Clinic in Kolkata \| Petals Health" | Matches the H1 |

## Earlier decisions still in force

| # | Where | Reference said | The page says | Source |
|---|---|---|---|---|
| 19 | Treatment cards | Held lines | "Routine oral exams and professional cleaning to catch problems before they start", "Treatment for infected or badly decayed teeth, aimed at saving the natural tooth.", "Custom veneers to correct chips, gaps, or discolouration on front teeth.", "A combined plan across whitening, shaping, and alignment for a full smile refresh." | Main site's Dentistry page |
| 20 | Treatment cards | "Learn More", linking nowhere | "Book Consultation", going to the form | Reference's own button label |
| 21 | Treatments eyebrow | Not on the reference | "Dental treatments offered by Petals Health" | The brief's section list |
| 22 | Hero eyebrow | Not on the reference | "Petals Health Dental Clinic" | Client's name for the clinic (revision round 1); was "Petals Dental" until 2026-11-16 |
| 23 | Why Choose list | A tooth emoji before each item | Orange dot | Main site's chip language |
| 24 | Get Direction links | "Get Direction ➤" | "Get Direction" | Arrow dropped |
| 25 | Clinic details | Address lines laid out separately | One address line | Same words, joined |
| 26 | Form heading and intro | "Book your Slot" only | Adds "Tell us what you need and we will call you back." | Main site's form |
| 27 | Form labels and placeholder | Placeholders such as "Enter Name *" | "Full name", "Mobile number", "10-digit mobile", "Email", "Preferred date", "Message", "(optional)" | Main site's form; visible labels are an accessibility requirement |
| 28 | Required fields | Email and date required | Only name, mobile and consent required | Approved with the design direction |
| 29 | Consent line | None | "I agree to Petals Health storing these details to contact me about this request." | Main site's form |
| 30 | Form messages | None | Validation errors and the send-failure message | Main site's handler, lightly reworded |
| 31 | Hero call button | "Call +91 91474 05960" | "Call +91 91477 69585" | Main site's button pattern, the client's new number |
| 32 | Image alt text | Empty | "A young man laughing" and "A smiling patient in the dental chair with a dentist beside her" | Main site's Dentistry page, which also supplies both images |
| 33 | Legal link | None | A privacy link beside the copyright line | Interface text |

## Privacy notice: differences from the main site's interim copy

Source: `petals-web/app/public/privacy-policy.html`. The main site's file was not changed, so it still lacks all of this.

| # | Change | Why |
|---|---|---|
| 34 | "What we collect" now covers attribution: arrival page, referrer, UTM tags, gclid, fbclid, device type, screen size, reference number; drops gender, age and doctor | Matches what this page sends; it has no such fields |
| 35 | "Where it goes" now covers Plan D Media's copy of each lead, Google's services and who can open the sheet | Requested 2026-11-04. The old wording was false for this page |
| 36 | New section on advertising and measurement tags | Requested 2026-11-04. Assumes no tag reads the form; see the README |
| 37 | New paragraphs on campaign details and failed sends kept in the browser | Requested 2026-11-04. Worded to the real behaviour: the 7-day deletion runs only when the page is next opened |
| 38 | Withdrawal email set to info@petalshealth.in, the address on the client's consent form; "draft" pill removed | The placeholder could not launch. The opening paragraph still says it is interim |
| 38a | New section on maps and directions | Google loads only if the visitor opens a map or follows Get Direction, added with the click-to-load map |
| 39 | "Home" link became "Back to Petals Health Dental Clinic"; added noindex; relative paths; 44 px link bar; focus rings; last updated 4 November 2026 | Hosted with this page, and its accessibility standard |

## Revision round 1 (2026-11-16): the client's brief

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| 40 | Phone, everywhere | 9147405955 | +91 91477 69585 | Client's brief. Open conflict for the client doc: the main site's Diagnostic Services page shows 1800 1205 1600 and 9147405960; its dental pages still show the old number |
| 41 | Name, everywhere | "Petals Dental" | "Petals Health Dental Clinic"; "Petals Health" alone mid-sentence | Client's brief. Title and description, sharing tags and schema were added at the same time; the page had no description, OG tags or schema before |
| 42 | Why Choose | Five bullets, including the 3D imaging line | Six tiles with a numeral, a label and one supporting line: skilled dentists (BDS, Mon to Sat, from the client's doctor list), dental X-ray on site, autoclave sterilisation, sterile hospital-grade environment, no hidden charges, patient-first | Client's written statement: normal dental X-ray, autoclave, sterile hospital-grade environment; no intraoral scanning or 3D imaging. Supporting lines are the client's own sentences where one exists. "No hidden charges" kept at the client's words and flagged |
| 43 | Treatment cards | Two uneven lines each | One line naming the situation, one on what the treatment does, the same length on every card | Client's brief. Facts from the client's General and Cosmetic pages: plaque, tartar and stains; infected pulp, aimed at relieving pain and saving the tooth; crowns rebuild, bridges and implants fill the gap; a complete plan for complex conditions; aligners without brackets or wires; veneers, bonding and whitening for chips, gaps and discolouration. "Hard to notice" is the client's "discreet" |
| 44 | Booking prompt line | "Whether it's been months… take the first step toward better oral care." | "Fill in the form and we'll call you back to fix a time at whichever of our three Kolkata dental clinics suits you. Or just call. Teeth don't get better on their own." | Client called it AI-written. "We will call you back" is the form's own promise; "teeth don't get better on their own" is the cavity FAQ |
| 45 | FAQ | Five questions from the sources | Eleven, phrased as searched: cost, pain, visits, emergency, timings, location, X-ray safety, root canal signs, bleeding gums, cavity, check-up frequency. First sentence answers outright. FAQPage schema matches word for word | Client's brief. No prices, durations, visit counts or same-day promise: the client has not confirmed any, so those answers describe the staged process, the hours and what to do, and the gaps are on the client list |
| 46 | Clinic cards | X-rays; sterile environment | X-rays; autoclave sterilisation; sterile environment | The client's statement, in the client's words |
| 47 | Cards and tiles, design | Flat cards with a hover lift; bulleted list | Cards with an accent bar and an outlined Book Consultation button that fills on hover; tiles for Why Choose. Hover effects only under `(hover: hover) and (pointer: fine)`; nothing is hover-only | Client's brief. Equal heights come from the grid; the link is pinned with margin-top: auto |

## Revision round 2 (2026-11-25): the client's final round before handover

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| 48 | Duplicate section | Two sections made the same three points: "A Clinic Built Around Your Comfort & Safety" (examinations and X-rays, autoclave, sterile hospital-grade environment) and Why Choose tiles 02, 03, 04 | The "A Clinic Built Around..." section and its heading are deleted. The numbered Why Choose tiles are the one place those points are made | Client: "same content repeat". He objected to the earlier bullet list, not to the numbered cards, so the card layout stays |
| 49 | Why Choose card 01 | "Skilled dentists" / "BDS-qualified dentists in clinic Monday to Saturday." | "Experienced BDS and MDS dentists, with specialists for different treatments." / "A dentist is in from 10:00 AM to 7:30 PM." | The label is the client's exact replacement wording. The supporting line is the dentist hours he gave, and no longer contradicts the new timings |
| 50 | Why Choose card 04 (was 05) | "Affordable treatment packages with no hidden charges" / "Costs are discussed at your consultation, before any treatment starts." | "Costs explained before treatment starts" / "Costs are discussed at the consultation, before any treatment begins." | The client's own instruction: publish starting-from prices or reword. There are no prices, so it is reworded in his words. "Affordable", "packages" and "no hidden charges" are now in the launch check's held list and appear nowhere, meta included |
| 51 | Why Choose card 04, old | "Sterile, hospital-grade environment" / "Internationally trusted and ethical dental protocols." | Folded into card 03: "Autoclave sterilisation, in a sterile hospital-grade environment" / "Instruments are sterilised in an autoclave before they're used again." | "Internationally trusted and ethical dental protocols" is vague, unsourced and does not explain sterility. The client has confirmed only the autoclave, the X-ray and the sterile environment. Single-use items were NOT confirmed, so nothing was invented in its place; with nothing concrete left to say, the card was folded rather than kept |
| 52 | Inline CTAs | Three Book Consultation / Call us pairs: Why Choose, the deleted clinic section, the booking prompt | One, in the booking prompt | Client circled two consecutive pairs. Deleting the duplicate section removed one; the Why Choose pair was removed because it sat immediately before the booking prompt's. The sticky rail and floating call button are unchanged and are not counted |
| 53 | Hours, everywhere | Monday to Saturday, 7:30 AM to 7:30 PM (and 07:30 AM - 07:30 PM in the Loudon Street block); schema 07:30-19:30 | Clinic Monday to Saturday 8:00 AM to 8:00 PM, Sunday 8:00 AM to 2:00 PM (half day); a dentist is in from 10:00 AM to 7:30 PM. Set once in CONFIG.HOURS_* and checked everywhere | Client's final word for this LP. Sunday is a half day, not closed, which also clears the "Sunday hours" hold. Replaced in: meta description, og:description, schema opening hours, three FAQ answers, Why Choose card 01, all three clinic cards |
| 54 | Hours conflict | n/a | Logged, not fixed | The main site's Loudon Street / Calcutta Medical Centre block still states Monday to Saturday 07:30 AM - 07:30 PM. Whether the new hours apply to all three clinics is unconfirmed, and the timings FAQ says "all three Kolkata clinics". Both are in HANDOVER.md |
| 55 | "Center" | "Calcutta Medical Center" in the clinic card, the location FAQ, the schema address, the map title and the map alt text | "Calcutta Medical Centre" throughout | Client's instruction. Flagged in HANDOVER.md: if their Google Business Profile, signage or registration uses "Center", changing it only here creates a NAP mismatch |
| 56 | New section | None | "Meet Your Dentists", an inert template built from assets/js/dentists.js, placed after the treatments section and before the FAQ | Client asked for it. The data file is empty, so the section does not exist on the page; the launch check fails while it is empty. "Reg. no." is interface text, the only wording not from a source |
| 57 | New section | None | A Google reviews block: a link to the clinic's own Google Business Profile, behind its own flag, off | Offered to the client as the option most likely to be permissible, because it reproduces no review text and no rating. The same adviser sign-off still applies; the NDC advisory of 14 Oct 2026 covers a dentist publishing testimonials |
| 58 | Before and after, testimonials | Built, flagged off | Unchanged: built, flagged off, no images or quotes in the code, the four unverified images still outside the deploy folder | The client asked for both directly and wrote "only with written patient consent". Consent addresses the patient's privacy; it does not answer the advisory, and the risk sits with his registered dentist. Position unchanged |
| 59 | FAQ | Eleven questions | Twelve visible, plus five that render nothing until the client answers | See 60-67. FAQPage JSON-LD regenerated from the page by tools/regen-faq-schema.mjs |
| 60 | FAQ, cost | "To book one, fill in the form or call..." | "To book a consultation, fill in the form or call..." | Client's edit. Payment options were NOT added: he wrote "UPI, cards, EMI (?)" and the question mark is his |
| 61 | FAQ, visits | The staged plan only | Opens with his examples as rough guides: check-up usually one visit, root canal usually two to three, crown about two, clear aligners or braces counted in months rather than visits. Closes "your dentist will confirm after examining you" | Client's content. Written as guides, not promises. No durations: he gave none |
| 62 | FAQ, emergency | "Call us and say it's urgent" plus the old hours | His content: the clinic and dentist hours; out of hours, the nearest hospital emergency department; toothache, swelling or a broken tooth to be seen rather than waited out; a knocked-out tooth held by the crown, kept in milk, seen within an hour; and, set apart in .faq__urgent, spreading facial or neck swelling or trouble breathing or swallowing to go straight to a hospital emergency department | Client's content. The last point is visually distinct because it is the one that matters clinically. No 24/7 or round-the-clock cover was claimed before and none is now; both phrases are in the held list |
| 63 | FAQ, timings | "That's twelve hours a day, so an early-morning or after-work appointment is possible." | The new clinic and dentist hours, and "so a treatment appointment is booked inside those hours" | The old line implied an 8 AM appointment, which the dentist's 10:00 AM start contradicts. Public holidays: nothing said, as he gave no answer |
| 64 | FAQ, root canal signs | "Persistent tooth pain, sensitivity to hot or cold, swelling, or a pimple on the gums" | Adds pain when biting, pain that lingers after something hot or cold, a tooth that is darkening and a bad taste; "pimple on the gums" became "small pimple-like bump on the gum"; closes on its own line with "Not every toothache needs a root canal. Only an examination and X-ray can confirm." | Client's content and wording. The old closing CTA "Book a consultation before it gets worse" was dropped so the clinical caveat lands last |
| 65 | FAQ, bleeding gums | "treats early-stage gum disease with scaling and root planing, and advanced cases with deep cleaning" | His rewrite, substantially as written: don't stop brushing; brush gently and floss daily; if bleeding lasts more than a week, book a check-up; early gum disease treated with scaling, advanced cases may need deeper treatment under the dentist's guidance | He is the clinical source, so his wording and sequence are kept. Edited only for rhythm |
| 66 | FAQ, check-ups | Six months, and what a check-up includes | Adds "Your dentist may suggest a different interval based on your needs." | Client's edit |
| 67 | FAQ, new | None | "What happens at my first visit?", written from what we know: examination, the dentist talking you through what they find, the cost explained before any treatment begins, an X-ray if one is needed | The only new question we could answer without new facts. Four others are built as entries that render nothing: children, insurance/cashless, walk-in or appointment, payment methods, public holidays |
| 68 | Hero subline | "Skilled Hands. Caring Approach." | Unchanged, and flagged | It is the same generic phrasing he objected to in card 01, but he did not ask for it to change and supplied no replacement. Flagged in HANDOVER.md and by the launch check rather than rewritten on our own initiative |

## Revision round 3 (2026-11-25, same day): emergency FAQ correction, two blockers answered

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| 69 | FAQ, emergency | One paragraph: call and say it is urgent, the hours, then "If you call outside our hours with an emergency, go to the nearest hospital emergency department." | Three paragraphs in the client's order: call +91 91477 69585 and say it is urgent; the clinic hours, the dentist hours and the public-holiday closure; then "If you call outside these hours or on a public holiday, we will direct you to the nearest hospital emergency department." The bullets and the `.faq__urgent` line are unchanged | The concept was wrong, not the wording. The old sentence read as "we are closed, do not call us". The client's position is the opposite: the call IS answered, and whoever answers directs the caller. "our hours" also became "these hours", because the hours are now in the sentence before it rather than three clauses back |
| 70 | FAQ, emergency and timings | Nothing about public holidays | "We are closed on public holidays." in both | The client answered the blocker: closed. It is the hours fact set, so the wording is set once in `CONFIG.HOURS_HOLIDAYS` and the launch check fails if it leaves the page, exactly like the other three hours strings |
| 71 | FAQ, public holidays | A `CONFIG.BLOCKED_FAQS` entry that rendered nothing | A visible entry after the timings question: closed on public holidays, the clinic and dentist hours, and, for an emergency on a holiday, call and we will direct you to the nearest hospital emergency department. Written into `index.html`, removed from `CONFIG.BLOCKED_FAQS` | Answered by the client. Static markup rather than the JS entry, so a crawler that does not run JavaScript sees it; the schema was regenerated in the same pass |
| 72 | FAQ, children | A `CONFIG.BLOCKED_FAQS` entry that rendered nothing | A visible entry after the first-visit question: yes, paediatric dentistry is part of the regular practice, then how to book. Written into `index.html`, removed from `CONFIG.BLOCKED_FAQS` | Answered by the client: paediatric dentistry is available and actively running. Deliberately short. No age range, no named dentist and no claim about the child's experience: none of that is confirmed |
| 73 | Treatments grid | Six cards; children's dentistry nowhere on the page | A seventh card, "Children's Dentistry": "A child's first check-up, or a milk tooth that is hurting them." / "Paediatric dentistry is part of our regular practice, so a child's teeth are examined and treated at the same clinics." | The client confirmed it as a running service and it was missing from the only place a parent would look. Same shape and length as the other six. The clinical term is in the body because that is what parents search; the plain term is the heading because it reads alongside the other six. No claim about comfort, fear, painlessness or outcomes |
| 74 | Launch check, held wording | "Paediatric" was in the held list, so it could not appear on the page | Removed from the held list; the "Paediatric Dentistry" and "Public holidays" entries removed from HOLDS | Both were held for want of confirmation, and the client has now confirmed both. The hold on Sedation, Invisalign and the rest is unchanged |
| 75 | Treatments grid, last row | Six cards divided evenly at every width | Seven cards leave one alone on the last row (2+2+2+1 at 768, 3+3+1 at 1024 and above). The lone card is now centred | Left as it was, two thirds of the last row was empty and it read as an unfinished grid rather than the end of the set. The rule is `:last-child:nth-child(3n + 1)`, so it cancels itself at any count that fills its last row: an eighth card needs no CSS change |
| 76 | Why Choose list, last row | Five tiles in two columns: 2+2+1, the fifth alone with an empty cell beside it | The fifth tile spans both columns | It is a two-column list, not the three-column grid it was taken for: one column from 768 to 1199 (beside the photo), two at 600-767 and at 1200 and above. A full-width closing tile ends the list deliberately, and "Patient-First, Always" now fits its supporting line on one line. Self-cancelling: with an even number of tiles the last one is not an odd child |
| 77 | Public holidays, structured data | n/a | Not marked up; logged for the client | Schema.org expresses a closed day only as a `specialOpeningHoursSpecification` with `validFrom` and `validThrough` dates. There is no "closed on public holidays" value, so it needs the client's list of dates, refreshed yearly. The visible text answers the question regardless |
