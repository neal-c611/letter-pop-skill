# Artwork generation

Read this only when the task needs new raster glyph artwork.

## Build an occurrence and art-direction manifest

Segment the exact text into grapheme clusters and give every non-space occurrence its own stable ID. Repeated characters remain separate and receive different artwork. Before generation, assign each occurrence a concrete visual direction across these axes:

- `medium`: what it is physically made from;
- `construction`: how the glyph is formed, such as bent tubing, torn layers, carving, weaving, or assembled objects;
- `dimensionality`: flat graphic, shallow relief, hollow volume, solid sculpture, or another distinct spatial treatment;
- `renderMode`: how the artifact is depicted, such as studio product photography, a scanned analog collage, macro craft photography, a luminous sign, hand-painted art, or a sculptural render;
- `surfaceLight`: matte, reflective, translucent, internally lit, fibrous, rough, wet, or another distinct finish;
- `palette`: the supporting color direction, used after the structural choices above.

Every non-punctuation glyph in a short headline needs a unique direction. Adjacent occurrences should differ on at least three of the first five axes. Changing hue, calling several cells different kinds of clay, or depicting everything with the same softly beveled 3D render is style repetition and fails the brief.

```json
[
  {
    "id": "g00-H",
    "grapheme": "H",
    "kind": "letter",
    "medium": "clear blown glass",
    "construction": "hollow joined tubes",
    "dimensionality": "transparent 3D volume",
    "renderMode": "sharp studio product photograph",
    "surfaceLight": "hard specular refraction",
    "palette": "cyan"
  },
  {
    "id": "g01-e",
    "grapheme": "e",
    "kind": "letter",
    "medium": "torn handmade paper",
    "construction": "rough layered collage",
    "dimensionality": "flat layers",
    "renderMode": "scanned analog collage",
    "surfaceLight": "dry fibrous diffuse",
    "palette": "vermillion and cream"
  }
]
```

Build directions for the actual phrase rather than repeatedly copying the examples. Useful media can include glass, chrome, paper collage, embroidery, carved wood, moss, flower petals, neon tubing, ice, mosaic, twisted rope, folded foil, pastry, stone, liquid, beads, or found-object assemblage. The list is a source of contrast, not a house style.

The raster is decorative. Real text remains responsible for layout and accessibility. Do not copy artwork from a public reference page unless the user explicitly asks to reuse it.

## Probe before the full spend

An unverified generator gets one representative-glyph probe before any multi-glyph batch. Validate the decoded file with `scripts/validate-glyph-assets.sh` and inspect its light and dark reports. A filename, preview checkerboard, or a few transparent edge pixels do not prove usable transparency.

Stop after a failed probe. A checkerboard, card, rounded tile, frame, gradient field, or scene cannot be repaired reliably. Do not consume a full batch hoping it improves.

If a known RGB-only generator can produce one perfectly flat matte, request the probe on a color absent from the object, then run:

```bash
scripts/remove-solid-matte.sh INPUT OUTPUT.png 35 '#00ff00'
```

Validate the result again. Continue only when the decoded PNG contains useful alpha and the light and dark reports have clean edges. Matte removal is unsuitable for translucency that shares the matte color or for textured backgrounds.

## Generate small contrast atlases

After the probe passes, select 3–5 representative occurrences for an exact equal-cell atlas. Include different scripts or structural types when available, and assign intentionally incompatible directions so this first batch tests whether the generator follows cell-level art direction instead of harmonizing the grid. Inspect and validate it before generating the rest. If it collapses into one common render style, stop; do not spend calls on the remaining glyphs.

After the contrast gate passes, continue in occurrence order with atlases of at most five glyphs. Use grid dimensions that divide the bitmap exactly, keep generous padding, preserve every atlas, and crop cells locally. Do not put a longer phrase into one image and do not make one generation call per character.

Prompt pattern:

```text
Use case: mixed-media editorial glyph assets
Asset type: isolated glyph-shaped artwork spanning unrelated visual media for an interactive website headline
Primary request: Create <count> independently art-directed glyph assets in an exact <columns>-column by <rows>-row grid. This is not a coordinated alphabet or a cohesive collection. Reading left to right and top to bottom, follow this cell manifest exactly: <ordered cell manifest with grapheme, medium, construction, dimensionality, renderMode, surfaceLight, and palette>.
Scene/backdrop: genuinely transparent
Composition: equal cells, one centered isolated glyph per cell, generous transparent padding, no overlap
Diversity contract: each cell must look as if it came from a different physical process, artist, and depiction method. Preserve the assigned medium, construction, dimensionality, render mode, and surface behavior. Do not harmonize the cells. Do not reuse a common bevel, rounded toy volume, clay/felt/plush look, lighting rig, texture, camera treatment, or rendering language. Different colors on the same treatment do not count. The differences must remain obvious when desaturated and viewed at thumbnail size.
Constraints: exact order and character structure; punctuation substantially smaller and near its baseline; correct CJK strokes; glyph silhouette only; no caption, label, logo, watermark, checkerboard, panel, card, rounded square, frame, border, floor, cast shadow on the background, grid line, or extra object
```

For a known solid-matte workflow, replace the backdrop line with:

```text
Scene/backdrop: one perfectly flat #00ff00 field filling the canvas, with no texture, lighting variation, horizon, checkerboard, or gradient
```

The default task budget is one transparency probe plus `ceil(non-space graphemes / 5)` small atlases. The first atlas is a stop gate for transparency, character accuracy, and real stylistic separation. Do not retry accepted batches. When only a few cells fail, retain approved files and make at most one targeted request containing those IDs.

## Validate and crop

At full resolution:

- compare the cell count, order, and exact grapheme shapes with the manifest;
- reject misspelled Latin, malformed CJK strokes, incorrect punctuation, or extra marks;
- reject artwork crossing cell boundaries;
- compare the result with the art-direction manifest and reject directions the model silently replaced;
- reject adjacent glyphs that differ mainly by hue or share the same dominant construction, bevel, volume, lighting, and texture family;
- inspect the grayscale contact sheet at thumbnail size; each non-punctuation glyph should still read as a different visual medium;
- make punctuation materially smaller than letters before frontend tuning;
- crop without removing intentional baseline padding, recording `bottom` or `lift` adjustments when needed;
- name outputs by occurrence and keep paths stable;
- run `scripts/validate-glyph-assets.sh` on the final crop directory and inspect all three reports.

Record the art-direction manifest, final prompts, batch membership, and generation-call count with the delivered project.

## Revise from feedback

A new skill invocation may create a different visual direction, while a deployed page uses fixed files. If the user rejects a material or occurrence, keep every approved file and regenerate only the rejected IDs. Preserve their public paths so component code does not change. Never silently replace an approved set.

## Optional variants

Generate one final image per occurrence unless the user requests alternatives. When variants are requested, include a variant ID such as `g00-H-a` and `g00-H-b` in the manifest. A request for two images may apply to the whole phrase or only named occurrences; do not assume that every glyph needs two.

Give variants of the same occurrence different art directions rather than recoloring the same render. Count them as separate cells when planning small contrast atlases and report the added generation calls. Validate every variant with the same transparency, character-accuracy, and style-separation checks.

Configure the first file as `src` and any alternatives as `variants`:

```js
{
  src: "/letter-pop/g00-H-a.png",
  variants: ["/letter-pop/g00-H-b.png"]
}
```

The supplied component preloads all files and cycles to the next one on each separate pointer, touch, or keyboard activation. A deployed page therefore has deterministic local rotation among fixed assets; it does not call an image model at runtime.
