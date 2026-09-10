# Implementation contract

Read this only when integrating the supplied component or creating a framework-native port.

## Default integration

Copy `assets/vanilla/letter-pop.js` and `assets/vanilla/letter-pop.css` into the target project. Do not transcribe them from memory. Keep the original heading, link, or button and mount a neutral inline child so typography continues to inherit from the host.

The runtime API is:

```js
const instance = LetterPop.mount(elementOrSelector, {
  text,              // optional; defaults to target.textContent
  artwork,           // array or occurrence-indexed object
  maxCjkGroup: 4,    // optional wrapping group limit
  touchDuration: 760,
  keyboard: true,
  align,             // optional override: left, center, right
});

instance.activate(index);
instance.deactivate(index);
instance.play();
await instance.verify(index);
instance.destroy();
```

Every artwork item may specify `src`, `spread`, `rotation`, `lift`, `scale`, `width`, `height`, and `bottom`. An omitted item leaves the real character unchanged.

## Geometry invariant

Each wrapping group has this structure:

```text
group shell (size comes only from hit group)
├── visual group (absolute, centered, excluded from layout)
│   └── occurrence (real character + absolute artwork; padding may expand)
└── hit group (normal flow, transparent)
    └── stable target for each occurrence
```

The visual and hit groups are siblings. The visual group must be absolutely positioned so its expanding padding cannot change the group shell, recenter the stage, alter wrapping, or move the hit rectangles. Merely placing two flex layers in the same grid cell is insufficient because both grid items can still contribute to track size.

Do not place a hit target inside the expanding occurrence. During activation, the maximum change in every representative hit rectangle's x, y, width, and height must stay at or below `0.75px`.

## Wrapping

Whitespace remains a break opportunity. Latin sequences stay together. Punctuation attaches to the preceding group. CJK runs form short groups so unspaced Chinese sentences can wrap without placing every character in a separate flex item. The component reads the inherited text alignment and applies it to wrapped lines.

Test the real text at desktop and mobile widths. Adjust the host's existing responsive font size or width when needed; do not solve overflow with `overflow-x: hidden` or by shrinking individual glyph images until they are unreadable.

## Semantics and events

The mounted target receives one accessible label containing the original text. Decorative visual and hit layers are hidden from assistive technology. The component provides one focus stop for the phrase rather than one per character.

Use occurrence indices as state keys. Keep the short delayed return that prevents flicker while a pointer crosses neighboring glyphs. Clear timers on teardown. Keep asset paths and rotations stable during server rendering and page reloads.

## Native framework ports

A React, Vue, or Svelte port may express the same DOM and state with framework primitives. Preserve every geometry invariant and implement an equivalent `verify()` report. Avoid hydration-time randomness. Use the project's animation library only when already present; the supplied CSS needs no runtime dependency.
