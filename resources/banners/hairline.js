// Hairline: images drawn from specs by one engine, so that every image is
// made of the same parts in the same places and can be drawn again exactly.
// The canonical copy lives in the ph-image skill (hairline/engine.js); a
// project that uses it keeps a verbatim copy and never edits it there. The
// same drawing is shot to PNGs (hairline/shoot.R, light and dark) and runs
// live in a page, where it answers the pointer.
//
// Two canvases:
// - A banner (the default): 1376 x 768, and a canvas, not a template: its
//   words stand where its picture wants them (`layout`). Beside a 3 x 3
//   stage, at its left or its right; in one line over a stage the canvas's
//   width; or in a corner of a picture that takes the whole canvas. Cells
//   are 208 square, with a 32 gutter.
// - A figure (`canvas: { cols, rows }`): no words, a stage of cols x rows
//   cells with a 48 margin all round, the canvas its size.
// Every part sits on the stage's grid: `at` is its top-left cell (half and
// quarter steps allowed, to center a part or set four in a row), `span` its
// size in cells, and a part's size is its span less the gutter.
// - The parts: a tile (one Tabler icon, a caption under it), a window (a
//   title bar over one of a fixed set of contents, drawn as bars and
//   shapes), a figure (a thing drawn as it looks: a car, a turbine, a
//   cloud), a chip (a callout), and a layer (a plane seen at a slant, with
//   nodes). Links between parts are hairlines that run straight where they
//   can and end in a small arrowhead, so a row of parts reads as a flow.
// - An image is one picture, read in about three seconds: a few large
//   things, almost no words. The words in a picture are a caption under a
//   part or a callout's name, in one size (26) in the chrome face.
// - A banner's title takes the largest of a few sizes at which its longest
//   line fits; no line of keywords stands under it.
// - One part per image is the key: drawn in the image's color, standing
//   forward with a soft shade. Everything else is the muted ink and two
//   grays, so the color is spent once.
// - Under the pointer, each part moves by its depth (windows behind, tiles
//   nearer, the key nearest, a layer by its own place in a stack), with a
//   spring, the links follow their ends, and what turns (a turbine's
//   blades, a gear) turns.
//
// Live in a page: load the specs (window.HAIRLINE_SPECS = { id: spec }) and
// then this script; every <img> whose file name, without .png, is a spec's
// id is drawn live in its place, once Optima and Maple Mono are in.

