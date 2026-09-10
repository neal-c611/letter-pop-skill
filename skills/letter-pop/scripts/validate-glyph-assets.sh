#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 GLYPH_DIRECTORY [REPORT_DIRECTORY]" >&2
  exit 2
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "ERROR: ImageMagick 'magick' is required." >&2
  exit 2
fi

glyph_dir=$1
report_dir=${2:-"$glyph_dir/validation"}
mkdir -p "$report_dir"

shopt -s nullglob
files=("$glyph_dir"/*.png "$glyph_dir"/*.PNG)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "ERROR: no PNG files found in $glyph_dir" >&2
  exit 1
fi

status=0
warnings=0
printf 'file\tformat\tchannels\twidth\theight\talpha_min\talpha_max\talpha_mean\tresult\n'

for file in "${files[@]}"; do
  format=$(magick identify -quiet -format '%m' "$file" 2>/dev/null || true)
  channels=$(magick identify -quiet -format '%[channels]' "$file" 2>/dev/null || true)
  width=$(magick identify -quiet -format '%w' "$file" 2>/dev/null || true)
  height=$(magick identify -quiet -format '%h' "$file" 2>/dev/null || true)

  if [[ "$format" != "PNG" || "$channels" != *a* ]]; then
    printf '%s\t%s\t%s\t%s\t%s\t-\t-\t-\tFAIL signature-or-alpha\n' \
      "$(basename "$file")" "$format" "$channels" "$width" "$height"
    status=1
    continue
  fi

  alpha_stats=$(magick "$file" -alpha extract -format '%[fx:minima]|%[fx:maxima]|%[fx:mean]' info:)
  IFS='|' read -r alpha_min alpha_max alpha_mean <<< "$alpha_stats"
  result=PASS
  if ! awk -v lo="$alpha_min" -v hi="$alpha_max" -v mean="$alpha_mean" \
      'BEGIN { exit !(lo <= 0.01 && hi >= 0.99 && mean > 0.005) }'; then
    result='FAIL alpha-coverage'
    status=1
  elif awk -v mean="$alpha_mean" 'BEGIN { exit !(mean >= 0.72) }'; then
    result='WARN inspect-high-coverage'
    warnings=1
  fi
  printf '%s\t%s\t%s\t%s\t%s\t%.4f\t%.4f\t%.4f\t%s\n' \
    "$(basename "$file")" "$format" "$channels" "$width" "$height" \
    "$alpha_min" "$alpha_max" "$alpha_mean" "$result"
done

tile="160x160"
magick "${files[@]}" -thumbnail "$tile" -background '#f2efe7' -gravity center -extent 180x180 -alpha remove -alpha off +append "$report_dir/on-light.png"
magick "${files[@]}" -thumbnail "$tile" -background '#181816' -gravity center -extent 180x180 -alpha remove -alpha off +append "$report_dir/on-dark.png"
echo "Composites: $report_dir/on-light.png and $report_dir/on-dark.png"

if [[ $status -ne 0 ]]; then
  echo "REJECTED: fix failed files before frontend integration." >&2
  exit 1
fi

if [[ $warnings -ne 0 ]]; then
  echo "ACCEPTED WITH WARNINGS: tightly cropped glyphs can have high alpha coverage. Inspect both composites before integration."
else
  echo "ACCEPTED: decoded PNG alpha checks passed. Inspect both composites for matte residue and wrong glyphs."
fi
