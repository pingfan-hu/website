// The post's downloads, as emaki.lol has them (its js/page.js, adapted): each
// `.dl` holds one link to the latest release, and this gives it a menu of
// the installers and names this computer's. On a Mac or a PC the pill takes
// this computer's installer and the segment at its right opens that
// system's others; on Linux the pill is the menu, since a browser often
// cannot tell x64 from ARM and a .deb or an AppImage is the person's to
// choose; with no system to go by the pill keeps the release page and the
// menu lists every installer. Without this script the link still works.
(function () {
  "use strict";

  var BASE = "https://github.com/alkaline-software/emaki/releases/latest";
  var FILES = [
    ["mac", "arm64", "macOS", "Apple silicon", "Emaki-mac-arm64.dmg"],
    ["mac", "x64", "macOS", "Intel", "Emaki-mac-x64.dmg"],
    ["windows", "x64", "Windows", "x64", "Emaki-windows-x64-setup.exe"],
    ["windows", "arm64", "Windows", "ARM", "Emaki-windows-arm64-setup.exe"],
    ["linux", "x64", "Linux", "x64 .deb", "Emaki-linux-x64.deb"],
    ["linux", "arm64", "Linux", "ARM .deb", "Emaki-linux-arm64.deb"],
    ["linux", "x64", "Linux", "x64 AppImage", "Emaki-linux-x64.AppImage"],
    ["linux", "arm64", "Linux", "ARM AppImage", "Emaki-linux-arm64.AppImage"]
  ];

  // A browser does not say which chip a Mac has, but its graphics renderer
  // does, near enough: Apple's own GPU is Apple silicon.
  function macChip() {
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      var renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      if (!renderer) return null;
      if (/Apple/i.test(renderer)) return "arm64";
      if (/Intel|AMD|Radeon|NVIDIA/i.test(renderer)) return "x64";
    } catch (e) {}
    return null;
  }
  // Chrome and Edge say "x64" everywhere and tell the truth only when asked.
  function pcChip() {
    var said = navigator.userAgent + " " + (navigator.platform || "");
    return /aarch64|arm64|armv8/i.test(said) ? "arm64" : null;
  }
  function chipAsked() {
    var data = navigator.userAgentData;
    if (!data || !data.getHighEntropyValues) return Promise.resolve(null);
    return data.getHighEntropyValues(["architecture"]).then(function (v) {
      return v.architecture === "arm" ? "arm64" : v.architecture === "x86" ? "x64" : null;
    }, function () { return null; });
  }
  function here() {
    var ua = navigator.userAgent;
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    if (/Mac/i.test(platform) && !/iPhone|iPad/i.test(ua)) return { os: "mac", chip: macChip() };
    if (/Win/i.test(platform)) return { os: "windows", chip: pcChip() };
    if (/Linux/i.test(platform) && !/Android/i.test(ua)) return { os: "linux", chip: null };
    return null;
  }

  var count = 0;
  function row(href, os, chip, name, kind) {
    var a = document.createElement("a");
    // Quarto marks every link that leaves the site to open in a new tab, and
    // puts back the address a link had when the page loaded; `no-external`
    // keeps it off the pill (set in the markup) and off these rows.
    a.className = "no-external";
    a.setAttribute("role", "menuitem");
    a.href = href;
    if (os) { a.setAttribute("data-os", os); a.setAttribute("data-chip", chip); }
    var strong = document.createElement("strong");
    strong.textContent = name;
    a.appendChild(strong);
    if (kind) {
      var span = document.createElement("span");
      span.textContent = kind;
      a.appendChild(span);
    }
    return a;
  }

  function control(box, h) {
    var main = box.querySelector(".dl-main");
    var word = box.querySelector(".dl-word");
    if (!main || !word) return;

    var more = document.createElement("button");
    more.className = "dl-more";
    more.type = "button";
    more.setAttribute("aria-haspopup", "menu");
    more.setAttribute("aria-expanded", "false");
    more.setAttribute("aria-label", "More downloads");
    var menu = document.createElement("div");
    menu.className = "dl-menu";
    menu.id = "dl-menu-" + (++count);
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Downloads");
    more.setAttribute("aria-controls", menu.id);

    var name = null;
    for (var i = 0; i < FILES.length; i++) {
      var f = FILES[i];
      if (h && f[0] !== h.os) continue;
      if (h) name = f[2];
      menu.appendChild(row(BASE + "/download/" + f[4], f[0], f[1], f[2], f[3]));
    }
    if (h) {
      var all = row(BASE, null, null, "Other systems", null);
      all.className = "no-external dl-all";
      all.target = "_blank";
      all.rel = "noopener";
      menu.appendChild(all);
    }
    box.appendChild(more);
    box.appendChild(menu);
    box.classList.add("dl-ready");

    var ask = !!h && h.os === "linux";
    function take(h) {
      var pick = menu.querySelector('[data-os="' + h.os + '"]' + (h.chip ? '[data-chip="' + h.chip + '"]' : ""));
      if (!pick) return;
      var was = menu.querySelector(".dl-here");
      if (was) was.classList.remove("dl-here");
      // An installer downloads where the page is; only the release page opens a tab.
      main.href = pick.href;
      main.removeAttribute("target");
      pick.classList.add("dl-here");
    }
    if (h) {
      if (name && !box.hasAttribute("data-short")) word.textContent = "Download for " + name;
      if (ask) {
        box.classList.add("dl-ask");
        main.setAttribute("role", "button");
        main.setAttribute("aria-haspopup", "menu");
        main.setAttribute("aria-expanded", "false");
        main.setAttribute("aria-controls", menu.id);
      } else {
        take(h);
        if (h.os === "windows" && !h.chip) {
          chipAsked().then(function (chip) { if (chip) take({ os: h.os, chip: chip }); });
        }
      }
    }

    function setOpen(open) {
      box.classList.toggle("dl-open", open);
      (ask ? main : more).setAttribute("aria-expanded", String(open));
    }
    main.addEventListener("click", function (e) {
      if (!ask) return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(!box.classList.contains("dl-open"));
    });
    // A link answers Enter by itself; as a button the pill answers Space too.
    main.addEventListener("keydown", function (e) {
      if (!ask || e.key !== " ") return;
      e.preventDefault();
      setOpen(!box.classList.contains("dl-open"));
    });
    more.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!box.classList.contains("dl-open"));
    });
    menu.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  function init() {
    var boxes = document.querySelectorAll(".dl"), h = here();
    for (var i = 0; i < boxes.length; i++) control(boxes[i], h);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
