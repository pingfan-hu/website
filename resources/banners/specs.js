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
// The paradigm (November 2026; the ph-image skill's hairline.md has it in full): read the whole post, say in one sentence what it says, and draw that with each thing as itself (a prompt with its command typed, a folder with its files, a monitor), never an icon in a box. The only words are the few that are the point, and none is under 44 on the canvas (a `tag` chip is 52), so all can be read in the listing. Agentic Skills, Agentic Workflows and the three Agentic Engineering banners are the models.
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
  // The site is text in a Quarto project, pushed to a repo on GitHub,
  // which Netlify deploys as the site.
  "2023-12-09-personal-website": {
    dir: "blog", key: "accent", layout: "top",
    lead: "How to Make a", title: ["Personal", "Website"],
    items: [
      { id: "qmd", k: "win", file: true, at: [0, 0.3], span: [1.356, 2.05], body: "qmd", head: "# Hello", label: "index.qmd" },
      { id: "repo", k: "fig", fig: "folder", icon: "brand-github", at: [1.452, 0.3], span: [1.356, 2.05], label: "GitHub" },
      { id: "host", k: "fig", fig: "cloud", at: [2.904, 0.3], span: [1.26, 2.05], label: "Netlify" },
      { id: "site", k: "win", at: [4.26, 0.3], span: [1.74, 2.05], body: "site", label: "pingfan.org", key: true }
    ],
    links: [["qmd", "repo", "flow"], ["repo", "host", "flow"], ["host", "site", "flow"]]
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
  // One key runs `git pull` in every repo on the machine.
  "2025-03-07-pull-repos": {
    dir: "blog", key: "sage", layout: "top",
    lead: "Shortcut to", title: ["Pull", "Repos"],
    items: [
      { id: "key", k: "fig", fig: "keycap", at: [0, 0.75], span: [1.3, 1.3], key: true },
      { id: "run", k: "win", at: [1.572, 0.85], span: [1.95, 1.1], body: "prompt", cmd: "git pull" },
      { id: "repos", k: "fig", fig: "pulled", at: [3.798, 0.45], span: [2.2, 1.9] }
    ],
    links: [["key", "run", "flow"], ["run", "repos", "flow"]]
  },
  // A push; GitHub builds the site by the workflow file; Netlify hosts it.
  "2025-04-12-github-action": {
    dir: "blog", key: "ochre", layout: "top",
    title: ["GitHub", "Action"],
    items: [
      { id: "push", k: "win", at: [0, 0.5], span: [1.95, 1.1], body: "prompt", cmd: "git push" },
      { id: "build", k: "fig", fig: "gear", at: [2.226, 0.2], span: [1.5, 2.0], icon: "bolt", label: "build.yml", key: true },
      { id: "site", k: "win", at: [4.0, 0.2], span: [2.0, 2.0], body: "site", label: "Netlify" }
    ],
    links: [["push", "build", "flow"], ["build", "site", "flow"]]
  },
  // Dynata sends its respondents to the survey on a starting link, which
  // the survey checks; the survey sends them back on an ending link.
  "2025-07-07-dynata-tutorial": {
    dir: "blog", key: "rose", layout: "top",
    lead: "Embedding", title: ["Dynata", "Links"],
    items: [
      { id: "panel", k: "fig", fig: "people", at: [0.25, 0.35], span: [1.2, 2.05], label: "Dynata" },
      { id: "start", k: "fig", fig: "url", parts: ["psid", "_k", "_s"], ok: true, at: [1.69, 0.4], span: [2.46, 0.7], key: true, depth: 0.6 },
      { id: "end", k: "fig", fig: "url", parts: ["rst=1"], at: [1.69, 1.25], span: [2.46, 0.7] },
      { id: "survey", k: "win", at: [4.39, 0.35], span: [1.36, 1.74], body: "form", cards: true }
    ],
    links: [["panel", "start", "flow"], ["start", "survey", "flow"], ["survey", "end", "flow"], ["end", "panel", "flow"]]
  },
  // The stable release: the package's mark over its name and version,
  // and beside it what it is for: the designer only writes text, and it is
  // rendered as a survey with set type, a picture, a map, choices.
  "2025-11-21-surveydown-version-1": {
    dir: "blog", key: "slate", layout: "scene", words: "nw", inset: [0, 46], room: 490,
    mark: { fig: "hex", size: 300 }, title: ["surveydown"], lang: "r", tag: "v1.0.0",
    items: [
      { id: "qmd", k: "win", file: true, at: [2.558, 0.4615], span: [1.404, 2.385], body: "qmd", head: "# Hello", label: "survey.qmd" },
      { id: "survey", k: "win", at: [4.106, 0.173], span: [1.933, 2.654], body: "survey", title: "Hello", progress: 0.4, key: true }
    ],
    links: [["qmd", "survey", "flow"]]
  },
  // Messy survey data, tidied, then drawn.
  "2025-12-16-tidyviz": {
    dir: "blog", key: "sage", layout: "top",
    mark: { fig: "python" }, title: ["tidyviz"],
    items: [
      { id: "csv", k: "win", at: [0.15, 0], span: [1.8, 2.4], body: "table", messy: true, label: "survey.csv" },
      { id: "tidy", k: "win", at: [2.1, 0], span: [1.8, 2.4], body: "table", badge: true, label: "tv.tidy" },
      { id: "viz", k: "win", at: [4.05, 0], span: [1.8, 2.4], body: "bars", label: "tv.viz", key: true }
    ],
    links: [["csv", "tidy"], ["tidy", "viz"]]
  },
  // The fundamentals as a climb: code, its tests, its history, its release.
  "2025-12-23-urssi-winter-school": {
    dir: "blog", key: "slate", layout: "scene", words: "nw",
    lead: "From Bootcamp to", title: ["Better Code"], lang: "python", tag: "URSSI 2025",
    items: [
      { id: "stairs", k: "fig", fig: "stairs", tile: 176, at: [0.9, 0.5], span: [5.1, 2.5], z: 0 },
      { id: "code", k: "fig", fig: "sheet", at: [1.158, 1.76], span: [0.875, 1.183], label: "Code", depth: 0.6 },
      { id: "test", k: "fig", fig: "notebook", at: [2.394, 1.417], span: [0.875, 1.183], label: "Test", depth: 0.6 },
      { id: "git", k: "fig", fig: "branch", at: [3.631, 1.074], span: [0.875, 1.183], label: "Git", depth: 0.6 },
      { id: "ship", k: "fig", fig: "cloud", at: [4.72, 0.731], span: [1.17, 1.183], label: "Ship", key: true, depth: 0.6 }
    ]
  },
  // An agent, unlike an assistant, works in the project: it reads and
  // writes what is there, CLAUDE.md first.
  "2026-03-26-agentic-engineering-1": {
    dir: "blog", key: "accent", layout: "top",
    title: ["Agentic", "Engineering"], tag: "Part 1",
    items: [
      { id: "agent", k: "win", at: [0.115, 0.12], span: [2.9, 2.28], body: "session", cmd: "claude", key: true },
      { id: "project", k: "fig", fig: "folder", sheet: "CLAUDE.md", name: "project", at: [3.39, 0.12], span: [2.45, 2.28] }
    ],
    links: [["agent", "project", "both"]]
  },
  // The agent holds the rest: what it knows, what it can do, how it works.
  "2026-04-06-agentic-engineering-2": {
    dir: "blog", key: "ochre", layout: "top",
    title: ["Agentic", "Engineering"], tag: "Part 2",
    items: [
      { id: "agent", k: "win", at: [0, 0.1], span: [6, 2.3], body: "host", title: "Agent", key: true, depth: 0.4 },
      { id: "context", k: "fig", fig: "module", of: "sheet", name: "Context", at: [0.125, 0.827], span: [1.942, 1.413], depth: 0.85 },
      { id: "can", k: "fig", fig: "module", of: "plug", name: "Capabilities", at: [2.029, 0.827], span: [1.942, 1.413], depth: 0.85 },
      { id: "does", k: "fig", fig: "module", of: "wand", name: "Behaviors", at: [3.933, 0.827], span: [1.942, 1.413], depth: 0.85 }
    ]
  },
  // The tools on the wall, four to a row: the four apps, and the three
  // kinds of extension, with a place left for the next.
  "2026-04-09-agentic-engineering-3": {
    dir: "blog", key: "sage", layout: "top",
    title: ["Agentic", "Engineering"], tag: "Part 3",
    items: [
      { id: "wall", k: "fig", fig: "pegboard", rows: ["Software", "Extensions"], at: [0, 0.12], span: [6, 2.28], depth: 0.3 },
      { id: "notes", k: "fig", fig: "notebook", peg: true, at: [1.75, 0.358], span: [0.875, 0.875], depth: 0.3 },
      { id: "voice", k: "fig", fig: "mic", peg: true, at: [2.817, 0.358], span: [0.875, 0.875], depth: 0.3 },
      { id: "ide", k: "win", body: "code", peg: true, at: [3.885, 0.358], span: [0.875, 0.875], depth: 0.3 },
      { id: "term", k: "win", body: "term", spark: true, peg: true, at: [4.952, 0.358], span: [0.875, 0.875], key: true, depth: 0.3 },
      { id: "plugin", k: "fig", fig: "piece", peg: true, at: [1.858, 1.498], span: [0.66, 0.66], tabs: [0, 1, -1, 0], depth: 0.3 },
      { id: "mcp", k: "fig", fig: "plug", peg: true, drop: 0.22, at: [2.817, 1.42], span: [0.875, 0.875], depth: 0.3 },
      { id: "skill", k: "fig", fig: "wand", tilt: 0, peg: true, drop: 0.14, at: [3.885, 1.42], span: [0.875, 0.875], depth: 0.3 },
      { id: "next", k: "fig", fig: "slot", at: [4.952, 1.42], span: [0.875, 0.875], depth: 0.3 }
    ]
  },
  // A day at the desk: what is said goes to the agent, a skill does the
  // work, and a hook makes the page again by itself.
  "2026-05-15-agentic-workflows": {
    dir: "blog", key: "slate", layout: "scene", words: "nw", room: 545,
    title: ["Agentic", "Workflows"],
    items: [
      { id: "desk", k: "fig", fig: "ground", plain: true, at: [0, 2.8], span: [6, 0.2] },
      { id: "mic", k: "fig", fig: "mic", at: [0.25, 1.5], span: [1.1, 1.5] },
      { id: "voice", k: "fig", fig: "wave", at: [1.45, 1.561], span: [1.3, 0.83] },
      { id: "screen", k: "fig", fig: "monitor", at: [2.7, 1], span: [3.3, 2], key: true, depth: 0.6 },
      { id: "skills", k: "chip", at: [2.885, 0.3], icon: "wand", name: "Skills", min: 6 },
      { id: "hooks", k: "chip", at: [4.37, 0.3], icon: "webhook", name: "Hooks", min: 6 }
    ],
    links: [["skills", "screen", "dots", "left"], ["hooks", "screen", "dots", "right"]]
  },
  // A command calls a skill, a folder of instructions, scripts and
  // templates, and what comes out is of one make each time.
  "2026-06-24-agentic-skills": {
    dir: "blog", key: "mauve", layout: "top",
    title: ["Agentic", "Skills"],
    items: [
      { id: "call", k: "win", at: [0, 0.65], span: [2.05, 1.1], body: "prompt", cmd: "/ph-image", hot: true },
      { id: "skill", k: "fig", fig: "folder", sheet: "SKILL.md", name: "ph-image", icon: "wand", at: [2.159, 0], span: [2.3, 2.4], key: true },
      { id: "work", k: "fig", fig: "set", at: [4.567, 0.1], span: [1.433, 2.2] }
    ],
    links: [["call", "skill"], ["skill", "work"]]
  },

  // Four transport networks over the same places, one layer each.
  "2023-network-science": {
    dir: "research", key: "accent", room: 500,
    lead: "Multi-layer", title: ["Network", "Science"],
    items: [
      { id: "air", k: "layer", at: [0, 0], dx: -70, label: "Airline", key: true, depth: 1,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.36, 0.82], [0.66, 0.86]], edges: [[1, 0], [1, 2], [1, 3], [1, 4], [0, 3], [2, 4]] },
      { id: "sea", k: "layer", at: [0, 0.75], dx: -70, label: "Marine", depth: 0.75,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.44, 0.8], [0.7, 0.9]], edges: [[0, 3], [3, 4], [4, 2], [1, 2]] },
      { id: "rail", k: "layer", at: [0, 1.5], dx: -70, label: "Rail", depth: 0.5,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.35, 0.2], [0.62, 0.78], [0.3, 0.82]], edges: [[0, 3], [3, 1], [1, 2], [1, 4], [4, 2], [0, 5], [5, 4]] },
      { id: "road", k: "layer", at: [0, 2.25], dx: -70, label: "Road", depth: 0.25,
        nodes: [[0.2, 0.5], [0.5, 0.25], [0.8, 0.6], [0.32, 0.2], [0.68, 0.2], [0.36, 0.8], [0.64, 0.86], [0.5, 0.56]], edges: [[0, 3], [3, 1], [1, 4], [4, 2], [0, 5], [5, 6], [6, 2], [3, 7], [7, 5], [4, 7], [7, 6], [7, 1]] }
    ],
    links: [["air", "sea", "drop", [0.2, 0.5]], ["air", "sea", "drop", [0.5, 0.25]], ["air", "sea", "drop", [0.8, 0.6]],
      ["sea", "rail", "drop", [0.2, 0.5]], ["sea", "rail", "drop", [0.5, 0.25]], ["sea", "rail", "drop", [0.8, 0.6]],
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
  // A survey of owners: an electric car at its charger, and the question
  // its owner is asked, more money against more of the battery kept.
  "2024-sc-adoption": {
    dir: "research", key: "sage", layout: "scene", words: "nw",
    lead: "Smart Charging", title: ["Adoption"],
    items: [
      { id: "land", k: "fig", fig: "ground", at: [0, 2.6], span: [6, 0.2] },
      { id: "car", k: "fig", fig: "car", at: [2.3, 1.75], span: [2.7, 1.05] },
      { id: "post", k: "fig", fig: "charger", at: [5.2, 1.5], span: [0.8, 1.3] },
      { id: "ask", k: "win", at: [2.85, 0], span: [3.15, 1.3], body: "conjoint", a: "$5", b: "$20", key: true, depth: 0.8 }
    ],
    links: [["car", "post", "cable"], ["ask", "car", "dots"]]
  },
  // The whole platform: the text the designer writes, the survey it is
  // rendered as, and the database the answers go to.
  "2024-surveydown": {
    dir: "research", key: "slate", layout: "top",
    mark: { fig: "hex" }, title: ["surveydown"], lang: "r",
    items: [
      { id: "qmd", k: "win", file: true, at: [0, 0.2], span: [1.596, 2.05], body: "qmd", head: "# Hello", label: "survey.qmd" },
      { id: "survey", k: "win", at: [1.865, 0], span: [2.365, 2.4], body: "survey", title: "Hello", key: true },
      { id: "db", k: "fig", fig: "db", at: [4.5, 0.2], span: [1.5, 2.05], label: "PostgreSQL" }
    ],
    links: [["qmd", "survey", "flow"], ["survey", "db", "flow"]]
  },
  // The studio is one app with three tabs: build the survey from blocks,
  // preview it as rendered, read the responses.
  "2025-sdstudio": {
    dir: "research", key: "accent", layout: "top",
    mark: { fig: "hex", inner: "studio" }, title: ["sdstudio"], lang: "r",
    items: [
      { id: "app", k: "win", at: [0, 0.1], span: [6, 2.3], body: "host", key: true, depth: 0.4 },
      { id: "build", k: "fig", fig: "module", of: "blocks", name: "Build", at: [0.125, 0.55], span: [1.942, 1.7], depth: 0.85 },
      { id: "preview", k: "fig", fig: "module", of: "preview", name: "Preview", at: [2.029, 0.55], span: [1.942, 1.7], depth: 0.85 },
      { id: "responses", k: "fig", fig: "module", of: "grid", name: "Responses", at: [3.933, 0.55], span: [1.942, 1.7], depth: 0.85 }
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
