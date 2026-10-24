# The skills table, for the About page (HTML) and the resume and CV (Typst).
# One source: resources/chunks/skills.qmd lists the groups as Markdown, each
# name as it is shown; this script gives each skill a mark, and draws them from
# the glyph map in resources/styles/styles.scss, so all three documents show
# the same table with the same icons. A semicolon in a group's list starts a
# new row there ("Claude Code, Codex; Skills, MCP, Hooks"), in every layout.

# Each skill's mark: its logo where one exists, a framework its language's
# logo (Shiny is R's, GPUI is Rust's, SwiftUI is Swift's), otherwise a
# Tabler picture of what it is. A skill not listed here gets a dot.
skill_marks <- c(
  "Claude Code" = "anthropic", "Codex" = "openai", "Skills" = "wand", "MCP" = "plug",
  "Hooks" = "webhook",
  "PostgreSQL" = "database", "tidyverse" = "hexagons", "ggplot" = "chart-scatter",
  "Survey Design" = "clipboard-list", "Discrete Choice" = "arrows-split",
  "Logit Modeling" = "math-function",
  "R" = "r", "Python" = "python", "Rust" = "rust", "Swift" = "swift", "Git" = "git",
  "SQL" = "sql", "Shell" = "terminal", "JavaScript" = "javascript",
  "GPUI" = "rust", "SwiftUI" = "swift", "Cross-Platform" = "devices",
  "Quarto" = "quarto", "Shiny" = "r", "HTML" = "html5", "CSS" = "css3",
  "Web Design" = "browser", "Deployment" = "rocket"
)

# A mark that names what the label leaves out is read aloud.
skill_spoken <- c("Shiny" = "R", "GPUI" = "Rust", "SwiftUI" = "Swift")

skill_groups <- function() {
  lines <- readLines(here::here("resources/chunks/skills.qmd"))
  lines <- gsub("\\{\\{< var rnolink >\\}\\}", "R", lines)
  found <- regmatches(lines, regexec("^- \\*\\*(.+)\\*\\*: (.+)$", lines))
  found <- Filter(function(g) length(g) == 3, found)
  lapply(found, function(g) {
    rows <- strsplit(trimws(strsplit(g[3], ";")[[1]]), ",")
    skills <- unlist(lapply(seq_along(rows), function(k) {
      names <- trimws(rows[[k]])
      lapply(seq_along(names), function(j) list(
        name = names[j],
        mark = if (names[j] %in% names(skill_marks)) skill_marks[[names[j]]] else "point",
        spoken = if (names[j] %in% names(skill_spoken)) skill_spoken[[names[j]]] else NA,
        # the first skill after a semicolon opens a row
        row = k > 1 && j == 1
      ))
    }), recursive = FALSE)
    list(label = g[2], skills = skills)
  })
}

# The About page: a label over a hairline, then the group's cells.
skills_html <- function() {
  cell <- function(s) {
    alt <- if (is.na(s$spoken)) 'aria-hidden="true"' else sprintf('role="img" aria-label="%s"', s$spoken)
    sprintf('<span class="about-skill%s"><span class="about-skill-logo"><span class="glyph glyph-%s" %s></span></span><span class="about-skill-sep"></span>%s</span>',
            if (s$row) " about-skill-row" else "", s$mark, alt, s$name)
  }
  groups <- vapply(skill_groups(), function(g) sprintf(
    ' <div class="about-skill-group"><p class="about-skill-label">%s</p><div class="about-skill-grid">%s</div></div>',
    g$label, paste(vapply(g$skills, cell, ""), collapse = "")), "")
  paste0('<div class="about-skills">\n', paste(groups, collapse = "\n"), '\n</div>\n')
}

# One mark from the site's glyph map as an SVG string, in the given color.
# On paper every mark is gray (the page shows them in color; see the
# `$glyph-tints` in styles.scss), so the R logo is the map's gray drawing,
# its ring at 40%.
glyph_svg <- function(name, color) {
  scss <- paste(readLines(here::here("resources/styles/styles.scss")), collapse = "\n")
  svg <- regmatches(scss, regexec(sprintf('\n  "%s": "(<svg[^"]*</svg>)"', name), scss))[[1]][2]
  gsub("'black'", sprintf("'%s'", color), svg)
}

