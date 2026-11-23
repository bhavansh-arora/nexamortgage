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

  /* ---------- Preloader / page transitions ---------- */
  var pre = $(".preloader");
  var curtain = $(".curtain");
  var showPre = pre && !doc.classList.contains("no-preload");
  var cameByNav = doc.classList.contains("curtain-in");
  var LABELS = { "index.html": "Home", "": "Home", "dscr-loans.html": "DSCR Loans", "loan-programs.html": "Loan Programs", "about.html": "About Daniel", "learn.html": "The Playbook", "contact.html": "Run my deal" };
  var cFill = curtain ? $(".curtain__fill", curtain) : null;
  var cRing = curtain ? $(".curtain__ring", curtain) : null;
  var cLabel = curtain ? $(".curtain__label", curtain) : null;
  var cWord = curtain ? $(".curtain__label b", curtain) : null;
  var cHouse = curtain ? $$(".curtain__house path", curtain) : [];
  var frameRadius = function () {
    var cs = getComputedStyle(doc);
    return { f: parseFloat(cs.getPropertyValue("--frame")) || 12, r: parseFloat(getComputedStyle($(".panel") || doc.body).borderTopLeftRadius) || 30 };
  };
  var panelInset = function () { var fr = frameRadius(); return "inset(" + fr.f + "px " + fr.f + "px " + fr.f + "px " + fr.f + "px round " + fr.r + "px)"; };
  function splitWord(el) {
    if (!el) return [];
    var txt = el.textContent; el.textContent = "";
    return txt.split("").map(function (ch) { var s = document.createElement("span"); s.className = "ch"; s.textContent = ch === " " ? " " : ch; el.appendChild(s); return s; });
  }
  function houseLen() { cHouse.forEach(function (p) { var L = p.getTotalLength ? p.getTotalLength() : 300; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; }); }

  if (showPre && hasGSAP && !reduced) {
    if (lenis) lenis.stop();
    var cnt = { v: 0 }, cEl = $(".preloader__count", pre), words = $$(".preloader__words .w > i", pre);
    gsap.set(words, { yPercent: 110 });
    var preStarted = false;
    var startPre = function () {
      if (preStarted) return; preStarted = true;
      requestAnimationFrame(function () { requestAnimationFrame(runPre); });
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      if (document.readyState === "complete") startPre(); else window.addEventListener("load", startPre, { once: true });
    });
    setTimeout(startPre, 1200);
    // any scroll, swipe, key or click during the intro fast-forwards it instead of being ignored
    var hurry = function () { if (window.__preTl) window.__preTl.timeScale(3); };
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (ev) { window.addEventListener(ev, hurry, { passive: true, once: true }); });
    function runPre() {
    window.__preTl = gsap.timeline({ onComplete: function () { pre.remove(); if (lenis) lenis.start(); window.__preTl = null; } })
      .from(".preloader__top, .preloader__bottom", { opacity: 0, y: 12, duration: .6, ease: "power2.out", stagger: .05 })
      .to(words, { yPercent: 0, duration: .9, ease: "expo.out", stagger: .06 }, "-=.35")
      .to(cnt, { v: 100, duration: 1.25, ease: "power2.inOut", onUpdate: function () { cEl.textContent = String(Math.round(cnt.v)).padStart(3, "0"); } }, "<")
      .to(".preloader__bar i", { scaleX: 1, duration: 1.25, ease: "power2.inOut" }, "<")
      .to(words, { yPercent: -110, duration: .6, ease: "expo.in", stagger: .03 })
      .to(".preloader__top, .preloader__bottom", { opacity: 0, duration: .4 }, "<")
      .to(pre, { clipPath: panelInset(), duration: .9, ease: "expo.inOut" }, "-=.15")
      .add(pageIntro, "-=.55")
      .to(pre, { opacity: 0, duration: .6, ease: "power1.out" }, "-=.5");
    }
  } else {
    if (pre) pre.remove();
    if (cameByNav && hasGSAP && !reduced && curtain) {
      // arrival: the name lifts away, then the cover shrinks into this page's hero panel and melts into it
      if (lenis) lenis.stop();
      var chars = splitWord(cWord);
      houseLen(); cHouse.forEach(function (p) { p.style.strokeDashoffset = 0; });
      gsap.set(cFill, { clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 });
      gsap.timeline({ delay: .08, onComplete: function () { doc.classList.remove("curtain-in"); gsap.set([cFill, cLabel], { clearProps: "all" }); if (lenis) lenis.start(); } })
        .to(chars, { yPercent: -110, duration: .6, ease: "expo.in", stagger: .02 })
        .to(".curtain__label .mk, .curtain__label small, .curtain__house", { opacity: 0, y: -16, duration: .5, ease: "power2.in" }, "<")
        .to(cFill, { clipPath: panelInset(), duration: 1.05, ease: "expo.inOut" }, "-=.2")
        .add(pageIntro, "-=.55")
        .to(cFill, { opacity: 0, duration: .7, ease: "power1.out" }, "-=.5");
    } else {
      doc.classList.remove("curtain-in");
      pageIntro();
    }
  }
  store.del("cwd-nav");

  // leaving: a deep-green circle grows from the exact click point, edged by a brass ring,
  // while the destination name rises letter by letter and the house line-art draws itself
  function leave(href, x, y) {
    var page = href.split("#")[0].split("?")[0].split("/").pop();
    var label = LABELS[page] || "Closing with Daniel";
    store.set("cwd-nav", "1"); store.set("cwd-label", label);
    if (!curtain || !hasGSAP) { window.location.href = href; return; }
    cWord.textContent = label;
    var chars = splitWord(cWord);
    houseLen();
    var W = window.innerWidth, H = window.innerHeight;
    if (x == null) { x = W / 2; y = H / 2; }
    var R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 40;
    doc.classList.add("is-leaving");
    if (lenis) lenis.stop();
    gsap.set(cFill, { clipPath: "circle(0px at " + x + "px " + y + "px)", opacity: 1 });
    gsap.set(cRing, { left: x, top: y, width: 2 * R, height: 2 * R, xPercent: -50, yPercent: -50, scale: 0, opacity: 1 });
    gsap.set(cLabel, { opacity: 1 });
    gsap.set(chars, { yPercent: 110 });
    gsap.set(".curtain__label .mk", { scale: 0, rotate: -90 });
    gsap.set(".curtain__label small", { opacity: 0, y: 10 });
    var tl = gsap.timeline({ onComplete: function () { window.location.href = href; } });
    tl.to(cRing, { scale: 1.02, duration: 1.05, ease: "expo.inOut" }, 0)
      .to(cRing, { opacity: 0, duration: .35 }, .8)
      .to(cFill, { clipPath: "circle(" + R + "px at " + x + "px " + y + "px)", duration: 1.05, ease: "expo.inOut" }, .06)
      .to(".curtain__label .mk", { scale: 1, rotate: 0, duration: .75, ease: "back.out(1.8)" }, .55)
      .to(chars, { yPercent: 0, duration: .8, ease: "expo.out", stagger: .028 }, .6)
      .to(cHouse, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: .03 }, .55)
      .to(".curtain__label small", { opacity: 1, y: 0, duration: .55, ease: "expo.out" }, .85)
      .to({}, { duration: .18 });
  }

  var prefetched = {};
  $$("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(mailto|tel|https?):/i.test(href) || a.hasAttribute("download")) return;
    var warm = function () {
      var u = href.split("#")[0].split("?")[0]; if (!u || prefetched[u]) return; prefetched[u] = 1;
      var l = document.createElement("link"); l.rel = "prefetch"; l.href = u; document.head.appendChild(l);
    };
    a.addEventListener("mouseenter", warm, { passive: true });
    a.addEventListener("touchstart", warm, { passive: true });
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || reduced) return;
      var here = location.pathname.split("/").pop() || "index.html";
      var target = href.split("#")[0].split("?")[0];
      if (target === here && href.indexOf("#") > -1 && href.indexOf("?") < 0) { var t = $("#" + href.split("#")[1]); if (t) { e.preventDefault(); setMenu(false); scrollToEl(t); return; } }
      e.preventDefault();
      if (doc.classList.contains("is-leaving")) return;
      var x = e.clientX, y = e.clientY;
      if (!x && !y) { var r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      leave(href, x, y);
    });
  });
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    doc.classList.remove("is-leaving", "curtain-in");
    if (hasGSAP && curtain) gsap.set([cFill, cRing, cLabel], { clearProps: "all" });
    if (lenis) lenis.start();
  });

  /* ---------- Tickers fill the full width, at any screen size ---------- */
  $$(".ticker__track").forEach(function (track) {
    var kids = Array.prototype.slice.call(track.children);
    var half = kids.slice(0, Math.ceil(kids.length / 2));
    track.innerHTML = ""; half.forEach(function (k) { track.appendChild(k); });
    var box = track.parentElement.getBoundingClientRect().width || window.innerWidth;
    var guard = 0;
    while (track.scrollWidth < box + 200 && guard++ < 12) half.forEach(function (k) { track.appendChild(k.cloneNode(true)); });
    Array.prototype.slice.call(track.children).forEach(function (k) { track.appendChild(k.cloneNode(true)); });
  });

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

  /* ---------- Intro: the hero assembles itself ---------- */
  function splitLetters(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    var txt = el.textContent; el.textContent = "";
    return txt.split("").map(function (ch) {
      var s = document.createElement("span"); s.className = "ch"; s.textContent = ch; s.setAttribute("aria-hidden", "true"); el.appendChild(s); return s;
    });
  }
  function pageIntro() {
    if (!hasGSAP || reduced) {
      $$("[data-ring]").forEach(function (r) { setRing(r, true); });
      $$("[data-inview]").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var hero = $(".hero, .phero");
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // headline: line by line, with the big italic word rising letter by letter
    var bigWord = $(".hero__title .t2 > span");
    var letters = splitLetters(bigWord);
    var heroLines = $$(".hero .split .line > span, .phero .split .line > span").filter(function (s) { return s !== bigWord; });
    gsap.set(heroLines, { y: 0, yPercent: 115 });
    if (bigWord) gsap.set(bigWord, { y: 0, yPercent: 0 });
    if (letters.length) gsap.set(letters, { yPercent: 105, rotate: 8, opacity: 0, display: "inline-block", transformOrigin: "0% 100%" });
    tl.to(heroLines.slice(0, 1), { yPercent: 0, duration: 1.3 }, .15)
      .to(letters, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: .045 }, .3)
      .to(heroLines.slice(1), { yPercent: 0, duration: 1.3, stagger: .1 }, .55);

    // portrait rises out of soft focus
    var fig = $(".hero__figure img");
    gsap.set(".hero__figure", { opacity: 1 });
    if (fig) tl.fromTo(fig, { yPercent: 12, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.6, force3D: true }, .25);
    var arcs = $(".hero__arcs");
    if (arcs) tl.fromTo(arcs, { rotate: -25, opacity: 0, scale: .85 }, { rotate: 0, opacity: .22, scale: 1, duration: 2.4, ease: "power3.out" }, 0);

    // supporting pieces arrive from their own sides
    var revealEls = $$(".hero [data-reveal], .phero [data-reveal]").filter(function (el) { return !el.classList.contains("hero__figure") && !el.classList.contains("badge-spin"); });
    // left and right halves arrive together as mirrored pairs (row by row, top to bottom),
    // so neither side lags behind the other
    var rows = [];
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect(), right = r.left + r.width / 2 > window.innerWidth / 2;
      var fromX = el.closest(".hero__top, .phero__crumbs") || el.classList.contains("hero__top") ? 0 : (right ? 40 : -40);
      var side = fromX === 0 ? "c" : (right ? "r" : "l");
      rows.push({ el: el, x: fromX, side: side, top: r.top });
    });
    var sideIdx = { l: 0, r: 0, c: 0 };
    rows.sort(function (a, b) { return a.top - b.top; }).forEach(function (o) {
      var k = sideIdx[o.side]++;
      tl.fromTo(o.el, { opacity: 0, x: o.x, y: 24 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1 }, .55 + k * .08);
    });
    var badge = $(".badge-spin");
    if (badge) tl.fromTo(badge, { scale: 0, rotate: -160, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.4, ease: "back.out(1.6)" }, 1.0);
    var sparks = $$(".hero .sparkle, .phero > .sparkle");
    if (sparks.length) tl.fromTo(sparks, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, stagger: .1, ease: "back.out(3)", clearProps: "transform,opacity" }, 1.1);
    // inner-page image cards wipe open
    $$(".phero .itile").forEach(function (t) { tl.fromTo(t, { clipPath: "inset(100% 0% 0% 0% round 30px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" }, .35); });

    tl.add(function () {
      $$(".hero [data-inview], .phero [data-inview], .hero, .phero").forEach(function (el) { el.classList.add("is-in"); });
    }, .9);
    // ring and counters fill while their cards fade in, not after
    tl.add(function () { $$(".hero [data-ring], .phero [data-ring]").forEach(function (r) { setRing(r); }); }, .6);
    $$(".hero [data-count], .phero [data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10), o = { v: 0 };
      el.textContent = (0).toFixed(dec);
      tl.to(o, { v: end, duration: 1.6, ease: "power3.out", onUpdate: function () { el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString("en-US"); } }, .6);
    });
    gsap.delayedCall(1.2, initScroll);
  }

  function setStep(sec, pr) {
    var el = $("[data-hs-step]", sec); if (!el) return;
    var n = $$(".hs__card", sec).length || 5;
    var step = Math.min(n, 1 + Math.floor(pr * n * .999));
    el.textContent = String(step).padStart(2, "0");
    $$(".route__nodes li", sec).forEach(function (li, i) { li.classList.toggle("is-on", i === step - 1); li.classList.toggle("is-done", i < step - 1); });
  }

  // Runs small pieces of work in idle time so setup never blocks an animation frame.
  function runInSlices(steps, done) {
    var i = 0;
    var next = function (deadline) {
      var t0 = performance.now();
      while (i < steps.length) {
        steps[i++]();
        var left = deadline && deadline.timeRemaining ? deadline.timeRemaining() : 8 - (performance.now() - t0);
        if (left < 2) break;
      }
      if (i < steps.length) schedule(); else if (done) done();
    };
    var schedule = function () { if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 120 }); else setTimeout(next, 16); };
    schedule();
  }

  function initScroll() {
    var steps = [];
    var notHero = function (el) { return !el.closest(".hero, .phero"); };
    var splits = $$(".split").filter(notHero);
    var counters = $$("[data-count]").filter(notHero); // hero counters already ran in the intro

    // 1) all style writes first, in one go (no layout reads in between)
    steps.push(function () {
      splits.forEach(function (el) { gsap.set($$(".line > span", el), { y: 0, yPercent: 115 }); });
      counters.forEach(function (el) { el.textContent = (0).toFixed(parseInt(el.getAttribute("data-dec") || "0", 10)); });
    });
    // 2) the pinned process first, so every trigger created after it already accounts for the pin
    steps.push(function () {
      var mm = gsap.matchMedia();
      mm.add("(max-width: 760px)", function () {
        $$("[data-hs]").forEach(function (sec) {
          var vp = $(".hs-viewport", sec), bar = $(".route__line i", sec); if (!vp) return;
          var onSwipe = function () { var max = vp.scrollWidth - vp.clientWidth; var pr = max > 0 ? vp.scrollLeft / max : 0; if (bar) bar.style.transform = "scaleX(" + pr + ")"; setStep(sec, pr); };
          vp.addEventListener("scroll", onSwipe, { passive: true }); onSwipe();
          return function () { vp.removeEventListener("scroll", onSwipe); };
        });
      });
      mm.add("(min-width: 761px)", function () {
        $$("[data-hs]").forEach(function (sec) {
          var track = $(".hs__track", sec), bar = $(".route__line i", sec);
          var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 40); };
          gsap.to(track, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: sec, start: "top top+=" + (window.innerHeight * .08), end: function () { return "+=" + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (s) { if (bar) bar.style.transform = "scaleX(" + s.progress + ")"; setStep(sec, s.progress); } } });
        });
      });
    });
    // 3) one small step per trigger
    splits.forEach(function (el) { steps.push(function () {
      gsap.to($$(".line > span", el), { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: el, start: "top 88%" } });
    }); });
    var reveals = $$("[data-reveal]").filter(notHero);
    for (var ri = 0; ri < reveals.length; ri += 8) (function (group) {
      steps.push(function () {
        ScrollTrigger.batch(group, {
          start: "top 90%",
          onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: .08, overwrite: true }); }
        });
      });
    })(reveals.slice(ri, ri + 8));
    $$("[data-inview]").forEach(function (el) {
      if (el.closest(".hero, .phero") && el !== $(".hero") && el !== $(".phero")) return;
      steps.push(function () { ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: function () { el.classList.add("is-in"); } }); });
    });
    $$("[data-ring]").filter(notHero).forEach(function (r) {
      steps.push(function () { ScrollTrigger.create({ trigger: r, start: "top 85%", once: true, onEnter: function () { setRing(r); } }); });
    });
    counters.forEach(function (el) { steps.push(function () {
      var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10), o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 95%" }, onUpdate: function () { el.textContent = dec ? o.v.toFixed(dec) : Math.round(o.v).toLocaleString("en-US"); } });
    }); });
    $$("[data-parallax]").forEach(function (img) { steps.push(function () {
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    }); });
    var cards = $$(".stack__card");
    cards.forEach(function (card, i) {
      var next = cards[i + 1]; if (!next) return;
      steps.push(function () { gsap.to(card, { scale: .92 + i * .015, ease: "none", scrollTrigger: { trigger: next, start: "top 92%", end: "top 30%", scrub: true } }); });
    });
    $$(".panel").forEach(function (p) {
      if (p.classList.contains("hero") || p.classList.contains("phero") || p.closest("[data-hs]")) return;
      steps.push(function () { gsap.fromTo(p, { scale: .965 }, { scale: 1, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "top 55%", scrub: true } }); });
    });
    steps.push(function () {
      var fw = $(".footer__word");
      if (fw) gsap.from(fw, { yPercent: 60, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: fw, start: "top 98%" } });
      var bm = $(".bands__bar i");
      if (bm) gsap.from(bm, { left: "0%", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: bm, start: "top 85%" } });
      initToc();
    });
    // 4) safety net: anything already in (or above) view when setup finishes is shown right away
    runInSlices(steps, function () {
      if (document.readyState !== "complete") window.addEventListener("load", function () { ScrollTrigger.refresh(); }, { once: true });
      var fold = window.innerHeight * .92;
      $$("[data-reveal]").filter(notHero).forEach(function (el) {
        if (el.getBoundingClientRect().top < fold) gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: .9, ease: "expo.out", overwrite: true });
      });
      splits.forEach(function (el) {
        if (el.getBoundingClientRect().top >= fold) return;
        gsap.to($$(".line > span", el), { yPercent: 0, duration: 1, ease: "expo.out", stagger: .06, overwrite: true });
      });
      $$("[data-inview]").forEach(function (el) { if (el.getBoundingClientRect().top < fold) el.classList.add("is-in"); });
    });
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
    } else if (q.get("program") && pill) {
      pill.classList.add("is-on");
      $(".deal-pill [data-label]").textContent = "Interested in:";
      $("[data-deal]", pill).textContent = q.get("program");
      if (form.elements["fit"]) form.elements["fit"].value = q.get("program");
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
