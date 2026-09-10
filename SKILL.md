---
name: letter-pop
description: Transform a specific word, title, or text fragment in an existing webpage into a per-grapheme image-replacement interaction where hovered letters become custom visual objects and surrounding text makes room. Use for OpenAI Images-style kinetic letter hover/tap effects or for applying that effect to an existing frontend. Skip ordinary color, underline, or whole-element hover animations.
---

# Letter Pop

Apply the effect to the user's real page. A short request naming the page and visible text is enough. Capability checks, cost limits, asset validation, component integration, responsive behavior, and browser verification belong to this workflow; do not ask the user to restate them.

## Locate the exact target

Inspect repository instructions and the current stack. Find the exact rendered occurrence from the user's text, then change only that source node or the smallest suitable component. Preserve the semantic parent, surrounding content, typography, and breakpoints. When a plain heading contains the target, wrap the text in a neutral inline element inside the heading; do not mount the effect on the heading itself.

If the text occurs once, proceed without asking for a selector. Ask only when several rendered occurrences remain plausible. Record the baseline font, size, weight, line height, letter spacing, alignment, width, and wrapping before editing.

## Use the supplied component

For vanilla HTML, static pages, and framework code that can initialize a DOM enhancement, copy these files from this skill into the project:

- `assets/vanilla/letter-pop.js`
- `assets/vanilla/letter-pop.css`

Use `assets/vanilla/example.js` as the API example. Copy the component files as-is; do not recreate the interaction from this document. The supplied component already handles grapheme segmentation, repeated occurrences, short CJK wrapping groups, punctuation sizing, stable hit geometry, mouse, touch, keyboard focus, reduced motion, cleanup, and runtime verification.

Mount a neutral child of the semantic element:

```html
<h1 class="existing-title">
  <span data-letter-pop-target>Hello, 我是Neal</span>
</h1>
```

```js
const instance = LetterPop.mount(
  document.querySelector("[data-letter-pop-target]"),
  { artwork }
);
```

The host element owns typography. Do not add a font inside the Letter Pop component or redesign the page.

For a framework-native port, first read [the implementation contract](references/implementation-pattern.md). Preserve its group shell, absolutely positioned visual group, normal-flow hit group, occurrence configuration, and `verify()` behavior. A hit element nested inside a letter whose padding changes is invalid. Prefer the supplied dependency-free component unless the project genuinely requires a native port.

## Bound image-generation cost

When final artwork already exists, use it and make no image-generation calls.

When new artwork is required, first check whether the current host has an enabled image-generation tool. Image understanding is not image generation. If generation is missing or disabled, stop the artwork branch immediately and report that capability; do not install unrelated tools, fake the result with SVG/CSS/emoji, or keep retrying.

For an image generator that has not already produced validated transparent glyphs in the current task:

1. Generate one representative probe glyph. Choose a structurally difficult CJK glyph when present, otherwise a representative letter. Do not generate the full phrase yet.
2. Run `scripts/validate-glyph-assets.sh` on the probe and inspect its light and dark composites.
3. If the probe is a JPEG disguised as PNG, has no usable alpha, contains a checkerboard, card, frame, or textured background, stop. Do not spend another call on the full phrase.
4. If the generator is known to flatten alpha but the probe uses one genuinely flat matte color, process it locally with `scripts/remove-solid-matte.sh`, validate it again, and continue only when the composite is clean.

After a probe passes, create an occurrence-level art-direction manifest before generating the set. Give every non-space occurrence its own visual medium, construction, and render mode; a color change or a different label on the same soft 3D treatment does not count as a new direction. Repeated characters must also receive independent directions.

Generate a representative 3–5 glyph subset as a deliberately high-contrast atlas and inspect it before spending on the remainder. Include different scripts or structural types when the phrase provides them. Reject the batch if the generator gives every cell the same bevel, volume, lighting, texture family, or cute rounded 3D treatment. Once that gate passes, generate the remaining glyphs in atlases of at most five. Do not put a longer phrase into one full atlas: image models tend to impose one global style on a single grid. The default budget is one transparency probe plus `ceil(non-space graphemes / 5)` contrast atlases. Do not generate one image per character or retry completed batches without explicit user feedback; later corrections should contain only rejected occurrence IDs and keep approved files.

Read [artwork generation](references/artwork-generation.md) for the manifest, prompt pattern, cropping, matte fallback, and visual review. Fresh generation means a new skill run may produce a new design; deployed files remain fixed and do not change on hover or reload.

## Reject bad assets before integration

Run:

```bash
scripts/validate-glyph-assets.sh PATH_TO_GLYPH_DIRECTORY PATH_TO_REPORT_DIRECTORY
```

This checks decoded file format, a real alpha channel, alpha extrema, and suspicious coverage, then writes `on-light.png`, `on-dark.png`, and `style-grayscale.png`. High coverage is a warning because tightly cropped valid glyphs can exceed the heuristic. A `.png` extension and transparent border pixels are insufficient.

Inspect all three reports. Reject any visible rectangle, matte fringe, checkerboard, card, malformed glyph, wrong occurrence order, or extra object. Also reject a set whose non-punctuation glyphs differ mainly by color while sharing the same construction and render treatment. Their differences should remain obvious in the grayscale report at thumbnail size. Check that punctuation is substantially smaller than adjacent glyph artwork. Do not integrate failed assets and promise to fix them later.

## Configure by grapheme occurrence

Build one artwork entry per grapheme in reading order, including separate entries for repeated characters. Spaces need no entry. Each entry may use one required `src` or add optional `variants`; the component cycles through the available files on separate activations. Generate one file per occurrence by default. Create variants only when the user asks for them, and allow variants for selected occurrences so the image cost does not have to multiply across the whole phrase. Use the component defaults first and tune only outliers:

```js
const artwork = [
  { src: "/letter-pop/g00-H.png", rotation: -6 },
  {
    src: "/letter-pop/g01-e-a.png",
    variants: ["/letter-pop/g01-e-b.png"],
    rotation: 5,
  },
  { src: "/letter-pop/g02-comma.png", scale: 0.55, spread: 0.02 },
];
```

Supported fields are `src`, `variants`, `spread`, `rotation`, `lift`, `scale`, `width`, `height`, and `bottom`. Punctuation already receives smaller defaults. Keep paths deterministic and preload or reserve every primary and variant image before judging the layout.

## Verify on the real route

Expose the mounted instance during verification and run:

```js
await instance.verify()
```

Require `pass: true`. This proves that representative hit rectangles do not move or resize during activation, the page has no horizontal overflow, and all images decode. Also use browser automation to:

1. confirm only the intended rendered occurrence changed;
2. exercise first, middle, repeated, punctuation, and CJK occurrences;
3. check pointer exit, rapid movement, touch hold, keyboard focus, and reduced motion;
4. run at the original viewport, a common desktop viewport, and a narrow mobile viewport;
5. capture resting and active screenshots and inspect actual line breaks and visual scale;
6. reject console errors, failed requests, clipped artwork, isolated last-line fragments, and any active state that is merely a styled font silhouette.

Do not declare success from source inspection alone. Report the route, changed files, artwork directory, image-call count, validation result, and measured `verify()` output.