# The resume and CV: the same marks and names in Typst. "table" sets each
# group's label over a hairline, as on the page, then its skills `cols` to a
# row. "flow" deals the groups into `cols` columns in order, each group a
# label over a hairline with its skills running on beneath it and wrapping
# where they must, so a name is read under its group and no cell stands
# empty. "rows" sets the label at the left of its group's first row, one
# grid for every group. Each mark is gray, a hairline before the name.
# Wrapped in a raw Typst block for Quarto.
skills_typst <- function(layout = c("table", "flow", "rows"), cols = 3, color = "#77746B") {
  layout <- match.arg(layout)
  groups <- skill_groups()
  marks <- unique(unlist(lapply(groups, function(g) vapply(g$skills, function(s) s$mark, ""))))
  defs <- vapply(marks, function(m) sprintf('  "%s": bytes("%s"),', m, glyph_svg(m, color)), "")
  cells <- function(g) vapply(g$skills, function(s) sprintf('skill-cell("%s")[%s]', s$mark, s$name), "")
  # in a table, a row a group opens anew is reached by empty cells
  padded <- function(g) {
    out <- character(0)
    for (i in seq_along(g$skills)) {
      if (g$skills[[i]]$row) out <- c(out, rep("[]", (cols - length(out) %% cols) %% cols))
      out <- c(out, cells(g)[i])
    }
    out
  }
  # in running text, a line break; the weak space beside it falls away
  flowing <- function(g) vapply(seq_along(g$skills), function(i)
    paste0(if (g$skills[[i]]$row) "linebreak(), " else "", cells(g)[i]), "")
  label <- sprintf('  text(size: 0.85em, fill: rgb("%s"), label),', color)
  # a dotted rule, so a group's label never reads as a section head, whose
  # rule is solid
  rule <- '  line(length: 100%, stroke: (paint: rgb("#B5B2A8"), thickness: 0.7pt, dash: (0pt, 2.2pt), cap: "round")),'
  body <- if (layout == "flow") {
    per <- ceiling(length(groups) / cols)
    columns <- split(groups, ceiling(seq_along(groups) / per))
    # spaced by the resume's own gaps: groups `head-gap` apart, each label
    # `rule-gap` over its rule and `line-gap` over its skills, which wrap at
    # the document's leading
    stacks <- vapply(columns, function(col) sprintf("  stack(spacing: head-gap,\n%s\n  ),", paste(vapply(col, function(g)
      sprintf("    skill-flow([%s], %s),", g$label, paste(flowing(g), collapse = ", ")), ""), collapse = "\n")), "")
    c(
      "// the weak space between skills falls away at a line's end",
      "#let skill-flow(label, ..cells) = stack(",
      sub(",$", ", rule-gap,", label), sub(",$", ", line-gap,", rule),
      "  par(cells.pos().join(h(1.5em, weak: true))),",
      ")",
      sprintf("#grid(columns: (1fr,) * %d, column-gutter: 2.4em,", cols),
      stacks,
      ")"
    )
  } else if (layout == "table") {
    # a group's label is a small head over its rows, spaced by the CV's own
    # gaps (`head-gap` above, `rule-gap` to its rule, `line-gap` between
    # rows), so the table reads as the text around it
    c(
      "#let skill-group(label, ..cells) = block(breakable: false, above: head-gap, stack(",
      sub(",$", ", rule-gap,", label), sub(",$", ", line-gap,", rule),
      sprintf("  grid(columns: (1fr,) * %d, row-gutter: line-gap, column-gutter: 0.8em, ..cells.pos()),", cols),
      "))",
      vapply(groups, function(g) sprintf("#skill-group([%s], %s)", g$label, paste(padded(g), collapse = ", ")), "")
    )
  } else {
    rows <- vapply(groups, function(g) ceiling(length(padded(g)) / cols), 0)
    # a group's rows sit a line apart, the groups a paragraph apart (the
    # document's `line-gap` and `para-gap`)
    gutters <- unlist(lapply(rows, function(n) c(rep("line-gap", n - 1), "para-gap")))
    gutters <- head(gutters, -1)
    lines <- vapply(seq_along(groups), function(i) {
      g <- groups[[i]]
      filled <- c(padded(g), rep("[]", rows[i] * cols - length(padded(g))))
      sprintf('  grid.cell(rowspan: %d, text(fill: rgb("%s"))[%s]), %s,', rows[i], color, g$label, paste(filled, collapse = ", "))
    }, "")
    c(
      sprintf("#grid(columns: (auto,) + (1fr,) * %d, column-gutter: 0.9em, row-gutter: (%s),",
              cols, paste(gutters, collapse = ", ")),
      lines,
      ")"
    )
  }
  paste0(
    "```{=typst}\n",
    "#let skill-marks = (\n", paste(defs, collapse = "\n"), "\n)\n",
    "// the R logo stands a fifth taller than the others, as on the page; every\n",
    "// mark sits in a box of the same width, so the hairlines after them line\n",
    "// up down a column\n",
    "#let skill-cell(mark, name) = box({\n",
    "  let size = if mark == \"r\" { 1.08em } else { 0.9em }\n",
    "  // a box 0.58em tall holds the mark at its middle, so its center sits\n",
    "  // 0.29em above the baseline, between the lowercase and capital centers\n",
    "  // as on the page, and never makes a line taller than its words\n",
    "  box(width: 1.08em, height: 0.58em, place(horizon + center, image(skill-marks.at(mark), height: size)))\n",
    "  h(0.28em); box(baseline: 0.05em, line(angle: 90deg, length: 0.8em, stroke: 0.4pt + rgb(\"#D0CEC3\"))); h(0.28em)\n",
    "  name\n",
    "})\n",
    paste(body, collapse = "\n"), "\n",
    "```\n"
  )
}

