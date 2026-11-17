#!/bin/zsh
# make-banners.sh [id...]: shoot each banner from its spec in
# resources/banners/specs.js to {dir}/banners/{id}.png and {id}-dark.png,
# through resources/scripts/banner/shoot.html in headless Chrome (macOS,
# with the fonts installed on this Mac). With no ids, every spec.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE=$(mktemp -d)
trap 'rm -rf "$PROFILE"' EXIT
ids=("$@")
if (( ${#ids} == 0 )); then
  ids=(${(f)"$(grep -oE '^  "[^"]+": \{' resources/banners/specs.js | sed -E 's/^  "([^"]+)".*/\1/')"})
fi
for id in $ids; do
  dir=$(awk -v id="\"$id\":" '$1 == id { f = 1 } f && /dir:/ { match($0, /dir: "[a-z]+"/); print substr($0, RSTART + 6, RLENGTH - 7); exit }' resources/banners/specs.js)
  [[ -n $dir ]] || { print -u2 "make-banners: no spec: $id"; exit 1; }
  for mode in "" "&dark"; do
    out="$dir/banners/$id${mode:+-dark}.png"
    "$CHROME" --headless=new --user-data-dir="$PROFILE" --disable-gpu --hide-scrollbars --window-size=1376,768 \
      --screenshot="$PWD/$out" "file://$PWD/resources/scripts/banner/shoot.html?id=$id$mode" 2>/dev/null
    print "$out"
  done
done
