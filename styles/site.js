// ---- Footer Year ----
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
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
