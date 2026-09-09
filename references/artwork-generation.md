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

For a short phrase, an exact equal-cell atlas is efficient when the available tooling can crop it deterministically. Specify the grid dimensions, exact reading order, and one isolated glyph per cell. Otherwise generate one transparent image per occurrence.

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
