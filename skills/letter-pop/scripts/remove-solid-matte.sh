#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ] || [ "$#" -gt 4 ]; then
  echo "Usage: remove-solid-matte.sh INPUT OUTPUT.png [FUZZ_PERCENT] [MATTE_COLOR]" >&2
  exit 64
fi

input_path=$1
output_path=$2
fuzz_percent=${3:-10}
matte_color=${4:-}

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

if [ -n "$matte_color" ]; then
  magick "$input_path" \
    -alpha on \
    -fuzz "${fuzz_percent}%" \
    -transparent "$matte_color" \
    "PNG32:$output_path"
else
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
fi

if [ "$(magick identify -format '%[opaque]' "$output_path")" = "True" ]; then
  echo "No transparent pixels were created. Regenerate on a flat solid matte and retry." >&2
  exit 65
fi

mean_alpha=$(magick "$output_path" -alpha extract -format '%[fx:mean]' info:)
if ! awk -v alpha="$mean_alpha" 'BEGIN { exit !(alpha > 0.01 && alpha < 0.72) }'; then
  rm -f "$output_path"
  echo "The result is empty or still too opaque for an isolated glyph. Increase the fuzz value, pass the intended matte color, or regenerate without a card or frame." >&2
  exit 65
fi

magick identify -format 'created %f: %m %[channels] %wx%h\n' "$output_path"
