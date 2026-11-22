#!/usr/bin/env python3
"""Static site builder for Closing with Daniel.

Each page body lives in _src/pages/<name>.html. Shared chrome (head, header,
menu, footer) and shared snippets live here, so a phone number or nav change
is a one-line edit.
Run:  python3 _src/build.py   -> writes ../<name>.html
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES_DIR = ROOT / "_src" / "pages"

SITE = {
    "name": "Closing with Daniel",
    "url": "https://www.closingwithdaniel.com",
    "phone": "(812) 406-3712",
    "phone_href": "tel:+18124063712",
    "email": "dstephens@nexamortgage.com",
    "nmls": "2006359",
    "street": "222 Pearl St, Suite 104",
    "city": "New Albany, IN 47150",
}

NAV = [
    ("index.html", "Home", "Home"),
    ("dscr-loans.html", "DSCR Loans", "DSCR <em>Loans</em>"),
    ("loan-programs.html", "Programs", "Loan <em>Programs</em>"),
    ("about.html", "About", "About <em>Daniel</em>"),
    ("learn.html", "Learn", "The <em>Playbook</em>"),
    ("contact.html", "Contact", "Run my <em>deal</em>"),
]

PAGES = {
    "index": {
        "title": "Closing with Daniel | DSCR Loans for Indiana & Kentucky Investors",
        "desc": "DSCR and investor mortgage loans across Indiana and Kentucky. Qualify on the property's rent, not your tax returns. 250+ lenders, 17-day average close. NMLS #2006359.",
    },
    "dscr-loans": {
        "title": "DSCR Loans in Indiana & Kentucky | Closing with Daniel",
        "desc": "How DSCR loans work, what you need, and a live calculator to test your deal. Single-family, 2–4 units, short-term rentals, cash-out refinance.",
    },
    "loan-programs": {
        "title": "Loan Programs | Closing with Daniel",
        "desc": "Twenty loan programs for buyers, investors and homeowners in Indiana and Kentucky: DSCR, Non-QM, bank statement, FHA, VA, USDA, Jumbo, HELOC and more.",
    },
    "about": {
        "title": "About Daniel Stephens | Closing with Daniel, New Albany IN",
        "desc": "Meet Daniel Stephens (NMLS #2006359) and the Closing with Daniel team, a New Albany mortgage team serving Louisville and Southern Indiana.",
    },
    "learn": {
        "title": "What Is a DSCR Loan? The Investor Playbook | Closing with Daniel",
        "desc": "A plain-English guide to DSCR loans: the formula, property types, when they work, and a real deal that closed using AirDNA short-term rental data.",
    },
    "contact": {
        "title": "Run My Deal | Contact Closing with Daniel",
        "desc": "Send Daniel your deal for a no-obligation DSCR breakdown, or book a free 15-minute consultation. New Albany, IN · (812) 406-3712.",
    },
}

# ---------- icons & shared snippets ----------
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
ARROW_UR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>'
STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5 6 20.8l1.3-6.7-5-4.6 6.8-.8z"/></svg>'
SPARK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>'
MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 6L2 7"/></svg>'
PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>'
SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
EHL = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 14L16 4l13 10"/><path d="M6 12v15h20V12"/><path d="M11 17h10M11 21h10"/></svg>'

# rotating text ring (for spinning badges)
def ring_text(text, rid):
    return (f'<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="{rid}" d="M60,60 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/></defs>'
            f'<text font-family="Inter Tight, sans-serif" font-weight="600" font-size="9" fill="currentColor"><textPath href="#{rid}" textLength="312" lengthAdjust="spacing">{text}</textPath></text></svg>')

# decorative concentric arcs behind hero portrait
ARCS = '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width=".18" aria-hidden="true"><circle cx="50" cy="50" r="49"/><circle cx="50" cy="50" r="40" stroke-dasharray=".6 1.2"/><circle cx="50" cy="50" r="31"/><path d="M1 50h98M50 1v98" stroke-dasharray=".4 1.6" opacity=".6"/></svg>'

# line-art house for CTA panels (draws on scroll)
HOUSE_ART = '''<svg viewBox="0 0 400 300" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 290h360"/><path d="M60 290V150l110-90 110 90v140"/><path d="M40 166L170 58l130 108"/><path d="M230 98V52h28v68"/><path d="M140 290v-80h60v80"/><path d="M188 252h4"/><path d="M84 180h40v40H84zM104 180v40M84 200h40"/><path d="M216 180h40v40h-40zM236 180v40M216 200h40"/><path d="M150 120a20 20 0 0140 0v20h-40z"/><path d="M300 290v-60c0-20 30-20 30 0v60M315 232v58"/><path d="M330 250c18-6 30 4 30 18M340 290c0-24 30-30 40-14"/></svg>'''

PRELOADER = """<div class="preloader" aria-hidden="true">
  <div class="preloader__inner">
    <div class="preloader__mark">d</div>
    <div class="preloader__word">Let the property qualify itself.</div>
    <div class="preloader__bar"><i></i></div>
    <div class="preloader__count"><span>000</span></div>
  </div>
