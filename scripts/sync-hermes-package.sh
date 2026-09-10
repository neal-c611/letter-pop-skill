#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
package_root="$repo_root/skills/letter-pop"

mkdir -p \
  "$package_root/assets/vanilla" \
  "$package_root/references" \
  "$package_root/scripts"

cp "$repo_root/SKILL.md" "$package_root/SKILL.md"
cp "$repo_root/assets/vanilla/letter-pop.js" "$package_root/assets/vanilla/letter-pop.js"
cp "$repo_root/assets/vanilla/letter-pop.css" "$package_root/assets/vanilla/letter-pop.css"
cp "$repo_root/assets/vanilla/example.js" "$package_root/assets/vanilla/example.js"
cp "$repo_root/references/artwork-generation.md" "$package_root/references/artwork-generation.md"
cp "$repo_root/references/implementation-pattern.md" "$package_root/references/implementation-pattern.md"
cp "$repo_root/scripts/remove-solid-matte.sh" "$package_root/scripts/remove-solid-matte.sh"
cp "$repo_root/scripts/validate-glyph-assets.sh" "$package_root/scripts/validate-glyph-assets.sh"

chmod +x \
  "$package_root/scripts/remove-solid-matte.sh" \
  "$package_root/scripts/validate-glyph-assets.sh"

echo "Synced Hermes package: $package_root"
