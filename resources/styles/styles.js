// ---- Footer Year ----
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ---- Brand Icon Swap ----
// Quarto's `tools:` (navbar) and `about: links:` (homepage) only accept
// Bootstrap icon names, but Bootstrap has no brand icons for ORCID /
// ResearchGate / Google Scholar. Match each link by href and swap its
// <i class="bi ..."> for the FontAwesome brand equivalent.
(function () {
  var ICON_MAP = [
    { match: 'linkedin.com',     cls: 'fa-brands fa-linkedin' },
    { match: 'github.com',       cls: 'fa-brands fa-github' },
    { match: 'orcid.org',        cls: 'fa-brands fa-orcid' },
    { match: 'researchgate.net', cls: 'fa-brands fa-researchgate' },
    { match: 'scholar.google',   cls: 'fa-brands fa-google-scholar' }
  ];
  var SELECTOR = '.quarto-navbar-tools a, .about-link, .about-links a';
  function swapBrandIcons() {
    document.querySelectorAll(SELECTOR).forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hit = null;
      for (var i = 0; i < ICON_MAP.length; i++) {
        if (href.indexOf(ICON_MAP[i].match) !== -1) { hit = ICON_MAP[i]; break; }
      }
      if (!hit) return;
      var icon = a.querySelector('i');
      if (icon) icon.className = hit.cls;
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', swapBrandIcons);
  } else {
    swapBrandIcons();
  }
})();