(function () {
  "use strict";

  // Tabler outline icons (MIT, tabler.io/icons, v3.31.0), path data on their
  // 24 grid: the same family as the site's glyphs.
  var ICONS = {"app-window":"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2zM6 8h.01M9 8h.01","apps":"M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM14 7l6 0M17 4l0 6","arrows-exchange":"M7 10h14l-4 -4M17 14h-14l4 4","battery-charging":"M16 7h1a2 2 0 0 1 2 2v.5a.5 .5 0 0 0 .5 .5a.5 .5 0 0 1 .5 .5v3a.5 .5 0 0 1 -.5 .5a.5 .5 0 0 0 -.5 .5v.5a2 2 0 0 1 -2 2h-2M8 7h-2a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h1M12 8l-2 4h3l-2 4","bolt":"M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11","book":"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6l0 13M12 6l0 13M21 6l0 13","bookmark":"M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z","books":"M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1zM9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1zM5 8h4M9 16h4M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041zM14 9l4 -1M16 16l3.923 -.98","brand-docker":"M22 12.54c-1.804 -.345 -2.701 -1.08 -3.523 -2.94c-.487 .696 -1.102 1.568 -.92 2.4c.028 .238 -.32 1 -.557 1h-14c0 5.208 3.164 7 6.196 7c4.124 .022 7.828 -1.376 9.854 -5c1.146 -.101 2.296 -1.505 2.95 -2.46zM5 10h3v3h-3zM8 10h3v3h-3zM11 10h3v3h-3zM8 7h3v3h-3zM11 7h3v3h-3zM11 4h3v3h-3zM4.571 18c1.5 0 2.047 -.074 2.958 -.78M10 16l0 .01","brand-git":"M16 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 15v-6M15 11l-2 -2M11 7l-1.9 -1.9M13.446 2.6l7.955 7.954a2.045 2.045 0 0 1 0 2.892l-7.955 7.955a2.045 2.045 0 0 1 -2.892 0l-7.955 -7.955a2.045 2.045 0 0 1 0 -2.892l7.955 -7.955a2.045 2.045 0 0 1 2.892 0z","brand-github":"M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5","brand-python":"M12 9h-7a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h3M12 15h7a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-3M8 9v-4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2h-4a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4M11 6l0 .01M13 18l0 .01","brand-ubuntu":"M12 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17.723 7.41a7.992 7.992 0 0 0 -3.74 -2.162m-3.971 0a7.993 7.993 0 0 0 -3.789 2.216m-1.881 3.215a8 8 0 0 0 -.342 2.32c0 .738 .1 1.453 .287 2.132m1.96 3.428a7.993 7.993 0 0 0 3.759 2.19m4 0a7.993 7.993 0 0 0 3.747 -2.186m1.962 -3.43a8.008 8.008 0 0 0 .287 -2.131c0 -.764 -.107 -1.503 -.307 -2.203M5 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M19 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0","building":"M3 21l18 0M9 8l1 0M9 12l1 0M9 16l1 0M14 8l1 0M14 12l1 0M14 16l1 0M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16","building-bank":"M3 21l18 0M3 10l18 0M5 6l7 -3l7 3M4 10l0 11M20 10l0 11M8 14l0 3M12 14l0 3M16 14l0 3","building-skyscraper":"M3 21l18 0M5 21v-14l8 -4v18M19 21v-10l-6 -4M9 9l0 .01M9 12l0 .01M9 15l0 .01M9 18l0 .01","bulb":"M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3M9.7 17l4.6 0","car":"M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5","certificate":"M15 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M13 17.5v4.5l2 -1.5l2 1.5v-4.5M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73M6 9l12 0M6 12l3 0M6 15l2 0","charging-pile":"M18 7l-1 1M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14M9 11.5l-1.5 2.5h3l-1.5 2.5M3 20l12 0M4 8l10 0","chart-bar":"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM4 20h14","chart-line":"M4 19l16 0M4 15l4 -6l4 2l4 -5l4 4","circle-check":"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9 12l2 2l4 -4","clipboard-check":"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM9 14l2 2l4 -4","clock":"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 7v5l3 3","cloud":"M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878","cloud-upload":"M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1M9 15l3 -3l3 3M12 12l0 9","code":"M7 8l-4 4l4 4M17 8l4 4l-4 4M14 4l-4 16","coin":"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1M12 7v10","command":"M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10","credit-card":"M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3zM3 10l18 0M7 15l.01 0M11 15l2 0","database":"M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0M4 6v6a8 3 0 0 0 16 0v-6M4 12v6a8 3 0 0 0 16 0v-6","device-desktop":"M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10zM7 20h10M9 16v4M15 16v4","download":"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2M7 11l5 5l5 -5M12 4l0 12","eye":"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6","file":"M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z","file-code":"M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2zM10 13l-1 2l1 2M14 13l1 2l-1 2","file-settings":"M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M12 10.5v1.5M12 16v1.5M15.031 12.25l-1.299 .75M10.268 15l-1.3 .75M15 15.803l-1.285 -.773M10.285 12.97l-1.285 -.773M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z","file-text":"M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2zM9 9l1 0M9 13l6 0M9 17l6 0","file-type-pdf":"M14 3v4a1 1 0 0 0 1 1h4M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4M5 18h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6M17 18h2M20 15h-3v6M11 15v6h1a2 2 0 0 0 2 -2v-2a2 2 0 0 0 -2 -2h-1z","flask":"M9 3l6 0M10 9l4 0M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6","folder":"M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2","forms":"M12 3a3 3 0 0 0 -3 3v12a3 3 0 0 0 3 3M6 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3M13 7h7a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-7M5 7h-1a1 1 0 0 0 -1 1v8a1 1 0 0 0 1 1h1M17 12h.01M13 12h.01","gauge":"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M13.41 10.59l2.59 -2.59M7 12a5 5 0 0 1 5 -5","git-branch":"M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 8l0 8M9 18h6a2 2 0 0 0 2 -2v-5M14 14l3 -3l3 3","git-commit":"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 3l0 6M12 15l0 6","git-merge":"M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 8l0 8M7 8a4 4 0 0 0 4 4h4","git-pull-request":"M6 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M6 8l0 8M11 6h5a2 2 0 0 1 2 2v8M14 9l-3 -3l3 -3","key":"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0zM15 9h.01","keyboard":"M2 6m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2zM6 10l0 .01M10 10l0 .01M14 10l0 .01M18 10l0 .01M6 14l0 .01M18 14l0 .01M10 14l4 .01","link":"M9 15l6 -6M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463","list-check":"M3.5 5.5l1.5 1.5l2.5 -2.5M3.5 11.5l1.5 1.5l2.5 -2.5M3.5 17.5l1.5 1.5l2.5 -2.5M11 6l9 0M11 12l9 0M11 18l9 0","lock":"M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6zM11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M8 11v-4a4 4 0 1 1 8 0v4","markdown":"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2zM7 15v-6l2 2l2 -2v6M14 13l2 2l2 -2m-2 2v-6","message-circle":"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1","messages":"M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2","microphone":"M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3zM5 10a7 7 0 0 0 14 0M8 21l8 0M12 17l0 4","moon":"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z","notebook":"M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18M13 8l2 0M13 12l2 0","package":"M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5M12 12l8 -4.5M12 12l0 9M12 12l-8 -4.5M16 5.25l-8 4.5","pencil":"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4M13.5 6.5l4 4","photo":"M15 8h.01M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12zM3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3","plane":"M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z","player-play":"M7 4v16l13 -8z","player-track-prev":"M21 5v14l-8 -7zM10 5v14l-8 -7z","plug":"M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054zM4 20l3.5 -3.5M15 4l-3.5 3.5M20 9l-3.5 3.5","presentation":"M3 4l18 0M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10M12 16l0 4M9 20l6 0M8 12l3 -3l2 2l3 -3","puzzle":"M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1","report-analytics":"M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM9 17v-5M12 17v-1M15 17v-3","road":"M4 19l4 -14M16 5l4 14M12 8v-2M12 13v-2M12 18v-2","robot":"M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2zM12 2v2M9 12v9M15 12v9M5 16l4 -2M15 14l4 2M9 18h6M10 8v.01M14 8v.01","rocket":"M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0","route":"M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4zM11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5","school":"M22 9l-10 -4l-10 4l10 4l10 -4v6M6 10.6v5.4a6 3 0 0 0 12 0v-5.4","search":"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6","send":"M10 14l11 -11M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5","server":"M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3zM3 12m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3zM7 8l0 .01M7 16l0 .01","settings-automation":"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065zM10 9v6l5 -3z","share":"M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M8.7 10.7l6.6 -3.4M8.7 13.3l6.6 3.4","shield-check":"M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06M15 19l2 2l4 -4","ship":"M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1M4 18l-1 -5h18l-2 4M5 13v-6h8l4 6M7 7v-4h-1","sitemap":"M3 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM15 15m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2zM6 15v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1M12 9l0 3","slash":"M17 5l-10 14","solar-panel":"M4.28 14h15.44a1 1 0 0 0 .97 -1.243l-1.5 -6a1 1 0 0 0 -.97 -.757h-12.44a1 1 0 0 0 -.97 .757l-1.5 6a1 1 0 0 0 .97 1.243zM4 10h16M10 6l-1 8M14 6l1 8M12 14v4M7 18h10","sparkles":"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z","speakerphone":"M18 8a3 3 0 0 1 0 6M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8","stack-2":"M12 4l-8 4l8 4l8 -4l-8 -4M4 12l8 4l8 -4M4 16l8 4l8 -4","sun":"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7","table":"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14zM3 10h18M10 3v18","template":"M4 4m0 1a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1zM4 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1zM14 12l6 0M14 16l6 0M14 20l6 0","terminal-2":"M8 9l3 3l-3 3M13 15l3 0M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z","tool":"M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5","tools":"M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4M14.5 5.5l4 4M12 8l-5 -5l-4 4l5 5M7 8l-1.5 1.5M16 12l5 5l-4 4l-5 -5M16 17l-1.5 1.5","train":"M21 13c0 -3.87 -3.37 -7 -10 -7h-8M3 15h16a2 2 0 0 0 2 -2M3 6v5h17.5M3 11v4M8 11v-5M13 11v-4.5M3 19h18","trending-up":"M3 17l6 -6l4 4l8 -8M14 7l7 0l0 7","user":"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2","users":"M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0 -3 -3.85","wand":"M6 21l15 -15l-3 -3l-15 15l3 3M15 6l3 3M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2","webhook":"M4.876 13.61a4 4 0 1 0 6.124 3.39h6M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5","wind":"M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24","windmill":"M12 12c2.76 0 5 -2.01 5 -4.5s-2.24 -4.5 -5 -4.5v9zM12 12c0 2.76 2.01 5 4.5 5s4.5 -2.24 4.5 -5h-9zM12 12c-2.76 0 -5 2.01 -5 4.5s2.24 4.5 5 4.5v-9zM12 12c0 -2.76 -2.01 -5 -4.5 -5s-4.5 2.24 -4.5 5h9z","world":"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18","world-upload":"M21 12a9 9 0 1 0 -9 9M3.6 9h16.8M3.6 15h8.4M11.578 3a17 17 0 0 0 0 18M12.5 3c1.719 2.755 2.5 5.876 2.5 9M18 21v-7m3 3l-3 -3l-3 3","world-www":"M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4M11.5 3a16.989 16.989 0 0 0 -1.826 4M12.5 3a16.989 16.989 0 0 1 1.828 4M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4M11.5 21a16.989 16.989 0 0 1 -1.826 -4M12.5 21a16.989 16.989 0 0 0 1.828 -4M2 10l1 4l1.5 -4l1.5 4l1 -4M17 10l1 4l1.5 -4l1.5 4l1 -4M9.5 10l1 4l1.5 -4l1.5 4l1 -4"};

  var CELL = 208, GUT = 32, MARGIN = 48;
  var COL_X = 72, COL_W = 568;
  // The canvas and stage for a spec: a banner, or a bare figure.
  function geometry(spec) {
    var c = spec.canvas;
    // A banner is a canvas, and its words stand where its picture wants
    // them (`layout`): at the left of a 3 x 3 stage ("left", the default) or
    // at its right ("right"); in one line over a stage the canvas's width,
    // 6 x 2.4 cells ("top"); or in a corner of a picture that takes the
    // whole canvas, 6 x 3 cells ("scene", the corner named by `words`).
    var L = spec.layout || "left";
    if (!c && L === "top") return { W: 1376, H: 768, sx: 64, sy: 200, cols: 6, rows: 2.4, words: "top" };
    if (!c && L === "scene") return { W: 1376, H: 768, sx: 64, sy: 72, cols: 6, rows: 3, words: "scene" };
    if (!c && L === "right") return { W: 1376, H: 768, sx: 56, sy: 72, cols: 3, rows: 3, words: "right" };
    if (!c) return { W: 1376, H: 768, sx: 696, sy: 72, cols: 3, rows: 3, words: "left" };
    return { W: c.cols * CELL + 2 * MARGIN - GUT, H: c.rows * CELL + 2 * MARGIN - GUT, sx: MARGIN - GUT / 2, sy: MARGIN - GUT / 2, cols: c.cols, rows: c.rows, words: false };
  }
  var SIZES = [152, 136, 120, 108];
  // Words in the picture: one size, in a face whose letters are 0.6 of it wide.
  var FS = 26, LH = 40, MONO = 0.6;
  var TILE = 120, BIG = 176, CAP = 40, BAR = 44, CARD = 132;
  var NS = "http://www.w3.org/2000/svg";

  // The colors. Light: the site's tokens, the two grays a step firmer, as a
  // banner is seen at a quarter of its size; the ground is the key mixed 11%
  // into the panel. Dark: not the site's dark page but a slate lighter than
  // the card a banner sits in, the same for every key.
  var UI = "font-family:'Maple Mono NF CN','Maple Mono',ui-monospace,Menlo,monospace;";
  var WORDS = "font-family:Optima,'Avenir Next',Avenir,sans-serif;";
  var CSS = [
    ".hl{--panel:#FFFFFF;--ink:#2A2920;--muted:#77746B;--border:#D8D5CA;--border-2:#BDBAAD;--claude:#D97757;",
    "--accent:#5061B3;--ochre:#9E793D;--sage:#578F63;--mauve:#986EA2;--slate:#4489AE;--rose:#AF6974;",
    "--k:var(--accent);--ground:color-mix(in oklab,var(--k) 11%,var(--panel));--soft:color-mix(in oklab,var(--ink) 78%,var(--ground));",
    "--kt:color-mix(in oklab,var(--k) 76%,var(--ink));--shade:color-mix(in oklab,var(--k) 30%,transparent)}",
    ".hl.dark{--panel:#474A57;--ink:#F3F1EA;--muted:#B6B4AE;--border:#696C78;--border-2:#838692;--claude:#E48D6F;",
    "--accent:#AAB9F3;--ochre:#E2C38E;--sage:#A6D5AF;--mauve:#DDB8E5;--slate:#95CDEE;--rose:#EFB3BB;",
    "--ground:#393C48;--kt:var(--k);--shade:rgb(0 0 0 / 0.28)}",
    ".hl.k-accent{--k:var(--accent)}.hl.k-ochre{--k:var(--ochre)}.hl.k-sage{--k:var(--sage)}.hl.k-mauve{--k:var(--mauve)}.hl.k-slate{--k:var(--slate)}.hl.k-rose{--k:var(--rose)}",
    ".hl svg{display:block;width:100%;height:auto;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}",
    ".hl text{stroke:none}",
    ".hl .ground{fill:var(--ground)}",
    ".hl .t-title{" + WORDS + "fill:var(--ink);letter-spacing:-1px}",
    ".hl .t-lead{" + WORDS + "font-size:52px;fill:var(--soft)}",
    ".hl .t-what{" + UI + "font-size:34px;fill:var(--soft)}",
    ".hl .t-tag{" + UI + "font-size:28px;fill:var(--kt)}",
    ".hl .t-cap,.hl .t-code{" + UI + "font-size:" + FS + "px;fill:var(--soft)}",
    ".hl .t-name{" + UI + "font-size:21px;fill:var(--muted)}",
    ".hl .t-btn{" + UI + "font-size:22px;fill:var(--soft)}",
    ".hl .t-card{" + WORDS + "font-size:38px;fill:var(--ink)}",
    ".hl .t-k{fill:var(--kt)}.hl .t-dim{fill:var(--muted)}",
    ".hl .sil{stroke:var(--muted);fill:var(--panel)}",
    ".hl .pane{stroke:var(--k);fill:color-mix(in oklab,var(--k) 9%,var(--panel))}",
    ".hl .lo{stroke:var(--border)}.hl .mid{stroke:var(--border-2)}.hl .hi{stroke:var(--k)}.hl .ic{stroke:var(--muted)}",
    ".hl .ln{stroke:var(--muted);stroke-width:2.5}",
    ".hl .fill-k{fill:var(--k);stroke:none}.hl .fill-mid{fill:var(--border-2);stroke:none}.hl .fill-mu{fill:var(--muted);stroke:none}.hl .fill-claude{fill:var(--claude);stroke:none}",
    ".hl .glass{stroke:var(--muted);fill:color-mix(in oklab,var(--muted) 15%,var(--panel))}.hl .paper{fill:var(--panel)}.hl .net{fill:color-mix(in oklab,var(--muted) 26%,var(--panel));stroke:none}",
    ".hl .t-logo{" + WORDS + "font-weight:700;font-size:60px;fill:var(--soft)}.hl .t-logo.t-k{fill:var(--kt)}",
    ".hl .wash{fill:color-mix(in oklab,var(--k) 16%,var(--panel))}.hl .area{fill:color-mix(in oklab,var(--k) 22%,var(--panel));stroke:none}",
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

  // ---- Marks every part is drawn with. ----
  function n1(v) { return Math.round(v * 10) / 10; }
  function line(x1, y1, x2, y2, cls, w) {
    return '<path class="' + cls + '" d="M' + n1(x1) + " " + n1(y1) + "L" + n1(x2) + " " + n1(y2) + '"' + (w ? ' stroke-width="' + w + '"' : "") + "/>";
  }
  function rect(x, y, w, h, r, cls) {
    return '<rect class="' + cls + '" x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" rx="' + r + '"/>';
  }
  function dot(x, y, r, cls) { return '<circle class="' + cls + '" cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + r + '"/>'; }
  function rows(x, y, w, ks, step, cls, bottom) {
    var s = "";
    for (var i = 0; i < ks.length && y <= bottom; i++, y += step) s += line(x, y, x + w * ks[i], y, cls);
    return s;
  }
  function txt(x, y, s, cls, anchor, size) {
    return '<text class="' + cls + '" x="' + n1(x) + '" y="' + n1(y) + '"' + (anchor ? ' text-anchor="' + anchor + '"' : "") +
      (size && size !== FS ? ' style="font-size:' + size + 'px"' : "") + ">" + esc(s) + "</text>";
  }
  // The size at which a word fits a width: the picture's size, or less.
  function fit(s, w, size, min) { return Math.max(min || 16, Math.min(size || FS, Math.floor(w / (String(s).length * MONO)))); }
  function fitAll(list, w, lead) {
    var n = 1;
    list.forEach(function (s) { n = Math.max(n, String(s).length); });
    return Math.max(18, Math.min(FS, Math.floor((w - (lead || 0)) / (n * MONO))));
  }
  function icon(name, x, y, size, cls, sw) {
    var d = ICONS[name];
    if (!d) throw new Error("hairline: no icon " + name);
    var k = size / 24;
    return '<path class="' + cls + '" d="' + d + '" transform="translate(' + n1(x) + " " + n1(y) + ") scale(" + k + ')" stroke-width="' + ((sw || 3) / k) + '"/>';
  }
  function tick(x, y, cls) { return '<path class="' + cls + '" d="M' + n1(x) + " " + n1(y) + 'l6 6 11 -13"/>'; }
  function spark(x, y) { return '<path class="fill-claude" d="M' + n1(x) + " " + n1(y - 11) + 'l3.5 7.5 7.5 3.5 -7.5 3.5 -3.5 7.5 -3.5 -7.5 -7.5 -3.5 7.5 -3.5z"/>'; }
  function axes(b) { return '<path class="ic" d="M' + b.x + " " + b.y + "V" + (b.y + b.h) + "H" + (b.x + b.w) + '"/>'; }
  // The key part alone is in color: in any other, an accent is the muted ink.
  function tone(p) { return p.key ? { hi: "hi", fill: "fill-k", tk: " t-k", wash: " wash" } : { hi: "ic", fill: "fill-mu", tk: "", wash: "" }; }

  // ---- The contents a window can hold, each drawn in its body box. ----
  var BODY = {
    lines: function (b) { return rows(b.x, b.y + 6, b.w, [0.92, 0.7, 0.84, 0.56, 0.78, 0.64, 0.88, 0.5], 32, "mid", b.y + b.h); },
    // A web page: a mark and the menu's words, a portrait beside a name and
    // two buttons, and three cards along the foot.
    page: function (b, p, c) {
      var s = dot(b.x + 9, b.y + 10, 9, c.fill), x = b.x + b.w, nav = p.nav || [];
      for (var i = nav.length - 1; i >= 0; i--) {
        x -= nav[i].length * 21 * MONO;
        s += txt(x, b.y + 18, nav[i], "t-name" + (i === 0 ? c.tk : ""));
        x -= 24;
      }
      if (!nav.length) s += rows(b.x + b.w * 0.5, b.y + 10, b.w * 0.5, [1], 1, "mid", b.y + 10);
      var hy = b.y + 54, r = 50, tx = b.x + 2 * r + 34, tw = b.w - 2 * r - 34;
      s += dot(b.x + r, hy + r, r, c.hi + c.wash) + icon("user", b.x + r - 26, hy + r - 26, 52, c.hi);
      s += line(tx, hy + 12, tx + tw * 0.52, hy + 12, "ic", 9) + rows(tx, hy + 44, tw, [0.94, 0.78], 26, "mid", hy + 80);
      s += rect(tx, hy + 92, 128, 38, 19, c.hi + c.wash) + line(tx + 34, hy + 111, tx + 94, hy + 111, c.hi);
      s += rect(tx + 144, hy + 92, 128, 38, 19, "mid") + line(tx + 178, hy + 111, tx + 238, hy + 111, "mid");
      var ch = 60, cy = b.y + b.h - ch, cw = (b.w - 32) / 3;
      for (var j = 0; j < 3; j++) {
        var cx = b.x + j * (cw + 16);
        s += rect(cx, cy, cw, ch, 12, "mid") + dot(cx + 28, cy + ch / 2, 11, "ic") + line(cx + 54, cy + 22, cx + cw - 22, cy + 22, "mid") + line(cx + 54, cy + 40, cx + cw - 54, cy + 40, "lo");
      }
      return s;
    },
    // A terminal. `lines` are its lines, each led by two characters: "$ " a
    // command, "> " what was asked of an agent, "* " the agent speaking,
    // "+ " a step done, "- " what came back.
    term: function (b, p, c) {
      var s = "";
      if (!p.lines) {
        s = '<path class="' + c.hi + '" d="M' + b.x + " " + (b.y + 2) + 'l10 9 -10 9"/>' + line(b.x + 22, b.y + 20, b.x + 44, b.y + 20, c.hi);
        if (p.spark) s += spark(b.x + 66, b.y + 11);
        return s + rows(b.x, b.y + 64, b.w, [0.84, 0.6, 0.74, 0.46, 0.66, 0.5, 0.7], 32, "mid", b.y + b.h);
      }
      var fs = fitAll(p.lines.map(function (l) { return l.slice(2); }), b.w, 32), lh = Math.round(fs * 1.56), y = b.y + fs;
      p.lines.forEach(function (l) {
        if (y > b.y + b.h + 6) return;
        var m = l.charAt(0), t = l.slice(2), my = y - fs * 0.34;
        if (m === "$") s += '<path class="' + c.hi + '" d="M' + (b.x + 2) + " " + n1(my - 8) + 'l9 8 -9 8"/>';
        else if (m === ">") s += '<path class="ic" d="M' + (b.x + 2) + " " + n1(my - 8) + 'l9 8 -9 8"/>';
        else if (m === "*") s += spark(b.x + 10, my);
        else if (m === "+") s += tick(b.x, my, c.hi);
        s += txt(b.x + 32, y, t, "t-code" + (m === "-" || m === "+" ? " t-dim" : ""), null, fs);
        y += lh;
      });
      return s;
    },
    check: function (b, p, c) {
      var s = "", y = b.y;
      for (var i = 0; i < 6 && y + 24 <= b.y + b.h; i++, y += 46) {
        s += rect(b.x, y, 24, 24, 6, "mid");
        if (i < 2) s += tick(b.x + 4, y + 12, c.hi);
        s += line(b.x + 42, y + 12, b.x + 42 + (b.w - 42) * [0.8, 0.62, 0.74, 0.5, 0.7, 0.6][i], y + 12, "mid");
      }
      return s;
    },
    // The steps of a run, one under the next: those done are ticked, the one
    // running is a filled dot, the rest wait.
    steps: function (b, p, c) {
      var L = p.lines, done = p.done == null ? L.length : p.done, s = "";
      var fs = fitAll(L, b.w, 44), step = Math.min(54, b.h / L.length), y = b.y + step / 2;
      L.forEach(function (l, i) {
        if (i < L.length - 1) s += line(b.x + 14, y + 14, b.x + 14, y + step - 14, "mid");
        if (i < done) s += dot(b.x + 14, y, 14, c.hi + c.wash) + tick(b.x + 6, y, c.hi);
        else if (i === done) s += dot(b.x + 14, y, 14, c.hi) + dot(b.x + 14, y, 6, c.fill);
        else s += dot(b.x + 14, y, 14, "mid");
        s += txt(b.x + 44, y + fs * 0.34, l, "t-code" + (i > done ? " t-dim" : ""), null, fs);
        y += step;
      });
      return s;
    },
    table: function (b, p, c) {
      var s = rect(b.x, b.y, b.w, b.h, 8, "mid"), cx = b.x + Math.round(b.w * 0.36);
      s += line(cx, b.y, cx, b.y + b.h, "lo");
      for (var y = b.y + 42, i = 0; y < b.y + b.h + 2; y += 42, i++) {
        if (y < b.y + b.h - 8) s += line(b.x, y, b.x + b.w, y, "lo");
        if (p.messy && (i === 2 || i === 3 || i === 5)) s += rect(i === 3 ? b.x + 5 : cx + 5, y - 37, (i === 3 ? cx - b.x : b.x + b.w - cx) - 10, 32, 5, "net");
        s += line(b.x + 14, y - 21, b.x + 14 + (cx - b.x - 28) * (p.messy ? [0.7, 0.4, 0.9, 0.5, 0.75, 0.3][i % 6] : 0.7), y - 21, i === 0 ? c.hi : "mid");
        s += line(cx + 14, y - 21, cx + 14 + (b.x + b.w - cx - 28) * [0.8, 0.6, 0.72, 0.5, 0.66, 0.58][i % 6], y - 21, i === 0 ? c.hi : "mid");
      }
      return s;
    },
    form: function (b, p, c) { return formBody(b, p, c, false); },
    nav: function (b, p, c) { return formBody(b, p, c, true); },
    // A file's lines, indented by their leading spaces; `hi` lists the lines
    // in the key, and a line that opens with # is a comment.
    code: function (b, p, c) {
      var s = "";
      if (!p.lines) {
        var ind = [0, 1, 2, 2, 1, 2, 0, 1], ks = [0.5, 0.56, 0.42, 0.6, 0.36, 0.52, 0.3, 0.44];
        for (var i = 0, y = b.y + 6; i < 40 && y <= b.y + b.h; i++, y += 32) {
          var x = b.x + ind[i % 8] * 28;
          s += line(x, y, x + (b.w - ind[i % 8] * 28) * ks[i % 8], y, i % 8 === 2 ? c.hi : "mid");
        }
        return s;
      }
      var fs = fitAll(p.lines, b.w), lh = Math.round(fs * 1.56), hi = p.hi || [], yy = b.y + fs;
      p.lines.forEach(function (l, j) {
        if (yy > b.y + b.h + 6) return;
        var t = l.replace(/^ +/, ""), on = hi.indexOf(j) >= 0;
        if (t) s += txt(b.x + (l.length - t.length) * fs * MONO, yy, t, "t-code" + (on ? c.tk : t.charAt(0) === "#" ? " t-dim" : ""), null, fs);
        yy += lh;
      });
      return s;
    },
    // A folder: `rows` are its entries, two leading spaces a level, a name
    // that ends in / a folder; `hi` is the entry in the key.
    tree: function (b, p, c) {
      var s = "", R = p.rows, step = Math.min(56, b.h / R.length), fs = fitAll(R.map(function (r) { return r.trim(); }), b.w, 110), y = b.y;
      var level = function (r) { return (r.length - r.replace(/^ +/, "").length) / 2; };
      R.forEach(function (r, i) {
        var name = r.trim(), d = level(r), x = b.x + d * 34, on = i === p.hi, my = y + step / 2;
        if (d > 0) {
          // A guide from the entry above at this level, or from the folder it is in.
          var j = i - 1;
          while (j > 0 && level(R[j]) > d) j--;
          var from = b.y + step * j + step / 2 + (level(R[j]) === d ? 0 : 18);
          s += '<path class="mid" d="M' + (x - 20) + " " + n1(from) + "V" + n1(my) + "H" + (x - 6) + '"/>';
        }
        s += icon(/\/$/.test(name) ? "folder" : "file", x, my - 14, 28, on ? c.hi : "ic", 2.5);
        s += txt(x + 40, my + fs * 0.34, name, "t-code" + (on ? c.tk : ""), null, fs);
        y += step;
      });
      return s;
    },
    edit: function (b, p, c) {
      var s = "", y = b.y;
      for (var i = 0; i < 5 && y + 38 <= b.y + b.h - 48; i++, y += 54) {
        s += dot(b.x + 4, y + 13, 3, "fill-mid") + dot(b.x + 4, y + 25, 3, "fill-mid");
        s += rect(b.x + 20, y, b.w - 20, 38, 9, "mid");
        s += line(b.x + 36, y + 19, b.x + 36 + (b.w - 52) * [0.6, 0.45, 0.7, 0.5, 0.62][i], y + 19, "mid");
      }
      var py = b.y + b.h - 14;
      return s + '<path class="' + c.hi + '" d="M' + (b.x + 20) + " " + py + "h18M" + (b.x + 29) + " " + (py - 9) + 'v18"/>' + line(b.x + 52, py, b.x + 52 + (b.w - 52) * 0.4, py, c.hi);
    },
    bars: function (b, p, c) {
      var s = line(b.x, b.y + b.h, b.x + b.w, b.y + b.h, "ic"), n = 4, gap = 14, bw = (b.w - gap * (n + 1)) / n;
      var hs = [0.34, 0.52, 0.7, 0.92];
      for (var i = 0; i < n; i++) {
        var h = (b.h - 12) * hs[i];
        s += rect(b.x + gap + i * (bw + gap), b.y + b.h - h, bw, h, 6, c.hi + (i === n - 1 ? c.wash : ""));
      }
      return s;
    },
    // Growth without a limit (dashed) and with one: the two rise together,
    // then the logistic curve bends under its cap. `labels` names the cap
    // and the two curves.
    "chart-s": function (b, p, c) {
      var x0 = b.x + 6, y0 = b.y + b.h, w = b.w - 12, h = b.h - 14, s = axes(b), L = p.labels || {}, top = 0.9;
      s += line(x0, y0 - h * top, x0 + w, y0 - h * top, "mid dash");
      var exp = "", logi = "";
      for (var i = 0; i <= 90; i++) {
        var t = i / 90, xx = n1(x0 + w * t), e = 0.012 * Math.exp(t * 10.5), l = top / (1 + (top / 0.012 - 1) * Math.exp(-t * 10.5));
        if (e <= 1.02) exp += (exp ? "L" : "M") + xx + " " + n1(y0 - h * Math.min(e, 1.02));
        logi += (i ? "L" : "M") + xx + " " + n1(y0 - h * l);
      }
      s += '<path class="ic dash" d="' + exp + '"/><path class="' + c.hi + '" d="' + logi + '" stroke-width="4"/>';
      if (L.cap) s += txt(x0 + w - 2, y0 - h * top - 14, L.cap, "t-cap", "end");
      if (L.a) s += txt(x0 + w * 0.33, y0 - h * 0.66, L.a, "t-cap t-dim", "end", fit(L.a, w * 0.31));
      if (L.b) s += txt(x0 + w * 0.6, y0 - h * 0.5, L.b, "t-cap" + c.tk);
      return s;
    },
    "chart-up": function (b, p, c) {
      var x0 = b.x + 8, y0 = b.y + b.h, w = b.w - 16, h = b.h - 12, s = axes(b);
      var pts = [[0, 0.12], [0.2, 0.22], [0.4, 0.3], [0.6, 0.5], [0.8, 0.66], [1, 0.9]], d = "";
      pts.forEach(function (q, i) { d += (i ? "L" : "M") + n1(x0 + w * q[0]) + " " + n1(y0 - h * q[1]); });
      s += '<path class="' + c.hi + '" d="' + d + '"/>';
      pts.forEach(function (q) { s += dot(x0 + w * q[0], y0 - h * q[1], 6, c.fill); });
      return s;
    },
    // Two things growing over the years: `labels` names them at their ends,
    // `x` the first and last year.
    growth: function (b, p, c) {
      var foot = p.x ? 38 : 0, bb = { x: b.x, y: b.y, w: b.w, h: b.h - foot }, s = axes(bb), L = p.labels || [];
      var room = L.length ? Math.max(L[0].length, (L[1] || "").length) * FS * MONO + 18 : 0;
      var x0 = bb.x + 8, y0 = bb.y + bb.h, w = bb.w - 16 - room, h = bb.h - 14;
      var fa = function (t) { return 0.03 + 0.7 * Math.pow(t, 3.2); }, fb = function (t) { return 0.05 + 0.87 * Math.pow(t, 1.5); };
      var a = "", d = "";
      for (var i = 0; i <= 40; i++) {
        var t = i / 40, xx = n1(x0 + w * t);
        a += (i ? "L" : "M") + xx + " " + n1(y0 - h * fa(t));
        d += (i ? "L" : "M") + xx + " " + n1(y0 - h * fb(t));
      }
      s += '<path class="ic" d="' + d + '"/><path class="' + c.hi + '" d="' + a + '" stroke-width="4"/>';
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) { s += dot(x0 + w * t, y0 - h * fa(t), 6, c.fill) + dot(x0 + w * t, y0 - h * fb(t), 5, "fill-mu"); });
      if (L[0]) s += txt(x0 + w + 16, y0 - h * fa(1) + 9, L[0], "t-cap" + c.tk);
      if (L[1]) s += txt(x0 + w + 16, y0 - h * fb(1) + 9, L[1], "t-cap");
      if (p.x) s += txt(x0, b.y + b.h - 2, p.x[0], "t-cap t-dim") + txt(x0 + w, b.y + b.h - 2, p.x[1], "t-cap t-dim", "end");
      return s;
    },
    // A day's load: the evening peak as it is (gray), and shaved, its
    // charging moved into the night (the key); what is cut is filled.
    // `labels` names the two curves, `x` the hours along the foot.
    peak: function (b, p, c) {
      var foot = p.x ? 38 : 0, bb = { x: b.x, y: b.y, w: b.w, h: b.h - foot }, s = "", L = p.labels || [];
      var x0 = bb.x + 8, y0 = bb.y + bb.h, w = bb.w - 16, h = bb.h - 12, un = "", sm = "", cut = "", back = [];
      for (var i = 0; i <= 96; i++) {
        var t = i / 96, xx = n1(x0 + w * t);
        var base = 0.3 - 0.1 * Math.sin((t - 0.42) * Math.PI * 2);
        var u = base + 0.5 * Math.exp(-Math.pow((t - 0.38) / 0.085, 2));
        var m = base + 0.16 * Math.exp(-Math.pow((t - 0.4) / 0.11, 2)) + 0.24 * Math.exp(-Math.pow((t - 0.76) / 0.09, 2));
        un += (i ? "L" : "M") + xx + " " + n1(y0 - h * u);
        sm += (i ? "L" : "M") + xx + " " + n1(y0 - h * m);
        if (u > m + 0.004) { cut += (cut ? "L" : "M") + xx + " " + n1(y0 - h * u); back.unshift(xx + " " + n1(y0 - h * m)); }
      }
      if (cut) s += '<path class="' + (p.key ? "area" : "fill-mid") + '" d="' + cut + "L" + back.join("L") + 'Z"/>';
      s += axes(bb) + '<path class="ic" d="' + un + '"/><path class="' + c.hi + '" d="' + sm + '" stroke-width="4"/>';
      if (L[0]) s += txt(x0 + w * 0.46, y0 - h * 0.88, L[0], "t-cap t-dim");
      if (L[1]) s += txt(x0 + w * 0.76, y0 - h * 0.64, L[1], "t-cap" + c.tk, "middle");
      (p.x || []).forEach(function (v, j, all) {
        var f = all.length > 1 ? j / (all.length - 1) : 0;
        s += txt(x0 + w * f, b.y + b.h - 2, v, "t-cap t-dim", f === 0 ? null : f === 1 ? "end" : "middle");
      });
      return s;
    },
    // A choice question: two option cards, B chosen. `a` and `b` are the
    // lines on each card.
    choice: function (b, p, c) {
      var cw = (b.w - 20) / 2, s = "", A = [p.a, p.b];
      for (var i = 0; i < 2; i++) {
        var x = b.x + i * (cw + 20), on = i === 1;
        s += rect(x, b.y, cw, b.h, 12, on ? c.hi + c.wash : "mid");
        s += txt(x + 18, b.y + 36, (cw >= 200 ? "Option " : "") + (on ? "B" : "A"), "t-cap" + (on ? c.tk : " t-dim"));
        s += line(x, b.y + 54, x + cw, b.y + 54, on ? c.hi : "mid", 2);
        if (A[i]) {
          var fs = fitAll(A[i], cw - 36);
          A[i].forEach(function (l, j) { s += txt(x + 18, b.y + 94 + j * 42, l, "t-code", null, fs); });
        } else s += rows(x + 18, b.y + 84, cw - 36, [0.8, 0.6, 0.72], 32, "mid", b.y + b.h - 56);
        s += dot(x + cw - 30, b.y + b.h - 30, 12, on ? c.hi : "mid");
        if (on) s += dot(x + cw - 30, b.y + b.h - 30, 5.5, c.fill);
      }
      return s;
    },
    // Two contents side by side, a rule between them: `left` and `right`
    // each hold a window's own fields (`body` and what it takes).
    split: function (b, p, c) {
      var w = (b.w - 36) / 2, s = line(b.x + w + 18, b.y - 8, b.x + w + 18, b.y + b.h + 8, "mid");
      [p.left, p.right].forEach(function (q, i) {
        if (!BODY[q.body]) throw new Error("hairline: no window content " + q.body);
        s += BODY[q.body]({ x: b.x + i * (w + 36), y: b.y, w: w, h: b.h }, q, c);
      });
      return s;
    },
    // A small website: a picture, three cards and a few lines.
    site: function (b, p, c) {
      var ih = Math.round(b.h * 0.4), cw = (b.w - 20) / 3, s = rect(b.x, b.y, b.w, ih, 8, c.hi + c.wash);
      s += '<path class="' + c.hi + '" d="M' + n1(b.x + b.w * 0.1) + " " + n1(b.y + ih - 12) + "l" + n1(b.w * 0.22) + " " + n1(-ih * 0.5) + "l" + n1(b.w * 0.16) + " " + n1(ih * 0.26) + "l" + n1(b.w * 0.14) + " " + n1(-ih * 0.2) + "l" + n1(b.w * 0.26) + " " + n1(ih * 0.44) + '"/>';
      for (var i = 0; i < 3; i++) s += rect(b.x + i * (cw + 10), b.y + ih + 16, cw, 34, 6, "mid");
      return s + rows(b.x, b.y + ih + 74, b.w, [0.9, 0.62, 0.78, 0.5], 26, "mid", b.y + b.h);
    },
    // One large icon and a few lines: a window that stands for a thing.
    mark: function (b, p, c) {
      if (b.w < 200) return icon(p.icon, b.x + b.w / 2 - 34, b.y + 2, 68, c.hi) + (p.spark ? spark(b.x + b.w - 14, b.y + 14) : "") + rows(b.x, b.y + 104, b.w, [0.9, 0.6, 0.76, 0.5, 0.7], 30, "mid", b.y + b.h);
      if (b.h > 220) {
        var zz = Math.min(128, Math.round(b.w * 0.46));
        return icon(p.icon, b.x + b.w / 2 - zz / 2, b.y + 14, zz, c.hi) + rows(b.x, b.y + zz + 62, b.w, [0.92, 0.62, 0.8, 0.5, 0.7, 0.58], 32, "mid", b.y + b.h);
      }
      var z = Math.min(88, b.h);
      return icon(p.icon, b.x + 2, b.y + (b.h - z) / 2, z, c.hi) + (p.spark ? spark(b.x + b.w - 14, b.y + 14) : "") + rows(b.x + z + 34, b.y + b.h / 2 - 30, b.w - z - 34, [0.92, 0.6, 0.78], 30, "mid", b.y + b.h);
    },
    // A day's load on a grid, from one morning to the next, over the load
    // without the cars (the gray ground): charging as it comes stacks on the
    // evening peak (gray line); managed, the peak is shaved and the charging
    // moved into the night's valley (the key). `labels` names the two lines,
    // `x` the hours along the foot.
    load: function (b, p, c) {
      var foot = p.x ? 42 : 0, y0 = b.y + b.h - foot, h = b.h - foot, s = "", L = p.labels || [];
      var at = function (P) { return P.map(function (v) { return [b.x + b.w * v[0], y0 - h * v[1] / 34]; }); };
      var NET = at([[0, 18], [0.08, 8], [0.17, 3], [0.25, 2.5], [0.33, 6], [0.42, 16], [0.5, 24.3], [0.54, 25.3], [0.6, 24.3], [0.67, 22], [0.75, 20], [0.83, 18.4], [0.92, 19], [0.97, 20], [1, 18.2]]);
      var UN = at([[0, 18.2], [0.08, 8.4], [0.17, 3.5], [0.25, 3.4], [0.33, 8.5], [0.42, 20], [0.5, 30.6], [0.535, 31.8], [0.58, 31.2], [0.63, 29], [0.67, 26.2], [0.71, 23.8], [0.75, 21.4], [0.83, 18.8], [0.9, 19.2], [0.97, 20.3], [1, 18.4]]);
      var SM = at([[0, 18.6], [0.08, 8.1], [0.17, 3.1], [0.25, 2.8], [0.33, 6.8], [0.42, 16.8], [0.5, 25.5], [0.535, 26.4], [0.58, 25.9], [0.63, 24.9], [0.67, 24.1], [0.7, 23.9], [0.725, 25], [0.76, 25.7], [0.83, 25.2], [0.9, 24.4], [0.955, 22.8], [1, 18.7]]);
      s += '<path class="net" d="' + smooth(NET) + "L" + n1(b.x + b.w) + " " + n1(y0) + "L" + n1(b.x) + " " + n1(y0) + 'Z"/>';
      if (p.key) s += '<path class="area" d="' + smooth(UN) + smooth(SM.slice().reverse(), true) + 'Z"/>';
      s += line(b.x, y0, b.x + b.w, y0, "ic") + '<path class="ic" d="' + smooth(UN) + '" stroke-width="3.5"/><path class="' + c.hi + '" d="' + smooth(SM) + '" stroke-width="5"/>';
      if (L[0]) s += line(b.x + 6, b.y + 14, b.x + 46, b.y + 14, "ic", 3.5) + txt(b.x + 60, b.y + 23, L[0], "t-cap");
      if (L[1]) s += line(b.x + 6, b.y + 54, b.x + 46, b.y + 54, c.hi, 5) + txt(b.x + 60, b.y + 63, L[1], "t-cap" + c.tk);
      (p.x || []).forEach(function (v, j, all) {
        var f = all.length > 1 ? j / (all.length - 1) : 0;
        s += txt(b.x + b.w * f, b.y + b.h - 2, v, "t-cap t-dim", f === 0 ? null : f === 1 ? "end" : "middle");
      });
      return s;
    },
    // Repositories, each pulled: `lines` are their names.
    list: function (b, p, c) {
      var L = p.lines || [null, null, null], n = L.length, step = b.h / n, s = "";
      var fs = fitAll(L.map(function (l) { return l || ""; }), b.w, 120);
      for (var i = 0; i < n; i++) {
        var y = b.y + step * i + step / 2;
        s += icon("git-branch", b.x, y - 16, 32, "ic", 2.5);
        if (L[i]) s += txt(b.x + 52, y + fs * 0.34, L[i], "t-code", null, fs);
        else s += line(b.x + 56, y, b.x + 56 + (b.w - 120) * [0.7, 0.5, 0.62][i % 3], y, "mid");
        s += tick(b.x + b.w - 24, y, c.hi);
        if (i < n - 1) s += line(b.x, y + step / 2, b.x + b.w, y + step / 2, "lo");
      }
      return s;
    }
  };
  // A survey page: its question (`q`), its choices (`options`), and its
  // buttons, with their words where the window is wide enough.
  function formBody(b, p, c, nav) {
    var s = "", wide = b.w >= 250, opts = p.options || [null, null, null], pick = p.pick == null ? 1 : p.pick;
    if (p.q) s += txt(b.x, b.y + 24, p.q, "t-code", null, fit(p.q, b.w));
    else s += line(b.x, b.y + 12, b.x + b.w * 0.7, b.y + 12, "ic", 7);
    var y = b.y + 68, fs = fitAll(opts.map(function (o) { return o || ""; }), b.w, 38);
    opts.forEach(function (o, i) {
      if (y > b.y + b.h - 68) return;
      s += dot(b.x + 12, y, 12, i === pick ? c.hi : "mid");
      if (i === pick) s += dot(b.x + 12, y, 5.5, c.fill);
      if (o) s += txt(b.x + 38, y + fs * 0.34, o, "t-code", null, fs);
      else s += line(b.x + 38, y, b.x + 38 + (b.w - 38) * [0.6, 0.48, 0.54][i % 3], y, "mid");
      y += 44;
    });
    var bh = 44, by = b.y + b.h - bh, nw = wide ? 112 : 68, pw = wide ? 150 : 68;
    s += rect(b.x + b.w - nw, by, nw, bh, 14, c.hi + c.wash);
    if (wide) s += txt(b.x + b.w - nw / 2, by + 30, p.next || "Next", "t-btn" + c.tk, "middle");
    else s += '<path class="' + c.hi + '" d="M' + (b.x + b.w - nw / 2 - 4) + " " + (by + 14) + 'l8 8 -8 8"/>';
    if (nav) {
      s += rect(b.x, by, pw, bh, 14, "ic");
      if (wide) s += txt(b.x + pw / 2, by + 30, p.prev || "Previous", "t-btn", "middle");
      else s += '<path class="ic" d="M' + (b.x + pw / 2 + 4) + " " + (by + 14) + 'l-8 8 8 8"/>';
    }
    return s;
  }

  // ---- The parts. Each is drawn at its origin; its group is moved there. ----
  // A caption stands under its part, in the part's own span.
  function caption(p, b) { return p.label ? txt(b.w / 2, b.h + 33, p.label, "t-cap" + (p.key ? " t-k" : ""), "middle", fit(p.label, b.w + 72)) : ""; }
  function drawTile(p, b) {
    var z = Math.round(b.w * 0.47);
    return rect(0, 0, b.w, b.w, Math.round(b.w * 0.2), p.key ? "pane" : "sil") + icon(p.icon, (b.w - z) / 2, (b.w - z) / 2, z, p.key ? "hi" : "ic") + caption(p, b);
  }
  // A window: three dots, then its name, or its address in a pill.
  function drawWindow(p, b) {
    var s = rect(0, 0, b.w, b.h, 18, p.key ? "pane" : "sil"), f = BODY[p.body];
    if (!f) throw new Error("hairline: no window content " + p.body);
    // A bare window is a plain sheet: no title bar.
    if (p.bare) return s + f({ x: 28, y: 28, w: b.w - 56, h: b.h - 56 }, p, tone(p)) + caption(p, b);
    s += line(0, BAR, b.w, BAR, p.key ? "hi" : "mid", 2);
    for (var i = 0; i < 3; i++) s += '<circle class="' + (p.key ? "hi" : "ic") + '" cx="' + (24 + i * 17) + '" cy="' + (BAR / 2) + '" r="4.5" stroke-width="2"/>';
    if (p.url) {
      var uw = Math.min(b.w - 180, p.url.length * 21 * MONO + 56);
      s += rect(b.w / 2 - uw / 2, 8, uw, 28, 14, p.key ? "hi" : "mid").replace("/>", ' stroke-width="2"/>') + txt(b.w / 2, 29, p.url, "t-name" + (p.key ? " t-k" : ""), "middle");
    } else if (p.name) s += txt(84, 29, p.name, "t-name" + (p.key ? " t-k" : ""), null, fit(p.name, b.w - 100, 21));
    s += f({ x: 26, y: BAR + 24, w: b.w - 52, h: b.h - BAR - 48 }, p, tone(p));
    // A badge: a tick at the window's corner, for what has been checked.
    if (p.badge) s += dot(b.w - 8, 8, 20, p.key ? "pane" : "sil") + tick(b.w - 16, 8, p.key ? "hi" : "ic");
    return s + caption(p, b);
  }
  // A card: an icon, a name, and under the name a note or a row of chips.
  function drawCard(p, b) {
    var c = tone(p), s = rect(0, 0, b.w, b.h, 26, p.key ? "pane" : "sil") + icon(p.icon, 32, (b.h - 56) / 2, 56, p.key ? "hi" : "ic");
    var x = 116, two = p.note || p.chips;
    s += txt(x, p.chips ? 52 : two ? 56 : b.h / 2 + 13, p.name, "t-card");
    if (p.note) s += txt(x, 99, p.note, "t-cap", null, fit(p.note, b.w - x - 28, 24));
    if (p.chips) {
      var all = p.chips.join("").length, fs = Math.min(24, Math.floor((b.w - x - 24 - p.chips.length * 40) / (all * MONO))), cx = x;
      p.chips.forEach(function (t) {
        var w = t.length * fs * MONO + 28;
        s += rect(cx, 68, w, 44, 12, p.key ? "hi" : "mid").replace("/>", ' stroke-width="2"/>') + txt(cx + w / 2, 90 + fs * 0.34, t, "t-btn" + c.tk, "middle", fs);
        cx += w + 12;
      });
    }
    return s;
  }
  // A timeline: a rule with a point for each entry, its year over the rule
  // and its name under it; `hi` is the entry in the key.
  function drawTimeline(p, b) {
    var E = p.entries, n = E.length, pad = 66, y = b.h / 2 - 4, s = line(6, y, b.w - 6, y, "ic");
    E.forEach(function (e, i) {
      var x = pad + i * (b.w - 2 * pad) / (n - 1), on = i === p.hi;
      s += dot(x, y, on ? 12 : 10, on ? "pane" : "sil");
      if (on) s += dot(x, y, 5, "fill-k");
      s += txt(x, y - 30, e[0], "t-cap" + (on ? " t-k" : ""), "middle");
      s += txt(x, y + 50, e[1], "t-cap" + (on ? " t-k" : " t-dim"), "middle", fit(e[1], (b.w - 2 * pad) / (n - 1) - 8, 24));
    });
    return s;
  }
  // A layer: a plane at a slant across the stage's width, its nodes at
  // fractions of it, and edges between them.
  var LAYER_W = 500, LAYER_H = 136, SLANT = 112;
  function layerPoint(u, v) { return { x: SLANT * (1 - v) + u * (LAYER_W - SLANT), y: v * LAYER_H }; }
  function drawLayer(p) {
    var s = '<path class="' + (p.key ? "pane" : "sil") + '" d="M' + SLANT + " 0H" + LAYER_W + "L" + (LAYER_W - SLANT) + " " + LAYER_H + 'H0Z"/>';
    (p.edges || []).forEach(function (e) {
      var a = layerPoint.apply(null, p.nodes[e[0]]), c = layerPoint.apply(null, p.nodes[e[1]]);
      s += line(a.x, a.y, c.x, c.y, p.key ? "hi" : "mid");
    });
    p.nodes.forEach(function (n) { var q = layerPoint(n[0], n[1]); s += dot(q.x, q.y, 8, p.key ? "fill-k" : "fill-mu"); });
    if (p.label) s += txt(LAYER_W + 6, LAYER_H / 2 + 9, p.label, "t-cap" + (p.key ? " t-k" : ""));
    return s;
  }

  // ---- Figures: things drawn as they look (a car, a turbine, a cloud),
  // each to fill its box. A figure is drawn on a small grid of its own and
  // scaled to the box, its strokes kept at the picture's weight; one that
  // stands on the ground is set at its box's foot. A figure may name
  // anchors (a car's charging port), which a cable link joins, and may mark
  // a group to turn with the pointer (`data-spin`). ----
  function fitBox(b, dw, dh, ax, ay) {
    var s = Math.min(b.w / dw, b.h / dh);
    return { s: s, x: (b.w - dw * s) * (ax == null ? 0.5 : ax), y: (b.h - dh * s) * (ay == null ? 0.5 : ay) };
  }
  function scaled(f, inner) {
    return '<g transform="translate(' + n1(f.x) + " " + n1(f.y) + ") scale(" + f.s.toFixed(4) + ')" stroke-width="' + (3 / f.s).toFixed(3) + '">' + inner + "</g>";
  }
  // A smooth line through points (Catmull-Rom), to open a path or go on with one.
  function smooth(P, go) {
    var d = (go ? "L" : "M") + n1(P[0][0]) + " " + n1(P[0][1]);
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], e = P[Math.min(i + 2, P.length - 1)];
      d += "C" + n1(b[0] + (c[0] - a[0]) / 6) + " " + n1(b[1] + (c[1] - a[1]) / 6) + " " + n1(c[0] - (e[0] - b[0]) / 6) + " " + n1(c[1] - (e[1] - b[1]) / 6) + " " + n1(c[0]) + " " + n1(c[1]);
    }
    return d;
  }
  var FIG = {
    // An electric car from the side, its nose to the left, its charging port
    // at the rear.
    car: function (b, p, c, q) {
      var f = fitBox(b, 240, 96, 0.5, 1), body = p.key ? "pane" : "sil";
      q.anchors = { port: [f.x + 217 * f.s, f.y + 58 * f.s], top: [f.x + 146 * f.s, f.y + 15 * f.s] };
      return scaled(f,
        '<path class="' + body + '" d="M12 76C5 76 5 62 12 56C30 48 52 46 74 43C88 26 104 15 128 15L164 15C188 16 206 30 218 42C228 44 234 52 234 62L234 72C234 76 230 78 226 78L203 78A21 21 0 0 0 161 78L79 78A21 21 0 0 0 37 78L16 78C13 78 12 77 12 76Z"/>' +
        '<path class="glass" d="M86 42C96 30 108 22 128 21L148 21L148 42Z"/><path class="glass" d="M156 21L164 21C182 22 196 31 205 42L156 42Z"/>' +
        '<path class="ic" d="M124 53h13M13 61l8 -2M229 55l3 7"/>' +
        dot(58, 78, 17, body) + dot(58, 78, 6, "ic") + dot(182, 78, 17, body) + dot(182, 78, 6, "ic") + dot(217, 58, 4, c.fill));
    },
    // A charging post, its plug at the left.
    charger: function (b, p, c, q) {
      var f = fitBox(b, 64, 142, 0.5, 1), cls = p.key ? "pane" : "sil";
      q.anchors = { port: [f.x + 5 * f.s, f.y + 74 * f.s], top: [f.x + 32 * f.s, f.y + 4 * f.s] };
      return scaled(f, '<path class="ic" d="M2 140H62"/>' + rect(10, 4, 44, 136, 12, cls) + rect(18, 16, 28, 28, 7, c.hi + c.wash) +
        '<path class="' + c.fill + '" d="M33.5 20L26.5 31H31.5L30 40L38 28.5H33Z"/>' + rect(3, 64, 13, 20, 4, cls) + '<path class="mid" d="M22 62H42M22 76H36"/>');
    },
    // A wind turbine; its blades turn with the pointer.
    turbine: function (b, p) {
      var f = fitBox(b, 200, 300, 0.5, 1), cls = p.key ? "pane" : "sil", blades = "";
      [10, 130, 250].forEach(function (a) { blades += '<path class="' + cls + '" transform="rotate(' + a + ')" d="M-5 0C-12 -30 -7 -72 0 -92C5 -72 9 -30 5 0Z"/>'; });
      return scaled(f, '<path class="' + cls + '" d="M95 100L92 298H108L105 100Z"/><path class="ic" d="M78 298H122"/>' +
        '<g data-spin="80" data-base="translate(100 96)" transform="translate(100 96)">' + blades + "</g>" + dot(100, 96, 8, cls));
    },
    // A solar panel on its post.
    solar: function (b, p) {
      var f = fitBox(b, 220, 140, 0.5, 1), TL = [30, 50], TR = [182, 16], BR = [206, 84], BL = [54, 118], g = "";
      var mix = function (a, d, t) { return n1(a[0] + (d[0] - a[0]) * t) + " " + n1(a[1] + (d[1] - a[1]) * t); };
      [0.25, 0.5, 0.75].forEach(function (t) { g += "M" + mix(TL, TR, t) + "L" + mix(BL, BR, t); });
      g += "M" + mix(TL, BL, 0.5) + "L" + mix(TR, BR, 0.5);
      return scaled(f, '<path class="ic" d="M132 96V138M104 138H160M132 122L158 138"/>' +
        '<path class="' + (p.key ? "pane" : "glass") + '" d="M' + TL.join(" ") + "L" + TR.join(" ") + "L" + BR.join(" ") + "L" + BL.join(" ") + 'Z"/><path class="' + (p.key ? "hi" : "ic") + '" d="' + g + '" stroke-width="' + (2 / f.s).toFixed(3) + '"/>');
    },
    // A crescent moon and two stars.
    moon: function (b, p) {
      var f = fitBox(b, 100, 100);
      return scaled(f, '<path class="' + (p.key ? "pane" : "sil") + '" d="M56 12A40 40 0 1 0 88 64A31 31 0 0 1 56 12Z"/><path class="ic" d="M82 14v12M76 20h12M94 38v8M90 42h8"/>');
    },
    // The ground: a line at the box's foot, with tufts of grass.
    ground: function (b) {
      var y = b.h, s = line(0, y, b.w, y, "ic");
      [0.06, 0.52, 0.95].forEach(function (t) {
        var x = n1(b.w * t);
        s += '<path class="ic" d="M' + x + " " + y + "q-4 -16 -12 -20M" + x + " " + y + "q1 -18 7 -25M" + x + " " + y + 'q6 -9 15 -11"/>';
      });
      return s;
    },
    // A line that rises to an arrow, a point at each turn; `sun` adds a sun
    // at its upper left.
    trend: function (b, p, c) {
      var P = [[0.03, 0.9], [0.2, 0.74], [0.36, 0.78], [0.54, 0.52], [0.7, 0.44], [0.84, 0.2], [0.97, 0.04]], d = "", s = "";
      P.forEach(function (v, i) { d += (i ? "L" : "M") + n1(b.w * v[0]) + " " + n1(b.h * v[1]); });
      var a = P[P.length - 2], e = P[P.length - 1], ex = b.w * e[0], ey = b.h * e[1], ang = Math.atan2(ey - b.h * a[1], ex - b.w * a[0]);
      d += "M" + n1(ex - 22 * Math.cos(ang - 0.5)) + " " + n1(ey - 22 * Math.sin(ang - 0.5)) + "L" + n1(ex) + " " + n1(ey) + "L" + n1(ex - 22 * Math.cos(ang + 0.5)) + " " + n1(ey - 22 * Math.sin(ang + 0.5));
      s = '<path class="' + c.hi + '" d="' + d + '" stroke-width="4"/>';
      P.slice(0, -1).forEach(function (v) { s += dot(b.w * v[0], b.h * v[1], 7, c.fill); });
      if (p.sun) s += dot(b.w * 0.12, b.h * 0.14, 42, c.hi + c.wash);
      return s;
    },
    // A cloud, an arrow rising into it.
    cloud: function (b, p, c) {
      var f = fitBox(b, 240, 132);
      return scaled(f, '<path class="' + (p.key ? "pane" : "sil") + '" d="M58 120C22 120 10 84 40 70C34 36 76 20 96 42C112 8 166 12 170 54C210 48 226 96 196 114C188 119 178 120 168 120Z"/>' +
        '<path class="' + c.hi + '" d="M120 102V60M104 76L120 60L136 76"/>');
    },
    // A shipping container, Docker's whale on its side.
    container: function (b, p, c) {
      var f = fitBox(b, 300, 190, 0.5, 1), cls = p.key ? "pane" : "sil", ribs = "";
      [26, 46, 66, 186, 206, 226].forEach(function (x) { ribs += "M" + x + " 58V170"; });
      return scaled(f, '<path class="' + cls + '" d="M6 44L54 6H294L246 44Z"/><path class="' + cls + '" d="M246 44L294 6V146L246 184Z"/>' + rect(6, 44, 240, 140, 4, cls) +
        '<path class="mid" d="' + ribs + 'M262 46V160M278 33V147"/>' + icon("brand-docker", 86, 74, 80, c.hi, 3 / f.s));
    },
    // A database: three disks.
    db: function (b, p, c) {
      var f = fitBox(b, 140, 176), cls = p.key ? "pane" : "sil";
      return scaled(f, '<path class="' + cls + '" d="M12 28V148A58 20 0 0 0 128 148V28"/><ellipse class="' + cls + '" cx="70" cy="28" rx="58" ry="20"/>' +
        '<path class="' + (p.key ? "hi" : "ic") + '" d="M12 68A58 20 0 0 0 128 68M12 108A58 20 0 0 0 128 108"/>' + dot(104, 61, 3.5, c.fill) + dot(104, 101, 3.5, c.fill) + dot(104, 141, 3.5, c.fill));
    },
    // surveydown's mark: a hexagon holding S and an arrow down; with
    // `inner: "studio"`, sdstudio's, holding a checklist's window.
    hex: function (b, p, c) {
      var f = fitBox(b, 200, 220);
      return scaled(f, '<path class="' + (p.key ? "pane" : "sil") + '" d="M100 8L188 59V161L100 212L12 161V59Z"/>' + rect(46, 62, 108, 80, 12, (p.key ? "hi" : "ic") + " paper") +
        (p.inner === "studio"
          ? '<path class="' + c.hi + '" d="M46 82H154M62 100l6 6 10 -12M90 100H138M90 122H126" stroke-width="5"/>' + rect(60, 112, 18, 18, 4, c.hi).replace("/>", ' stroke-width="5"/>')
          : '<text class="t-logo' + c.tk + '" x="60" y="124">S</text><path class="' + c.hi + '" d="M126 82V122M112 109L126 123L140 109" stroke-width="7"/>') +
        '<path class="' + c.hi + '" d="M60 166H140" stroke-width="7"/>');
    },
    // Rays round a center.
    burst: function (b) {
      var cx = b.w / 2, cy = b.h / 2, R = Math.min(b.w, b.h) / 2, d = "";
      for (var i = 0; i < 18; i++) {
        var a = (i + 0.5) / 18 * Math.PI * 2, r1 = R * (i % 3 === 0 ? 0.74 : 0.8), r2 = R * (i % 3 === 0 ? 0.98 : i % 3 === 1 ? 0.9 : 0.86);
        d += "M" + n1(cx + r1 * Math.cos(a)) + " " + n1(cy + r1 * Math.sin(a)) + "L" + n1(cx + r2 * Math.cos(a)) + " " + n1(cy + r2 * Math.sin(a));
      }
      return '<path class="ic" d="' + d + '"/>';
    },
    // A jigsaw piece, a cell square: `tabs` gives its four sides from the
    // top, clockwise (1 a tab, -1 a notch, 0 flat), `icon` what it holds.
    piece: function (b, p) {
      var a = b.w, r = a * 0.1, n = r * 0.6, m = a / 2, S = [[0, 0, 1, 0], [a, 0, 0, 1], [a, a, -1, 0], [0, a, 0, -1]], d = "M0 0";
      S.forEach(function (s, i) {
        var t = (p.tabs || [])[i];
        if (t) d += "L" + n1(s[0] + s[2] * (m - n)) + " " + n1(s[1] + s[3] * (m - n)) + "A" + n1(r) + " " + n1(r) + " 0 1 " + (t > 0 ? 1 : 0) + " " + n1(s[0] + s[2] * (m + n)) + " " + n1(s[1] + s[3] * (m + n));
        d += "L" + (s[0] + s[2] * a) + " " + (s[1] + s[3] * a);
      });
      return '<path class="' + (p.key ? "pane" : "sil") + '" d="' + d + 'Z"/>' + (p.icon ? icon(p.icon, a / 2 - 38, a / 2 - 38, 76, p.key ? "hi" : "ic") : "");
    },
    // A page under a magnifying glass.
    paper: function (b, p, c) {
      var f = fitBox(b, 176, 236);
      return scaled(f, rect(6, 6, 136, 196, 10, p.key ? "pane" : "sil") + '<path class="ic" d="M26 34H86" stroke-width="7"/>' +
        '<path class="mid" d="M26 62H122M26 84H110M26 106H122M26 128H70M26 150H60"/>' + dot(118, 158, 42, (p.key ? "hi" : "ic") + " paper") + '<path class="mid" d="M98 150H140M102 168H132"/>' +
        '<path class="' + c.hi + '" d="M148 190L168 212" stroke-width="8"/>');
    },
    // A ring-bound notebook with a checklist.
    notebook: function (b, p, c) {
      var f = fitBox(b, 176, 236), s = rect(22, 8, 140, 220, 12, p.key ? "pane" : "sil");
      for (var i = 0; i < 6; i++) s += '<path class="ic" d="M10 ' + (36 + i * 33) + 'h24" stroke-width="5"/>';
      for (var j = 0; j < 4; j++) {
        var y = 40 + j * 46;
        s += rect(56, y, 24, 24, 6, "mid") + (j < 3 ? '<path class="' + c.hi + '" d="M61 ' + (y + 12) + 'l5 5 9 -11"/>' : "") + '<path class="mid" d="M94 ' + (y + 12) + "h" + [50, 36, 44, 30][j] + '"/>';
      }
      return scaled(f, s);
    },
    // A gear that turns with the pointer, `icon` at its middle.
    gear: function (b, p, c) {
      var R = Math.min(b.w, b.h) / 2 - 2, n = 8, w = Math.PI * 2 / n, d = "", pt = function (r, a) { return n1(r * Math.cos(a)) + " " + n1(r * Math.sin(a)); };
      for (var i = 0; i < n; i++) {
        var a = i * w;
        d += (i ? "L" : "M") + pt(R * 0.78, a - 0.3 * w) + "L" + pt(R, a - 0.16 * w) + "L" + pt(R, a + 0.16 * w) + "L" + pt(R * 0.78, a + 0.3 * w);
      }
      var base = "translate(" + n1(b.w / 2) + " " + n1(b.h / 2) + ")";
      return '<g data-spin="45" data-base="' + base + '" transform="' + base + '"><path class="' + (p.key ? "pane" : "sil") + '" d="' + d + 'Z"/></g>' +
        dot(b.w / 2, b.h / 2, R * 0.48, (p.key ? "hi" : "ic") + " paper") + (p.icon ? icon(p.icon, b.w / 2 - R * 0.3, b.h / 2 - R * 0.3, R * 0.6, c.hi) : "");
    },
    // Repositories as cards, two by three, each pulled.
    repos: function (b, p, c) {
      var g = 18, cw = (b.w - g) / 2, ch = (b.h - g * 2) / 3, s = "";
      for (var i = 0; i < 6; i++) {
        var x = (i % 2) * (cw + g), y = Math.floor(i / 2) * (ch + g);
        s += rect(x, y, cw, ch, 16, p.key ? "pane" : "sil") + icon("brand-github", x + 16, y + 16, 44, "ic") + line(x + 76, y + 30, x + cw - 20, y + 30, "mid") + line(x + 76, y + 48, x + cw - 48, y + 48, "mid") +
          icon("download", x + cw - 46, y + ch - 44, 30, c.hi, 2.5);
      }
      return s;
    },
    // A ring with a small tile for each of `icons`, round whatever stands at
    // its middle.
    orbit: function (b, p) {
      var cx = b.w / 2, cy = b.h / 2, R = Math.min(b.w, b.h) / 2 - 52, n = p.icons.length;
      var s = '<circle class="mid dash" cx="' + n1(cx) + '" cy="' + n1(cy) + '" r="' + n1(R) + '"/>';
      p.icons.forEach(function (name, i) {
        var a = -Math.PI / 2 + (i + 0.5) / n * Math.PI * 2, x = cx + R * Math.cos(a) - 50, y = cy + R * Math.sin(a) - 50;
        s += rect(x, y, 100, 100, 22, "sil") + icon(name, x + 26, y + 26, 48, "ic");
      });
      return s;
    },
    // A staircase of `n` steps rising to the right, for tiles to stand on:
    // each tread is the box's width over n; the lowest is 52 above the
    // box's foot and the highest a tile and 22 under its top (`tile`, the
    // tile's size, 120 unless given), room for a tile on it and its caption
    // under it.
    stairs: function (b, p) {
      var n = p.n || 4, tw = b.w / n, rise = (b.h - 74 - (p.tile || TILE)) / (n - 1), d = "M0 " + b.h + "V" + (b.h - 52);
      for (var i = 0; i < n; i++) d += "H" + n1((i + 1) * tw) + (i < n - 1 ? "V" + n1(b.h - 52 - (i + 1) * rise) : "");
      return '<path class="sil" d="' + d + "V" + b.h + 'Z"/>';
    },
    // A panel of people.
    people: function (b, p) {
      var s = rect(0, 0, b.w, b.h, 18, p.key ? "pane" : "sil"), cw = b.w / 2, ch = (b.h - 24) / 3;
      for (var i = 0; i < 6; i++) s += icon("user", (i % 2) * cw + cw / 2 - 26, 12 + Math.floor(i / 2) * ch + ch / 2 - 26, 52, "ic");
      return s;
    },
    // The logistic curve on bare axes, from 0 to 1: growth without a limit
    // leaves it (dashed), and points lie about it.
    scurve: function (b, p, c) {
      var x0 = 62, y0 = b.h - 10, w = b.w - x0 - 22, h = y0 - 34, top = 0.88, exp = "", P = [], s = "";
      var L = function (t) { return top / (1 + Math.exp(-(t - 0.5) * 10)); }, Y = function (v) { return y0 - h * v; };
      s += '<path class="ic" d="M' + x0 + " 10V" + y0 + "H" + (b.w - 4) + "M" + (x0 - 9) + " 23L" + x0 + " 10L" + (x0 + 9) + " 23M" + (b.w - 17) + " " + (y0 - 9) + "L" + (b.w - 4) + " " + y0 + "L" + (b.w - 17) + " " + (y0 + 9) + '"/>';
      s += line(x0, Y(top), x0 + w, Y(top), "mid dash") + line(x0, Y(top / 2), x0 + w * 0.5, Y(top / 2), "mid dash");
      for (var i = 0; i <= 60; i++) {
        var t = i / 60, e = top * Math.exp((t - 0.5) * 10);
        if (e <= 1.08) exp += (exp ? "L" : "M") + n1(x0 + w * t) + " " + n1(Y(e));
        P.push([x0 + w * t, Y(L(t))]);
      }
      s += '<path class="ic dash" d="' + exp + '"/>';
      for (var j = 0; j < 20; j++) {
        var u = 0.04 + j * 0.048, r = Math.sin(j * 12.9898) * 43758.5453, k = (r - Math.floor(r) - 0.5) * 0.13;
        s += dot(x0 + w * u, Y(Math.min(0.98, Math.max(0.015, L(u) + k))), 5.5, j % 2 ? c.fill : "fill-mu");
      }
      s += '<path class="' + c.hi + '" d="' + smooth(P.filter(function (v, n) { return n % 3 === 0; })) + '" stroke-width="5"/>';
      return s + txt(x0 - 14, Y(top) + 9, "1", "t-cap", "end") + txt(x0 - 14, Y(top / 2) + 9, "0.5", "t-cap", "end") + txt(x0 - 14, y0 + 6, "0", "t-cap", "end");
    }
  };
  function drawFig(p, b, q) {
    if (!FIG[p.fig]) throw new Error("hairline: no figure " + p.fig);
    return FIG[p.fig](b, p, tone(p), q) + caption(p, b);
  }
  // A chip: an icon and a word, as a callout.
  function drawChip(p, b) {
    return rect(0, 0, b.w, b.h, 20, p.key ? "pane" : "sil") + icon(p.icon, 18, (b.h - 36) / 2, 36, p.key ? "hi" : "ic", 2.5) + txt(68, b.h / 2 + 9, p.name, "t-cap" + (p.key ? " t-k" : ""));
  }

  // A part's box from its cells.
  function box(G, at, span) {
    span = span || [1, 1];
    return { x: G.sx + at[0] * CELL + GUT / 2, y: G.sy + at[1] * CELL + GUT / 2, w: span[0] * CELL - GUT, h: span[1] * CELL - GUT };
  }
  function place(G, p) {
    var c;
    if (p.k === "tile") {
      // A large tile is a cell wide, and stands in a cell and a quarter.
      c = box(G, p.at, p.span || [1, p.size === "l" ? 1.25 : 1]);
      var z = p.span ? Math.min(c.w, c.h - (p.label ? CAP : 0)) : p.size === "l" ? BIG : TILE;
      return { x: c.x + c.w / 2 - z / 2, y: c.y + (c.h - z - (p.label ? CAP : 0)) / 2, w: z, h: z, foot: p.label ? CAP : 0 };
    }
    if (p.k === "chip") {
      c = box(G, p.at);
      return { x: c.x, y: c.y, w: 68 + p.name.length * FS * MONO + 24, h: 68 };
    }
    // A jigsaw piece takes its cell whole, so pieces meet.
    if (p.k === "fig" && p.fig === "piece") return { x: G.sx + p.at[0] * CELL, y: G.sy + p.at[1] * CELL, w: CELL, h: CELL };
    if (p.k === "layer") {
      c = box(G, [0, p.at[1]], [G.cols, 1]);
      return { x: G.sx + G.cols * CELL / 2 - LAYER_W / 2 - 44, y: c.y + c.h / 2 - LAYER_H / 2, w: LAYER_W, h: LAYER_H };
    }
    if (p.k === "card") {
      c = box(G, p.at, [p.span ? p.span[0] : G.cols, 1]);
      return { x: c.x, y: c.y + (c.h - CARD) / 2, w: c.w, h: CARD };
    }
    if (p.k === "timeline") return box(G, p.at, [p.span ? p.span[0] : G.cols, 1]);
    c = box(G, p.at, p.span);
    if (p.label) { c.h -= CAP; c.foot = CAP; }
    return c;
  }
  var DRAW = { tile: drawTile, win: drawWindow, card: drawCard, timeline: drawTimeline, layer: drawLayer, fig: drawFig, chip: drawChip };
  var DEPTH = { tile: 0.75, win: 0.45, card: 0.6, timeline: 0.3, layer: 0.45, fig: 0.6, chip: 0.9 };
  function depthOf(p) { return p.depth != null ? p.depth : p.key ? 1 : DEPTH[p.k]; }

  // A link: straight where the two parts face each other, else out from the
  // first part's side and turned, with round corners. It ends in a small
  // arrowhead (`head`), short of the part it points at; a caption under a
  // part is cleared.
  function link(a, b, head) {
    var ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    var G = head ? 8 : 0, P = 22, s2 = head === "both" ? 8 : 0;
    var aB = a.y + a.h + (a.foot || 0), bB = b.y + b.h + (b.foot || 0);
    var over = function (lo1, len1, c1, lo2, len2, c2) {
      // Where two ranges face: the smaller part's middle if it lies within the other, else the middle of what they share.
      var lo = Math.max(lo1, lo2), hi = Math.min(lo1 + len1, lo2 + len2);
      if (hi - lo < 2 * P) return null;
      if (c2 >= lo1 + P && c2 <= lo1 + len1 - P && len2 <= len1) return c2;
      if (c1 >= lo2 + P && c1 <= lo2 + len2 - P) return c1;
      if (c2 >= lo1 + P && c2 <= lo1 + len1 - P) return c2;
      return (lo + hi) / 2;
    };
    var d, tip, x, y;
    if (aB <= b.y || bB <= a.y) {
      x = over(a.x, a.w, ac.x, b.x, b.w, bc.x);
      if (x !== null) {
        var down = aB <= b.y, y1 = down ? aB + (a.foot ? 6 : 0) + s2 : a.y - s2, y2 = down ? b.y - G : bB + (b.foot ? 6 : 0) + G;
        d = "M" + n1(x) + " " + n1(y1) + "V" + n1(y2);
        return d + (head ? arrow(x, y2, down ? "D" : "U") : "") + (head === "both" ? arrow(x, y1, down ? "U" : "D") : "");
      }
    }
    if (a.x + a.w <= b.x || b.x + b.w <= a.x) {
      y = over(a.y, a.h, ac.y, b.y, b.h, bc.y);
      var right = a.x + a.w <= b.x, x1 = right ? a.x + a.w + s2 : a.x - s2, x2 = right ? b.x - G : b.x + b.w + G;
      if (y !== null) {
        d = "M" + n1(x1) + " " + n1(y) + "H" + n1(x2);
        return d + (head ? arrow(x2, y, right ? "R" : "L") : "") + (head === "both" ? arrow(x1, y, right ? "L" : "R") : "");
      }
      return turn(x1, ac.y, x2, bc.y, true) + (head ? arrow(x2, bc.y, right ? "R" : "L") : "");
    }
    var dn = bc.y > ac.y, ya = dn ? aB + (a.foot ? 6 : 0) : a.y, yb = dn ? b.y - G : bB + (b.foot ? 6 : 0) + G;
    return turn(ac.x, ya, bc.x, yb, false) + (head ? arrow(bc.x, yb, dn ? "D" : "U") : "");
  }
  function arrow(x, y, dir) {
    var a = 9, v = { R: [-a, -a, -a, a], L: [a, -a, a, a], D: [-a, -a, a, -a], U: [-a, a, a, a] }[dir];
    return "M" + n1(x + v[0]) + " " + n1(y + v[1]) + "L" + n1(x) + " " + n1(y) + "L" + n1(x + v[2]) + " " + n1(y + v[3]);
  }
  function turn(x1, y1, x2, y2, across) {
    var r = 16, sx = Math.sign(x2 - x1) || 1, sy = Math.sign(y2 - y1) || 1;
    if (across) {
      var mx = (x1 + x2) / 2, rr = Math.min(r, Math.abs(y2 - y1) / 2, Math.abs(mx - x1));
      return "M" + n1(x1) + " " + n1(y1) + "H" + n1(mx - sx * rr) + "Q" + n1(mx) + " " + n1(y1) + " " + n1(mx) + " " + n1(y1 + sy * rr) + "V" + n1(y2 - sy * rr) + "Q" + n1(mx) + " " + n1(y2) + " " + n1(mx + sx * rr) + " " + n1(y2) + "H" + n1(x2);
    }
    var my = (y1 + y2) / 2, rv = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(my - y1));
    return "M" + n1(x1) + " " + n1(y1) + "V" + n1(my - sy * rv) + "Q" + n1(x1) + " " + n1(my) + " " + n1(x1 + sx * rv) + " " + n1(my) + "H" + n1(x2 - sx * rv) + "Q" + n1(x2) + " " + n1(my) + " " + n1(x2) + " " + n1(my + sy * rv) + "V" + n1(y2);
  }

  // ---- An image. ----
  function render(spec, host, opts) {
    injectStyle();
    opts = opts || {};
    var G = geometry(spec), W = G.W, H = G.H;
    var root = document.createElement("div");
    root.className = "hl k-" + spec.key + (opts.dark ? " dark" : "");
    var parts = spec.items.map(function (p) { return { p: p, b: place(G, p), z: depthOf(p) }; });
    var byId = {};
    parts.forEach(function (q) { if (q.p.id) byId[q.p.id] = q; });
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(spec.label || [spec.lead].concat(spec.title, spec.tag, spec.what).filter(Boolean).join(" ")) + '">' +
      '<rect class="ground" width="' + W + '" height="' + H + '"/><g class="hl-words"></g><g class="hl-links"></g>';
    // Behind first, the key last, so it stands over the rest.
    // (`z` sets a part's place in the pile where it should differ from its depth.)
    var pile = function (q) { return q.p.z != null ? q.p.z : q.z; };
    parts.slice().sort(function (a, b) { return pile(a) - pile(b); }).forEach(function (q) {
      var p = q.p, f = DRAW[p.k];
      if (!f) throw new Error("hairline: no part " + p.k);
      svg += '<g class="hl-part' + (p.key ? " forward" : "") + '" data-id="' + (p.id || "") + '" transform="translate(' + q.b.x + " " + q.b.y + ')">' + f(p, q.b, q) + "</g>";
    });
    root.innerHTML = svg + "</svg>";
    host.appendChild(root);
    if (G.words) words(spec, root.querySelector(".hl-words"), G);

    var linkEl = root.querySelector(".hl-links");
    var links = (spec.links || []).map(function (l) {
      if (!byId[l[0]] || !byId[l[1]]) throw new Error("hairline: no part " + (byId[l[0]] ? l[1] : l[0]) + " for a link");
      var el = document.createElementNS(NS, "path");
      el.setAttribute("class", l[2] === "drop" ? "hi dash" : l[2] === "dots" ? "ln dash" : "ln");
      linkEl.appendChild(el);
      return { a: byId[l[0]], b: byId[l[1]], drop: l[2] === "drop" ? l[3] : null, cable: l[2] === "cable", dots: l[2] === "dots", head: l[2] === "plain" || l[2] === "dots" ? false : l[2] === "both" ? "both" : true, el: el };
    });
    // What turns with the pointer: a turbine's blades, a gear.
    var spins = [].map.call(root.querySelectorAll("[data-spin]"), function (el) { return { el: el, k: +el.getAttribute("data-spin"), base: el.getAttribute("data-base") }; });
    var groups = {};
    [].forEach.call(root.querySelectorAll(".hl-part"), function (g) { groups[g.getAttribute("data-id")] = g; });

    function draw(wind, lift) {
      parts.forEach(function (q) {
        q.dx = -wind * 32 * q.z; q.dy = -lift * 16 * q.z;
        var g = groups[q.p.id || ""];
        if (g) g.setAttribute("transform", "translate(" + n1(q.b.x + q.dx) + " " + n1(q.b.y + q.dy) + ")");
      });
      links.forEach(function (l) {
        var A = moved(l.a), B = moved(l.b);
        if (l.drop) {
          var pa = layerPoint(l.drop[0], l.drop[1]);
          l.el.setAttribute("d", "M" + n1(A.x + pa.x) + " " + n1(A.y + pa.y + 10) + "L" + n1(B.x + pa.x) + " " + n1(B.y + pa.y - 10));
        } else if (l.cable) {
          // A cable hangs between two figures' ports.
          var u = l.a.anchors.port, v = l.b.anchors.port, x1 = A.x + u[0], y1 = A.y + u[1], x2 = B.x + v[0], y2 = B.y + v[1], sag = 46 + Math.abs(x2 - x1) * 0.25;
          l.el.setAttribute("d", "M" + n1(x1) + " " + n1(y1) + "C" + n1(x1 + (x2 - x1) * 0.2) + " " + n1(y1 + sag) + " " + n1(x1 + (x2 - x1) * 0.75) + " " + n1(y2 + sag) + " " + n1(x2) + " " + n1(y2));
        } else if (l.dots && l.b.anchors && l.b.anchors.top) {
          // A callout's leader drops from it to the top of what it is about.
          var tp = l.b.anchors.top, tx = B.x + tp[0];
          l.el.setAttribute("d", "M" + n1(Math.min(Math.max(tx, A.x + 24), A.x + A.w - 24)) + " " + n1(A.y + A.h + 4) + "L" + n1(tx) + " " + n1(B.y + tp[1] - 6));
        } else l.el.setAttribute("d", link(A, B, l.head));
      });
      spins.forEach(function (t) { t.el.setAttribute("transform", t.base + " rotate(" + n1(wind * t.k) + ")"); });
    }
    function moved(q) { return { x: q.b.x + (q.dx || 0), y: q.b.y + (q.dy || 0), w: q.b.w, h: q.b.h, foot: q.b.foot }; }
    draw(0, 0);
    return { root: root, draw: draw };
  }

  // The words: a lead over the title, and the title at the largest size at
  // which its longest line fits; a chip (`tag`) and a line (`what`) under
  // it only where a spec asks for them. Beside the stage, the block is
  // centered on the canvas's middle. On top, the title is one line, a mark
  // (the product's own, a figure) before it and the chip after it. In a
  // scene, the block stands in the corner `words` names ("nw", "ne", "sw",
  // "se"), `inset` in from it, and reads from the right in an east corner.
  var TOP_SIZES = [112, 96, 84], SCENE_SIZES = [136, 120, 108, 96];
  function words(spec, g, G) {
    var top = G.words === "top", scene = G.words === "scene", corner = scene ? spec.words || "nw" : "", east = corner.charAt(1) === "e", inset = spec.inset || [0, 0];
    var s = "", lines = top ? [spec.title.join(" ")] : spec.title, mark = top && spec.mark, end = east ? ' text-anchor="end"' : "";
    if (mark) {
      if (!FIG[mark.fig]) throw new Error("hairline: no figure " + mark.fig);
      var mp = { key: true, inner: mark.inner };
      s += '<g transform="translate(' + COL_X + ' 50)">' + FIG[mark.fig]({ w: 126, h: 138 }, mp, tone(mp), {}) + "</g>";
    }
    if (spec.lead) s += '<text class="t-lead"' + end + ">" + esc(spec.lead) + "</text>";
    lines.forEach(function (t) { s += '<text class="t-title"' + end + ">" + esc(t) + "</text>"; });
    if (spec.tag) s += '<rect class="tag" height="52" rx="14"/><text class="t-tag">' + esc(spec.tag) + "</text>";
    if (spec.what) s += '<text class="t-what">' + esc(spec.what) + "</text>";
    g.innerHTML = s;
    var titles = g.querySelectorAll(".t-title"), sizes = top ? TOP_SIZES : scene ? SCENE_SIZES : SIZES, size = sizes[sizes.length - 1];
    var tx = top ? COL_X + (mark ? 150 : 0) : G.words === "right" ? 736 : east ? G.W - COL_X - inset[0] : COL_X + inset[0];
    var room = top ? G.W - COL_X - tx : scene ? spec.room || 600 : COL_W;
    for (var i = 0; i < sizes.length; i++) {
      var fits = true;
      [].forEach.call(titles, function (t) { t.setAttribute("font-size", sizes[i]); if (t.getComputedTextLength() > room) fits = false; });
      if (fits) { size = sizes[i]; break; }
    }
    [].forEach.call(titles, function (t) { t.setAttribute("font-size", size); t.setAttribute("x", tx + (east ? 5 : -5)); });
    var lead = g.querySelector(".t-lead"), tt = g.querySelector(".t-tag"), r = g.querySelector(".tag"), w = g.querySelector(".t-what"), tw = tt ? tt.getComputedTextLength() : 0;
    if (lead) lead.setAttribute("x", tx);
    if (top) {
      // One line, its middle on the mark's.
      var base = spec.lead ? 190 : 120 + Math.round(size * 0.34);
      if (lead) lead.setAttribute("y", 96);
      titles[0].setAttribute("y", base);
      if (tt) {
        var cx = tx + titles[0].getComputedTextLength() + 30, cy = base - Math.round(size * 0.3);
        r.setAttribute("x", cx); r.setAttribute("y", cy - 26); r.setAttribute("width", tw + 40);
        tt.setAttribute("x", cx + 20); tt.setAttribute("y", cy + 10);
      }
      return;
    }
    var meta = tt || w, leadH = lead ? 70 : 0, step = Math.round(size * 1.0), metaH = meta ? 52 : 0, gap = meta ? 34 : 0;
    var total = leadH + titles.length * step + gap + metaH - (meta ? 0 : Math.round(size * 0.2));
    var y = !scene ? Math.round(G.H / 2 - total / 2) : corner.charAt(0) === "s" ? G.H - 72 - inset[1] - total : 72 + inset[1];
    if (lead) { lead.setAttribute("y", y + 46); y += leadH; }
    [].forEach.call(titles, function (t) { t.setAttribute("y", y + Math.round(size * 0.76)); y += step; });
    if (!meta) return;
    y += gap;
    var mid = y + metaH / 2, x = tx + (east ? 0 : 2);
    if (tt) {
      r.setAttribute("x", east ? x - tw - 40 : x); r.setAttribute("y", y); r.setAttribute("width", tw + 40);
      tt.setAttribute("x", (east ? x - tw - 40 : x) + 20); tt.setAttribute("y", mid + 10);
      x += tw + 40 + 22;
    }
    if (w && !east) {
      // The line shrinks to stay in the column.
      var left = tx + room - x, len = w.getComputedTextLength();
      if (len > left) w.style.fontSize = Math.max(24, Math.floor(34 * left / len)) + "px";
      w.setAttribute("x", x); w.setAttribute("y", mid + 12);
    }
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  // ---- Live in a listing: the pointer over the image moves its parts. ----
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
    // A listing's card has a link stretched over the whole of it, so the
    // pointer is heard on the card, never on the image's own link (which
    // lies under the stretched one and hears nothing); the image answers
    // only while the pointer is over it.
    var card = holder.closest(".quarto-post, .quarto-grid-item, .card") || holder.closest("a") || holder;
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
    Promise.all([document.fonts.load("96px Optima"), document.fonts.load("26px 'Maple Mono'")]).then(go, go);
  }
})();