</div>
<div class="curtain" aria-hidden="true"><span>Closing with Daniel</span></div>
"""

HEAD = """<!doctype html>
<html lang="en" class="anim">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#2c1233">
<link rel="canonical" href="{url}/{file}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/daniel.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23d9b56b'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='34' fill='%231e0f24'%3Ed%3C/text%3E%3C/svg%3E">
<link rel="preload" href="assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css">
<script>
(function(d){{var h=d.documentElement;h.classList.add('js');
var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(r){{h.classList.add('reduced');h.classList.remove('anim');}}
try{{if(sessionStorage.getItem('cwd-visited'))h.classList.add('no-preload');else sessionStorage.setItem('cwd-visited','1');if(sessionStorage.getItem('cwd-nav'))h.classList.add('curtain-in');}}catch(e){{h.classList.add('no-preload');}}
setTimeout(function(){{if(!window.__animReady){{h.classList.remove('anim','curtain-in');var p=d.querySelector('.preloader');if(p)p.remove();}}}},3500);
}})(document);
</script>
{schema}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""


def header(active):
    cur = ' aria-current="page"'
    links = "".join(
        f'<a href="{f}"{cur if f == active else ""}>{label}</a>' for f, label, _ in NAV
    )
    menu = "".join(
        f'<li><a href="{f}"><span class="n">0{i+1}</span><span>{big}</span></a></li>'
        for i, (f, _, big) in enumerate(NAV)
    )
    return f"""<header class="header">
  <div class="header__bar">
    <a class="brand" href="index.html" aria-label="Closing with Daniel, home">
      <span class="brand__mark" aria-hidden="true">d</span>
      <span class="brand__text"><span class="brand__name">Closing with <em>Daniel</em></span><span class="brand__sub">DSCR &amp; investor lending</span></span>
    </a>
    <nav class="nav" aria-label="Primary">{links}</nav>
    <div class="header__cta">
      <a class="header__phone" href="{SITE['phone_href']}" aria-label="Call {SITE['phone']}">{PHONE}<span>{SITE['phone']}</span></a>
      <a class="btn btn--sm" href="contact.html" data-magnetic>Run my deal <span class="ic">{ARROW}</span></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="site-menu"><span class="menu-btn__lines" aria-hidden="true"></span><span class="menu-btn__label">Menu</span></button>
    </div>
  </div>
</header>
<div class="menu" id="site-menu" aria-hidden="true">
  <div class="container menu__inner">
    <ul class="menu__list">{menu}</ul>
    <div class="menu__aside">
      <div class="menu__card">
        <span class="eyebrow">Free · 15 minutes</span>
        <p class="h4">Not sure where to start? Talk it through with Daniel before anything official.</p>
        <a class="btn btn--sm" href="contact.html#consult">Book a consult <span class="ic">{ARROW}</span></a>
      </div>
      <div class="menu__meta">
        <a href="{SITE['phone_href']}">{SITE['phone']}</a>
        <a href="mailto:{SITE['email']}">{SITE['email']}</a>
        <span>{SITE['street']}, {SITE['city']}</span>
      </div>
    </div>
  </div>
</div>
"""


FOOTER = f"""<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="brand" href="index.html"><span class="brand__mark" aria-hidden="true">d</span><span class="brand__text"><span class="brand__name">Closing with <em>Daniel</em></span><span class="brand__sub">DSCR &amp; investor lending</span></span></a>
        <p>DSCR and investor mortgage lending for Indiana and Kentucky. If the property cash flows, there's usually a way.</p>
        <div class="footer__badges"><span>{SHIELD}NMLS #{SITE['nmls']}</span><span>{SHIELD}NEXA Lending · NMLS #1660690</span><span>{EHL}Equal Housing</span></div>
        <a class="btn" href="contact.html" data-magnetic>Send Daniel your deal <span class="ic">{ARROW}</span></a>
      </div>
      <div class="footer__cols">
        <div class="fcol"><h4>Lending</h4><ul>
          <li><a href="dscr-loans.html">DSCR loans</a></li>
          <li><a href="dscr-loans.html#calculator">DSCR calculator</a></li>
          <li><a href="loan-programs.html">All 20 programs</a></li>
          <li><a href="index.html#fit-finder">Loan Fit Finder</a></li>
        </ul></div>
        <div class="fcol"><h4>Explore</h4><ul>
          <li><a href="about.html">About Daniel</a></li>
          <li><a href="learn.html">The DSCR playbook</a></li>
          <li><a href="contact.html">Run my deal</a></li>
          <li><a href="contact.html#consult">Free 15-min consult</a></li>
        </ul></div>
        <div class="fcol"><h4>Connect</h4><ul>
          <li><a href="{SITE['phone_href']}">{SITE['phone']}</a></li>
          <li><a href="mailto:{SITE['email']}">Email Daniel</a></li>
          <li><address>{SITE['street']}<br>{SITE['city']}</address></li>
        </ul></div>
      </div>
    </div>
    <div class="footer__word" aria-hidden="true">Closing <em>with</em> Daniel</div>
    <div class="footer__legal">
      <p>Daniel Stephens, Mortgage Loan Officer, NMLS #{SITE['nmls']}. NEXA Lending, 5559 S Sossaman Rd, Bldg 1, Ste 101, Mesa, AZ 85212. Company NMLS #1660690. <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener">NMLS Consumer Access</a>. Equal Housing Opportunity. This is not a commitment to lend. Programs, rates, terms and conditions are subject to change without notice and subject to borrower and property qualification. Calculator and Fit Finder results are estimates for illustration only.</p>
      <p class="r"><span>© <span data-year>2026</span> Closing with Daniel</span><a href="#main" data-top>Back to top ↑</a></p>
    </div>
  </div>
</footer>
<button class="to-top" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
<nav class="mbar" aria-label="Quick actions"><a href="{SITE['phone_href']}">Call Daniel</a><a href="contact.html">Run my deal</a></nav>
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
"""


