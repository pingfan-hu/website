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
      el.style.setProperty('--anim-delay', Math.min(i * 60, 300) + 'ms');
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
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
  function addBackButton() {
    var match = window.location.pathname.match(/^\/([^\/]+)\/.+/);
    if (!match) return;
    var nav = findSectionLink(match[1]);
    if (!nav) return;
    var header = document.getElementById('title-block-header');
    if (!header || header.previousElementSibling && header.previousElementSibling.classList.contains('subpage-back-btn')) return;
    var btn = document.createElement('a');
    btn.className = 'subpage-back-btn';
    btn.href = nav.href;
    btn.innerHTML = '<i class="nav-arrow" aria-hidden="true">←</i><span>Back to ' + nav.title + '</span>';
    header.parentNode.insertBefore(btn, header);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBackButton);
  } else {
    addBackButton();
  }
})();

// ---- Subpage Prev / Next Buttons ----
// For any subpage that appears in /listings.json, append a row of prev/older
// (left) and next/newer (right) buttons at the end of <main.content>. Items
// in listings.json are newest-first, so newer = items[idx - 1] and older =
// items[idx + 1]. Hidden when there is no neighbor on that side.
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
  function renderNav(olderHref, newerHref, titleMap) {
    if (!olderHref && !newerHref) return;
    var main = document.querySelector('main.content');
    if (!main) return;
    var nav = document.createElement('nav');
    nav.className = 'post-nav';
    nav.setAttribute('aria-label', 'Post navigation');
    var prevSlot = document.createElement('div');
    prevSlot.className = 'post-nav-slot post-nav-slot-prev';
    var nextSlot = document.createElement('div');
    nextSlot.className = 'post-nav-slot post-nav-slot-next';
    if (olderHref) prevSlot.appendChild(makeBtn(olderHref, 'prev', titleMap[olderHref]));
    if (newerHref) nextSlot.appendChild(makeBtn(newerHref, 'next', titleMap[newerHref]));
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
      var newer = hit.idx > 0 ? hit.items[hit.idx - 1] : null;
      var older = hit.idx < hit.items.length - 1 ? hit.items[hit.idx + 1] : null;
      renderNav(older, newer, titleMap);
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

// ---- Code Copy Button ----
// Suppress "Copied!" tooltip — checkmark icon is sufficient feedback
document.addEventListener('show.bs.tooltip', function (e) {
  if (e.target.classList.contains('code-copy-button')) e.preventDefault();
});

// Remove focus ring after click
document.addEventListener('click', function (e) {
  if (e.target.closest('.code-copy-button')) e.target.closest('.code-copy-button').blur();
});
