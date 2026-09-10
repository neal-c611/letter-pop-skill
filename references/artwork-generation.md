# Artwork generation

Read this only when the task needs new raster glyph artwork.

## Build an occurrence manifest

Segment the exact text into grapheme clusters and give every non-space occurrence its own stable ID. Repeated characters remain separate because they may receive different artwork.

```json
[
  { "id": "g00-H", "grapheme": "H", "kind": "letter" },
  { "id": "g01-e", "grapheme": "e", "kind": "letter" },
  { "id": "g05-comma", "grapheme": ",", "kind": "punctuation" },
  { "id": "g06-wo", "grapheme": "我", "kind": "cjk" }
]
```

The raster is decorative. Real text remains responsible for layout and accessibility. Do not copy artwork from a public reference page unless the user explicitly asks to reuse it.

## Probe before the full spend

An unverified generator gets one representative-glyph probe before a full atlas request. Validate the decoded file with `scripts/validate-glyph-assets.sh` and inspect both generated composites. A filename, preview checkerboard, or a few transparent edge pixels do not prove usable transparency.

Stop after a failed probe. A checkerboard, card, rounded tile, frame, gradient field, or scene cannot be repaired reliably. Do not consume a full batch hoping it improves.

If a known RGB-only generator can produce one perfectly flat matte, request the probe on a color absent from the object, then run:

```bash
scripts/remove-solid-matte.sh INPUT OUTPUT.png 35 '#00ff00'
```

Validate the result again. Continue only when the decoded PNG contains useful alpha and both composites have clean edges. Matte removal is unsuitable for translucency that shares the matte color or for textured backgrounds.

## Generate one atlas

After the probe passes, request one exact equal-cell atlas in occurrence order. Use grid dimensions that divide the bitmap exactly, keep generous padding, preserve the atlas, and crop cells locally. Do not make one generation call per character.

Prompt pattern:

```text
Use case: stylized-concept
Asset type: glyph-shaped object artwork for an interactive website headline
Primary request: Create <count> separate character-shaped objects in an exact <columns>-column by <rows>-row grid. Reading left to right and top to bottom, the glyphs must be exactly: <ordered graphemes>. Every glyph must remain instantly legible and use a distinct tactile material.
Scene/backdrop: genuinely transparent
Composition: equal cells, one centered isolated glyph per cell, generous transparent padding, no overlap
Constraints: exact order and character structure; punctuation substantially smaller and near its baseline; correct CJK strokes; glyph silhouette only; no caption, label, logo, watermark, checkerboard, panel, card, rounded square, frame, border, floor, cast shadow on the background, grid line, or extra object
```

For a known solid-matte workflow, replace the backdrop line with:

```text
Scene/backdrop: one perfectly flat #00ff00 field filling the canvas, with no texture, lighting variation, horizon, checkerboard, or gradient
```

The default task budget is one probe and one complete atlas. Do not run a second complete atlas without explicit user feedback asking for a new direction. When only a few cells fail, retain approved files and make at most one targeted request containing those IDs.

## Validate and crop

At full resolution:

- compare the cell count, order, and exact grapheme shapes with the manifest;
- reject misspelled Latin, malformed CJK strokes, incorrect punctuation, or extra marks;
- reject artwork crossing cell boundaries;
- make punctuation materially smaller than letters before frontend tuning;
- crop without removing intentional baseline padding, recording `bottom` or `lift` adjustments when needed;
- name outputs by occurrence and keep paths stable;
- run `scripts/validate-glyph-assets.sh` on the final crop directory and inspect both composites.

Record the final prompt and generation-call count with the delivered project.

## Revise from feedback

A new skill invocation may create a different visual direction, while a deployed page uses fixed files. If the user rejects a material or occurrence, keep every approved file and regenerate only the rejected IDs. Preserve their public paths so component code does not change. Never silently replace an approved set.