// ---- Scroll Animations ----
(function () {
  function init() {
    var targets = document.querySelectorAll('.quarto-post, .quarto-grid-item, .presentation-box');
    if (!targets.length || !window.IntersectionObserver) return;
    targets.forEach(function (el, i) {
      el.classList.add('animate-on-scroll');
      el.style.setProperty('--anim-delay', Math.min(i * 22, 100) + 'ms');
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('is-visible');
          obs.unobserve(el);
          // The reveal is one-shot. Once it finishes, drop the animation classes
          // so they stop owning `transform`/`transition` on the card — otherwise
          // `.is-visible { transform: translateY(0) }` overrides the hover/active
          // transforms (the press-shrink never shows) and the animation's
          // transition list (opacity/transform only) suppresses the glow easing.
          var cleanup = function () {
            el.removeEventListener('transitionend', cleanup);
            el.classList.remove('animate-on-scroll', 'is-visible');
            el.style.removeProperty('--anim-delay');
          };
          el.addEventListener('transitionend', cleanup);
          setTimeout(cleanup, 1200);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (el) { obs.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Publications Category Locator ----
// Scoped to the Publications page (only runs when `.pres-filter` exists).
// Acts like a table of contents: clicking a category smooth-scrolls to its
// section, and scrolling highlights whichever section is currently in view.
(function () {
  function init() {
    var nav = document.querySelector('.pres-filter');
    if (!nav) return;
    var items = Array.prototype.slice.call(nav.querySelectorAll('.pres-filter-btn'))
      .map(function (link) {
        return { link: link, el: document.getElementById(link.getAttribute('data-target')) };
      })
      .filter(function (it) { return it.el; });
    if (!items.length) return;

    function navOffset() {
      var bar = document.querySelector('.navbar');
      var base = (bar ? bar.offsetHeight : 60) + 16;
      // On mobile the filter is a sticky top bar overlapping the content, so its
      // height must be cleared too (for both scroll-spy and click-scroll).
      if (window.innerWidth <= 1080 && nav && getComputedStyle(nav).position === 'sticky') {
        base += nav.offsetHeight;
      }
      return base;
    }

    function setActive(link) {
      items.forEach(function (it) { it.link.classList.toggle('is-active', it.link === link); });
    }

    // Smooth-scroll to the section, accounting for the fixed navbar.
    items.forEach(function (it) {
      it.link.addEventListener('click', function (e) {
        e.preventDefault();
        var y = it.el.getBoundingClientRect().top + window.pageYOffset - navOffset();
        window.scrollTo({ top: y, behavior: 'smooth' });
        setActive(it.link);
      });
    });

    // Scroll-spy: highlight the last section whose top has crossed the line
    // just below the navbar (and the final section once scrolled to the bottom).
    var ticking = false;
    function update() {
      ticking = false;
      var line = navOffset() + 12;
      var current = items[0];
      for (var i = 0; i < items.length; i++) {
        if (items[i].el.getBoundingClientRect().top <= line) current = items[i];
      }
      if (window.innerHeight + window.pageYOffset >= document.body.scrollHeight - 2) {
        current = items[items.length - 1];
      }
      setActive(current.link);
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Publications Reference Copy ----
// Copy button inside each paper's APA reference block. Copies the reference's
// plain text (markdown italics collapse to plain text via textContent) and
// briefly swaps the icon to a check as confirmation.
(function () {
  function init() {
    var btns = document.querySelectorAll('.pub-ref-copy');
    if (!btns.length) return;

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var box = btn.closest('.pub-ref');
        var textEl = box ? box.querySelector('.pub-ref-text') : null;
        if (!textEl) return;
        var text = textEl.textContent.trim().replace(/\s+/g, ' ');
        var icon = btn.querySelector('i');
        var confirm = function () {
          btn.classList.add('is-copied');
          if (icon) icon.className = 'bi bi-check-lg';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            if (icon) icon.className = 'bi bi-clipboard';
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(confirm).catch(function () { fallbackCopy(text); confirm(); });
        } else {
          fallbackCopy(text);
          confirm();
        }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Intro Button Equalize ----
// When buttons stack, equalizes widths and pins all to the first button's
// left position — so floated images don't shift the lower buttons.
(function () {
  function updateIntroBtns() {
    document.querySelectorAll('.intro-links').forEach(function (container) {
      var btns = Array.from(container.querySelectorAll('.intro-btn'));
      if (btns.length < 2) return;

      // Reset for fresh measurement
      container.style.textAlign = '';
      btns.forEach(function (b) { b.style.width = ''; b.style.marginLeft = ''; });

      // Detect full stacking: every button is on its own row
      var tops = btns.map(function (b) { return Math.round(b.getBoundingClientRect().top); });
      var uniqueTops = tops.filter(function (t, i) { return tops.indexOf(t) === i; });
      var isFullyStacked = uniqueTops.length === btns.length;

      if (isFullyStacked) {
        // Equalize widths
        var maxW = Math.max.apply(null, btns.map(function (b) { return b.offsetWidth; }));
        btns.forEach(function (b) { b.style.width = maxW + 'px'; });

        // Pin all buttons to the first button's left position so they align
        // consistently even when a floated image narrows the container above
        var containerLeft = container.getBoundingClientRect().left;
        var targetLeft = btns[0].getBoundingClientRect().left - containerLeft;
        container.style.textAlign = 'left';
        btns.forEach(function (b) { b.style.marginLeft = targetLeft + 'px'; });
      }
    });
  }
  document.fonts.ready.then(updateIntroBtns);
  window.addEventListener('resize', updateIntroBtns);
})();

// ---- Subpage Back Button ----
// On any subpage under /<section>/... inject a "Back to <Section>" pill
// above the page title. Section title and href are read from the navbar —
// both top-level nav links and items nested inside a dropdown menu.
(function () {
  function findSectionLink(section) {
    var links = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item');
    for (var i = 0; i < links.length; i++) {
      var hrefAttr = links[i].getAttribute('href') || '';
      var basename = hrefAttr.split('/').pop().split('?')[0].split('#')[0].replace(/\.html$/, '');
      if (basename === section) {
        var menu = links[i].querySelector('.menu-text');
        var title = menu ? menu.textContent.trim() : links[i].textContent.trim();
        return { href: hrefAttr, title: title };
      }
    }
    return null;
  }
  // Per-section back-button label overrides (section slug -> full label).
  // Sections not listed fall back to "Back to <navbar title>".
  var BACK_LABELS = {
    recipes: '菜谱',
    cocktails: '鸡尾酒'
  };
  function addBackButton() {
    var match = window.location.pathname.match(/^\/([^\/]+)\/.+/);
    if (!match) return;
    var nav = findSectionLink(match[1]);
    if (!nav) return;
    var header = document.getElementById('title-block-header');
    if (!header || header.previousElementSibling && header.previousElementSibling.classList.contains('subpage-back-btn')) return;
    var label = BACK_LABELS[match[1]] || ('Back to ' + nav.title);
    var btn = document.createElement('a');
    btn.className = 'subpage-back-btn';
    btn.href = nav.href;
    btn.innerHTML = '<i class="nav-arrow" aria-hidden="true">←</i><span>' + label + '</span>';
    header.parentNode.insertBefore(btn, header);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBackButton);
  } else {
    addBackButton();
  }
})();

// ---- Subpage Prev / Next Buttons ----
// For any subpage that appears in /listings.json, append a row of prev (left)
// and next (right) buttons at the end of <main.content>. Items in listings.json
// follow the listing's own sort order.
//
// "Next" (right) always means "forward through the listing as displayed", i.e.
// items[idx + 1], and "prev" (left) means items[idx - 1]. But blog/projects are
// sorted DESC (newest first), so forward-through-the-list means going to older
// posts — and the established, desired behavior there is the reverse: next =
// newer = items[idx - 1]. Recipes/cocktails are sorted ASC, where the intuitive
// "next" is simply the following item, items[idx + 1].
//
// So: ASC sections (recipes, cocktails) map idx-1 -> prev, idx+1 -> next;
// DESC sections (blog, projects, default) map idx-1 -> next, idx+1 -> prev.
// Hidden when there is no neighbor on that side.
var ASC_SECTIONS = /^\/(recipes|cocktails)\//;
(function () {
  function currentItemPath() {
    var path = window.location.pathname;
    if (path.charAt(path.length - 1) === '/') path += 'index.html';
    return path;
  }
  function loadJSON(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function buildTitleMap(searchData) {
    var map = {};
    if (!Array.isArray(searchData)) return map;
    // Recipe pages start with raw HTML (link/script) and have no free prose
    // before the first ## heading, so Quarto only emits per-section entries
    // (href like "recipes/foo/index.html#食材"). Strip the anchor to recover
    // the page-level key; the entry's title is still the page title.
    // Prefer entries without an anchor when both exist for the same page.
    searchData.forEach(function (entry) {
      if (!entry || !entry.href) return;
      var hasAnchor = entry.href.indexOf('#') !== -1;
      var pageHref = hasAnchor ? entry.href.split('#')[0] : entry.href;
      var key = pageHref.charAt(0) === '/' ? pageHref : '/' + pageHref;
      if (!map[key] || !hasAnchor) {
        map[key] = entry.title;
      }
    });
    return map;
  }
  function makeBtn(href, direction, title) {
    var btn = document.createElement('a');
    btn.className = 'post-nav-btn post-nav-' + direction;
    btn.href = href;
    var arrow = '<i class="nav-arrow" aria-hidden="true">' + (direction === 'prev' ? '←' : '→') + '</i>';
    var titleHtml = '<span class="post-nav-title">' + (title || '') + '</span>';
    btn.innerHTML = direction === 'prev' ? arrow + titleHtml : titleHtml + arrow;
    return btn;
  }
  function renderNav(prevHref, nextHref, titleMap) {
    if (!prevHref && !nextHref) return;
    var main = document.querySelector('main.content');
    if (!main) return;
    var nav = document.createElement('nav');
    nav.className = 'post-nav';
    nav.setAttribute('aria-label', 'Post navigation');
    var prevSlot = document.createElement('div');
    prevSlot.className = 'post-nav-slot post-nav-slot-prev';
    var nextSlot = document.createElement('div');
    nextSlot.className = 'post-nav-slot post-nav-slot-next';
    if (prevHref) prevSlot.appendChild(makeBtn(prevHref, 'prev', titleMap[prevHref]));
    if (nextHref) nextSlot.appendChild(makeBtn(nextHref, 'next', titleMap[nextHref]));
    nav.appendChild(prevSlot);
    nav.appendChild(nextSlot);
    main.appendChild(nav);
  }
  function init() {
    if (!document.getElementById('title-block-header')) return;
    if (!document.querySelector('main.content')) return;
    Promise.all([loadJSON('/listings.json'), loadJSON('/search.json')]).then(function (results) {
      var listings = results[0];
      var titleMap = buildTitleMap(results[1]);
      if (!Array.isArray(listings)) return;
      var current = currentItemPath();
      var hit = null;
      for (var i = 0; i < listings.length; i++) {
        var idx = listings[i].items ? listings[i].items.indexOf(current) : -1;
        if (idx !== -1) { hit = { items: listings[i].items, idx: idx }; break; }
      }
      if (!hit) return;
      var earlier = hit.idx > 0 ? hit.items[hit.idx - 1] : null;          // items[idx - 1]
      var later = hit.idx < hit.items.length - 1 ? hit.items[hit.idx + 1] : null; // items[idx + 1]
      var prevHref, nextHref;
      if (ASC_SECTIONS.test(current)) {
        prevHref = earlier; nextHref = later;   // ascending: next = following item
      } else {
        prevHref = later; nextHref = earlier;   // descending: next = newer item
      }
      renderNav(prevHref, nextHref, titleMap);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Navbar Section Highlighting ----
// Quarto only marks the navbar link active for top-level pages. For any
// subpage under /<section>/... mark the navbar link whose href is
// <section>.html active too. Generic across all navbar entries.
(function () {
  function highlightSectionNav() {
    var match = window.location.pathname.match(/^\/([^\/]+)\/.+/);
    if (!match) return;
    var section = match[1];
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var basename = href.split('/').pop().split('?')[0].split('#')[0].replace(/\.html$/, '');
      if (basename === section) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightSectionNav);
  } else {
    highlightSectionNav();
  }
})();

// ---- Code Window Language Labels ----
(function () {
  function initCodeWindows() {
    document.querySelectorAll('div.sourceCode').forEach(function (div) {
      var pre = div.querySelector('pre.sourceCode');
      if (!pre) return;
      var lang = Array.from(pre.classList).find(function (c) { return c !== 'sourceCode'; }) || '';
      var label = document.createElement('span');
      label.className = 'code-window-lang';
      label.textContent = lang.toUpperCase();
      div.insertBefore(label, div.firstChild);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeWindows);
  } else {
    initCodeWindows();
  }
})();

// ---- Step Timer ----
// Recipe/cocktail step cards show a `.step-time` pill (e.g. "40 分", "30 秒",
// "60–90 分钟"). Make each pill clickable to launch a single floating countdown
// timer. Ranges use the larger bound; a beep + flash fire when it reaches zero.
(function () {
  // Parse a duration string into seconds. Returns null when no number is found.
  function parseSeconds(text) {
    var nums = text.match(/\d+/g);
    if (!nums || !nums.length) return null;
    var value = parseInt(nums[nums.length - 1], 10); // larger end of a range
    var isSeconds = /秒/.test(text) && !/分/.test(text);
    return isSeconds ? value : value * 60;
  }

  // Inline lucide-style icons (the page's lucide.createIcons() has already run
  // by the time this panel is built, so injected <i data-lucide> wouldn't render).
  function svgIcon(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" ' +
      'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  var ICON_PLAY = svgIcon('<polygon points="6 3 20 12 6 21 6 3"></polygon>');
  var ICON_PAUSE = svgIcon('<rect x="14" y="3" width="4" height="18" rx="1"></rect><rect x="6" y="3" width="4" height="18" rx="1"></rect>');
  var ICON_RESET = svgIcon('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>');
  var ICON_TIMER = svgIcon('<line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle>');

  function format(totalSeconds) {
    var s = Math.max(0, Math.round(totalSeconds));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // One reusable AudioContext, unlocked on the first click (a user gesture) so
  // the completion beep is allowed to play later.
  var audioCtx = null;
  function unlockAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { audioCtx = null; }
  }
  // Oscillators scheduled by the most recent beep(), so stopBeep() can cut the
  // sound the instant the timer is closed/reset instead of letting the queued
  // tones play out.
  var activeBeeps = [];
  function stopBeep() {
    for (var i = 0; i < activeBeeps.length; i++) {
      try { activeBeeps[i].stop(); activeBeeps[i].disconnect(); } catch (e) {}
    }
    activeBeeps = [];
  }
  function beep(times) {
    if (!audioCtx) return;
    stopBeep();
    for (var i = 0; i < times; i++) {
      var start = audioCtx.currentTime + i * 0.7;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
      activeBeeps.push(osc);
    }
  }

  function init() {
    // Recipes only. Cocktails share the same step-card markup but are quick to
    // make, so their time pills stay non-interactive.
    if (!/^\/recipes\//.test(window.location.pathname)) return;
    var pills = document.querySelectorAll('.step-card .step-time');
    if (!pills.length) return;

    // Wrap each step card in a positioned `.step-row` so the timer can attach to
    // it: on wide screens it floats out past the card's right edge; on narrow
    // screens it drops below in normal flow and nudges the next card down. The
    // card itself has `overflow: hidden`, so the panel can't live inside it.
    document.querySelectorAll('.step-card').forEach(function (card) {
      var parent = card.parentElement;
      if (parent && parent.classList.contains('step-row')) return;
      var row = document.createElement('div');
      row.className = 'step-row';
      card.parentNode.insertBefore(row, card);
      row.appendChild(card);
    });

    // Single shared timer panel, moved into the active card's row on open.
    // `.recipe-timer-clip` masks the inner content during the grow/collapse
    // animation; `.recipe-timer-inner` carries the visible card so its fixed
    // size never reflows mid-animation.
    var panel = document.createElement('div');
    panel.className = 'recipe-timer';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '计时器');
    panel.innerHTML =
      '<div class="recipe-timer-clip"><div class="recipe-timer-inner">' +
        '<div class="recipe-timer-head">' +
          '<span class="recipe-timer-step"></span>' +
          '<button class="recipe-timer-close" type="button" aria-label="关闭计时器">&times;</button>' +
        '</div>' +
        '<div class="recipe-timer-display" aria-live="polite">00:00</div>' +
        '<div class="recipe-timer-controls">' +
          '<button class="recipe-timer-btn rt-toggle" type="button" aria-label="暂停">' + ICON_PAUSE + '</button>' +
          '<button class="recipe-timer-btn rt-reset" type="button" aria-label="重置">' + ICON_RESET + '</button>' +
        '</div>' +
        '<div class="recipe-timer-track" role="slider" tabindex="0" aria-label="调整剩余时间" ' +
          'aria-valuemin="0" aria-valuenow="0"><div class="recipe-timer-fill"></div></div>' +
      '</div></div>';
    document.body.appendChild(panel);

    var stepEl = panel.querySelector('.recipe-timer-step');
    var displayEl = panel.querySelector('.recipe-timer-display');
    var fillEl = panel.querySelector('.recipe-timer-fill');
    var trackEl = panel.querySelector('.recipe-timer-track');
    var toggleBtn = panel.querySelector('.rt-toggle');
    var resetBtn = panel.querySelector('.rt-reset');
    var closeBtn = panel.querySelector('.recipe-timer-close');
    var innerEl = panel.querySelector('.recipe-timer-inner');

    var STEP = 5; // scrub/keyboard resolution, in seconds
    function snap(seconds) {
      var s = Math.round(seconds / STEP) * STEP;
      return Math.max(0, Math.min(state.total, s));
    }

    function setToggleIcon(isRunning) {
      toggleBtn.innerHTML = isRunning ? ICON_PAUSE : ICON_PLAY;
      toggleBtn.setAttribute('aria-label', isRunning ? '暂停' : '继续');
    }

    var state = {
      tick: null,        // interval id
      endTime: 0,        // ms timestamp when running
      remaining: 0,      // seconds left when paused
      total: 0,          // original seconds (for reset)
      running: false,
      done: false,
      pill: null         // the .step-time element currently driving the timer
    };

    function clearTick() {
      if (state.tick) { clearInterval(state.tick); state.tick = null; }
    }

    function setActivePill(pill) {
      var prevCard = state.pill ? state.pill.closest('.step-card') : null;
      if (state.pill && state.pill !== pill) state.pill.classList.remove('is-timing');
      state.pill = pill;
      if (pill) pill.classList.add('is-timing');
      // Glow the card whose timer is currently open so the active step is obvious
      // at a glance. The open drawer carries a matching glow via `.is-open` in CSS.
      var nextCard = pill ? pill.closest('.step-card') : null;
      if (prevCard && prevCard !== nextCard) prevCard.classList.remove('is-timing-card');
      if (nextCard) nextCard.classList.add('is-timing-card');
    }

    function render(seconds) {
      displayEl.textContent = format(seconds);
      var pct = state.total > 0 ? Math.max(0, Math.min(100, (seconds / state.total) * 100)) : 0;
      fillEl.style.width = pct + '%';
      trackEl.setAttribute('aria-valuenow', Math.round(seconds));
    }

    function finish() {
      clearTick();
      state.running = false;
      state.done = true;
      state.remaining = 0;
      panel.classList.remove('is-running');
      render(0);
      panel.classList.add('is-done');
      setToggleIcon(false);
      beep(3);
    }

    function loop() {
      var left = (state.endTime - Date.now()) / 1000;
      if (left <= 0) { finish(); return; }
      render(left);
    }

    function start(seconds) {
      stopBeep();
      panel.classList.remove('is-done');
      panel.classList.add('is-running');
      state.done = false;
      state.endTime = Date.now() + seconds * 1000;
      state.running = true;
      setToggleIcon(true);
      render(seconds);
      clearTick();
      state.tick = setInterval(loop, 250);
    }

    function pause() {
      if (!state.running) return;
      state.remaining = Math.max(0, (state.endTime - Date.now()) / 1000);
      state.running = false;
      clearTick();
      panel.classList.remove('is-running');
      render(state.remaining);
      setToggleIcon(false);
    }

    function openFor(pill, seconds) {
      setActivePill(pill);
      stepEl.textContent = pillStepTitle(pill);
      state.total = seconds;
      trackEl.setAttribute('aria-valuemax', seconds);

      // Mount the panel into this card's row so it extends from the card itself.
      var card = pill.closest('.step-card');
      var row = card ? card.closest('.step-row') : null;
      if (row && panel.parentElement !== row) row.appendChild(panel);

      // Force a reflow before flipping `.is-open` so the grow animation runs even
      // when the panel was just moved or is opening for the first time.
      void panel.offsetWidth;
      panel.classList.add('is-open');

      start(seconds);
      centerOnActive(card);
      updateJumpBtn();
    }

    // Scroll the active card + the timer that expands below it into view. The
    // timer starts collapsed, so measure its final height from `.recipe-timer-inner`
    // (its own offsetHeight is the natural height, unaffected by the clip) and fold
    // that into the block we move. Doing this up front lets the scroll and the open
    // animation run together instead of the scroll target shifting as the panel grows.
    //
    // Desktop centers the whole block in the viewport. Mobile instead pins the
    // bottom of the timer drawer near the bottom of the viewport, so the full
    // timing window is visible while keeping as much of the step card above it as
    // fits (on a narrow screen the card is taller, so centering would push the
    // timer's controls off-screen).
    var TIMER_MOBILE_BREAKPOINT = 600; // matches the `.step-card` single-column query
    var TIMER_TUCK = 14;               // `.recipe-timer` margin-top:-14px tuck behind the card
    var TIMER_BOTTOM_GAP = 12;         // gap between the drawer's bottom and the fixed footer
    var TIMER_PLACED_SLACK = 12;       // tolerance so re-toggling a placed timer doesn't re-nudge
    function centerOnActive(card) {
      if (!card || !card.getBoundingClientRect) return;
      var cardRect = card.getBoundingClientRect();
      var viewport = window.innerHeight;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Work in ABSOLUTE document coordinates, not viewport-relative deltas. `top +
      // scrollY` and the inner's natural `offsetHeight` are both invariant to an
      // in-flight smooth scroll or a half-open/half-closed drawer, so every call
      // aims at the SAME target and rapid re-toggling converges instead of drifting.
      // The drawer's visible flow height is the inner height minus the 14px it tucks
      // behind the card.
      var drawerHeight = (innerEl && innerEl.offsetHeight) ? innerEl.offsetHeight - TIMER_TUCK : 0;
      var cardTopDoc = cardRect.top + scrollY;
      var blockBottomDoc = cardTopDoc + cardRect.height + drawerHeight;
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var isMobile = window.matchMedia &&
        window.matchMedia('(max-width: ' + TIMER_MOBILE_BREAKPOINT + 'px)').matches;

      var target;
      if (isMobile) {
        // The page footer is fixed to the bottom of the viewport and paints over
        // content, so the usable bottom edge sits above it. Pin the drawer's bottom
        // just above the footer so the whole timing window shows.
        var footer = document.querySelector('.nav-footer');
        var footerH = (footer && footer.offsetHeight) ? footer.offsetHeight : 0;
        target = blockBottomDoc - (viewport - footerH - TIMER_BOTTOM_GAP);
      } else {
        // Desktop: center the card + timer block in the viewport.
        target = (cardTopDoc + (cardRect.height + drawerHeight) / 2) - viewport / 2;
      }
      if (target < 0) target = 0;

      // Already there (within tolerance)? Do nothing — this is what stops a placed
      // timer from being re-nudged each time it is toggled.
      if (Math.abs(target - scrollY) <= TIMER_PLACED_SLACK) return;
      window.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }

    function pillStepTitle(pill) {
      var head = pill.closest('.step-head');
      var title = head ? head.querySelector('.step-title') : null;
      return title ? title.textContent.trim() : '计时器';
    }

    toggleBtn.addEventListener('click', function () {
      unlockAudio();
      if (state.done) { start(state.total); return; }
      if (state.running) { pause(); }
      else { start(state.remaining || state.total); }
    });

    resetBtn.addEventListener('click', function () {
      unlockAudio();
      clearTick();
      stopBeep();
      panel.classList.remove('is-done', 'is-running');
      state.done = false;
      state.running = false;
      state.remaining = state.total;
      render(state.total);
      setToggleIcon(false);
    });

    // ---- Scrubbing the progress bar ----
    // Drag / click / wheel / arrow keys set the remaining time, snapped to STEP
    // seconds and bounded by the step's total. Works whether running or paused.
    function liveRemaining() {
      if (state.running) return Math.max(0, (state.endTime - Date.now()) / 1000);
      return state.remaining;
    }

    function setRemaining(seconds) {
      var snapped = snap(seconds);
      panel.classList.remove('is-done');
      state.done = false;
      if (state.running) {
        state.endTime = Date.now() + snapped * 1000;
      } else {
        state.remaining = snapped;
      }
      render(snapped);
    }

    function seekFromEvent(e) {
      if (!state.total) return;
      var rect = trackEl.getBoundingClientRect();
      var frac = (e.clientX - rect.left) / rect.width;
      setRemaining(frac * state.total);
    }

    var dragging = false;
    var wasRunning = false;
    trackEl.addEventListener('pointerdown', function (e) {
      if (!state.total) return;
      unlockAudio();
      dragging = true;
      wasRunning = state.running;
      state.running = false; // freeze while scrubbing; resume on release
      clearTick();
      panel.classList.add('is-scrubbing');
      document.documentElement.classList.add('rt-scrubbing'); // suppress page text selection
      try { trackEl.setPointerCapture(e.pointerId); } catch (_) {}
      seekFromEvent(e);
    });
    trackEl.addEventListener('pointermove', function (e) {
      if (dragging) seekFromEvent(e);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('is-scrubbing');
      document.documentElement.classList.remove('rt-scrubbing');
      try { trackEl.releasePointerCapture(e.pointerId); } catch (_) {}
      if (wasRunning && state.remaining > 0) start(state.remaining);
      else setToggleIcon(false);
    }
    trackEl.addEventListener('pointerup', endDrag);
    trackEl.addEventListener('pointercancel', endDrag);

    trackEl.addEventListener('wheel', function (e) {
      if (!state.total) return;
      e.preventDefault();
      unlockAudio();
      setRemaining(liveRemaining() + (e.deltaY < 0 ? STEP : -STEP));
    }, { passive: false });

    trackEl.addEventListener('keydown', function (e) {
      if (!state.total) return;
      var step = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') step = STEP;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') step = -STEP;
      else return;
      e.preventDefault();
      unlockAudio();
      setRemaining(liveRemaining() + step);
    });

    function close() {
      clearTick();
      stopBeep();
      state.running = false;
      panel.classList.remove('is-open', 'is-done', 'is-running');
      setActivePill(null);
      updateJumpBtn();
    }
    closeBtn.addEventListener('click', close);

    // ---- Jump-to-timer button ----
    // A floating control that surfaces only when a timer is open AND its drawer
    // has scrolled out of view — so a timer set then scrolled past is one tap
    // away. Clicking it runs the SAME scroll as opening the timer (desktop
    // centers the active card; mobile pins the drawer's bottom above the footer)
    // by reusing centerOnActive — no destination is redefined here.
    var jumpBtn = document.createElement('button');
    jumpBtn.className = 'recipe-timer-jump';
    jumpBtn.type = 'button';
    jumpBtn.setAttribute('aria-label', '回到计时器');
    jumpBtn.innerHTML = ICON_TIMER;
    document.body.appendChild(jumpBtn);

    var panelVisible = true; // kept in sync by the observer below
    function updateJumpBtn() {
      var show = panel.classList.contains('is-open') && !panelVisible;
      jumpBtn.classList.toggle('is-visible', show);
    }
    jumpBtn.addEventListener('click', function () {
      var card = state.pill ? state.pill.closest('.step-card') : null;
      if (card) centerOnActive(card);
    });
    // The observer fires on every scroll that crosses the drawer's edges, so the
    // button's visibility tracks the viewport without a manual scroll listener.
    // The panel re-parents between rows on open, but the observer follows the
    // element itself, so this keeps working across cards.
    if (window.IntersectionObserver) {
      var jumpObs = new IntersectionObserver(function (entries) {
        panelVisible = entries[entries.length - 1].isIntersecting;
        updateJumpBtn();
      }, { threshold: 0 });
      jumpObs.observe(panel);
    }

    // Wire each pill that carries a parseable duration.
    pills.forEach(function (pill) {
      var seconds = parseSeconds(pill.textContent);
      if (!seconds) return;
      pill.classList.add('timer-enabled');
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('aria-label', '开始计时 ' + pill.textContent.trim());

      function activate() {
        unlockAudio();
        // Clicking the pill whose timer is already open closes it — running,
        // paused, or finished alike. Any other case (different pill, or this
        // pill while its panel is closed) (re)starts the timer.
        if (pill === state.pill && panel.classList.contains('is-open')) {
          close();
        } else {
          openFor(pill, seconds);
        }
      }
      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ---- Code Copy Button ----
// Suppress "Copied!" tooltip — checkmark icon is sufficient feedback
document.addEventListener('show.bs.tooltip', function (e) {
  if (e.target.classList.contains('code-copy-button')) e.preventDefault();
});

// Remove focus ring after click
document.addEventListener('click', function (e) {
  if (e.target.closest('.code-copy-button')) e.target.closest('.code-copy-button').blur();
});
