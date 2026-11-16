// The handscroll on the home page, answering the pointer.
//
// A port of `Workbench::home_scroll` and the `HomeFig` spring from the app
// (crates/emaki-app/src/workbench.rs). The figure's markup is _hero.html; the
// constants and the spring below are the app's own, so the two move alike.
//
// The pointer moved across winds the scroll: paper leaving one roll goes onto
// the other, so one thickens as the other thins, and the landscape's four
// layers pass at four speeds by how far off each is. A frame is asked for only
// while the spring is live, none at rest.

(function () {
  "use strict";

  var fig = document.getElementById("hero-fig");
  if (!fig) return;

  // The drawing's box, a roll's two ends, the sheet's two edges. The box is
  // the site's, not the app's: 400 wide for the app's 300, a longer sheet
  // unrolled, so the figure is wide and short at the head of the page. 400
  // is as long as the landscape's strip still covers the sheet at the
  // farthest wind (its nearest layer is 640 and winds 150 to either side);
  // the rest is the app's.
  var W = 400, TOP = 12, FOOT = 98, EDGE = 6, KNOB = 8, SW = 1.5;
  // The landscape's strip, and how far its nearest layer winds to either side.
  var STRIP = 640, RANGE = 150;

  var SHEET_Y = TOP + EDGE;                 // 18
  var SHEET_H = FOOT - TOP - 2 * EDGE;      // 74
  var LEFT_X = 4;

  var svg = fig.querySelector("svg");
  var clip = document.getElementById("hero-clip");
  var sun = document.getElementById("hero-sun");
  var edgeTop = document.getElementById("hero-edge-top");
  var edgeBot = document.getElementById("hero-edge-bot");
  var rollL = document.getElementById("hero-roll-l");
  var rollR = document.getElementById("hero-roll-r");
  var knobs = {
    lt: document.getElementById("hero-knob-lt"),
    lb: document.getElementById("hero-knob-lb"),
    rt: document.getElementById("hero-knob-rt"),
    rb: document.getElementById("hero-knob-rb")
  };
  var turns = document.getElementById("hero-turns");
  var layers = [].map.call(fig.querySelectorAll(".hero-layer"), function (el) {
    return { el: el, depth: parseFloat(el.getAttribute("data-depth")) };
  });

  var SVGNS = "http://www.w3.org/2000/svg";

  function attrs(el, map) {
    for (var k in map) el.setAttribute(k, map[k]);
  }

  // Three sides of an axle's end, open where the roll is: the corners away
  // from the roll are rounded, as the app rounds them by 2.
  function knobPath(x0, x1, up) {
    var r = 2 - SW / 2;
    return up
      ? "M" + x0 + " " + (TOP + SW) +
        " L" + x0 + " " + (TOP - KNOB + SW + SW / 2 + r) +
        " Q" + x0 + " " + (TOP - KNOB + SW + SW / 2) + " " + (x0 + r) + " " + (TOP - KNOB + SW + SW / 2) +
        " L" + (x1 - r) + " " + (TOP - KNOB + SW + SW / 2) +
        " Q" + x1 + " " + (TOP - KNOB + SW + SW / 2) + " " + x1 + " " + (TOP - KNOB + SW + SW / 2 + r) +
        " L" + x1 + " " + (TOP + SW)
      : "M" + x0 + " " + (FOOT - SW) +
        " L" + x0 + " " + (FOOT + KNOB - SW - SW / 2 - r) +
        " Q" + x0 + " " + (FOOT + KNOB - SW - SW / 2) + " " + (x0 + r) + " " + (FOOT + KNOB - SW - SW / 2) +
        " L" + (x1 - r) + " " + (FOOT + KNOB - SW - SW / 2) +
        " Q" + x1 + " " + (FOOT + KNOB - SW - SW / 2) + " " + x1 + " " + (FOOT + KNOB - SW - SW / 2 - r) +
        " L" + x1 + " " + (FOOT - SW);
  }

  // The paper wound on a roll, seen as its turns: a line a turn, counted in
  // from the sheet, the last one fading as its room goes.
  function windTurns(from, to) {
    var room = Math.abs(to - from);
    var way = Math.sign(to - from);
    for (var at = 6; at < room - 4; at += 5) {
      var line = document.createElementNS(SVGNS, "line");
      var x = from + way * at;
      attrs(line, {
        x1: x, y1: SHEET_Y + 3, x2: x, y2: SHEET_Y + SHEET_H - 3,
        "stroke-opacity": 0.3 * Math.min(1, Math.max(0, (room - 4 - at) / 5))
      });
      turns.appendChild(line);
    }
  }

  // Where the figure stands for a given wind and lift.
  function draw(wind, lift) {
    // The pointer to the right winds the paper leftward: onto the left roll,
    // off the right.
    var leftW = 22 + 5 * wind;
    var rightW = 12 - 5 * wind;
    var rightX = W - 4 - rightW;
    var sheetX = LEFT_X + leftW;
    var sheetW = rightX - sheetX;

    attrs(clip, { x: sheetX, width: sheetW });

    layers.forEach(function (l) {
      l.el.setAttribute(
        "transform",
        "translate(" + ((W - STRIP) / 2 - wind * RANGE * l.depth) + " " + SHEET_Y + ")"
      );
    });

    // The sun rises and sinks a little with the pointer.
    // It stands where the app has it over the landscape: 214 in its 300.
    attrs(sun, { cx: 214 + (W - 300) / 2 - wind * RANGE * 0.08, cy: SHEET_Y + 17 - lift * 5 });

    attrs(edgeTop, { x1: sheetX, x2: rightX, y1: SHEET_Y, y2: SHEET_Y });
    attrs(edgeBot, { x1: sheetX, x2: rightX, y1: SHEET_Y + SHEET_H, y2: SHEET_Y + SHEET_H });

    attrs(rollL, {
      x: LEFT_X + SW / 2, y: TOP + SW / 2, width: leftW - SW, height: FOOT - TOP - SW,
      rx: Math.min(8, leftW / 2) - SW / 2
    });
    attrs(rollR, {
      x: rightX + SW / 2, y: TOP + SW / 2, width: rightW - SW, height: FOOT - TOP - SW,
      rx: Math.min(5, rightW / 2) - SW / 2
    });

    var lx = LEFT_X + leftW / 2, rx = rightX + rightW / 2;
    knobs.lt.setAttribute("d", knobPath(lx - 3 + SW / 2, lx + 3 - SW / 2, true));
    knobs.lb.setAttribute("d", knobPath(lx - 3 + SW / 2, lx + 3 - SW / 2, false));
    knobs.rt.setAttribute("d", knobPath(rx - 3 + SW / 2, rx + 3 - SW / 2, true));
    knobs.rb.setAttribute("d", knobPath(rx - 3 + SW / 2, rx + 3 - SW / 2, false));

    while (turns.firstChild) turns.removeChild(turns.firstChild);
    windTurns(sheetX, LEFT_X);
    windTurns(rightX, rightX + rightW);
  }

  draw(0, 0);

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var coarse = window.matchMedia("(hover: none), (pointer: coarse)");

  // Where the scroll is in its answer to the pointer: how far it is wound to
  // one side and how high its sun stands, each from -1 to 1 with rest at 0,
  // how fast each is moving, and where the pointer asks them to be.
  var wind = 0, windV = 0, lift = 0, liftV = 0;
  var toWind = 0, toLift = 0;
  var last = null, frame = null, drift = null;

  // Stiff enough to keep up with the pointer, loose enough to run a little
  // past where it stops.
  var STIFF = 90, DAMP = 13;

  function step(now) {
    frame = null;
    var dt = last === null ? 0 : Math.min((now - last) / 1000, 1 / 30);
    last = now;
    for (var i = 0; i < 2; i++) {
      var h = dt / 2;
      windV += (STIFF * (toWind - wind) - DAMP * windV) * h;
      wind += windV * h;
      liftV += (STIFF * (toLift - lift) - DAMP * liftV) * h;
      lift += liftV * h;
    }
    var settled = function (at, to, v) {
      return Math.abs(at - to) < 0.002 && Math.abs(v) < 0.01;
    };
    if (settled(wind, toWind, windV) && settled(lift, toLift, liftV)) {
      wind = toWind; lift = toLift; windV = 0; liftV = 0;
      last = null;
      draw(wind, lift);
      return;                       // no frame asked for at rest
    }
    draw(wind, lift);
    frame = window.requestAnimationFrame(step);
  }

  function run() {
    if (frame === null) frame = window.requestAnimationFrame(step);
  }

  // The pointer's place across and down the drawing, or none when it has
  // left: the scroll is asked there, or back to rest.
  function ask(e) {
    if (!e) {
      toWind = 0; toLift = 0;
    } else {
      var b = svg.getBoundingClientRect();
      if (!b.width || !b.height) return;
      var clamp = function (n) { return Math.min(1, Math.max(-1, n)); };
      toWind = clamp((e.clientX - b.left) / b.width * 2 - 1);
      toLift = clamp((e.clientY - b.top) / b.height * 2 - 1);
    }
    run();
  }

  // Without a pointer to answer, the scroll winds slowly on its own, so the
  // figure is not a still frame on a phone.
  function autoDrift() {
    var started = null;
    drift = function (now) {
      if (started === null) started = now;
      var t = (now - started) / 26000;          // a turn each 26 seconds
      wind = 0.6 * Math.sin(t * 2 * Math.PI);
      draw(wind, 0);
      window.requestAnimationFrame(drift);
    };
    window.requestAnimationFrame(drift);
  }

  // At rest and left there: no pointer listeners, no loop.
  if (still.matches) return;

  if (coarse.matches) {
    autoDrift();
  } else {
    fig.addEventListener("pointermove", ask);
    fig.addEventListener("pointerleave", function () { ask(null); });
  }
})();
