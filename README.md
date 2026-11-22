# Closing with Daniel — DSCR & Investor Lending site

A hand-built, static 6-page website. There's no CMS and no build tooling to install. Upload the folder to any host (Netlify, Vercel, Cloudflare Pages, cPanel) and it works.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home: cut-out hero with mouse parallax and floating cards, stacking "sound familiar" cards, results bento with progress rings, deal analyzer, image bento, meet-Daniel bento, orbit diagram, pinned horizontal process, before/after case study, Loan Fit Finder quiz, FAQ, CTA |
| `dscr-loans.html` | DSCR deep-dive: calculator, 4-step process, docs needed vs. not needed, good/tough fit, full FAQ |
| `loan-programs.html` | All 20 programs, with filters |
| `about.html` | Daniel's story, team (Daniel, Olivia, Matt), principles |
| `learn.html` | Daniel's DSCR article as an editorial long-read, with a sticky table of contents and reading progress bar |
| `contact.html` | 3-step deal intake form (pre-fills from the calculator), contact cards, map |

## Editing
* **Page content:** edit `_src/pages/<page>.html`.
* **Shared header, menu, footer, phone, email, NMLS, SEO titles:** edit `_src/build.py`.
* **FAQ (used on home + DSCR page, and as Google FAQ schema):** edit `_src/pages/dscr-faq.json`.
* **Calculator / Fit Finder markup:** `_src/pages/_calc.html` and `_src/pages/_quiz.html`. Their logic (including the quiz recommendation rules) is in `assets/js/main.js`.
* Rebuild after any edit:
  ```bash
  python3 _src/build.py
  ```
* **Design tokens (colors, fonts, spacing):** at the top of `assets/css/style.css`.

## Before going live
1. **Connect the form.** `contact.html` shows a success state but doesn't send anything yet. In `assets/js/main.js`, find the comment `Hook point:` and POST `new FormData(form)` to your CRM or form service (Formspree, HubSpot, GoHighLevel, etc.).
2. **Consult booking.** "Request a time" opens an email. Replace it with a Calendly or other booking link if Daniel uses one.
3. **Google reviews.** The button links to a Google search. Swap in the direct Google Business Profile reviews URL.
4. **Canonical URLs** assume `https://www.closingwithdaniel.com`. Change `SITE["url"]` in `build.py` if needed.
5. Have Daniel / NEXA compliance review the disclaimers and claims.

## Tech
* GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13 for motion and smooth scroll, self-hosted in `assets/vendor/`.
* Fonts are self-hosted in `assets/fonts/` (Bricolage Grotesque, Instrument Serif, Inter Tight, JetBrains Mono), so there are no Google Fonts requests.
* Everything stays readable without JavaScript. Animations are turned off for visitors who prefer reduced motion.
* Structured data: FinancialService (home, about, contact), FAQPage (DSCR), Article (learn).
* Breakpoints: 1180 / 1024 / 760 / 420px. Phones get a sticky Call / Run my deal bar.

`assets/img/logo.webp` is Daniel's original logo. The site doesn't use it; it's kept for reference.

Property photos (`assets/img/p-*.webp`) are from Unsplash (free to use under the Unsplash License). `daniel-cutout.webp` is a background-removed version of Daniel's own headshot.
