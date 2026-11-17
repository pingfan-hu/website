// Hairline: images drawn from specs by one engine, so that every image is
// made of the same parts in the same places and can be drawn again exactly.
// The canonical copy lives in the ph-image skill (hairline/engine.js); a
// project that uses it keeps a verbatim copy and never edits it there. The
// same drawing is shot to PNGs (hairline/shoot.R, light and dark) and runs
// live in a page, where it answers the pointer.
//
// Two canvases:
// - A banner (the default): 1376 x 768. The words stand in a column from
//   x 96 to 608; the stage at the right is a grid of 3 x 3 cells, each
//   208 x 144, from x 656 and y 168, with a 32 gutter.
// - A figure (`canvas: { cols, rows }`): no words, a stage of cols x rows
//   cells with a 48 margin all round, the canvas its size.
// Every part sits on the stage's grid: `at` is its top-left cell (half
// steps allowed, to center a part), `span` its size in cells, and a part's
// size is its span less the gutter.
// - The parts: a tile (112 square, one Tabler icon at 48), a window (a
//   title bar with three dots over one of a fixed set of contents), and a
//   layer (a plane seen at a slant across the stage, with nodes). Links
//   between parts are hairlines that run straight where they can and turn
//   once where they cannot.
// - A banner's title takes the largest of four sizes at which its longest
//   line fits the column; the block of words is centered on the middle.
// - One part per image is the key: drawn in the image's color, standing
//   forward with a soft shade. Everything else is the muted ink and two
//   grays, so the color is spent once.
// - Under the pointer, each part moves by its depth (windows behind, tiles
//   nearer, the key nearest, a layer by its own place in a stack), with a
//   spring, and the links follow their ends.
//
// Live in a page: load the specs (window.HAIRLINE_SPECS = { id: spec }) and
// then this script; every <img> whose file name, without .png, is a spec's
// id is drawn live in its place, once Optima and Maple Mono are in.

