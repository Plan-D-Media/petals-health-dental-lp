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
