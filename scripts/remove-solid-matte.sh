#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "Usage: remove-solid-matte.sh INPUT OUTPUT.png [FUZZ_PERCENT]" >&2
  exit 64
fi

input_path=$1
output_path=$2
fuzz_percent=${3:-10}

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick 7 is required: missing 'magick' command." >&2
  exit 69
fi

case "$output_path" in
  *.png) ;;
  *)
    echo "Output must use a .png extension." >&2
    exit 64
    ;;
esac

if [ ! -f "$input_path" ]; then
  echo "Input file does not exist: $input_path" >&2
  exit 66
fi

corner_color=$(magick "$input_path" -format '%[pixel:p{0,0}]' info:)

magick "$input_path" \
  -bordercolor "$corner_color" \
  -border 1 \
  -alpha on \
  -fuzz "${fuzz_percent}%" \
  -fill none \
  -draw 'color 0,0 floodfill' \
  -shave 1x1 \
  "PNG32:$output_path"

if [ "$(magick identify -format '%[opaque]' "$output_path")" = "True" ]; then
  echo "No transparent pixels were created. Regenerate on a flat solid matte and retry." >&2
  exit 65
fi

mean_alpha=$(magick "$output_path" -alpha extract -format '%[fx:mean]' info:)
if ! awk -v alpha="$mean_alpha" 'BEGIN { exit !(alpha > 0.01 && alpha < 0.98) }'; then
  rm -f "$output_path"
  echo "The result is almost fully opaque or empty. Use a flat matte without checkerboard, gradient, card, or frame." >&2
  exit 65
fi

magick identify -format 'created %f: %m %[channels] %wx%h\n' "$output_path"