def schema_for(name):
    blocks = []
    if name in ("index", "contact", "about"):
        blocks.append({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": SITE["name"],
            "url": SITE["url"],
            "telephone": "+1-812-406-3712",
            "email": SITE["email"],
            "image": SITE["url"] + "/assets/img/daniel.jpg",
            "address": {"@type": "PostalAddress", "streetAddress": "222 Pearl St Suite 104", "addressLocality": "New Albany", "addressRegion": "IN", "postalCode": "47150", "addressCountry": "US"},
            "areaServed": [{"@type": "State", "name": "Indiana"}, {"@type": "State", "name": "Kentucky"}],
            "employee": {"@type": "Person", "name": "Daniel Stephens", "jobTitle": "Mortgage Loan Officer", "identifier": "NMLS #2006359"},
        })
    if name == "dscr-loans":
        faq = json.loads((PAGES_DIR / "dscr-faq.json").read_text())
        blocks.append({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq],
        })
    if name == "learn":
        blocks.append({
            "@context": "https://schema.org", "@type": "Article",
            "headline": "What Is a DSCR Loan? A Smarter Way for Real Estate Investors to Qualify",
            "author": {"@type": "Person", "name": "Daniel Stephens"}, "datePublished": "2026-04-20",
        })
    return "\n".join(f'<script type="application/ld+json">{json.dumps(b)}</script>' for b in blocks)


def faq_html(items):
    out = ['<div class="faq">']
    for q, a in items:
        out.append(f'<details data-reveal><summary>{q}<span class="pm" aria-hidden="true"></span></summary><div class="ans"><p>{a}</p></div></details>')
    out.append("</div>")
    return "".join(out)


def render(body, faq):
    for part in ("calc", "quiz"):
        p = PAGES_DIR / f"_{part}.html"
        if p.exists():
            body = body.replace("{{" + part + "}}", p.read_text())
    rep = {
        "{{arrow}}": ARROW, "{{arrow_ur}}": ARROW_UR, "{{star}}": STAR, "{{spark}}": SPARK,
        "{{stars5}}": STAR * 5, "{{phone_ic}}": PHONE, "{{mail_ic}}": MAIL, "{{pin_ic}}": PIN,
        "{{shield}}": SHIELD, "{{arcs}}": ARCS, "{{house_art}}": HOUSE_ART,
        "{{ring_lenders}}": ring_text("250+ LENDERS ✦ ONE CALL ✦ IN · KY ✦ ", "rl"),
        "{{ring_nmls}}": ring_text(f"CLOSING WITH DANIEL ✦ NMLS {SITE['nmls']} ✦ ", "rn"),
        "{{faq}}": faq_html(faq), "{{faq_short}}": faq_html(faq[:5]),
        "{{phone}}": SITE["phone"], "{{phone_href}}": SITE["phone_href"], "{{email}}": SITE["email"],
    }
    for k, v in rep.items():
        body = body.replace(k, v)
    return body


def build():
    faq = json.loads((PAGES_DIR / "dscr-faq.json").read_text())
    for name, meta in PAGES.items():
        file = f"{name}.html"
        src = PAGES_DIR / file
        if not src.exists():
            continue
        body = render(src.read_text(), faq)
        html = (HEAD.format(title=meta["title"], desc=meta["desc"], url=SITE["url"], file="" if name == "index" else file, schema=schema_for(name))
                + PRELOADER + header(file) + '<main id="main">\n' + body + "\n</main>\n" + FOOTER)
        (ROOT / file).write_text(html)
        print("built", file)


if __name__ == "__main__":
    build()
