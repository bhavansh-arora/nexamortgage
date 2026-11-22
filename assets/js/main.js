/* Closing with Daniel — interactions v2
   Progressive enhancement: everything works (and is readable) without GSAP/Lenis. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduced = doc.classList.contains("reduced");
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
  var isDesktop = function () { return window.matchMedia("(min-width: 761px)").matches; };

  if (!hasGSAP || reduced) doc.classList.remove("anim");
  window.__animReady = true;

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  var scrollToEl = function (t) { if (lenis) lenis.scrollTo(t, { offset: -100 }); else (t.scrollIntoView ? t.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }) : window.scrollTo(0, 0)); };

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#main" && a.hasAttribute("data-top")) { e.preventDefault(); if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault(); scrollToEl(t);
    });
  });

  /* ---------- Preloader / curtain ---------- */
  var pre = $(".preloader");
  var showPre = pre && !doc.classList.contains("no-preload");
  var cameByNav = doc.classList.contains("curtain-in");

  if (showPre && hasGSAP && !reduced) {
    if (lenis) lenis.stop();
    var c = { v: 0 }, cEl = $(".preloader__count span", pre);
    gsap.timeline({ onComplete: function () { pre.remove(); if (lenis) lenis.start(); } })
      .from(".preloader__mark", { scale: 0, rotate: -90, duration: .9, ease: "back.out(1.7)" })
      .from(".preloader__word", { y: 20, opacity: 0, duration: .7, ease: "expo.out" }, "-=.4")
      .to(c, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: function () { cEl.textContent = String(Math.round(c.v)).padStart(3, "0"); } }, "-=.3")
      .to(".preloader__bar i", { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, "<")
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "+=.1")
      .add(pageIntro, "-=.55");
  } else {
    if (pre) pre.remove();
    if (cameByNav) {
      requestAnimationFrame(function () {
        var cu = $(".curtain");
        if (hasGSAP && cu && !reduced) {
          gsap.fromTo(cu, { yPercent: 0 }, { yPercent: -100, duration: .9, ease: "expo.inOut", delay: .05, onComplete: function () { doc.classList.remove("curtain-in"); gsap.set(cu, { clearProps: "all" }); } });
          setTimeout(pageIntro, 320);
        } else { doc.classList.remove("curtain-in"); pageIntro(); }
      });
    } else pageIntro();
  }
  store.del("cwd-nav");

  $$("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(mailto|tel|https?):/i.test(href) || a.hasAttribute("download")) return;
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || reduced) return;
      var here = location.pathname.split("/").pop() || "index.html";
      var target = href.split("#")[0];
      if (target === here && href.indexOf("#") > -1) { var t = $("#" + href.split("#")[1]); if (t) { e.preventDefault(); setMenu(false); scrollToEl(t); return; } }
      e.preventDefault();
      store.set("cwd-nav", "1");
      doc.classList.add("is-leaving");
      setTimeout(function () { window.location.href = href; }, 650);
    });
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) doc.classList.remove("is-leaving", "curtain-in"); });

  /* ---------- Rings ---------- */
  function setRing(el, instant) {
    var bar = $(".bar", el); if (!bar) return;
    var v = parseFloat(el.getAttribute("data-ring")), max = parseFloat(el.getAttribute("data-max") || "1");
    var L = parseFloat(bar.getAttribute("stroke-dasharray"));
    var target = L * (1 - Math.min(1, v / max));
    var valEl = $("[data-ring-val]", el);
    if (hasGSAP && !reduced && !instant) {
      var o = { p: 0 };
      gsap.to(o, { p: 1, duration: 2, ease: "expo.out", onUpdate: function () {
        bar.setAttribute("stroke-dashoffset", L - (L - target) * o.p);
        if (valEl) valEl.textContent = (v * o.p).toFixed(2);
      } });
    } else { bar.setAttribute("stroke-dashoffset", target); if (valEl) valEl.textContent = v.toFixed(2); }
  }

  /* ---------- Intro ---------- */
  function pageIntro() {
    if (!hasGSAP || reduced) {
      $$("[data-ring]").forEach(function (r) { setRing(r, true); });
      $$("[data-inview]").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var heroLines = $$(".hero .split .line > span, .phero .split .line > span");
    gsap.set(heroLines, { y: 0, yPercent: 115 });
    gsap.to(heroLines, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .1 });
    var heroReveal = $$(".hero [data-reveal], .phero [data-reveal]");
    gsap.to(heroReveal, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "expo.out", stagger: .07, delay: .3 });
    var fig = $(".hero__figure img");
    if (fig) gsap.from(fig, { yPercent: 18, duration: 1.8, ease: "expo.out", delay: .15 });
    $$(".hero [data-inview], .phero [data-inview], .hero, .phero").forEach(function (el) { setTimeout(function () { el.classList.add("is-in"); }, 500); });
    $$(".hero [data-ring], .phero [data-ring]").forEach(function (r) { setTimeout(function () { setRing(r); }, 700); });
    initScroll();
  }

  function initScroll() {
    // split headlines
    $$(".split").forEach(function (el) {
      if (el.closest(".hero, .phero")) return;
      var spans = $$(".line > span", el);
      gsap.set(spans, { y: 0, yPercent: 115 });
      gsap.to(spans, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    // batch reveals
    ScrollTrigger.batch($$("[data-reveal]").filter(function (el) { return !el.closest(".hero, .phero"); }), {
      start: "top 90%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: .08, overwrite: true }); }
    });
    // in-view class (CSS-driven swashes, line art)
    $$("[data-inview]").forEach(function (el) {
      if (el.closest(".hero, .phero") && el !== $(".hero") && el !== $(".phero")) return;
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: function () { el.classList.add("is-in"); } });
    });
    // rings
    $$("[data-ring]").forEach(function (r) {
      if (r.closest(".hero, .phero")) return;
      ScrollTrigger.create({ trigger: r, start: "top 85%", once: true, onEnter: function () { setRing(r); } });
    });
    // counters
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10), o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 95%" }, onUpdate: function () { el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString("en-US"); } });
    });
    // image parallax
    $$("[data-parallax]").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // stacking cards: each card shrinks back as the next one lands
    var cards = $$(".stack__card");
    cards.forEach(function (card, i) {
      var next = cards[i + 1]; if (!next) return;
      gsap.to(card, { scale: .92 + i * .015, ease: "none", scrollTrigger: { trigger: next, start: "top 92%", end: "top 30%", scrub: true } });
    });
    // panels ease in with a slight scale
    $$(".panel").forEach(function (p) {
      if (p.classList.contains("hero") || p.classList.contains("phero") || p.closest("[data-hs]")) return;
      gsap.fromTo(p, { scale: .965 }, { scale: 1, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "top 55%", scrub: true } });
    });
    // horizontal process (desktop pinned, mobile native swipe)
    var mm = gsap.matchMedia();
    mm.add("(min-width: 761px)", function () {
      $$("[data-hs]").forEach(function (sec) {
        var track = $(".hs__track", sec), bar = $(".hs__progress i", sec);
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
        gsap.to(track, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: sec, start: "top top+=" + (window.innerHeight * .08), end: function () { return "+=" + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (s) { if (bar) bar.style.transform = "scaleX(" + (.15 + s.progress * .85) + ")"; } } });
      });
    });
    // footer wordmark
    var fw = $(".footer__word");
    if (fw) gsap.from(fw, { yPercent: 60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: fw, start: "top 98%" } });
    var bm = $(".bands__bar i");
    if (bm) gsap.from(bm, { left: "0%", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: bm, start: "top 85%" } });
    initToc();
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    ScrollTrigger.refresh();
  }

  /* ---------- Hero mouse parallax ---------- */
  var heroEl = $(".hero");
  if (heroEl && hasGSAP && !reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var layers = $$("[data-depth]", heroEl).map(function (el) {
      return { d: parseFloat(el.getAttribute("data-depth")), x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }) };
    });
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) { l.x(nx * 40 * l.d); l.y(ny * 30 * l.d); });
    });
    heroEl.addEventListener("mouseleave", function () { layers.forEach(function (l) { l.x(0); l.y(0); }); });
  }

  /* ---------- Header / progress / to-top ---------- */
  var header = $(".header"), lastY = 0;
  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) {
      header.classList.toggle("is-scrolled", y > 40);
      if (!doc.classList.contains("menu-open")) header.classList.toggle("is-hidden", y > 500 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove("is-hidden");
    }
    var tt = $(".to-top"); if (tt) tt.classList.toggle("is-on", y > 900);
    var mb = $(".mbar"); if (mb) mb.classList.toggle("is-on", y > 600 && (window.innerHeight + y) < document.body.scrollHeight - 300);
    var pr = $(".progress"), art = $(".prose");
    if (pr && art) { var r = art.getBoundingClientRect(); pr.style.transform = "scaleX(" + Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight * .6))) + ")"; }
    lastY = y;
  };
  if (lenis) lenis.on("scroll", onScroll); else window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var toTop = $(".to-top");
  if (toTop) toTop.addEventListener("click", function () { if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Menu ---------- */
  var menuBtn = $(".menu-btn"), menu = $(".menu");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", open ? "true" : "false"); $(".menu-btn__label", menuBtn).textContent = open ? "Close" : "Menu"; }
    if (menu) menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (header) header.classList.remove("is-hidden");
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Cursor & magnetic ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    var cur = document.createElement("div"); cur.className = "cursor"; document.body.appendChild(cur);
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; cur.classList.add("is-on"); });
    document.addEventListener("mouseleave", function () { cur.classList.remove("is-on"); });
    (function loop() { cx += (mx - cx) * .2; cy += (my - cy) * .2; cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
    $$("a, button, summary, input[type=range], label.choice").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-hover"); });
    });
    $$("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) { var r = el.getBoundingClientRect(); el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * .25 + "px," + (e.clientY - r.top - r.height / 2) * .35 + "px)"; });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Orbit: cycle highlight ---------- */
  $$("[data-orbit]").forEach(function (o) {
    var nodes = $$(".orbit__node", o), i = 0, paused = false;
    nodes.forEach(function (n) { n.addEventListener("mouseenter", function () { paused = true; nodes.forEach(function (x) { x.classList.remove("is-on"); }); }); n.addEventListener("mouseleave", function () { paused = false; }); });
    if (reduced) return;
    setInterval(function () { if (paused) return; nodes.forEach(function (x, k) { x.classList.toggle("is-on", k === i); }); i = (i + 1) % nodes.length; }, 2200);
  });

  /* ---------- Compare toggle ---------- */
  $$("[data-compare]").forEach(function (box) {
    var btns = $$(".compare__toggle button", box), states = $$(".compare__state", box), auto;
    var show = function (k) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-c") === k ? "true" : "false"); });
      states.forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-state") === k); });
    };
    btns.forEach(function (b) { b.addEventListener("click", function () { clearInterval(auto); show(b.getAttribute("data-c")); }); });
    if (!reduced) {
      var cur = "ltr";
      auto = setInterval(function () { cur = cur === "ltr" ? "str" : "ltr"; show(cur); }, 3600);
    }
  });

  /* ---------- DSCR calculator ---------- */
  var calc = $("[data-calc]");
  if (calc) {
    var inputs = {}, mode = "ltr";
    $$("input[type=range]", calc).forEach(function (i) { inputs[i.name] = i; });
    var fmt = { price: money, rent: money, tax: money, ins: money, hoa: money, down: function (v) { return v + "%"; }, rate: function (v) { return parseFloat(v).toFixed(2) + "%"; } };
    var paint = function (i) {
      i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min) * 100) + "%");
      var o = $('output[for="' + i.id + '"]', calc); if (o) o.textContent = fmt[i.name] ? fmt[i.name](parseFloat(i.value)) : i.value;
    };
    var compute = function () {
      var price = +inputs.price.value, down = +inputs.down.value / 100, rate = +inputs.rate.value / 100 / 12, n = 360, loan = price * (1 - down);
      var pi = rate ? loan * rate / (1 - Math.pow(1 + rate, -n)) : loan / n;
      var tax = +inputs.tax.value / 12, ins = +inputs.ins.value / 12, hoa = +inputs.hoa.value, rent = +inputs.rent.value;
      var pitia = pi + tax + ins + hoa, dscr = rent / pitia, cf = rent - pitia;
      var set = function (k, v) { var el = $('[data-out="' + k + '"]', calc); if (el) el.textContent = v; };
      set("loan", money(loan)); set("pi", money(pi)); set("ti", money(tax + ins + hoa)); set("pitia", money(pitia)); set("rent", money(rent)); set("dscr", dscr.toFixed(2));
      var cfEl = $('[data-out="cf"]', calc); if (cfEl) { cfEl.textContent = (cf >= 0 ? "+" : "−") + money(Math.abs(cf)) + "/mo"; cfEl.className = cf >= 0 ? "pos" : "neg"; }
      var m = $(".meter i", calc); if (m) m.style.left = (Math.max(0, Math.min(1, (dscr - .5) / 1.25)) * 100) + "%";
      var v = $(".verdict", calc), msg = $(".calc__msg", calc), tone, label, text;
      if (dscr >= 1.25) { tone = "good"; label = "Strong: lenders compete for this"; text = "Comfortably cash-flowing. This is where shopping 250+ lenders gets you the sharpest pricing."; }
      else if (dscr >= 1.0) { tone = "good"; label = "Approvable: rent covers the payment"; text = "Break-even or better. Most DSCR programs are comfortable here; structure and pricing make the difference."; }
      else if (dscr >= .75) { tone = "warn"; label = "Possible with select programs"; text = mode === "ltr" ? "Below 1.0 on long-term rent. Some lenders go lower, and short-term rental data (AirDNA) can change the picture." : "Below 1.0. Some programs still work here; down payment and rate structure are the levers."; }
      else { tone = "bad"; label = "Needs restructuring"; text = "On these numbers the property doesn't carry itself yet. More down, a different structure, or STR income may get it there."; }
      v.setAttribute("data-tone", tone); $("span", v).textContent = label; if (msg) msg.textContent = text;
      var send = $("[data-send]", calc);
      if (send) send.setAttribute("href", "contact.html?price=" + price + "&rent=" + rent + "&down=" + Math.round(down * 100) + "&dscr=" + dscr.toFixed(2) + "&type=" + mode);
    };
    Object.keys(inputs).forEach(function (k) { paint(inputs[k]); inputs[k].addEventListener("input", function () { paint(inputs[k]); compute(); }); });
    $$(".calc__mode button", calc).forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.getAttribute("data-mode") === mode) return;
        mode = b.getAttribute("data-mode");
        $$(".calc__mode button", calc).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var r = inputs.rent, lbl = $('label[for="' + r.id + '"]', calc);
        if (mode === "str") { if (lbl) lbl.textContent = "Projected STR income / mo (AirDNA)"; r.value = Math.round(+r.value * 1.45 / 25) * 25; }
        else { if (lbl) lbl.textContent = "Monthly rent (long-term lease)"; r.value = Math.round(+r.value / 1.45 / 25) * 25; }
        paint(r); compute();
      });
    });
    compute();
  }

  /* ---------- Loan Fit Finder ---------- */
  var quiz = $("[data-quiz]");
  if (quiz) {
    var qs = $$(".quiz__q", quiz), bars = $$(".quiz__bars i", quiz), res = $(".quiz__result", quiz), ans = {}, step = 0;
    var showQ = function (n) {
      step = n;
      qs.forEach(function (q, i) { q.classList.toggle("is-on", i === n); });
      bars.forEach(function (b, i) { b.classList.toggle("is-on", i <= n); });
      res.classList.remove("is-on");
    };
    var recommend = function () {
      var u = ans.use, inc = ans.income, cash = ans.cash, cnt = +ans.count;
      if (u === "flip") return { t: "Private | Hard <em>Money</em>", p: "DSCR is built for rentals you hold. For a flip, fast asset-based financing is usually the better tool.", l: ["Qualified on the asset and your plan", "Built for speed on time-sensitive deals", "Keeping it as a rental? Refinance into DSCR later"] };
      if (u === "home") {
        if (inc === "self" || inc === "writeoffs") return { t: "Self-Employed <em>Mortgage</em>", p: "Qualify using bank statements or other documentation instead of tax returns that understate your income.", l: ["12–24 months of bank statements, depending on program", "Built for business owners and 1099 earners", "Daniel compares it against conventional options"] };
        return { t: "Conventional, FHA <em>or VA</em>", p: "For a home you'll live in, owner-occupied programs usually beat investor pricing. Daniel will compare them side by side.", l: ["Conventional for solid credit and steady income", "FHA for flexible credit and down payment", "VA zero-down for eligible veterans"] };
      }
      if (u === "str") return { t: "DSCR · Short-term <em>rental</em>", p: "Qualify an Airbnb or VRBO property on its rental income, with no W-2s or tax returns.", l: ["Short-term rental income accepted by select lenders", "Some lenders qualify on AirDNA market projections", cash === "no" || cash === "even" ? "Tight on the numbers? Structure and lender choice can clear it" : "Strong cash flow opens up sharper pricing"] };
      if (inc === "w2" && cnt < 4 && cash !== "no") return { t: "Conventional <em>or</em> DSCR", p: "Your W-2 income may unlock conventional investor pricing. DSCR keeps your personal debt-to-income out of it. Compare both.", l: ["Daniel prices both side by side", "DSCR scales better as your portfolio grows", "Close in an LLC with many DSCR programs"] };
      var l = ["Qualifies on the property's rent, not your tax returns"];
      if (cnt >= 4) l.push("Each property stands on its own, so you can keep scaling");
      if (cash === "no") l.push("Short on long-term rent? STR data or a different structure may clear it");
      else l.push("Shop 1.0 and 1.25 minimum programs across 250+ lenders");
      l.push("Many programs let you close in an LLC");
      return { t: "DSCR <em>Loan</em>", p: "The property qualifies itself. Your write-offs stop working against you.", l: l };
    };
    $$(".quiz__opts button", quiz).forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.closest(".quiz__q"), key = q.getAttribute("data-q");
        $$("button", q).forEach(function (x) { x.classList.toggle("is-picked", x === b); });
        ans[key] = b.getAttribute("data-v");
        setTimeout(function () {
          if (step < qs.length - 1) { showQ(step + 1); return; }
          var r = recommend();
          qs.forEach(function (x) { x.classList.remove("is-on"); });
          $("[data-r-title]", res).innerHTML = r.t;
          $("[data-r-text]", res).textContent = r.p;
          $("[data-r-list]", res).innerHTML = r.l.map(function (x) { return "<li>" + x + "</li>"; }).join("");
          $("[data-r-link]", res).setAttribute("href", "contact.html?fit=" + encodeURIComponent(r.t.replace(/<[^>]+>/g, "")));
          res.classList.add("is-on");
        }, 260);
      });
    });
    $$("[data-qback]", quiz).forEach(function (b) { b.addEventListener("click", function () { showQ(Math.max(0, step - 1)); }); });
    var rs = $("[data-qrestart]", quiz); if (rs) rs.addEventListener("click", function () { ans = {}; $$(".is-picked", quiz).forEach(function (x) { x.classList.remove("is-picked"); }); showQ(0); });
    // add a Back button to questions 2-3 too
    qs.forEach(function (q, i) { if (i > 0 && !$("[data-qback]", q)) { var bk = document.createElement("button"); bk.type = "button"; bk.className = "quiz__back"; bk.textContent = "← Back"; bk.addEventListener("click", function () { showQ(i - 1); }); q.appendChild(bk); } });
    showQ(0);
  }

  /* ---------- Program filter ---------- */
  var filters = $(".filters");
  if (filters) {
    var progs = $$(".programs > [data-cat]");
    $$("button", filters).forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        $$("button", filters).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        progs.forEach(function (p) { var cats = (p.getAttribute("data-cat") || "").split(" "); p.classList.toggle("is-hidden", !(f === "all" || cats.indexOf(f) > -1)); });
        if (hasGSAP && !reduced) gsap.fromTo(progs.filter(function (p) { return !p.classList.contains("is-hidden"); }), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .7, stagger: .04, ease: "expo.out" });
        if (hasGSAP) ScrollTrigger.refresh();
      });
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  $$(".faq").forEach(function (f) {
    var ds = $$("details", f);
    ds.forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); if (hasGSAP) setTimeout(function () { ScrollTrigger.refresh(); }, 60); }); });
  });

  /* ---------- Deal intake form ---------- */
  var form = $("[data-form]");
  if (form) {
    var panels = $$(".form__panel", form), fbars = $$(".form__steps i", form), fstep = 0;
    var show = function (n) {
      fstep = n;
      panels.forEach(function (p, i) { p.classList.toggle("is-on", i === n); });
      fbars.forEach(function (b, i) { b.classList.toggle("is-on", i <= n); });
      var first = $("input:not([type=radio]):not([type=hidden]), select, textarea", panels[n]);
      if (first && n > 0) first.focus({ preventScroll: true });
    };
    var valid = function (p) { var ok = true; $$("input, select, textarea", p).forEach(function (el) { if (!el.checkValidity()) { if (ok) el.reportValidity(); ok = false; } }); return ok; };
    $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", function () { if (valid(panels[fstep])) show(fstep + 1); }); });
    $$("[data-prev]", form).forEach(function (b) { b.addEventListener("click", function () { show(fstep - 1); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid(panels[fstep])) return;
      // Hook point: POST new FormData(form) to the CRM / form endpoint of choice.
      panels.forEach(function (p) { p.classList.remove("is-on"); });
      $(".form__steps", form).style.display = "none";
      $(".form__success", form).classList.add("is-on");
      var nm = form.elements["first_name"] && form.elements["first_name"].value;
      if (nm) $(".form__success [data-name]", form).textContent = nm;
    });
    var q = new URLSearchParams(window.location.search), pill = $(".deal-pill");
    if (q.get("dscr") && pill) {
      pill.classList.add("is-on");
      $("[data-deal]", pill).textContent = "DSCR " + q.get("dscr") + " · " + money(+q.get("price")) + " · " + money(+q.get("rent")) + "/mo";
      if (form.elements["price"]) form.elements["price"].value = q.get("price");
      if (form.elements["rent"]) form.elements["rent"].value = q.get("rent");
      if (q.get("type") === "str") { var s = form.querySelector('input[name="ptype"][value="Short-term rental"]'); if (s) s.checked = true; }
      if (form.elements["dscr_est"]) form.elements["dscr_est"].value = q.get("dscr");
    } else if (q.get("fit") && pill) {
      pill.classList.add("is-on");
      $(".deal-pill [data-label]").textContent = "Fit Finder match:";
      $("[data-deal]", pill).textContent = q.get("fit");
      if (form.elements["fit"]) form.elements["fit"].value = q.get("fit");
    }
    show(0);
  }

  /* ---------- Article TOC ---------- */
  function initToc() {
    var links = $$(".toc a"); if (!links.length) return;
    links.forEach(function (l) {
      var t = $(l.getAttribute("href")); if (!t) return;
      ScrollTrigger.create({ trigger: t, start: "top 40%", end: "bottom 40%", onToggle: function (s) { if (s.isActive) { links.forEach(function (x) { x.classList.remove("is-active"); }); l.classList.add("is-active"); } } });
    });
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
