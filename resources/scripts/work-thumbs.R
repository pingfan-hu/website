# Thumbnails for the Works page: one per row of works/works.csv, saved as
# works/thumbs/{Name}.jpg and committed, so the site build needs none of the
# tools below. Run it after adding a row:
#
#   Rscript resources/scripts/work-thumbs.R          # only the missing ones
#   Rscript resources/scripts/work-thumbs.R --force  # all of them again
#
# Each thumbnail is what the card's main link opens: a deck's title slide or a
# workshop or storybook's front page (a Chrome screenshot), a poster's PDF, a
# paper's first page. Needs Google Chrome, pdftoppm (poppler) and sips (macOS).

library(readr)

force <- "--force" %in% commandArgs(TRUE)
works <- read_csv(here::here("works/works.csv"), show_col_types = FALSE)
out_dir <- here::here("works/thumbs")
dir.create(out_dir, showWarnings = FALSE)
chrome <- "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# A page at 1280 x 800, as a 640px-wide JPEG. `?pdf-export` asks a deck for
# its print look, without the corner controls.
screenshot <- function(url, out) {
  png <- tempfile(fileext = ".png")
  system2(chrome, c("--headless=new", "--hide-scrollbars", "--window-size=1280,800",
                    "--virtual-time-budget=20000", paste0("--screenshot=", png), shQuote(url)),
          stdout = FALSE, stderr = FALSE)
  system2("sips", c("-s", "format", "jpeg", "-s", "formatOptions", "82",
                    "--resampleWidth", "640", png, "--out", out), stdout = FALSE)
}

# A PDF's first page, `width` pixels wide. A publisher's download cover
# ("This content was downloaded from ...", as IOP adds) is passed over.
first_page <- function(pdf, out, width) {
  text <- system2("pdftotext", c("-f", "1", "-l", "1", shQuote(pdf), "-"), stdout = TRUE)
  page <- if (any(grepl("This content was downloaded from", text))) "2" else "1"
  system2("pdftoppm", c("-f", page, "-l", page, "-singlefile", "-jpeg", "-jpegopt", "quality=82",
                        "-scale-to-x", width, "-scale-to-y", "-1", shQuote(pdf),
                        shQuote(sub("\\.jpg$", "", out))))
}

# A paper's PDF: the Doc link labeled as the paper, local or downloaded.
paper_pdf <- function(row) {
  labels <- c(row$Doc1Label, row$Doc2Label)
  urls <- c(row$Doc1URL, row$Doc2URL)
  url <- urls[!is.na(labels) & grepl("paper|pdf", tolower(labels))][1]
  if (is.na(url)) return(NA)
  if (startsWith(url, "/")) return(here::here(sub("^/", "", url)))
  pdf <- tempfile(fileext = ".pdf")
  system2("curl", c("-sL", "-o", shQuote(pdf), shQuote(url)))
  # a publisher's bot check answers with a web page instead of the PDF
  if (!identical(readBin(pdf, "raw", 5), charToRaw("%PDF-"))) {
    message("could not download ", url, "; save the PDF and run first_page() on it")
    return(NA)
  }
  pdf
}

for (i in seq_len(nrow(works))) {
  row <- works[i, ]
  out <- file.path(out_dir, paste0(row$Name, ".jpg"))
  if (file.exists(out) && !force) next
  site <- paste0("https://pingfan-hu.github.io/", row$Name, "/")
  switch(row$Type,
    slide = screenshot(paste0(site, "?pdf-export"), out),
    workshop = , storybook = screenshot(site, out),
    poster = first_page(here::here("works", paste0(row$Name, ".pdf")), out, 960),
    paper = {
      pdf <- paper_pdf(row)
      if (!is.na(pdf)) first_page(pdf, out, 360)
    }
  )
  message(if (file.exists(out)) "made " else "FAILED ", basename(out))
}
