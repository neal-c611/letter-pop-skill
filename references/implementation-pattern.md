# Implementation pattern

Use this reference when integrating the effect into a frontend.

## Component boundary

Prefer a narrow API that keeps typography outside the component:

```tsx
<h1 className="existing-hero-title">
  <KineticText text="Hello, 我是Neal" artwork={artwork} />
</h1>
```

The host owns font, size, weight, color, alignment, and breakpoints. The component owns grapheme segmentation, artwork mapping, interaction state, and motion.

If the original target contains links, emphasis, or separately styled spans, preserve those semantic ranges. Either enhance only a plain-text subrange or accept structured children with an explicit occurrence map. Do not flatten meaningful interactive descendants into a string.

## Layer model

Render two coincident layers:

```text
kinetic stage (accessible name = original text)
├── visual layer (aria-hidden)
│   ├── word
│   │   └── occurrence: real character + absolutely positioned artwork
│   └── space / wrap opportunity
└── stable hit layer (aria-hidden)
    ├── word
    │   └── one transparent hit target per occurrence
    └── space / wrap opportunity
```

The visual layer expands through inline padding on the active occurrence. The hit layer keeps the original text metrics and remains centered above it, so expansion cannot move the pointer target and repeatedly fire enter/leave.

Do not put `.hit`, `.kinetic-hit`, or an equivalent target inside the expanding occurrence. Naming a nested element as a hit layer does not make its geometry stable; it inherits the occurrence's movement and size changes. Render the entire hit layer as a sibling of the entire visual layer.

Keep artwork absolutely positioned inside the occurrence. An invisible image must not contribute its intrinsic size to grid or inline layout.

## State and events

Use occurrence indices as state keys.

- `pointerenter`: cancel pending return and activate the occurrence.
- `pointerleave`: schedule a short return for mouse/pen; ignore synthetic touch leave.
- `pointerdown` on touch: activate, then return after a visible hold interval.
- focus: reveal the focused occurrence or run one short sequential preview.
- blur: clear active state.

Clear timers on unmount. Avoid random initial values during SSR; rotations and asset selection should come from stable configuration or initialize after hydration.

## CSS contract

Use custom properties so the component can inherit typography and tune artwork independently:

```css
.kinetic-occurrence {
  --spread: 0.13em;
  --rotation: -6deg;
  --lift: 0.02em;
  position: relative;
  display: inline-grid;
  padding-inline: 0;
  transition: padding-inline 440ms cubic-bezier(.2,.82,.2,1);
}

.kinetic-occurrence[data-active="true"] {
  padding-inline: var(--spread);
}

.kinetic-artwork {
  position: absolute;
  left: 50%;
  bottom: -0.08em;
  width: 1.42em;
  height: 1.16em;
  pointer-events: none;
  transform-origin: 50% 78%;
}

.kinetic-artwork img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

Animate opacity, scale, rotation, and vertical position on the artwork wrapper. Animate inline padding on the occurrence. Keep layout animation and artwork animation on compatible easing and duration so neighboring text appears to make room for the object.

For punctuation, reduce artwork scale and spread and tune the bottom/vertical offset. Do not normalize punctuation to full letter size. For CJK, use a full-em hit target and validate the browser's actual fallback font metrics.

## Wrapping and accessibility

Group graphemes into word wrappers with `white-space: nowrap`, leaving spaces as the wrapping boundary. Follow the target page's original wrapping behavior when it deliberately breaks inside words.

Give the stage a single accessible label containing the original text. Mark duplicated visual and hit layers `aria-hidden="true"`. Preserve the host's heading or link semantics. Do not make every decorative character a separate tab stop.

In reduced-motion mode, replace spring animation with a near-instant or short opacity swap while preserving the text and artwork states.

## Stack adaptation

- React/Next.js: keep event/timer logic in a client component; keep static asset paths deterministic; avoid hydration-time random choices.
- Vue/Svelte: derive occurrences from a stable manifest and clear scheduled returns during teardown.
- Vanilla: expose one initializer per stage and return a cleanup function for event listeners and timers.

Reuse the project's animation library when it already provides appropriate spring or timeline primitives. Plain CSS keyframes are sufficient for the standard effect and avoid adding a dependency solely for one heading.
