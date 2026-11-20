// The banners' specs, one to a post or research entry, keyed by its folder
// (the PNG is {dir}/banners/{id}.png). A banner is read in about three
// seconds, so each is one picture, not a diagram to study:
// - a post that is a run of steps is one straight flow of a few large
//   things, left to right, with no side branches;
// - a post about something physical shows the thing itself (a car at its
//   charger, a turbine and a solar panel), not a chart about it;
// - a chart appears only where the chart is the point, and then it makes
//   that point and nothing else.
// Words in the picture are a caption under a step, never lines to read:
// text inside a window is drawn as plain bars. And no line of keywords
// under the title ("A · B · C"): the title and the picture say it.
//
// A banner is a canvas, not a template: the title stands where the picture
// wants it (`layout`).
// - "left" (the default) and "right": the words beside a 3 x 3 stage.
// - "top": the title in one line over a stage the canvas's width, 6 x 2.4
//   cells, with the product's own mark before it (`mark`), as surveydown
//   and sdstudio have theirs. A row of steps takes this, so they are large.
// - "scene": the picture takes the whole canvas, 6 x 3 cells, and the
//   title a corner of it (`words`: nw, ne, sw or se; `inset` moves it).
// The key is the banner's color, kept from the earlier banners.
//
// A part: { id, k, at: [col, row] on the stage (fractions allowed),
// key: true on the one part in color }, and by kind:
// - "tile": icon (a Tabler name), label (its caption), size: "l" for a
//   large one.
// - "win": span: [cols, rows], body (what it shows, as bars and shapes),
//   name (in its title bar), label (a caption under it).
// - "fig": fig (a drawing: car, charger, turbine, solar, cloud, container,
//   db, hex, piece, gear, ...), span, label.
// - "chip": icon, name (a callout).
// - "layer": nodes, edges, label.
// A link: [from, to] (an arrow), [from, to, "plain"], [from, to, "dots"],
// [from, to, "cable"] between two figures' ports, or [from, to, "drop",
// [u, v]] between two layers at a node they share.
// `dir` is the site's own: where make-banners.sh puts the PNGs.
// resources/banners/hairline.js draws them (a verbatim copy of the ph-image
// skill's hairline engine); make-banners.sh shoots the PNGs.

