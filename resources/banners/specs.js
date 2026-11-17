// The banners' specs, one to a post or research entry, keyed by its folder
// (the PNG is {dir}/banners/{id}.png). Each is written from the post's own
// sections, not from a picture: the words say what it is, and the parts on
// the stage are the few things it covers, joined as they are in the post.
// The key is the banner's color, kept from the earlier banners.
//
// A part: { id, k: "tile" | "win" | "layer", at: [col, row] on the 3 x 3
// stage (half steps allowed), span: [cols, rows] for a window, icon (a
// Tabler name) for a tile, body for a window (lines, page, term, check,
// table, form, nav, code, edit, bars, chart-s, chart-up, peak, choice,
// list), key: true on the one part in color }. A link: [from, to], or
// [from, to, "drop", [u, v]] between two layers at a node they share.
// resources/banners/banner.js draws them; make-banners.sh shoots the PNGs.

window.BANNER_SPECS = {
  // Steps: prepare the tools, make the website project, buy a domain, deploy.
  "2023-12-09-personal-website": {
    dir: "blog", key: "accent",
    lead: "How to Make a", title: ["Personal", "Website"], what: "Quarto · Domain · Deploy",
    items: [
      { id: "site", k: "win", at: [0, 0], span: [3, 2], body: "page" },
      { id: "prep", k: "tile", at: [0, 2], icon: "tools" },
      { id: "domain", k: "tile", at: [1, 2], icon: "world-www" },
      { id: "deploy", k: "tile", at: [2, 2], icon: "rocket", key: true }
    ],
    links: [["prep", "domain"], ["domain", "deploy"]]
  },
  // From a terminal: create the server, install Docker, run formr.
  "2023-12-30-formr-instance": {
    dir: "blog", key: "mauve",
    lead: "Deploying", title: ["formr"], what: "Ubuntu · Docker · Akamai",
    items: [
      { id: "shell", k: "win", at: [0, 0], span: [2, 3], body: "term" },
      { id: "server", k: "tile", at: [2, 0], icon: "server" },
      { id: "docker", k: "tile", at: [2, 1], icon: "brand-docker" },
      { id: "formr", k: "tile", at: [2, 2], icon: "forms", key: true }
    ],
    links: [["shell", "server"], ["server", "docker"], ["docker", "formr"]]
  },
  // Research methods, research tools, publication and communication.
  "2024-01-30-how-to-do-research": {
    dir: "blog", key: "sage",
    lead: "How to Do", title: ["Research"], what: "Methods · Tools · Publishing",
    items: [
      { id: "methods", k: "tile", at: [0, 1], icon: "book" },
      { id: "tools", k: "tile", at: [1, 1], icon: "tool" },
      { id: "publish", k: "tile", at: [2, 1], icon: "presentation", key: true }
    ],
    links: [["methods", "tools"], ["tools", "publish"]]
  },
  // From Malthus's population problem to the logistic curve and the logit.
  "2024-05-20-history-of-logit": {
    dir: "blog", key: "ochre",
    lead: "The History of", title: ["Logit"], what: "Malthus · Logistic · Logit",
    items: [
      { id: "people", k: "tile", at: [0, 1], icon: "users" },
      { id: "curve", k: "win", at: [1, 0], span: [2, 3], body: "chart-s", key: true }
    ],
    links: [["people", "curve"]]
  },
  // A shell file, an Automator app, a keyboard shortcut: every repo pulled.
  "2025-03-07-pull-repos": {
    dir: "blog", key: "sage",
    lead: "Shortcut to", title: ["Pull Repos"], what: "Shell · Automator · Shortcut",
    items: [
      { id: "shell", k: "tile", at: [0, 0], icon: "terminal-2" },
      { id: "auto", k: "tile", at: [1, 0], icon: "settings-automation" },
      { id: "keys", k: "tile", at: [2, 0], icon: "keyboard", key: true },
      { id: "repos", k: "win", at: [0, 1], span: [3, 2], body: "list" }
    ],
    links: [["shell", "auto"], ["auto", "keys"], ["keys", "repos"]]
  },
  // A commit sets off the workflow, which reads its secrets and its file
  // and builds the site.
  "2025-04-12-github-action": {
    dir: "blog", key: "ochre",
    title: ["GitHub", "Action"], what: "Workflow · Secrets · Netlify",
    items: [
      { id: "commit", k: "tile", at: [0, 1], icon: "git-commit" },
      { id: "secrets", k: "tile", at: [1, 0], icon: "lock" },
      { id: "action", k: "tile", at: [1, 1], icon: "bolt", key: true },
      { id: "yaml", k: "tile", at: [1, 2], icon: "file-code" },
      { id: "site", k: "tile", at: [2, 1], icon: "world-www" }
    ],
    links: [["commit", "action"], ["secrets", "action"], ["yaml", "action"], ["action", "site"]]
  },
  // The panel's starting link into the survey, the ending link back, each
  // signed.
  "2025-07-07-dynata-tutorial": {
    dir: "blog", key: "rose",
    lead: "Embedding", title: ["Dynata", "Links"], what: "Start · End · Signatures",
    items: [
      { id: "panel", k: "tile", at: [0, 1], icon: "users" },
      { id: "start", k: "tile", at: [1, 0], icon: "link", key: true },
      { id: "survey", k: "win", at: [2, 0.5], span: [1, 2], body: "form" },
      { id: "sign", k: "tile", at: [1, 2], icon: "key" }
    ],
    links: [["panel", "start"], ["start", "survey"], ["survey", "sign"], ["sign", "panel"]]
  },
  // A survey page with its new previous button, and what v1 brings: YAML
  // settings, page navigation, better questions.
  "2025-11-21-surveydown-version-1": {
    dir: "blog", key: "slate",
    title: ["surveydown"], tag: "v1.0.0", what: "Stable Release",
    items: [
      { id: "page", k: "win", at: [0, 0.5], span: [2, 2], body: "nav", key: true },
      { id: "yaml", k: "tile", at: [2, 0], icon: "file-settings" },
      { id: "prev", k: "tile", at: [2, 1], icon: "player-track-prev" },
      { id: "q", k: "tile", at: [2, 2], icon: "forms" }
    ],
    links: [["page", "yaml"], ["page", "prev"], ["page", "q"]]
  },
  // Survey data cleaned, validated, then visualized.
  "2025-12-16-tidyviz": {
    dir: "blog", key: "sage",
    title: ["tidyviz"], what: "Clean · Validate · Visualize",
    items: [
      { id: "clean", k: "win", at: [0, 0.5], span: [1, 2], body: "table" },
      { id: "check", k: "win", at: [1, 0.5], span: [1, 2], body: "check" },
      { id: "plot", k: "win", at: [2, 0.5], span: [1, 2], body: "bars", key: true }
    ],
    links: [["clean", "check"], ["check", "plot"]]
  },
  // The fundamentals around the code: the IDE, packages, the terminal,
  // version control.
  "2025-12-23-urssi-winter-school": {
    dir: "blog", key: "slate",
    lead: "From Bootcamp to", title: ["Better", "Code"], what: "URSSI Winter School 2025",
    items: [
      { id: "code", k: "tile", at: [1, 1], icon: "code", key: true },
      { id: "ide", k: "tile", at: [1, 0], icon: "app-window" },
      { id: "pkg", k: "tile", at: [0, 1], icon: "package" },
      { id: "git", k: "tile", at: [2, 1], icon: "git-branch" },
      { id: "term", k: "tile", at: [1, 2], icon: "terminal-2" }
    ],
    links: [["ide", "code"], ["pkg", "code"], ["code", "git"], ["code", "term"]]
  },
  // A person asks, the agent works in the terminal, the tools do the work.
  "2026-03-26-agentic-engineering-1": {
    dir: "blog", key: "accent",
    title: ["Agentic", "Engineering"], tag: "Part 1", what: "Basics",
    items: [
      { id: "you", k: "tile", at: [0, 1], icon: "user" },
      { id: "agent", k: "win", at: [1, 0.5], span: [1, 2], body: "term", spark: true, key: true },
      { id: "tools", k: "tile", at: [2, 1], icon: "tool" }
    ],
    links: [["you", "agent"], ["agent", "tools"]]
  },
  // Speaking to the agent and orchestrating the work, into a task list.
  "2026-04-06-agentic-engineering-2": {
    dir: "blog", key: "ochre",
    title: ["Agentic", "Engineering"], tag: "Part 2", what: "Workflows",
    items: [
      { id: "speak", k: "tile", at: [0, 0], icon: "messages" },
      { id: "plan", k: "tile", at: [0, 2], icon: "sitemap" },
      { id: "tasks", k: "win", at: [1, 0.5], span: [2, 2], body: "check", key: true }
    ],
    links: [["speak", "tasks"], ["plan", "tasks"]]
  },
  // The agent at the middle, the software and extensions around it.
  "2026-04-09-agentic-engineering-3": {
    dir: "blog", key: "sage",
    title: ["Agentic", "Engineering"], tag: "Part 3", what: "Tools & Extensions",
    items: [
      { id: "agent", k: "tile", at: [1, 1], icon: "terminal-2", key: true },
      { id: "apps", k: "tile", at: [0, 0], icon: "apps" },
      { id: "ext", k: "tile", at: [2, 0], icon: "puzzle" },
      { id: "plug", k: "tile", at: [0, 2], icon: "plug" },
      { id: "road", k: "tile", at: [2, 2], icon: "route" }
    ],
    links: [["apps", "agent"], ["ext", "agent"], ["plug", "agent"], ["road", "agent"]]
  },
  // The agent's loop, with skills, hooks and the daily software around it.
  "2026-05-15-agentic-workflows": {
    dir: "blog", key: "slate",
    title: ["Agentic", "Workflows"], what: "Skills · Hooks · Software",
    items: [
      { id: "agent", k: "win", at: [0, 0.5], span: [2, 2], body: "term", spark: true, key: true },
      { id: "skills", k: "tile", at: [2, 0], icon: "wand" },
      { id: "hooks", k: "tile", at: [2, 1], icon: "webhook" },
      { id: "apps", k: "tile", at: [2, 2], icon: "apps" }
    ],
    links: [["agent", "skills"], ["agent", "hooks"], ["agent", "apps"]]
  },
  // A skill's file, and the three things done with skills: install, author,
  // use.
  "2026-06-24-agentic-skills": {
    dir: "blog", key: "mauve",
    title: ["Agentic", "Skills"], what: "Install · Author · Use",
    items: [
      { id: "install", k: "tile", at: [0, 0], icon: "download" },
      { id: "author", k: "tile", at: [0, 1], icon: "pencil" },
      { id: "use", k: "tile", at: [0, 2], icon: "wand" },
      { id: "skill", k: "win", at: [1, 0.5], span: [2, 2], body: "code", key: true }
    ],
    links: [["install", "skill"], ["author", "skill"], ["use", "skill"]]
  },

  // Three transport networks over the same places, one layer each.
  "2023-network-science": {
    dir: "research", key: "accent",
    lead: "Multi-layer", title: ["Network", "Science"], what: "Air · Rail · Road",
    items: [
      { id: "air", k: "layer", at: [0, 0], label: "Air", key: true, depth: 1,
        nodes: [[0.15, 0.5], [0.5, 0.3], [0.85, 0.6]], edges: [[0, 1], [1, 2], [0, 2]] },
      { id: "rail", k: "layer", at: [0, 1], label: "Rail", depth: 0.62,
        nodes: [[0.15, 0.5], [0.5, 0.3], [0.85, 0.6], [0.33, 0.78], [0.68, 0.18]], edges: [[0, 3], [3, 1], [1, 4], [4, 2]] },
      { id: "road", k: "layer", at: [0, 2], label: "Road", depth: 0.3,
        nodes: [[0.15, 0.5], [0.5, 0.3], [0.85, 0.6], [0.3, 0.2], [0.42, 0.75], [0.7, 0.8]], edges: [[0, 3], [3, 1], [0, 4], [4, 1], [1, 5], [5, 2], [4, 5]] }
    ],
    links: [["air", "rail", "drop", [0.15, 0.5]], ["air", "rail", "drop", [0.5, 0.3]], ["air", "rail", "drop", [0.85, 0.6]],
      ["rail", "road", "drop", [0.15, 0.5]], ["rail", "road", "drop", [0.5, 0.3]], ["rail", "road", "drop", [0.85, 0.6]]]
  },
  // Solar and wind, and their growth, studied through cost, policy and
  // research budgets.
  "2023-solar-wind": {
    dir: "research", key: "ochre",
    title: ["Solar &", "Wind"], what: "Cost · Policy · Budgets",
    items: [
      { id: "sun", k: "tile", at: [0, 0], icon: "sun" },
      { id: "wind", k: "tile", at: [0, 2], icon: "wind" },
      { id: "growth", k: "win", at: [1, 0.5], span: [2, 2], body: "chart-up", key: true }
    ],
    links: [["sun", "growth"], ["wind", "growth"]]
  },
  // A choice experiment: BEV owners choose between charging programs.
  "2024-sc-adoption": {
    dir: "research", key: "sage",
    lead: "Smart Charging", title: ["Adoption"], what: "Choice Experiment · N = 1,356",
    items: [
      { id: "choice", k: "win", at: [0, 0.5], span: [2, 2], body: "choice", key: true },
      { id: "car", k: "tile", at: [2, 0], icon: "car" },
      { id: "charger", k: "tile", at: [2, 1], icon: "charging-pile" },
      { id: "pay", k: "tile", at: [2, 2], icon: "coin" }
    ],
    links: [["choice", "car"], ["choice", "charger"], ["choice", "pay"]]
  },
  // A Quarto file becomes a Shiny survey that writes to PostgreSQL.
  "2024-surveydown": {
    dir: "research", key: "slate",
    title: ["surveydown"], what: "Quarto · Shiny · PostgreSQL",
    items: [
      { id: "qmd", k: "tile", at: [0, 1], icon: "file-code" },
      { id: "app", k: "win", at: [1, 0.5], span: [1, 2], body: "form", key: true },
      { id: "db", k: "tile", at: [2, 1], icon: "database" }
    ],
    links: [["qmd", "app"], ["app", "db"]]
  },
  // The studio's three tabs: Build, Preview, Responses.
  "2025-sdstudio": {
    dir: "research", key: "accent",
    title: ["sdstudio"], what: "Build · Preview · Responses",
    items: [
      { id: "build", k: "win", at: [0, 0.5], span: [1, 2], body: "edit" },
      { id: "preview", k: "win", at: [1, 0.5], span: [1, 2], body: "form", key: true },
      { id: "responses", k: "win", at: [2, 0.5], span: [1, 2], body: "table" }
    ],
    links: [["build", "preview"], ["preview", "responses"]]
  },
  // The evening peak shaved by managed charging, and what moves it: the
  // cars, the night hours, the cost.
  "2025-smc-economy": {
    dir: "research", key: "mauve",
    lead: "SMC", title: ["Peak", "Shaving"], what: "CAISO · NYISO · Cost",
    items: [
      { id: "load", k: "win", at: [0, 0.5], span: [2, 2], body: "peak", key: true },
      { id: "car", k: "tile", at: [2, 0], icon: "car" },
      { id: "night", k: "tile", at: [2, 1], icon: "moon" },
      { id: "cost", k: "tile", at: [2, 2], icon: "coin" }
    ],
    links: [["load", "car"], ["load", "night"], ["load", "cost"]]
  }
};
