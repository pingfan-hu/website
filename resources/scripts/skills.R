# The skills table, for the About page (HTML) and the resume and CV (Typst).
# One source: resources/chunks/skills.qmd lists the groups as Markdown, each
# name as it is shown; this script gives each skill a mark, and draws them from
# the glyph map in resources/styles/styles.scss, so all three documents show
# the same table with the same icons.

# Each skill's mark: its logo where one exists, a framework its language's
# logo (Shiny is R's, GPUI is Rust's, SwiftUI is Swift's), otherwise a
# Tabler picture of what it is. A skill not listed here gets a dot.
skill_marks <- c(
  "Claude Code" = "anthropic", "Agent Skills" = "wand", "Harness Design" = "plug",
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
    names <- trimws(strsplit(g[3], ",")[[1]])
    list(label = g[2], skills = lapply(names, function(n) list(
      name = n,
      mark = if (n %in% names(skill_marks)) skill_marks[[n]] else "point",
      spoken = if (n %in% names(skill_spoken)) skill_spoken[[n]] else NA
    )))
  })
}

# The About page: a label over a hairline, then the group's cells.
skills_html <- function() {
  cell <- function(s) {
    alt <- if (is.na(s$spoken)) 'aria-hidden="true"' else sprintf('role="img" aria-label="%s"', s$spoken)
    sprintf('<span class="about-skill"><span class="about-skill-logo"><span class="glyph glyph-%s" %s></span></span><span class="about-skill-sep"></span>%s</span>',
            s$mark, alt, s$name)
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
  label <- sprintf('  text(size: 0.85em, fill: rgb("%s"), label),', color)
  rule <- '  line(length: 100%, stroke: 0.4pt + rgb("#D0CEC3")),'
  body <- if (layout == "flow") {
    per <- ceiling(length(groups) / cols)
    columns <- split(groups, ceiling(seq_along(groups) / per))
    stacks <- vapply(columns, function(col) sprintf("  stack(spacing: 0.75em,\n%s\n  ),", paste(vapply(col, function(g)
      sprintf("    skill-flow([%s], %s),", g$label, paste(cells(g), collapse = ", ")), ""), collapse = "\n")), "")
    c(
      "// the weak space between skills falls away at a line's end",
      "#let skill-flow(label, ..cells) = stack(spacing: 0.4em,",
      label, rule,
      "  par(leading: 0.35em, cells.pos().join(h(1.5em, weak: true))),",
      ")",
      sprintf("#grid(columns: (1fr,) * %d, column-gutter: 2.4em,", cols),
      stacks,
      ")",
      "#v(gap)"
    )
  } else if (layout == "table") {
    c(
      "#let skill-group(label, ..cells) = block(breakable: false, below: 0.8em, stack(spacing: 0.45em,",
      label, rule,
      sprintf("  grid(columns: (1fr,) * %d, row-gutter: 0.5em, column-gutter: 0.8em, ..cells.pos()),", cols),
      "))",
      vapply(groups, function(g) sprintf("#skill-group([%s], %s)", g$label, paste(cells(g), collapse = ", ")), ""),
      # the last group's own `below` is lost at the end of the block Quarto
      # wraps the chunk in, so the table carries it
      "#v(0.8em)"
    )
  } else {
    rows <- vapply(groups, function(g) ceiling(length(g$skills) / cols), 0)
    # a group's rows sit close; a wider gap falls between groups
    gutters <- unlist(lapply(rows, function(n) c(rep("0.3em", n - 1), "0.6em")))
    gutters <- head(gutters, -1)
    lines <- vapply(seq_along(groups), function(i) {
      g <- groups[[i]]
      filled <- c(cells(g), rep("[]", rows[i] * cols - length(g$skills)))
      sprintf('  grid.cell(rowspan: %d, text(fill: rgb("%s"))[%s]), %s,', rows[i], color, g$label, paste(filled, collapse = ", "))
    }, "")
    c(
      sprintf("#grid(columns: (auto,) + (1fr,) * %d, column-gutter: 0.9em, row-gutter: (%s),",
              cols, paste(gutters, collapse = ", ")),
      lines,
      ")",
      # the template's own gap after a block, as its lists get
      "#v(gap)"
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