(function () {
  "use strict";

  // Tabler outline icons (MIT, tabler.io/icons, v3.31.0), path data on their
  // 24 grid: the same family as the site's glyphs.
  var ICONS = {"app-window":"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2zM6 8h.01M9 8h.01","apps":"M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM14 7l6 0M17 4l0 6","bolt":"M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11","book":"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6l0 13M12 6l0 13M21 6l0 13","brand-docker":"M22 12.54c-1.804 -.345 -2.701 -1.08 -3.523 -2.94c-.487 .696 -1.102 1.568 -.92 2.4c.028 .238 -.32 1 -.557 1h-14c0 5.208 3.164 7 6.196 7c4.124 .022 7.828 -1.376 9.854 -5c1.146 -.101 2.296 -1.505 2.95 -2.46zM5 10h3v3h-3zM8 10h3v3h-3zM11 10h3v3h-3zM8 7h3v3h-3zM11 7h3v3h-3zM11 4h3v3h-3zM4.571 18c1.5 0 2.047 -.074 2.958 -.78M10 16l0 .01","brand-github":"M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5","building":"M3 21l18 0M9 8l1 0M9 12l1 0M9 16l1 0M14 8l1 0M14 12l1 0M14 16l1 0M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16","car":"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5","charging-pile":"M18 7l-1 1M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14M9 11.5l-1.5 2.5h3l-1.5 2.5M3 20l12 0M4 8l10 0","chart-line":"M4 19l16 0M4 15l4 -6l4 2l4 -5l4 4","clock":"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 7v5l3 3","code":"M7 8l-4 4l4 4M17 8l4 4l-4 4M14 4l-4 16","coin":"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1M12 7v10","database":"M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0M4 6v6a8 3 0 0 0 16 0v-6M4 12v6a8 3 0 0 0 16 0v-6","download":"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2M7 11l5 5l5 -5M12 4l0 12","file-code":"M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2zM10 13l-1 2l1 2M14 13l1 2l-1 2","file-settings":"M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M12 10.5v1.5M12 16v1.5M15.031 12.25l-1.299 .75M10.268 15l-1.3 .75M15 15.803l-1.285 -.773M10.285 12.97l-1.285 -.773M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z","forms":"M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1M17 12h.01M13 12h.01","git-branch":"M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 8l0 8M9 18h6a2 2 0 0 0 2 -2v-5M14 14l3 -3l3 3","git-commit":"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 3l0 6M12 15l0 6","git-pull-request":"M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M6 8l0 8M11 6h5a2 2 0 0 1 2 2v8M14 9l-3 -3l3 -3","key":"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0zM15 9h.01","keyboard":"M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2zM6 10l0 .01M10 10l0 .01M14 10l0 .01M18 10l0 .01M6 14l0 .01M18 14l0 .01M10 14l4 .01","link":"M9 15l6 -6M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463","list-check":"M3.5 5.5l1.5 1.5l2.5 -2.5M3.5 11.5l1.5 1.5l2.5 -2.5M3.5 17.5l1.5 1.5l2.5 -2.5M11 6l9 0M11 12l9 0M11 18l9 0","lock":"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6zM11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M8 11v-4a4 4 0 1 1 8 0v4","messages":"M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2","moon":"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z","notebook":"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18M13 8l2 0M13 12l2 0","package":"M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5M12 12l8 -4.5M12 12l0 9M12 12l-8 -4.5M16 5.25l-8 4.5","pencil":"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4M13.5 6.5l4 4","player-track-prev":"M21 5v14l-8 -7zM10 5v14l-8 -7z","plug":"M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054zM4 20l3.5 -3.5M15 4l-3.5 3.5M20 9l-3.5 3.5","presentation":"M3 4l18 0M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10M12 16l0 4M9 20l6 0M8 12l3 -3l2 2l3 -3","puzzle":"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1","rocket":"M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0","route":"M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4zM11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5","server":"M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3zM3 12m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3zM7 8l0 .01M7 16l0 .01","settings-automation":"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065zM10 9v6l5 -3z","sitemap":"M3 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM15 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1M12 9l0 3","sun":"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7","terminal-2":"M8 9l3 3l-3 3M13 15l3 0M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z","tool":"M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5","tools":"M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4M14.5 5.5l4 4M12 8l-5 -5l-4 4l5 5M7 8l-1.5 1.5M16 12l5 5l-4 4l-5 -5M16 17l-1.5 1.5","trending-up":"M3 17l6 -6l4 4l8 -8M14 7l7 0l0 7","user":"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2","users":"M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0 -3 -3.85","wand":"M6 21l15 -15l-3 -3l-15 15l3 3M15 6l3 3M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2","webhook":"M4.876 13.61a4 4 0 1 0 6.124 3.39h6M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5","wind":"M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24","world-www":"M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4M11.5 3a16.989 16.989 0 0 0 -1.826 4M12.5 3a16.989 16.989 0 0 1 1.828 4M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4M11.5 21a16.989 16.989 0 0 1 -1.826 -4M12.5 21a16.989 16.989 0 0 0 1.828 -4M2 10l1 4l1.5 -4l1.5 4l1 -4M17 10l1 4l1.5 -4l1.5 4l1 -4M9.5 10l1 4l1.5 -4l1.5 4l1 -4"};

  var CELL_W = 208, CELL_H = 144, GUT = 32, MARGIN = 48;
  var COL_X = 96, COL_W = 512;
  // The canvas and stage for a spec: a banner, or a bare figure.
  function geometry(spec) {
    var c = spec.canvas;
    if (!c) return { W: 1376, H: 768, sx: 656, sy: 168, cols: 3, rows: 3, words: true };
    return { W: c.cols * CELL_W + 2 * MARGIN - GUT, H: c.rows * CELL_H + 2 * MARGIN - GUT, sx: MARGIN - GUT / 2, sy: MARGIN - GUT / 2, cols: c.cols, rows: c.rows, words: false };
  }
  var SIZES = [136, 112, 96, 80];
  var NS = "http://www.w3.org/2000/svg";

  // The colors. Light: the site's tokens, the two grays a step firmer, as a
  // banner is seen at a quarter of its size; the ground is the key mixed 11%
  // into the panel. Dark: not the site's dark page but a slate lighter than
  // the card a banner sits in, the same for every key.
  var CSS = [
    ".hl{--panel:#FFFFFF;--ink:#2A2920;--muted:#77746B;--border:#D8D5CA;--border-2:#C4C1B5;--claude:#D97757;",
    "--accent:#5061B3;--ochre:#9E793D;--sage:#578F63;--mauve:#986EA2;--slate:#4489AE;--rose:#AF6974;",
    "--k:var(--accent);--ground:color-mix(in oklab,var(--k) 11%,var(--panel));--soft:color-mix(in oklab,var(--ink) 72%,var(--ground));",
    "--shade:color-mix(in oklab,var(--k) 30%,transparent)}",
    ".hl.dark{--panel:#474A57;--ink:#F3F1EA;--muted:#B6B4AE;--border:#696C78;--border-2:#838692;--claude:#E48D6F;",
    "--accent:#AAB9F3;--ochre:#E2C38E;--sage:#A6D5AF;--mauve:#DDB8E5;--slate:#95CDEE;--rose:#EFB3BB;",
    "--ground:#393C48;--shade:rgb(0 0 0 / 0.28)}",
    ".hl.k-accent{--k:var(--accent)}.hl.k-ochre{--k:var(--ochre)}.hl.k-sage{--k:var(--sage)}.hl.k-mauve{--k:var(--mauve)}.hl.k-slate{--k:var(--slate)}.hl.k-rose{--k:var(--rose)}",
    ".hl svg{display:block;width:100%;height:auto;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}",
    ".hl .ground{fill:var(--ground)}",
    ".hl .t-title{font-family:Optima,'Avenir Next',Avenir,sans-serif;fill:var(--ink);letter-spacing:-0.5px}",
    ".hl .t-lead{font-family:Optima,'Avenir Next',Avenir,sans-serif;font-size:40px;fill:var(--soft)}",
    ".hl .t-what{font-family:'Maple Mono NF CN','Maple Mono',ui-monospace,Menlo,monospace;font-size:24px;fill:var(--soft);letter-spacing:0.4px}",
    ".hl .t-tag{font-family:'Maple Mono NF CN','Maple Mono',ui-monospace,Menlo,monospace;font-size:22px;fill:var(--k)}",
    ".hl .t-label{font-family:'Maple Mono NF CN','Maple Mono',ui-monospace,Menlo,monospace;font-size:20px;fill:var(--muted);stroke:none}",
    ".hl .sil{stroke:var(--muted);fill:var(--panel)}",
    ".hl .pane{stroke:var(--k);fill:color-mix(in oklab,var(--k) 9%,var(--panel))}",
    ".hl .lo{stroke:var(--border)}.hl .mid{stroke:var(--border-2)}.hl .hi{stroke:var(--k)}.hl .ic{stroke:var(--muted)}",
    ".hl .fill-k{fill:var(--k);stroke:none}.hl .fill-mid{fill:var(--border-2);stroke:none}.hl .fill-claude{fill:var(--claude);stroke:none}",
    ".hl .wash{fill:color-mix(in oklab,var(--k) 16%,var(--panel))}",
    ".hl .tag{stroke:var(--k);stroke-width:2.5}",
    ".hl .dash{stroke-dasharray:2 9}",
    ".hl .forward{filter:drop-shadow(0 14px 16px var(--shade))}"
  ].join("");

  function injectStyle() {
    if (document.getElementById("hl-style")) return;
    var s = document.createElement("style");
    s.id = "hl-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // A part's box from its cells.
  function box(G, at, span) {
    span = span || [1, 1];
    return {
      x: G.sx + at[0] * CELL_W + GUT / 2,
      y: G.sy + at[1] * CELL_H + GUT / 2,
      w: span[0] * CELL_W - GUT,
      h: span[1] * CELL_H - GUT
    };
  }
  function tileBox(G, at) {
    var c = box(G, at, [1, 1]);
    return { x: c.x + c.w / 2 - 56, y: c.y + c.h / 2 - 56, w: 112, h: 112 };
  }

  function icon(name, x, y, size, cls) {
    var d = ICONS[name];
    if (!d) throw new Error("hairline: no icon " + name);
    var k = size / 24;
    return '<path class="' + cls + '" d="' + d + '" transform="translate(' + x + " " + y + ") scale(" + k + ')" stroke-width="' + (3 / k) + '"/>';
  }

  // ---- The contents a window can hold, each drawn in its body box. ----
  function line(x1, y1, x2, y2, cls, w) {
    return '<path class="' + cls + '" d="M' + x1 + " " + y1 + "L" + x2 + " " + y2 + '"' + (w ? ' stroke-width="' + w + '"' : "") + "/>";
  }
  function rows(x, y, w, ks, step, cls, bottom) {
    var s = "";
    for (var i = 0; i < ks.length && y <= bottom; i++, y += step) s += line(x, y, x + w * ks[i], y, cls);
    return s;
  }
  var BODY = {
    lines: function (b) { return rows(b.x, b.y + 6, b.w, [0.92, 0.7, 0.84, 0.56, 0.78, 0.64], 30, "mid", b.y + b.h); },
    page: function (b) {
      var iw = Math.round(b.w * 0.36), ih = b.h - 16;
      return '<rect class="lo" x="' + b.x + '" y="' + b.y + '" width="' + iw + '" height="' + ih + '" rx="8"/>' +
        '<path class="lo" d="M' + (b.x + 14) + " " + (b.y + ih - 16) + "l" + (iw * 0.3) + " -" + (ih * 0.34) + "l" + (iw * 0.2) + " " + (ih * 0.18) + "l" + (iw * 0.16) + " -" + (ih * 0.12) + "l" + (iw * 0.2) + " " + (ih * 0.28) + '"/>' +
        line(b.x + iw + 32, b.y + 10, b.x + iw + 32 + (b.w - iw - 32) * 0.62, b.y + 10, "mid", 8) +
        rows(b.x + iw + 32, b.y + 52, b.w - iw - 32, [0.95, 0.8, 0.9, 0.55], 28, "mid", b.y + b.h);
    },
    term: function (b, o) {
      var s = '<path class="hi" d="M' + b.x + " " + (b.y + 2) + "l10 9 -10 9" + '"/>' + line(b.x + 22, b.y + 20, b.x + 44, b.y + 20, "hi");
      if (o.spark) s += '<path class="fill-claude" d="M' + (b.x + 66) + " " + (b.y + 0) + 'l3.5 7.5 7.5 3.5 -7.5 3.5 -3.5 7.5 -3.5 -7.5 -7.5 -3.5 7.5 -3.5z"/>';
      return s + rows(b.x, b.y + 64, b.w, [0.84, 0.6, 0.74, 0.46, 0.66, 0.5, 0.7], 30, "mid", b.y + b.h);
    },
    check: function (b) {
      var s = "", y = b.y;
      for (var i = 0; i < 6 && y + 22 <= b.y + b.h; i++, y += 44) {
        s += '<rect class="mid" x="' + b.x + '" y="' + y + '" width="22" height="22" rx="5"/>';
        if (i < 2) s += '<path class="hi" d="M' + (b.x + 5) + " " + (y + 11) + "l5 5 8 -9" + '"/>';
        s += line(b.x + 40, y + 11, b.x + 40 + (b.w - 40) * [0.8, 0.62, 0.74, 0.5, 0.7, 0.6][i], y + 11, "mid");
      }
      return s;
    },
    table: function (b) {
      var s = '<rect class="mid" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="8"/>';
      var cx = b.x + Math.round(b.w * 0.36);
      s += line(cx, b.y, cx, b.y + b.h, "lo");
      for (var y = b.y + 40, i = 0; y < b.y + b.h - 8; y += 40, i++) {
        if (i > 0) s += line(b.x, y - 20, b.x + b.w, y - 20, "lo");
        s += line(b.x + 14, y - 40 + 20, b.x + 14 + (cx - b.x - 28) * 0.7, y - 40 + 20, i === 0 ? "hi" : "mid");
        s += line(cx + 14, y - 40 + 20, cx + 14 + (b.x + b.w - cx - 28) * [0.8, 0.6, 0.72, 0.5, 0.66, 0.58][i % 6], y - 40 + 20, i === 0 ? "hi" : "mid");
      }
      return s;
    },
    form: function (b, o) { return formBody(b, o, false); },
    nav: function (b, o) { return formBody(b, o, true); },
    code: function (b) {
      var ind = [0, 1, 2, 2, 1, 2, 0], ks = [0.5, 0.56, 0.42, 0.6, 0.36, 0.52, 0.3], s = "";
      for (var i = 0, y = b.y + 6; i < ind.length && y <= b.y + b.h; i++, y += 30) {
        var x = b.x + ind[i] * 28;
        s += line(x, y, x + (b.w - ind[i] * 28) * ks[i], y, i === 2 ? "hi" : "mid");
      }
      return s;
    },
    edit: function (b) {
      var s = "", y = b.y;
      for (var i = 0; i < 4 && y + 36 <= b.y + b.h - 44; i++, y += 50) {
        s += '<circle class="fill-mid" cx="' + (b.x + 4) + '" cy="' + (y + 12) + '" r="3"/><circle class="fill-mid" cx="' + (b.x + 4) + '" cy="' + (y + 24) + '" r="3"/>';
        s += '<rect class="mid" x="' + (b.x + 20) + '" y="' + y + '" width="' + (b.w - 20) + '" height="36" rx="8"/>';
        s += line(b.x + 36, y + 18, b.x + 36 + (b.w - 52) * [0.6, 0.45, 0.7, 0.5][i], y + 18, "mid");
      }
      var py = b.y + b.h - 14;
      return s + '<path class="hi" d="M' + (b.x + 20) + " " + py + "h18M" + (b.x + 29) + " " + (py - 9) + "v18" + '"/>' + line(b.x + 52, py, b.x + 52 + (b.w - 52) * 0.4, py, "hi");
    },
    bars: function (b) {
      var s = line(b.x, b.y + b.h, b.x + b.w, b.y + b.h, "mid"), n = 4, gap = 14, bw = (b.w - gap * (n + 1)) / n;
      var hs = [0.34, 0.52, 0.7, 0.92];
      for (var i = 0; i < n; i++) {
        var h = (b.h - 12) * hs[i];
        s += '<rect class="hi" x="' + (b.x + gap + i * (bw + gap)) + '" y="' + (b.y + b.h - h) + '" width="' + bw + '" height="' + h + '" rx="5"/>';
      }
      return s;
    },
    "chart-s": function (b) {
      var x0 = b.x + 8, y0 = b.y + b.h, w = b.w - 16, h = b.h - 12, s = axes(b);
      s += line(x0, b.y + 12, x0 + w, b.y + 12, "lo dash");
      var exp = "", logi = "";
      for (var i = 0; i <= 60; i++) {
        var t = i / 60, xx = x0 + w * t;
        var e = Math.min(1.15, 0.02 * Math.exp(t * 4.6)), l = 1 / (1 + Math.exp(-(t - 0.5) * 11));
        if (e <= 1.12) exp += (exp ? "L" : "M") + xx.toFixed(1) + " " + (y0 - h * e).toFixed(1);
        logi += (i ? "L" : "M") + xx.toFixed(1) + " " + (y0 - h * (0.02 + 0.96 * l)).toFixed(1);
      }
      return s + '<path class="mid dash" d="' + exp + '"/>' + '<path class="hi" d="' + logi + '"/>';
    },
    "chart-up": function (b) {
      var x0 = b.x + 8, y0 = b.y + b.h, w = b.w - 16, h = b.h - 12, s = axes(b);
      var pts = [[0, 0.12], [0.2, 0.22], [0.4, 0.3], [0.6, 0.5], [0.8, 0.66], [1, 0.9]], d = "";
      pts.forEach(function (p, i) { d += (i ? "L" : "M") + (x0 + w * p[0]) + " " + (y0 - h * p[1]); });
      s += '<path class="hi" d="' + d + '"/>';
      pts.forEach(function (p) { s += '<circle class="fill-k" cx="' + (x0 + w * p[0]) + '" cy="' + (y0 - h * p[1]) + '" r="6"/>'; });
      return s;
    },
    peak: function (b) {
      var x0 = b.x + 8, y0 = b.y + b.h, w = b.w - 16, h = b.h - 12, s = axes(b), un = "", sm = "";
      for (var i = 0; i <= 80; i++) {
        var t = i / 80, xx = (x0 + w * t).toFixed(1);
        var base = 0.32 + 0.12 * Math.sin((t - 0.1) * Math.PI * 2);
        var u = base + 0.5 * Math.exp(-Math.pow((t - 0.58) / 0.08, 2));
        var m = base + 0.2 * Math.exp(-Math.pow((t - 0.62) / 0.1, 2)) + 0.18 * Math.exp(-Math.pow((t - 0.86) / 0.1, 2));
        un += (i ? "L" : "M") + xx + " " + (y0 - h * u).toFixed(1);
        sm += (i ? "L" : "M") + xx + " " + (y0 - h * m).toFixed(1);
      }
      return s + '<path class="mid" d="' + un + '"/>' + '<path class="hi" d="' + sm + '"/>';
    },
    choice: function (b) {
      var cw = (b.w - 20) / 2, s = "";
      for (var i = 0; i < 2; i++) {
        var x = b.x + i * (cw + 20), on = i === 1;
        s += '<rect class="' + (on ? "hi" : "mid") + '" x="' + x + '" y="' + b.y + '" width="' + cw + '" height="' + b.h + '" rx="10"/>';
        s += '<text class="t-label" x="' + (x + 18) + '" y="' + (b.y + 34) + '">' + (on ? "B" : "A") + "</text>";
        s += rows(x + 18, b.y + 70, cw - 36, [0.8, 0.6, 0.72], 30, "mid", b.y + b.h - 50);
        s += '<circle class="' + (on ? "hi" : "mid") + '" cx="' + (x + cw - 30) + '" cy="' + (b.y + b.h - 30) + '" r="11"/>';
        if (on) s += '<circle class="fill-k" cx="' + (x + cw - 30) + '" cy="' + (b.y + b.h - 30) + '" r="5"/>';
      }
      return s;
    },
    list: function (b) {
      var s = "", n = 3, step = b.h / n;
      for (var i = 0; i < n; i++) {
        var y = b.y + step * i + step / 2;
        s += icon("git-branch", b.x, y - 16, 32, "ic");
        s += line(b.x + 56, y, b.x + 56 + (b.w - 120) * [0.7, 0.5, 0.62][i], y, "mid");
        s += '<path class="hi" d="M' + (b.x + b.w - 30) + " " + y + "l8 8 14 -16" + '"/>';
        if (i < n - 1) s += line(b.x, y + step / 2, b.x + b.w, y + step / 2, "lo");
      }
      return s;
    }
  };
  function axes(b) { return '<path class="mid" d="M' + b.x + " " + b.y + "V" + (b.y + b.h) + "H" + (b.x + b.w) + '"/>'; }
  function formBody(b, o, nav) {
    var s = line(b.x, b.y + 8, b.x + b.w * 0.7, b.y + 8, "mid", 6), y = b.y + 52;
    for (var i = 0; i < 3 && y <= b.y + b.h - 70; i++, y += 40) {
      s += '<circle class="' + (i === 1 ? "hi" : "mid") + '" cx="' + (b.x + 10) + '" cy="' + y + '" r="10"/>';
      if (i === 1) s += '<circle class="fill-k" cx="' + (b.x + 10) + '" cy="' + y + '" r="4.5"/>';
      s += line(b.x + 34, y, b.x + 34 + (b.w - 34) * [0.6, 0.48, 0.54][i], y, "mid");
    }
    var by = b.y + b.h - 36;
    s += '<rect class="hi wash" x="' + (b.x + b.w - 84) + '" y="' + by + '" width="84" height="36" rx="10"/>' +
      '<path class="hi" d="M' + (b.x + b.w - 48) + " " + (by + 11) + "l7 7 -7 7" + '"/>';
    if (nav) s += '<rect class="mid" x="' + b.x + '" y="' + by + '" width="84" height="36" rx="10"/><path class="mid" d="M' + (b.x + 46) + " " + (by + 11) + "l-7 7 7 7" + '"/>';
    return s;
  }

  // ---- The parts. Each is drawn at its origin; its group is moved there. ----
  function drawTile(p) {
    return '<rect class="' + (p.key ? "pane" : "sil") + '" x="0" y="0" width="112" height="112" rx="20"/>' + icon(p.icon, 32, 32, 48, p.key ? "hi" : "ic");
  }
  function drawWindow(p, b) {
    var s = '<rect class="' + (p.key ? "pane" : "sil") + '" x="0" y="0" width="' + b.w + '" height="' + b.h + '" rx="16"/>';
    s += line(0, 36, b.w, 36, p.key ? "hi" : "lo", 2);
    for (var i = 0; i < 3; i++) s += '<circle class="' + (p.key ? "hi" : "mid") + '" cx="' + (20 + i * 14) + '" cy="18" r="4" stroke-width="2"/>';
    var f = BODY[p.body];
    if (!f) throw new Error("hairline: no window content " + p.body);
    return s + f({ x: 24, y: 60, w: b.w - 48, h: b.h - 84 }, p);
  }
  // A layer: a plane at a slant across the stage's width, its nodes at
  // fractions of it, and edges between them.
  var LAYER_W = 528, LAYER_H = 96, SLANT = 96;
  function layerPoint(u, v) { return { x: SLANT * (1 - v) + u * (LAYER_W - SLANT), y: v * LAYER_H }; }
  function drawLayer(p) {
    var s = '<path class="' + (p.key ? "pane" : "sil") + '" d="M' + SLANT + " 0H" + LAYER_W + "L" + (LAYER_W - SLANT) + " " + LAYER_H + "H0Z" + '"/>';
    (p.edges || []).forEach(function (e) {
      var a = layerPoint.apply(null, p.nodes[e[0]]), c = layerPoint.apply(null, p.nodes[e[1]]);
      s += line(a.x, a.y, c.x, c.y, "mid");
    });
    p.nodes.forEach(function (n) { var q = layerPoint(n[0], n[1]); s += '<circle class="fill-k" cx="' + q.x + '" cy="' + q.y + '" r="7"/>'; });
    if (p.label) s += '<text class="t-label" x="' + (LAYER_W + 8) + '" y="' + (LAYER_H / 2 + 7) + '">' + p.label + "</text>";
    return s;
  }

  function place(G, p) {
    if (p.k === "tile") return tileBox(G, p.at);
    if (p.k === "layer") {
      var c = box(G, [0, p.at[1]], [G.cols, 1]), mid = G.sx + G.cols * CELL_W / 2;
      return { x: mid - LAYER_W / 2 - 20, y: c.y + c.h / 2 - LAYER_H / 2, w: LAYER_W, h: LAYER_H };
    }
    return box(G, p.at, p.span);
  }
  function depthOf(p) {
    if (p.depth != null) return p.depth;
    if (p.key) return 1;
    return p.k === "tile" ? 0.75 : 0.45;
  }

  // A link: straight where one end's middle lies within the other's side,
  // else out from the first part's side and turned once, with round corners.
  function link(a, b) {
    var ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    var dx = bc.x - ac.x, dy = bc.y - ac.y, P = 20;
    var within = function (v, lo, len) { return v >= lo + P && v <= lo + len - P; };
    if (Math.abs(dx) >= Math.abs(dy)) {
      var sx = dx > 0 ? a.x + a.w : a.x, ex = dx > 0 ? b.x : b.x + b.w;
      if (within(bc.y, a.y, a.h)) return "M" + sx + " " + bc.y + "H" + ex;
      if (within(ac.y, b.y, b.h)) return "M" + sx + " " + ac.y + "H" + ex;
      return turn(sx, ac.y, ex, bc.y, true);
    }
    var sy = dy > 0 ? a.y + a.h : a.y, ey = dy > 0 ? b.y : b.y + b.h;
    if (within(bc.x, a.x, a.w)) return "M" + bc.x + " " + sy + "V" + ey;
    if (within(ac.x, b.x, b.w)) return "M" + ac.x + " " + sy + "V" + ey;
    return turn(ac.x, sy, bc.x, ey, false);
  }
  function turn(x1, y1, x2, y2, across) {
    var r = 14, sx = Math.sign(x2 - x1) || 1, sy = Math.sign(y2 - y1) || 1;
    if (across) {
      var mx = (x1 + x2) / 2, rr = Math.min(r, Math.abs(y2 - y1) / 2, Math.abs(mx - x1));
      return "M" + x1 + " " + y1 + "H" + (mx - sx * rr) + "Q" + mx + " " + y1 + " " + mx + " " + (y1 + sy * rr) + "V" + (y2 - sy * rr) + "Q" + mx + " " + y2 + " " + (mx + sx * rr) + " " + y2 + "H" + x2;
    }
    var my = (y1 + y2) / 2, rv = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(my - y1));
    return "M" + x1 + " " + y1 + "V" + (my - sy * rv) + "Q" + x1 + " " + my + " " + (x1 + sx * rv) + " " + my + "H" + (x2 - sx * rv) + "Q" + x2 + " " + my + " " + x2 + " " + (my + sy * rv) + "V" + y2;
  }

  // ---- A banner. ----
  function render(spec, host, opts) {
    injectStyle();
    opts = opts || {};
    var G = geometry(spec), W = G.W, H = G.H;
    var root = document.createElement("div");
    root.className = "hl k-" + spec.key + (opts.dark ? " dark" : "");
    var parts = spec.items.map(function (p) { return { p: p, b: place(G, p), z: depthOf(p) }; });
    var byId = {};
    parts.forEach(function (q) { if (q.p.id) byId[q.p.id] = q; });
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(spec.label || (spec.title || []).concat(spec.what || []).join(". ")) + '">' +
      '<rect class="ground" width="' + W + '" height="' + H + '"/><g class="hl-words"></g><g class="hl-links"></g>';
    // Behind first, the key last, so it stands over the rest.
    parts.slice().sort(function (a, b) { return a.z - b.z; }).forEach(function (q) {
      var p = q.p, inner = p.k === "tile" ? drawTile(p) : p.k === "layer" ? drawLayer(p) : drawWindow(p, q.b);
      svg += '<g class="hl-part' + (p.key ? " forward" : "") + '" data-id="' + (p.id || "") + '" transform="translate(' + q.b.x + " " + q.b.y + ')">' + inner + "</g>";
    });
    root.innerHTML = svg + "</svg>";
    host.appendChild(root);
    if (G.words) words(spec, root.querySelector(".hl-words"), H);

    var linkEl = root.querySelector(".hl-links");
    var links = (spec.links || []).map(function (l) {
      var el = document.createElementNS(NS, "path");
      el.setAttribute("class", l[2] === "drop" ? "hi dash" : "lo");
      linkEl.appendChild(el);
      return { a: byId[l[0]], b: byId[l[1]], drop: l[2] === "drop" ? l[3] : null, el: el };
    });
    var groups = {};
    [].forEach.call(root.querySelectorAll(".hl-part"), function (g) { groups[g.getAttribute("data-id")] = g; });

    function draw(wind, lift) {
      parts.forEach(function (q) {
        q.dx = -wind * 40 * q.z; q.dy = -lift * 18 * q.z;
        var g = groups[q.p.id || ""];
        if (g) g.setAttribute("transform", "translate(" + (q.b.x + q.dx) + " " + (q.b.y + q.dy) + ")");
      });
      links.forEach(function (l) {
        var A = moved(l.a), B = moved(l.b);
        if (l.drop) {
          var pa = layerPoint(l.drop[0], l.drop[1]);
          l.el.setAttribute("d", "M" + (A.x + pa.x) + " " + (A.y + pa.y + 10) + "L" + (B.x + pa.x) + " " + (B.y + pa.y - 10));
        } else l.el.setAttribute("d", link(A, B));
      });
    }
    function moved(q) { return { x: q.b.x + (q.dx || 0), y: q.b.y + (q.dy || 0), w: q.b.w, h: q.b.h }; }
    draw(0, 0);
    return { root: root, draw: draw };
  }

  // The words: a lead over the title, the title at the largest size at which
  // its longest line fits the column, and a line under it, a chip first if
  // there is one. The block is centered on the canvas's middle.
  function words(spec, g, H) {
    var s = "";
    if (spec.lead) s += '<text class="t-lead" x="' + COL_X + '">' + esc(spec.lead) + "</text>";
    spec.title.forEach(function (t) { s += '<text class="t-title" x="' + (COL_X - 4) + '">' + esc(t) + "</text>"; });
    if (spec.tag) s += '<rect class="tag" height="40" rx="10"/><text class="t-tag">' + esc(spec.tag) + "</text>";
    s += '<text class="t-what">' + esc(spec.what) + "</text>";
    g.innerHTML = s;
    var titles = g.querySelectorAll(".t-title"), size = SIZES[SIZES.length - 1];
    for (var i = 0; i < SIZES.length; i++) {
      var fits = true;
      [].forEach.call(titles, function (t) { t.setAttribute("font-size", SIZES[i]); if (t.getComputedTextLength() > COL_W) fits = false; });
      if (fits) { size = SIZES[i]; break; }
    }
    [].forEach.call(titles, function (t) { t.setAttribute("font-size", size); });
    var leadH = spec.lead ? 56 : 0, step = Math.round(size * 1.02), metaH = 40, gap = 28;
    var total = leadH + titles.length * step + gap + metaH;
    var top = Math.round(H / 2 - total / 2), y = top;
    if (spec.lead) { g.querySelector(".t-lead").setAttribute("y", y + 38); y += leadH; }
    [].forEach.call(titles, function (t) { t.setAttribute("y", y + Math.round(size * 0.74)); y += step; });
    y += gap;
    var mid = y + metaH / 2, x = COL_X + 2;
    if (spec.tag) {
      var tt = g.querySelector(".t-tag"), tw = tt.getComputedTextLength();
      var r = g.querySelector(".tag");
      r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", tw + 32);
      tt.setAttribute("x", x + 16); tt.setAttribute("y", mid + 8);
      x += tw + 32 + 18;
    }
    var w = g.querySelector(".t-what");
    w.setAttribute("x", x); w.setAttribute("y", mid + 8);
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  // ---- Live in a listing: the pointer over the banner moves its parts. ----
  function live(img, spec) {
    var holder = document.createElement("div");
    holder.className = "hl-live";
    img.replaceWith(holder);
    // The page's appearance: Quarto's body class, an html class or
    // data-theme, else the system's.
    var scheme = window.matchMedia("(prefers-color-scheme: dark)");
    var dark = function () {
      var bd = document.body, h = document.documentElement;
      if (bd.classList.contains("quarto-dark") || h.classList.contains("dark") || h.getAttribute("data-theme") === "dark") return true;
      if (bd.classList.contains("quarto-light") || h.classList.contains("light") || h.getAttribute("data-theme") === "light") return false;
      return scheme.matches;
    };
    var bn = render(spec, holder, { dark: dark() });
    var follow = function () { bn.root.classList.toggle("dark", dark()); };
    [document.body, document.documentElement].forEach(function (el) {
      new MutationObserver(follow).observe(el, { attributes: true, attributeFilter: ["class", "data-theme"] });
    });
    if (scheme.addEventListener) scheme.addEventListener("change", follow);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // A listing's card is a link stretched over the whole card, so the
    // pointer is heard on the card; the image answers only while the
    // pointer is over it.
    var card = holder.closest(".quarto-post, .quarto-grid-item, a") || holder;
    var wind = 0, windV = 0, lift = 0, liftV = 0, toWind = 0, toLift = 0, last = null, frame = null, STIFF = 90, DAMP = 13;
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
        wind = toWind; lift = toLift; windV = liftV = 0; last = null; bn.draw(wind, lift); return;
      }
      bn.draw(wind, lift);
      frame = requestAnimationFrame(step);
    }
    function ask(e) {
      var b = holder.getBoundingClientRect();
      var over = e && b.width && e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      toWind = over ? (e.clientX - b.left) / b.width * 2 - 1 : 0;
      toLift = over ? (e.clientY - b.top) / b.height * 2 - 1 : 0;
      if (frame === null) frame = requestAnimationFrame(step);
    }
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      var seen = false, ticking = false, started = null;
      var drift = function (now) {
        if (!seen) { ticking = false; started = null; return; }
        if (started === null) started = now;
        bn.draw(0.6 * Math.sin((now - started) / 26000 * 2 * Math.PI), 0);
        requestAnimationFrame(drift);
      };
      new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen && !ticking) { ticking = true; requestAnimationFrame(drift); } }).observe(holder);
    } else {
      card.addEventListener("pointermove", ask);
      card.addEventListener("pointerleave", function () { ask(null); });
    }
  }

  // Every image in the page whose file name is a spec's id is drawn live in
  // its place.
  function liveAll(specs) {
    specs = specs || window.HAIRLINE_SPECS || {};
    [].forEach.call(document.querySelectorAll("img[src]"), function (img) {
      var m = img.getAttribute("src").match(/([^/?#]+)\.png(?:[?#].*)?$/);
      if (m && specs[m[1]]) live(img, specs[m[1]]);
    });
  }

  window.Hairline = { render: render, live: live, liveAll: liveAll };

  // Once the two faces the words use are in (a title's size is measured).
  // Not `document.fonts.ready`, which waits for every face the page loads,
  // a large Chinese web face among them, and left banners undrawn.
  if (window.HAIRLINE_SPECS) {
    var go = function () { liveAll(); };
    Promise.all([document.fonts.load("80px Optima"), document.fonts.load("24px 'Maple Mono'")]).then(go, go);
  }
})();
