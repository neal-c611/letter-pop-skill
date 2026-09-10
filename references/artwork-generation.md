# Artwork generation

Use this reference only when the task needs new raster glyph artwork.

## Plan by occurrence

Create an ordered manifest before generating anything. Give every non-space grapheme an occurrence ID, even when its visible character repeats.

```json
[
  { "id": "g00-H", "grapheme": "H", "class": "letter" },
  { "id": "g01-e", "grapheme": "e", "class": "letter" },
  { "id": "g05-comma", "grapheme": ",", "class": "punctuation" },
  { "id": "g06-wo", "grapheme": "我", "class": "cjk" }
]
```

Use generated artwork as the decorative replacement while retaining real text for semantics and layout. Treat public reference pages as motion and art-direction references. Do not copy third-party raster assets into a deliverable unless the user explicitly asks to reuse them.

## Generate

Use the available image-generation workflow for original raster assets. Request genuinely transparent output.

Start from a fresh generation for every new phrase or new project application unless the user explicitly asks to reuse an existing set. Image generation is intentionally variable, so separate runs may produce different materials, colors, and silhouettes even with the same brief. Do not copy the skill's demo assets into a user's project as default output.

Generate once during implementation and ship the selected files with the site. Do not call an image model on hover, page load, or every refresh; runtime generation makes the interaction slow, costly, and visually inconsistent.

For a short phrase, prefer one batch generation as an exact equal-cell atlas when the available tooling can crop it deterministically. Specify the grid dimensions, exact reading order, and one isolated glyph per cell. Avoid launching one image-generation request per character during the first pass. When an atlas is unsuitable, use the smallest number of batch requests the tool supports.

Keep the first pass bounded. Make one complete batch, inspect it, and integrate a usable draft. If the batch has malformed glyphs, make at most one corrected full-batch retry; after that, regenerate only the failed occurrence IDs. Do not repeatedly regenerate the whole phrase while trying to reach an unrequested idea of perfection. If the generation tool fails, remains unavailable, or returns no usable output after the corrected retry, report that blocker and preserve completed code and assets.

Prompt pattern:

```text
Use case: stylized-concept
Asset type: transparent glyph artwork for an interactive website headline
Primary request: Create <count> separate character-shaped art stickers in an exact <columns>-column by <rows>-row grid. Reading left to right and top to bottom, the glyphs must be exactly: <ordered graphemes>. Each glyph must remain instantly legible and use a distinct tactile material.
Scene/backdrop: genuinely transparent; no panels or grid lines
Composition/framing: equal cells, one centered isolated glyph per cell, generous transparent padding, no overlap
Constraints: preserve exact order and character structure; punctuation is substantially smaller and aligned near its baseline; CJK characters are structurally correct; no captions, labels, extra text, logos, watermark, borders, or objects outside the glyph silhouettes
```

Choose grid dimensions that divide the final bitmap exactly. Preserve the original atlas alongside cropped occurrences when using an atlas.

## Validate before integration

Inspect the actual output at full resolution.

- Count cells and compare every glyph to the manifest in order.
- Reject misspelled Latin glyphs, malformed CJK strokes, incorrect punctuation, or unexpected extra marks.
- Check alpha rather than assuming the displayed checkerboard or black preview is transparency.
- Ensure artwork does not cross cell boundaries.
- Compare visible alpha bounds: punctuation should be materially smaller than adjacent letters.
- Crop cells without trimming away designed baseline padding. If trimming is needed, record a per-glyph baseline offset.

Save project-bound files inside the repository, use stable occurrence-based names, and record source paths plus the final generation prompt.

## Iterate on visual feedback

The first set is a draft that can be revised without rebuilding the interaction.

- If the overall direction misses, change the art-direction prompt and regenerate the atlas or complete set.
- If a few glyphs miss, retain the approved files and regenerate only those occurrence IDs.
- If the user is unsure about direction, create two or three variants of a representative glyph or short subset before generating the complete phrase.
- Use accepted glyphs as image references when the generation tool supports it, so replacements remain coherent.
- Inspect a replacement before overwriting the published file. Once accepted, keep the same occurrence ID and asset path so component code does not need to change.
- Clear or bypass browser caches and recapture the active preview after replacement.

Do not silently discard a set the user approved. Keep iteration scoped to the feedback they gave.

## Suggested configuration

Keep visual tuning beside each occurrence instead of baking spacing into component logic:

```ts
type GlyphArtwork = {
  id: string;
  grapheme: string;
  src: string;
  spreadEm: number;
  rotationDeg: number;
  liftEm?: number;
  scale?: number;
  kind?: "letter" | "punctuation" | "cjk" | "emoji";
};
```

Start punctuation with little or no spread. Give full-em scripts enough room to stay legible. Tune from rendered screenshots, not only asset dimensions.
