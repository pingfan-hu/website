#!/bin/zsh
# make-banners.sh [id...]: shoot each banner from its spec in
# resources/banners/specs.js to {dir}/banners/{id}.png and {id}-dark.png,
# with the ph-image skill's hairline shooter (hairline/shoot.R: headless
# Chrome on this Mac, with its fonts). With no ids, every spec.
set -euo pipefail
cd "$(dirname "$0")/../.."
SHOOT=~/.claude/skills/ph-image/hairline/shoot.R
[[ -f $SHOOT ]] || { print -u2 "make-banners: no $SHOOT (the ph-image skill)"; exit 1; }
SPECS=resources/banners/specs.js
ids=("$@")
if (( ${#ids} == 0 )); then
  ids=(${(f)"$(grep -oE '^  "[^"]+": \{' $SPECS | sed -E 's/^  "([^"]+)".*/\1/')"})
fi
for id in $ids; do
  dir=$(awk -v id="\"$id\":" '$1 == id { f = 1 } f && /dir:/ { match($0, /dir: "[a-z]+"/); print substr($0, RSTART + 6, RLENGTH - 7); exit }' $SPECS)
  [[ -n $dir ]] || { print -u2 "make-banners: no spec: $id"; exit 1; }
  Rscript $SHOOT --specs $SPECS --out $dir/banners $id
done
