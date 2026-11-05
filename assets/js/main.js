/* Petals Dental landing page. Vanilla JS, no build step. Lead handling ported from petals-web/app/src/forms/{submit,attribution}.js. */
(function () {
  'use strict';

  // ===== SET THESE IN THIS ONE PLACE =====================================================================================
  var CONFIG = {
    ENDPOINT: 'https://script.google.com/macros/s/PLACEHOLDER/exec',   // Google Apps Script web app URL (ends in /exec)
    GTM_ID: 'GTM-PLACEHOLDER',                                         // Google Tag Manager container id
    SITE_URL: '',                                                      // where this page is hosted, e.g. https://example.com/dental/ . Empty = worked out from this file's address
    PRIVACY_URL: 'privacy-policy.html',                                // local copy of the interim notice, until the client's text arrives
    PHONE_DISPLAY: '9147405955',
    PHONE_TEL: '+919147405955',

    // Before and after section. Off: renders nothing and fetches nothing. Turn on by changing this one line, once the case list
    // below is filled. A case with no consentRef never renders, and tools/launch-check.mjs fails it. See README.
    SHOW_BEFORE_AFTER: false,
    // { treatment: 'Veneers', before: 'assets/img/ba/case-1-before', after: 'assets/img/ba/case-1-after',
    //   altBefore: '...', altAfter: '...', consentRef: 'PD-BA-001' }   each image needs -400.webp and -800.webp files
    BEFORE_AFTER_CASES: [],

    // Testimonials section. Off, and built the same way: renders nothing, one line turns it on once the list below is filled, a case
    // with no consentRef never renders, and the launch check fails it. See README.
    SHOW_TESTIMONIALS: false,
    // { quote: '...', name: '...', treatment: 'Root Canal Treatment', consentRef: 'PD-TM-001',
    //   photo: 'assets/img/tm/case-1', photoAlt: '...' }   photo is optional: it needs a -160.webp file, and photoAlt
    TESTIMONIAL_CASES: []
  };
  // =======================================================================================================================

  var FORM_NAME = 'dental-lp';
  var DEPARTMENT = 'Dentistry';
  var CONSENT_TEXT = 'I agree to Petals Health storing these details to contact me about this request.';
  var ATTR_KEY = 'petals.lp.attribution';
  var QUEUE_KEY = 'petals.lp.leads.pending';
  var LEAD_KEY = 'petals.lp.lead.last';
  var QUEUE_MAX_AGE = 7 * 24 * 3600 * 1000;      // a queued lead older than a week is stale for a callback
  var LEAD_MAX_AGE = 3600 * 1000;                // the thank-you page confirms only a submission from the last hour
  var MIN_FILL_MS = 3000;
  var TIMEOUT_MS = 15000;

  var scriptSrc = document.currentScript && document.currentScript.src;
  var BASE = CONFIG.SITE_URL || (scriptSrc ? scriptSrc.replace(/assets\/js\/main\.js.*$/, '') : '');

  var isPlaceholder = function (v) { return !v || /PLACEHOLDER/.test(v); };
  var endpointUnset = function () { return isPlaceholder(CONFIG.ENDPOINT); };

  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  function readJSON(kind, key) { try { return JSON.parse(store(kind).getItem(key)); } catch (e) { return null; } }
  function writeJSON(kind, key, value) { try { store(kind).setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } }

  // ---- attribution: captured on landing, kept for the tab session. A later URL with its own campaign replaces the set. ----
  var ATTR_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  function attributionFromLocation() {
    var q = new URLSearchParams(window.location.search);
    var out = { landingPage: window.location.href.slice(0, 1000), referrer: '' };
    ATTR_PARAMS.forEach(function (k) { out[k] = (q.get(k) || '').slice(0, 300); });
    try { if (document.referrer && new URL(document.referrer).host !== window.location.host) out.referrer = document.referrer.slice(0, 500); } catch (e) { /* malformed */ }
    return out;
  }
  function captureAttribution() {
    var now = attributionFromLocation();
    var stored = readJSON('sessionStorage', ATTR_KEY);
    var hasCampaign = ATTR_PARAMS.some(function (k) { return now[k]; });
    if (!stored || hasCampaign) writeJSON('sessionStorage', ATTR_KEY, now);
  }
  function attribution() { return readJSON('sessionStorage', ATTR_KEY) || attributionFromLocation(); }

  // ---- validation ----
  var MOBILE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function normaliseMobile(v) { return String(v || '').replace(/[\s-]/g, '').replace(/^(?:\+?91|0)(?=[6-9]\d{9}$)/, ''); }
  function validate(v) {
    var errors = {};
    if (v.name.trim().length < 2) errors.name = 'Please enter your name.';
    if (!MOBILE_RE.test(v.mobile.replace(/[\s-]/g, ''))) errors.mobile = 'Please enter a 10-digit Indian mobile number.';
    if (v.email && !EMAIL_RE.test(v.email.trim())) errors.email = 'That email address does not look right.';
    if (v.date) {
      var d = new Date(v.date + 'T00:00:00'); var today = new Date(); today.setHours(0, 0, 0, 0);
      if (isNaN(d.getTime()) || d < today) errors.date = 'Please pick today or a later date.';
    }
    if (!v.consent) errors.consent = 'We need your consent to contact you about this request.';
    return errors;
  }

  // ---- payload: one key per column of apps-script/Code.gs, which sets its own IST timestamp on receipt ----
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  function deviceType() {
    var w = window.innerWidth;
    var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    return w < 768 ? 'mobile' : (w < 1024 || (coarse && w <= 1366)) ? 'tablet' : 'desktop';
  }
  function clean(v, max) { return String(v == null ? '' : v).trim().slice(0, max || 2000); }
  function buildPayload(v, section, id) {
    var a = attribution();
    var at = new Date().toISOString();
    return {
      timestamp: at,
      name: clean(v.name, 200),
      mobile: normaliseMobile(v.mobile),
      email: clean(v.email, 200),
      department: DEPARTMENT,
      doctor: '',
      date: clean(v.date, 20),
      gender: '',
      age: '',
      message: clean(v.message),
      consent: v.consent ? 'Yes' : 'No',
      consentText: CONSENT_TEXT,
      form: FORM_NAME,
      section: section,
      pageUrl: window.location.href.slice(0, 1000),
      pageTitle: document.title.slice(0, 300),
      landingPage: a.landingPage || '',
      referrer: a.referrer || '',
      utm_source: a.utm_source || '',
      utm_medium: a.utm_medium || '',
      utm_campaign: a.utm_campaign || '',
      utm_term: a.utm_term || '',
      utm_content: a.utm_content || '',
      gclid: a.gclid || '',
      fbclid: a.fbclid || '',
      deviceType: deviceType(),
      viewport: window.innerWidth + '×' + window.innerHeight,
      id: id,
      clientTime: at
    };
  }

  // ---- transport. Success is ONLY a body of { ok: true }: a 200 sign-in page from a misdeployed script is a failure. ----
  function leadError(message, retry) { var e = new Error(message); e.isLead = true; e.retry = retry !== false; return e; }
  function postLead(payload) {
    // Unlike the main site, a placeholder endpoint fails loudly: a page launched by mistake must never fake a success.
    if (endpointUnset()) { console.error('[petals-lp] ENDPOINT is still a placeholder. This lead was NOT sent.'); return Promise.reject(leadError('endpoint-not-configured')); }
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    // text/plain keeps this a "simple" request: Apps Script does not answer CORS preflight
    return fetch(CONFIG.ENDPOINT, { method: 'POST', mode: 'cors', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw leadError('HTTP ' + res.status);
        return res.json().catch(function () { throw leadError('The form service did not answer as expected'); });
      })
      .then(function (data) {
        if (data && data.ok === true) return { ok: true, duplicate: Boolean(data.duplicate) };
        throw leadError((data && data.error) || 'Rejected', !(data && data.retry === false));
      })
      .catch(function (e) {
        if (e.isLead) throw e;
        throw leadError(e && e.name === 'AbortError' ? 'Timed out' : String((e && e.message) || e));
      })
      .then(function (r) { if (timer) clearTimeout(timer); return r; }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }

  // ---- retry queue: a failed lead is re-sent on the next page load with the same id, which the script never writes twice ----
  function readQueue() { return readJSON('localStorage', QUEUE_KEY) || []; }
  function writeQueue(q) { writeJSON('localStorage', QUEUE_KEY, q); }
  function dequeue(id) { writeQueue(readQueue().filter(function (p) { return p.id !== id; })); }
  function enqueue(payload) {
    var q = readQueue().filter(function (p) { return p.id !== payload.id; });
    q.push(Object.assign({}, payload, { queuedAt: new Date().toISOString() }));
    writeQueue(q);
  }
  function flushQueue() {
    var q = readQueue().filter(function (p) { return Date.now() - Date.parse(p.queuedAt || 0) < QUEUE_MAX_AGE; });
    if (!q.length || endpointUnset()) { writeQueue(q); return; }
    var left = [];
    q.reduce(function (chain, p) {
      return chain.then(function () { return postLead(p).catch(function (e) { if (e.retry !== false) left.push(p); }); });
    }, Promise.resolve()).then(function () { writeQueue(left); });
  }

  // ---- data layer ----
  window.dataLayer = window.dataLayer || [];
  function loadGTM() {
    if (isPlaceholder(CONFIG.GTM_ID)) return;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.GTM_ID);
    document.head.appendChild(s);
  }

  // ---- forms ----
  function formValues(form) {
    return {
      name: form.elements.name.value,
      mobile: form.elements.mobile.value,
      email: form.elements.email.value,
      date: form.elements.date.value,
      message: form.elements.message.value,
      consent: form.elements.consent.checked,
      website: form.elements.website.value
    };
  }
  function setFieldError(form, name, message) {
    var field = form.elements[name];
    var err = document.getElementById(field.id + '-err');
    if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    if (err) { err.textContent = message || ''; err.hidden = !message; }
  }
  function showAlert(form, message, canRetry) {
    var box = form.querySelector('[data-alert]');
    box.textContent = '';
    var p = document.createElement('p'); p.style.margin = '0';
    p.appendChild(document.createTextNode(message + ' call '));
    var a = document.createElement('a'); a.href = 'tel:' + CONFIG.PHONE_TEL; a.textContent = CONFIG.PHONE_DISPLAY;
    p.appendChild(a); p.appendChild(document.createTextNode('.'));
    box.appendChild(p);
    if (canRetry) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lead__retry'; b.textContent = 'Try again';
      b.addEventListener('click', function () { form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); });
      box.appendChild(b);
    }
    box.hidden = false;
    box.scrollIntoView({ block: 'center', behavior: 'instant' });   // a failed send must never be out of view
  }
  function clearAlert(form) { var box = form.querySelector('[data-alert]'); box.hidden = true; box.textContent = ''; }

  function goToThankYou() { window.location.assign(BASE + (location.protocol === 'file:' ? 'thank-you/index.html' : 'thank-you/')); }

  function bindForm(form) {
    var openedAt = Date.now();
    var retryId = null;        // the failed attempt's id: a retry re-sends the SAME submission, so it cannot add a second row
    var sending = false;
    var submit = form.querySelector('.lead__submit');
    var label = submit.querySelector('[data-label]');
    var section = form.getAttribute('data-section');

    var today = new Date();
    form.elements.date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    ['name', 'mobile', 'email', 'date', 'consent'].forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid')) setFieldError(form, n, ''); });
    });

    function lock(on) {
      sending = on; submit.disabled = on; form.setAttribute('aria-busy', on ? 'true' : 'false');
      label.textContent = on ? 'Sending…' : 'Book Consultation';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;                                      // no double-send
      clearAlert(form);
      var v = formValues(form);
      var errors = validate(v);
      ['name', 'mobile', 'email', 'date', 'consent'].forEach(function (n) { setFieldError(form, n, errors[n]); });
      var first = ['name', 'mobile', 'email', 'date', 'consent'].filter(function (n) { return errors[n]; })[0];
      if (first) { form.elements[first].focus(); return; }

      // spam checks: bots get a quiet exit with no lead, no record and so no conversion
      if (v.website) { goToThankYou(); return; }
      if (Date.now() - openedAt < MIN_FILL_MS) { showAlert(form, 'Please take a moment and try again, or', false); return; }

      var id = retryId || newId();
      var payload = buildPayload(v, section, id);
      lock(true);
      window.dataLayer.push({ event: 'form_submit', form: FORM_NAME, form_section: section });
      postLead(payload).then(function () {
        dequeue(id);
        writeJSON('sessionStorage', LEAD_KEY, { id: id, form: FORM_NAME, section: section, at: Date.now(), fired: false });
        goToThankYou();
      }).catch(function (err) {
        lock(false);
        window.dataLayer.push({ event: 'form_error', form: FORM_NAME, form_section: section, error: String(err.message).slice(0, 100) });
        if (err.retry === false) {
          retryId = null; dequeue(id);
          showAlert(form, 'We could not accept this request. Please check your details, or', false);
          return;
        }
        retryId = id;
        if (err.message !== 'endpoint-not-configured') enqueue(payload);
        showAlert(form, 'We could not send this just now. Your details are kept here. Please try again, or', true);
      });
    });
  }

  // ---- page furniture ----
  // Bands below the fold use content-visibility, so they grow as a scroll passes them and one scroll overshoots. Keep
  // re-anchoring until the position has held for a few frames.
  function landOn(el) {
    var last = null, still = 0, frames = 0;
    (function step() {
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      var top = el.getBoundingClientRect().top;
      still = last !== null && Math.abs(top - last) < 1 ? still + 1 : 0;
      last = top;
      if (still < 4 && ++frames < 60) requestAnimationFrame(step);
    })();
  }

  function initBookLinks() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.form-card'));
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#book-"], a[data-book]') : null;
      if (!a) return;
      var target = document.querySelector(a.getAttribute('href'));
      // the fixed Book actions go to whichever form is nearer
      if (a.hasAttribute('data-book')) {
        target = forms.slice().sort(function (x, y) { return Math.abs(x.getBoundingClientRect().top) - Math.abs(y.getBoundingClientRect().top); })[0];
      }
      if (!target) return;
      e.preventDefault();
      var field = target.querySelector('input');
      if (field) field.focus({ preventScroll: true });
      landOn(target);
    });
    // the sticky rail never sits over the on-screen keyboard
    var rail = document.querySelector('.rail');
    var typing = 'input:not([type="checkbox"]), textarea';
    if (rail) {
      document.addEventListener('focusin', function (e) { if (e.target.matches(typing)) rail.classList.add('is-typing'); });
      document.addEventListener('focusout', function (e) { if (e.target.matches(typing)) rail.classList.remove('is-typing'); });
    }
  }
  function initReveal() {
    var els = document.querySelectorAll('.rv');
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduced || !els.length) return;
    var vh = window.innerHeight;
    var below = [];
    Array.prototype.forEach.call(els, function (el) { if (el.getBoundingClientRect().top > vh) below.push(el); else el.classList.add('is-in'); });
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    below.forEach(function (el) { io.observe(el); });
  }

  // ---- clinic tabs. Until this runs, or if it never does, the tab row stays hidden and every clinic shows. ----
  function initClinicTabs() {
    var root = document.querySelector('[data-clinic-tabs]');
    if (!root) return;
    var list = root.querySelector('[role="tablist"]');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) t.removeAttribute('tabindex'); else t.setAttribute('tabindex', '-1');
        panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    panels.forEach(function (p, n) {
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', tabs[n].id);
      p.setAttribute('tabindex', '0');
    });
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { select(i, false); }); });
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var to = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      select(to, true);
    });
    list.hidden = false;
    select(0, false);
  }

  // ---- map: a picture until clicked, so Google loads only for a visitor who asks for it ----
  function initMaps() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('.cmap__open') : null;
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;     // a new-tab click still opens Google Maps
      var box = a.closest('[data-map]');
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-embed');
      f.title = box.getAttribute('data-title');
      f.allowFullscreen = true;
      box.replaceChild(f, a);
      var credit = box.parentNode.querySelector('[data-map-credit]');          // Google's map carries its own credit
      if (credit) credit.hidden = true;
      f.focus();
    });
  }

  // ---- before and after: nothing happens unless the flag is on and a case has both images and a consent reference ----
  function renderBeforeAfter() {
    var tpl = document.getElementById('before-after');
    if (!tpl || !CONFIG.SHOW_BEFORE_AFTER) return;
    var cases = CONFIG.BEFORE_AFTER_CASES.filter(function (c) { return c.consentRef && c.before && c.after && c.altBefore && c.altAfter; });
    if (!cases.length) return;
    function side(base, alt, tag) {
      var d = document.createElement('div'); d.className = 'ba__side';
      var img = document.createElement('img');
      img.src = BASE + base + '-800.webp';
      img.srcset = BASE + base + '-400.webp 400w, ' + BASE + base + '-800.webp 800w';
      img.sizes = '(min-width: 1680px) 390px, (min-width: 1024px) 25vw, 45vw';
      img.alt = alt; img.width = 800; img.height = 600; img.loading = 'lazy'; img.decoding = 'async';
      var t = document.createElement('span'); t.className = 'ba__tag'; t.textContent = tag;
      d.appendChild(img); d.appendChild(t);
      return d;
    }
    var section = tpl.content.cloneNode(true);
    var box = section.querySelector('[data-ba-cases]');
    if (cases.length === 1) box.classList.add('ba--one');
    cases.forEach(function (c) {
      var fig = document.createElement('figure'); fig.className = 'ba__case';
      var pair = document.createElement('div'); pair.className = 'ba__pair';
      pair.appendChild(side(c.before, c.altBefore, 'Before'));
      pair.appendChild(side(c.after, c.altAfter, 'After'));
      fig.appendChild(pair);
      if (c.treatment) { var cap = document.createElement('figcaption'); cap.textContent = c.treatment; fig.appendChild(cap); }
      box.appendChild(fig);
    });
    tpl.parentNode.replaceChild(section, tpl);
  }

  // ---- testimonials: nothing happens unless the flag is on and a case is complete, with a consent reference ----
  function renderTestimonials() {
    var tpl = document.getElementById('testimonials');
    if (!tpl || !CONFIG.SHOW_TESTIMONIALS) return;
    var cases = CONFIG.TESTIMONIAL_CASES.filter(function (c) { return c.consentRef && c.quote && c.name && c.treatment && (!c.photo || c.photoAlt); });
    if (!cases.length) return;
    function line(cls, text) { var s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }
    var section = tpl.content.cloneNode(true);
    var box = section.querySelector('[data-tm-cases]');
    if (cases.length === 1) box.classList.add('tm--one');
    cases.forEach(function (c) {
      var fig = document.createElement('figure'); fig.className = 'tm__card';
      var q = document.createElement('blockquote'); q.className = 'tm__quote'; q.textContent = c.quote;
      var who = document.createElement('figcaption'); who.className = 'tm__who';
      if (c.photo) {
        var img = document.createElement('img');
        img.src = BASE + c.photo + '-160.webp'; img.alt = c.photoAlt;
        img.width = 160; img.height = 160; img.loading = 'lazy'; img.decoding = 'async';
        who.appendChild(img);
      }
      var text = document.createElement('span');
      text.appendChild(line('tm__name', c.name)); text.appendChild(line('tm__treatment', c.treatment));
      who.appendChild(text);
      fig.appendChild(q); fig.appendChild(who);
      box.appendChild(fig);
    });
    tpl.parentNode.replaceChild(section, tpl);
  }

  // ---- pages ----
  function initLanding() {
    captureAttribution();
    Array.prototype.forEach.call(document.querySelectorAll('[data-privacy]'), function (a) { a.href = CONFIG.PRIVACY_URL; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-lead-form]'), bindForm);
    renderBeforeAfter();
    renderTestimonials();
    initClinicTabs();
    initMaps();
    initBookLinks();
    initReveal();
    window.addEventListener('load', function () {
      // after load, so tags never compete with the LCP
      setTimeout(function () {
        flushQueue();
        loadGTM();
      }, 0);
    });
  }

  // The conversion fires here, once per delivered submission. Only postLead's { ok: true } writes the record, so a direct
  // visit, a new tab or a bot has no record: no event, and no confirmation either.
  function initThankYou() {
    var lead = readJSON('sessionStorage', LEAD_KEY);
    var valid = lead && lead.id && lead.form === FORM_NAME && Date.now() - lead.at < LEAD_MAX_AGE;
    var yes = document.querySelector('[data-confirmed]');
    var no = document.querySelector('[data-neutral]');
    if (!valid) { no.hidden = false; return; }
    yes.hidden = false;
    document.title = 'Thank you | Petals Dental';
    var ref = document.querySelector('[data-ref]');
    if (ref) ref.textContent = lead.id.slice(0, 8).toUpperCase();
    if (!lead.fired) {
      window.dataLayer.push({ event: 'generate_lead', form: lead.form, form_section: lead.section, department: DEPARTMENT, lead_id: lead.id });
      lead.fired = true;
      writeJSON('sessionStorage', LEAD_KEY, lead);
    }
    loadGTM();
  }

  function start() {
    var page = document.body.getAttribute('data-page');
    if (page === 'landing') initLanding();
    if (page === 'thank-you') initThankYou();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