window.HAIRLINE_SPECS = {
  // The site, and the three tools that make it, in order.
  "2023-12-09-personal-website": {
    dir: "blog", key: "accent",
    lead: "How to Make a", title: ["Personal", "Website"],
    items: [
      { id: "site", k: "win", at: [0, 0], span: [3, 2], body: "page", url: "pingfan.org", key: true },
      { id: "quarto", k: "tile", at: [0, 2], icon: "file-code", label: "Quarto" },
      { id: "github", k: "tile", at: [1, 2], icon: "brand-github", label: "GitHub" },
      { id: "netlify", k: "tile", at: [2, 2], icon: "world-upload", label: "Netlify" }
    ],
    links: [["quarto", "github"], ["github", "netlify"], ["netlify", "site"]]
  },
  // A Docker container, lifted to a server in the cloud.
  "2023-12-30-formr-instance": {
    dir: "blog", key: "mauve", layout: "right",
    lead: "Deploying", title: ["formr"],
    items: [
      { id: "cloud", k: "fig", fig: "cloud", at: [0.5, 0], span: [2, 1.3] },
      { id: "box", k: "fig", fig: "container", at: [0.3, 1.45], span: [2.4, 1.55], key: true }
    ],
    links: [["box", "cloud"]]
  },
  // Read, take notes, publish.
  "2024-01-30-how-to-do-research": {
    dir: "blog", key: "sage", layout: "top",
    title: ["How to Do Research"],
    items: [
      { id: "read", k: "fig", fig: "paper", at: [0.15, 0], span: [1.8, 2.4], label: "Review" },
      { id: "note", k: "fig", fig: "notebook", at: [2.1, 0], span: [1.8, 2.4], label: "Notes" },
      { id: "share", k: "win", at: [4.05, 0], span: [1.8, 2.4], body: "bars", label: "Publish", key: true }
    ],
    links: [["read", "note"], ["note", "share"]]
  },
  // The logistic curve, from 0 to 1.
  "2024-05-20-history-of-logit": {
    dir: "blog", key: "ochre", layout: "scene", words: "se", inset: [70, 66],
    lead: "The History of", title: ["Logit"],
    items: [
      { id: "curve", k: "fig", fig: "scurve", at: [0, 0], span: [6, 3], key: true }
    ]
  },
  // One shortcut pulls every repository.
  "2025-03-07-pull-repos": {
    dir: "blog", key: "sage",
    lead: "Shortcut to", title: ["Pull Repos"],
    items: [
      { id: "keys", k: "tile", size: "l", at: [0, 0.875], icon: "command", label: "Shortcut", key: true },
      { id: "repos", k: "fig", fig: "repos", at: [1, 0.25], span: [2, 2.5] }
    ],
    links: [["keys", "repos"]]
  },
  // A push, the action, the built website.
  "2025-04-12-github-action": {
    dir: "blog", key: "ochre", layout: "top",
    title: ["GitHub", "Action"],
    items: [
      { id: "push", k: "tile", at: [0.35, 0.71], span: [1.5, 1.69], icon: "brand-git", label: "git push" },
      { id: "action", k: "fig", fig: "gear", icon: "bolt", at: [2.25, 0.71], span: [1.5, 1.69], label: "Action", key: true },
      { id: "site", k: "win", at: [4.05, 0], span: [1.8, 2.4], body: "site", label: "Website" }
    ],
    links: [["push", "action"], ["action", "site"]]
  },
  // A respondent's round trip: out of Dynata's panel by the starting link,
  // through the survey, back by the ending link.
  "2025-07-07-dynata-tutorial": {
    dir: "blog", key: "rose",
    lead: "Embedding", title: ["Dynata", "Links"],
    items: [
      { id: "panel", k: "fig", fig: "people", at: [0, 0.6], span: [1, 1.8], label: "Dynata" },
      { id: "start", k: "tile", at: [1, 0.6], icon: "link", label: "Start", key: true },
      { id: "end", k: "tile", at: [1, 1.5], icon: "link", label: "End" },
      { id: "survey", k: "win", at: [2, 0.6], span: [1, 1.8], body: "form", label: "Survey" }
    ],
    links: [["panel", "start"], ["start", "survey"], ["survey", "end"], ["end", "panel"]]
  },
  // The package's mark, for a release.
  "2025-11-21-surveydown-version-1": {
    dir: "blog", key: "slate", layout: "right",
    title: ["surveydown"], tag: "v1.0.0",
    items: [
      { id: "rays", k: "fig", fig: "burst", at: [0.1, 0.1], span: [2.8, 2.8], depth: 0.3 },
      { id: "mark", k: "fig", fig: "hex", at: [0.55, 0.45], span: [1.9, 2.1], key: true }
    ]
  },
  // Messy survey data, tidied, then drawn.
  "2025-12-16-tidyviz": {
    dir: "blog", key: "sage", layout: "top",
    title: ["tidyviz"],
    items: [
      { id: "csv", k: "win", at: [0.15, 0], span: [1.8, 2.4], body: "table", messy: true, label: "survey.csv" },
      { id: "tidy", k: "win", at: [2.1, 0], span: [1.8, 2.4], body: "table", badge: true, label: "tv.tidy" },
      { id: "viz", k: "win", at: [4.05, 0], span: [1.8, 2.4], body: "bars", label: "tv.viz", key: true }
    ],
    links: [["csv", "tidy"], ["tidy", "viz"]]
  },
  // A staircase from code to release.
  "2025-12-23-urssi-winter-school": {
    dir: "blog", key: "slate", layout: "scene", words: "nw",
    lead: "From Bootcamp to", title: ["Better Code"], tag: "URSSI Winter School 2025",
    items: [
      { id: "stairs", k: "fig", fig: "stairs", tile: 176, at: [0.9, 0.5], span: [5.1, 2.5], z: 0 },
      { id: "code", k: "tile", size: "l", at: [1.094, 1.702], icon: "folder", label: "Code", depth: 0.6 },
      { id: "git", k: "tile", size: "l", at: [2.33, 1.321], icon: "git-branch", label: "Git", depth: 0.6 },
      { id: "test", k: "tile", size: "l", at: [3.565, 0.939], icon: "circle-check", label: "Test", depth: 0.6 },
      { id: "ship", k: "tile", size: "l", at: [4.801, 0.558], icon: "rocket", label: "Ship", key: true }
    ]
  },
  // A prompt, the agent, the project it works in.
  "2026-03-26-agentic-engineering-1": {
    dir: "blog", key: "accent", layout: "top",
    title: ["Agentic", "Engineering"], tag: "Part 1",
    items: [
      { id: "ask", k: "tile", at: [0.35, 0.71], span: [1.5, 1.69], icon: "message-circle", label: "Prompt" },
      { id: "agent", k: "win", at: [2.1, 0], span: [1.8, 2.4], body: "term", spark: true, label: "Agent", key: true },
      { id: "project", k: "tile", at: [4.15, 0.71], span: [1.5, 1.69], icon: "folder", label: "Project" }
    ],
    links: [["ask", "agent"], ["agent", "project"]]
  },
  // A workflow put together from its pieces: context, connectors, skills,
  // agents.
  "2026-04-06-agentic-engineering-2": {
    dir: "blog", key: "ochre",
    title: ["Agentic", "Engineering"], tag: "Part 2",
    items: [
      { id: "context", k: "fig", fig: "piece", at: [0.5, 0.6], tabs: [0, 1, -1, 0], icon: "file-text" },
      { id: "mcp", k: "fig", fig: "piece", at: [0.5, 1.6], tabs: [1, 1, 0, 0], icon: "plug" },
      { id: "agents", k: "fig", fig: "piece", at: [1.5, 1.6], tabs: [-1, 0, 0, -1], icon: "robot" },
      { id: "skills", k: "fig", fig: "piece", at: [1.75, 0.3], tabs: [0, 0, 1, -1], icon: "wand", key: true }
    ]
  },
  // The agent, and the software and extensions around it.
  "2026-04-09-agentic-engineering-3": {
    dir: "blog", key: "sage",
    title: ["Agentic", "Engineering"], tag: "Part 3",
    items: [
      { id: "ring", k: "fig", fig: "orbit", at: [0, 0], span: [3, 3], depth: 0.4, icons: ["notebook", "microphone", "app-window", "puzzle", "plug", "wand"] },
      { id: "agent", k: "tile", size: "l", at: [1, 0.875], icon: "terminal-2", key: true }
    ]
  },
  // The post's three parts, as a path.
  "2026-05-15-agentic-workflows": {
    dir: "blog", key: "slate", layout: "right",
    title: ["Agentic", "Workflows"],
    items: [
      { id: "skills", k: "win", at: [0, 0], span: [1.6, 0.92], body: "mark", icon: "wand", name: "Skills" },
      { id: "hooks", k: "win", at: [1.4, 1.04], span: [1.6, 0.92], body: "mark", icon: "webhook", name: "Hooks", key: true },
      { id: "apps", k: "win", at: [0, 2.08], span: [1.6, 0.92], body: "mark", icon: "apps", name: "Software" }
    ],
    links: [["skills", "hooks", "plain"], ["hooks", "apps", "plain"]]
  },
  // A command calls a skill, which does the work.
  "2026-06-24-agentic-skills": {
    dir: "blog", key: "mauve", layout: "top",
    title: ["Agentic", "Skills"],
    items: [
      { id: "call", k: "tile", at: [0.35, 0.71], span: [1.5, 1.69], icon: "slash", label: "Command" },
      { id: "skill", k: "win", at: [2.1, 0], span: [1.8, 2.4], body: "mark", icon: "wand", label: "SKILL.md", key: true },
      { id: "work", k: "tile", at: [4.15, 0.71], span: [1.5, 1.69], icon: "photo", label: "Result" }
    ],
    links: [["call", "skill"], ["skill", "work"]]
  },

  // Three transport networks over the same places, one layer each.
  "2023-network-science": {
    dir: "research", key: "accent",
    lead: "Multi-layer", title: ["Network", "Science"],
    items: [
      { id: "air", k: "layer", at: [0, 0.05], label: "Air", key: true, depth: 1,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.36, 0.82], [0.66, 0.86]], edges: [[1, 0], [1, 2], [1, 3], [1, 4], [0, 3], [2, 4]] },
      { id: "rail", k: "layer", at: [0, 0.95], label: "Rail", depth: 0.6,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.35, 0.2], [0.62, 0.78], [0.3, 0.82]], edges: [[0, 3], [3, 1], [1, 2], [1, 4], [4, 2], [0, 5], [5, 4]] },
      { id: "road", k: "layer", at: [0, 1.85], label: "Road", depth: 0.25,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.32, 0.2], [0.68, 0.2], [0.36, 0.8], [0.64, 0.86], [0.5, 0.56]], edges: [[0, 3], [3, 1], [1, 4], [4, 2], [0, 5], [5, 6], [6, 2], [3, 7], [7, 5], [4, 7], [7, 6], [1, 7]] }
    ],
    links: [["air", "rail", "drop", [0.2, 0.5]], ["air", "rail", "drop", [0.5, 0.25]], ["air", "rail", "drop", [0.8, 0.6]],
      ["rail", "road", "drop", [0.2, 0.5]], ["rail", "road", "drop", [0.5, 0.25]], ["rail", "road", "drop", [0.8, 0.6]]]
  },
  // A wind turbine and a solar panel, and their rise.
  "2023-solar-wind": {
    dir: "research", key: "ochre", layout: "scene", words: "nw",
    lead: "Advances in", title: ["Solar &", "Wind"],
    items: [
      { id: "rise", k: "fig", fig: "trend", sun: true, at: [2.3, 0.1], span: [3.7, 2.3], key: true, depth: 0.25, z: 0 },
      { id: "far", k: "fig", fig: "turbine", at: [1.95, 1.3], span: [1.05, 1.5], depth: 0.45 },
      { id: "wind", k: "fig", fig: "turbine", at: [2.9, 0.05], span: [1.9, 2.75] },
      { id: "sun", k: "fig", fig: "solar", at: [4.4, 1.35], span: [1.6, 1.45] },
      { id: "land", k: "fig", fig: "ground", at: [0, 2.6], span: [6, 0.2] }
    ]
  },
  // An electric car at its charger, and what its owner weighs.
  "2024-sc-adoption": {
    dir: "research", key: "sage", layout: "scene", words: "nw",
    lead: "Smart Charging", title: ["Adoption"],
    items: [
      { id: "land", k: "fig", fig: "ground", at: [0, 2.6], span: [6, 0.2] },
      { id: "car", k: "fig", fig: "car", at: [2, 1.35], span: [3.3, 1.45] },
      { id: "post", k: "fig", fig: "charger", at: [5.2, 1.1], span: [0.8, 1.7], key: true, depth: 0.6 },
      { id: "flex", k: "chip", at: [4.6, 0.1], icon: "gauge", name: "Flexibility" },
      { id: "pay", k: "chip", at: [3.43, 0.5], icon: "credit-card", name: "Payment" }
    ],
    links: [["car", "post", "cable"], ["flex", "post", "dots"], ["pay", "car", "dots"]]
  },
  // The survey's file, the survey, the database.
  "2024-surveydown": {
    dir: "research", key: "slate", layout: "top",
    mark: { fig: "hex" }, title: ["surveydown"],
    items: [
      { id: "qmd", k: "win", at: [0.15, 0], span: [1.8, 2.4], body: "code", label: "survey.qmd" },
      { id: "survey", k: "win", at: [2.2, 0], span: [1.8, 2.4], body: "form", options: [null, null, null, null], label: "Survey", key: true },
      { id: "db", k: "fig", fig: "db", at: [4.3, 0], span: [1.47, 2.4], label: "PostgreSQL" }
    ],
    links: [["qmd", "survey"], ["survey", "db"]]
  },
  // The studio's three tabs, one over the next.
  "2025-sdstudio": {
    dir: "research", key: "accent", layout: "top",
    mark: { fig: "hex", inner: "studio" }, title: ["sdstudio"],
    items: [
      { id: "build", k: "win", at: [0.4, 0], span: [2.3, 1.9], body: "edit", name: "Build", z: 1 },
      { id: "preview", k: "win", at: [1.85, 0.25], span: [2.3, 1.9], body: "form", options: [null, null, null, null], name: "Preview", key: true, z: 2 },
      { id: "responses", k: "win", at: [3.3, 0.5], span: [2.3, 1.9], body: "table", name: "Responses", z: 3 }
    ]
  },
  // The evening peak shaved and the charging moved into the night; under
  // it, a car charging by moonlight.
  "2025-smc-economy": {
    dir: "research", key: "mauve",
    lead: "SMC", title: ["Peak", "Shaving"],
    items: [
      { id: "load", k: "win", at: [0, 0], span: [3, 1.75], body: "load", bare: true, labels: ["Unmanaged", "SMC"], x: ["7 AM", "7 PM", "7 AM"], key: true },
      { id: "moon", k: "fig", fig: "moon", at: [0, 1.8], span: [0.6, 0.65], depth: 0.3 },
      { id: "land", k: "fig", fig: "ground", at: [0, 2.72], span: [3, 0.2] },
      { id: "car", k: "fig", fig: "car", at: [0.5, 1.87], span: [1.85, 1.05] },
      { id: "post", k: "fig", fig: "charger", at: [2.33, 1.72], span: [0.67, 1.2] }
    ],
    links: [["car", "post", "cable"]]
  }
};
