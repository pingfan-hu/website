#!/bin/zsh
# make-banner.sh [--dark] [--no-badge] <name> <out.png> [width]
# Draw a banner from its page, resources/scripts/banner/<name>.html (HTML and
# CSS in a 1376 x 768 body), and stamp the avatar badge in its bottom left
# corner, as the site's other banners have it. The page is shot by headless
# Chrome, which sees the fonts installed on this Mac; the badge needs R with
# magick, ragg and systemfonts, and the ph-image skill, whose script and
# portrait it is. A width other than 1376 scales the whole page.
#
# --dark opens the page with `?dark` at the end of its address, for a page
# that draws a dark version of itself when asked; --no-badge leaves the
# banner without the avatar.
#
#   resources/scripts/make-banner.sh --no-badge emaki blog/banners/2026-11-16-emaki.png
#   resources/scripts/make-banner.sh --no-badge --dark emaki blog/banners/2026-11-16-emaki-dark.png
set -euo pipefail
cd "$(dirname "$0")/../.."
QUERY=""
BADGE=1
while [[ "${1:-}" == --* ]]; do
  case "$1" in
    --dark) QUERY="?dark" ;;
    --no-badge) BADGE=0 ;;
    *) echo "make-banner.sh: no such option: $1" >&2; exit 2 ;;
  esac
  shift
done
NAME=$1
OUT=$2
WIDTH=${3:-1376}
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCALE=$(( WIDTH / 1376.0 ))
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=$SCALE --window-size=1376,768 --screenshot="$PWD/$OUT" "file://$PWD/resources/scripts/banner/$NAME.html$QUERY" 2>/dev/null
if (( BADGE )); then
  Rscript ~/.claude/skills/ph-image/composite_avatar.R --card "$OUT"
fi
ls -la "$OUT"
