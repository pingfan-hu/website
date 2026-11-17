// The Emaki post's banner, live in the blog listing: the same drawing as
// 2026-11-16-emaki.png (resources/scripts/banner/emaki.html), inlined in the
// card in its place, and wound by the pointer as the handscroll in the post
// is (blog/2026-11-16-emaki/resources/hero-scroll.js, whose spring this
// keeps). Paper leaving one roll goes onto the other, so one thickens as the
// other thins; what is drawn on the sheet passes at a speed by how near it
// stands, the chat, forward of the sheet, the fastest; the sun rises and
// sinks a little with the pointer. The PNG stays the front matter's image,
// for link previews and a page without scripts. Colors are in styles.scss
// (Live banners), so the drawing follows the site's appearance.

(function () {
  "use strict";

  var img = document.querySelector('.quarto-post img[src$="banners/2026-11-16-emaki.png"]');
  if (!img) return;
  var card = img.closest(".quarto-post");

  var box = document.createElement("div");
  box.className = "emaki-banner";
  box.innerHTML =
    '<svg viewBox="0 0 1376 768" role="img" aria-label="Emaki, the agentic development environment: a handscroll whose sheet holds a small landscape and then the app, its sidebar and its chat.">' +
    '<defs><clipPath id="emb-clip"><rect class="emb-cliprect" x="600" y="192" width="696" height="384"/></clipPath></defs>' +
    '<text class="emb-name" x="92" y="392">Emaki</text>' +
    '<text class="emb-what" x="98" y="452">The Agentic</text>' +
    '<text class="emb-what" x="98" y="488">Development Environment</text>' +
    '<g transform="translate(-14 0)">' +
    // The scroll: the sheet, its two edges, the rolls, their turns and axles.
    '<rect class="emb-sheet" x="600" y="192" width="696" height="384"/>' +
    '<path class="emb-edge emb-edges"/>' +
    '<rect class="emb-sil emb-roll-l" y="176" height="416"/>' +
    '<rect class="emb-sil emb-roll-r" y="176" height="416"/>' +
    '<path class="emb-edge emb-axles"/>' +
    '<g class="emb-mid emb-turns"></g>' +
    // The picture, as an old scroll has one, and the sidebar, cut to the sheet.
    '<g clip-path="url(#emb-clip)">' +
    '<g class="emb-layer" data-depth="0.3"><text class="emb-seal" x="631" y="242">絵</text><text class="emb-seal" x="631" y="276">巻</text></g>' +
    '<circle class="emb-sun" cx="808" cy="268" r="18"/>' +
    '<g class="emb-layer" data-depth="0.25"><path class="emb-lo" d="M660 386C696 366 712 326 746 324S796 362 830 354S862 330 878 338"/></g>' +
    '<g class="emb-layer" data-depth="0.45"><path class="emb-mid" d="M660 430C704 404 732 440 776 428S838 398 878 416M684 420V396M676 404l8-8 8 8M677 413l7-7 7 7"/></g>' +
    '<g class="emb-layer" data-depth="0.6"><path class="emb-lo" d="M664 474H720M750 474H796M832 474H878M690 502H748M792 502H852M664 530H704M740 530H816"/><path class="emb-mid" d="M772 468q16 10 32 0M788 468V442M788 444l14 20H788"/></g>' +
    '<g class="emb-layer" data-depth="0.8"><g transform="translate(-30 0)">' +
    '<rect class="emb-pane" x="936" y="212" width="92" height="344" rx="10"/>' +
    '<path class="emb-hi" d="M950 250H994"/>' +
    '<path class="emb-mid" d="M950 286H996M950 316H988M950 346H998M950 396H990M950 426H1004"/>' +
    '<circle class="emb-waits" cx="1013" cy="286" r="5"/><circle class="emb-works" cx="1013" cy="316" r="5"/><circle class="emb-done" cx="1013" cy="346" r="5"/>' +
    '</g></g>' +
    '</g>' +
    // The chat, forward of the sheet: your message, the answer, the composer.
    '<g class="emb-layer emb-forward" data-depth="1"><g transform="translate(-30 0)">' +
    '<rect class="emb-pane" x="1038" y="176" width="240" height="416" rx="14"/>' +
    '<rect class="emb-hi emb-wash" x="1152" y="204" width="110" height="40" rx="12"/>' +
    '<path class="emb-mid" d="M1168 224H1246M1082 290H1258M1082 312H1236M1082 334H1180"/>' +
    '<path class="emb-claude" d="M1061 280l3 8.5 8.5 3-8.5 3-3 8.5-3-8.5-8.5-3 8.5-3z"/>' +
    '<rect class="emb-hi" x="1054" y="500" width="208" height="72" rx="14"/>' +
    '<path class="emb-lo" d="M1072 524H1160"/>' +
    '<circle class="emb-dk" cx="1240" cy="550" r="10"/>' +
    '</g></g>' +
    '</g></svg>';
  img.replaceWith(box);

  var SVGNS = "http://www.w3.org/2000/svg";
  var q = function (s) { return box.querySelector(s); };
  var sheet = q(".emb-sheet"), clip = q(".emb-cliprect"), edges = q(".emb-edges");
  var rollL = q(".emb-roll-l"), rollR = q(".emb-roll-r"), axles = q(".emb-axles");
  var turns = q(".emb-turns"), sun = q(".emb-sun");
  var layers = [].map.call(box.querySelectorAll(".emb-layer"), function (el) {
    return { el: el, depth: parseFloat(el.getAttribute("data-depth")) };
  });

  // The rolls' outer ends stay put; the left roll is 52 wide at rest and
  // the right 30, as in the PNG, and each gives or takes 16 and 12. The
  // nearest thing on the sheet winds 32 to either side.
  var LEFT = 548, RIGHT = 1326, TOP = 192, FOOT = 576, RANGE = 32;

  function attrs(el, map) { for (var k in map) el.setAttribute(k, map[k]); }

  // An axle's two ends, over and under the roll, w wide.
  function axle(c, w) {
    var a = c - w / 2, b = c + w / 2, r = Math.min(6, w / 2);
    return "M" + a + " 177V164q0-6 " + r + "-6h" + (w - 2 * r) + "q" + r + " 0 " + r + " 6V177" +
      "M" + a + " 591V604q0 6 " + r + " 6h" + (w - 2 * r) + "q" + r + " 0 " + r + "-6V591";
  }

  // The paper wound on a roll, as its turns: a line every 18 from the
  // sheet's edge outward, the last fading as its room goes. `inset` is how
  // near the outer end a turn may come, which keeps the rest state the PNG's
  // (two turns on the left roll, none on the thin right one).
  function windTurns(from, way, outer, inset) {
    for (var x = from + way * 17; way * (outer - x) > 0; x += way * 18) {
      var room = Math.abs(outer - x);
      var a = Math.min(1, Math.max(0, (room - inset) / 6));
      if (a <= 0) break;
      var line = document.createElementNS(SVGNS, "line");
      attrs(line, { x1: x, y1: 198, x2: x, y2: 570, "stroke-opacity": a });
      turns.appendChild(line);
    }
  }

  function draw(wind, lift) {
    var leftW = 52 + 16 * wind, rightW = 30 - 12 * wind;
    var sheetX = LEFT + leftW, rightX = RIGHT - rightW;
    attrs(sheet, { x: sheetX, width: rightX - sheetX });
    attrs(clip, { x: sheetX, width: rightX - sheetX });
    edges.setAttribute("d", "M" + sheetX + " " + TOP + "H" + rightX + "M" + sheetX + " " + FOOT + "H" + rightX);
    attrs(rollL, { x: LEFT, width: leftW, rx: Math.min(20, leftW / 2) });
    attrs(rollR, { x: rightX, width: rightW, rx: Math.min(12, rightW / 2) });
    axles.setAttribute("d", axle(LEFT + leftW / 2, 16) + axle(rightX + rightW / 2, 12));
    while (turns.firstChild) turns.removeChild(turns.firstChild);
    windTurns(sheetX, -1, LEFT, 10);
    windTurns(rightX, 1, RIGHT, 13);
    layers.forEach(function (l) {
      l.el.setAttribute("transform", "translate(" + (-wind * RANGE * l.depth) + " 0)");
    });
    sun.setAttribute("transform", "translate(" + (-wind * RANGE * 0.08) + " " + (-lift * 12) + ")");
  }

  draw(0, 0);

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var coarse = window.matchMedia("(hover: none), (pointer: coarse)");
  if (still.matches) return;

  // The handscroll's spring: stiff enough to keep up with the pointer, loose
  // enough to run a little past where it stops. A frame is asked for only
  // while it moves.
  var wind = 0, windV = 0, lift = 0, liftV = 0, toWind = 0, toLift = 0;
  var last = null, frame = null, STIFF = 90, DAMP = 13;

  function step(now) {
    frame = null;
    var dt = last === null ? 0 : Math.min((now - last) / 1000, 1 / 30);
    last = now;
    for (var i = 0; i < 2; i++) {
      var h = dt / 2;
      windV += (STIFF * (toWind - wind) - DAMP * windV) * h; wind += windV * h;
      liftV += (STIFF * (toLift - lift) - DAMP * liftV) * h; lift += liftV * h;
    }
    var settled = function (at, to, v) { return Math.abs(at - to) < 0.002 && Math.abs(v) < 0.01; };
    if (settled(wind, toWind, windV) && settled(lift, toLift, liftV)) {
      wind = toWind; lift = toLift; windV = 0; liftV = 0; last = null;
      draw(wind, lift);
      return;
    }
    draw(wind, lift);
    frame = window.requestAnimationFrame(step);
  }
  function run() { if (frame === null) frame = window.requestAnimationFrame(step); }

  // The card's title link is stretched over the whole card, so the pointer
  // is heard on the card; the scroll answers only while it is over the
  // banner, and goes back to rest when it leaves.
  function ask(e) {
    var b = box.getBoundingClientRect();
    var over = e && b.width && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    if (!over) { toWind = 0; toLift = 0; }
    else {
      toWind = (e.clientX - b.left) / b.width * 2 - 1;
      toLift = (e.clientY - b.top) / b.height * 2 - 1;
    }
    run();
  }

  if (coarse.matches) {
    // Without a pointer, it winds slowly on its own while it is in view.
    var started = null, seen = false, ticking = false;
    var drift = function (now) {
      if (!seen) { ticking = false; started = null; return; }
      if (started === null) started = now;
      draw(0.6 * Math.sin((now - started) / 26000 * 2 * Math.PI), 0);
      window.requestAnimationFrame(drift);
    };
    new IntersectionObserver(function (es) {
      seen = es[0].isIntersecting;
      if (seen && !ticking) { ticking = true; window.requestAnimationFrame(drift); }
    }).observe(box);
  } else {
    card.addEventListener("pointermove", ask);
    card.addEventListener("pointerleave", function () { ask(null); });
  }
})();
