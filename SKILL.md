---
name: letter-pop
description: Transform a specific word, title, or text fragment in an existing webpage into a per-grapheme image-replacement interaction where hovered letters become custom visual objects and surrounding text makes room. Use for OpenAI Images-style kinetic letter hover/tap effects or for applying that effect to an existing frontend. Skip ordinary color, underline, or whole-element hover animations.
---

# Letter Pop

Add the effect to the user's actual page while preserving the host element's semantics, typography, layout, and responsive behavior.

## Interpret a short request

The user should only need to identify the target text and, when it is not obvious from the current workspace, the page or project. A request such as `用 letter-pop 把首页的“Hello, 我是Neal”做成这个效果` is sufficient.

Treat capability checks, artwork generation, alpha validation, fallback processing, interaction architecture, accessibility, responsive behavior, and browser verification as the skill's internal workflow. Never require the user to repeat those instructions in their prompt. Infer a coherent first-pass art direction from the supplied reference and host page when the user does not specify one. Ask only when multiple rendered targets remain genuinely ambiguous or a missing choice would materially change the requested result.

## Establish the target

Collect or infer:

- the project path and page route;
- the exact visible text;
- a selector or source component when the text is not unique;
- the visual theme or reference;
- whether artwork already exists.

When the exact text occurs once, locate it in source and rendered DOM without asking for a selector. If several rendered instances are plausible, ask which one before editing. Modify source files rather than build output or fetched production markup.

Inspect repository instructions and the existing stack before choosing an implementation. Capture the target's baseline appearance when a runnable page is available, including font family, size, weight, line height, letter spacing, color, width, wrapping, and relevant breakpoints.

## Check capabilities before starting

When new artwork is required, confirm that the current host exposes a working image-generation tool before starting implementation. Image understanding alone is not image generation. If generation is disabled, unavailable, or waiting for permission, surface that condition immediately instead of searching for unofficial substitutes, installing unrelated tools, or repeatedly retrying. Continue with existing or user-provided assets when available; otherwise explain the missing capability before doing long-running work.

Give a short progress update when the task enters artwork generation, frontend integration, and browser verification. A pending tool call must not become a silent wait.

## Build the character plan

Segment text into grapheme clusters rather than code points. In JavaScript, prefer `Intl.Segmenter` with grapheme granularity and provide a safe fallback. Treat repeated characters as separate occurrences so they may use different artwork.

- Spaces define wrapping opportunities and do not receive artwork.
- Punctuation keeps a smaller visual scale, narrow expansion, and punctuation-appropriate baseline.
- CJK glyphs keep a full-em footprint and must remain structurally legible.
- Emoji and combining sequences remain a single interactive unit.

If new artwork is needed, read [artwork generation](references/artwork-generation.md). If the user supplied final assets, preserve them and skip generation.

Accept an asset as transparent only after checking its decoded alpha channel, alpha coverage, file signature, and composites over both light and dark backgrounds. A `.png` filename does not prove PNG encoding or transparency, and a few transparent border pixels do not prove the background was removed. When the generator cannot emit alpha, use the solid-matte fallback in the artwork reference; never accept a rendered checkerboard or visible matte rectangle as transparency.

For a reference-driven Letter Pop effect, custom raster artwork is part of the requested result. Do not replace it with CSS gradients, SVG text using the original font outline, emoji, colored text, filters, or other placeholders and present that as complete. Use those only when the user explicitly asks for a code-only approximation. If raster generation and usable supplied assets are both unavailable, report the missing asset capability.

Treat artwork as project-specific output. Generate a fresh set for each new phrase or new application unless the user asks to reuse existing assets. Demo artwork illustrates the interaction only and must not become the default asset pack for other projects. Keep deployed artwork deterministic: do not generate images at page runtime or randomly swap assets on reload unless the user explicitly requests that behavior.

## Integrate into the existing page

Read [implementation pattern](references/implementation-pattern.md) before writing the component.

Replace only the requested text node or smallest suitable source component. Keep the semantic parent such as `h1`, `h2`, link, or button unless the interaction requires a valid structural change.

The component must:

- inherit font family, font size, weight, color, line height, and letter spacing by default;
- use occurrence-based asset configuration and em-relative sizing;
- separate the stable pointer hit layer from the expanding visual layer so hover does not jitter;
- keep the original text available as one accessible name while hiding decorative layers from assistive technology;
- preload artwork or reserve its geometry so initial rendering does not shift;
- support mouse hover, a visible-duration tap interaction on touch devices, and keyboard focus;
- respect `prefers-reduced-motion`;
- preserve word-level wrapping and avoid horizontal overflow at supported breakpoints.

Do not redesign the surrounding page, replace its font, or change unrelated copy unless the user requests it. Adapt the component to the repository's framework and conventions instead of adding a second frontend stack.

The stable hit targets must live in their own coincident layer, outside the occurrences whose padding expands. A transparent hit span nested inside an expanding occurrence is not stable even if it is named `hit`.

## Tune the motion

Use the reference as the source of truth when one is provided. A useful initial feel is:

- enter from roughly `scale(.35)` with a small vertical offset and stronger initial rotation;
- overshoot near `scale(1.04)` and settle around 400–500 ms;
- expand the occurrence with per-glyph inline padding during the same interval;
- retain the artwork briefly when the pointer crosses between characters;
- keep touch artwork visible for roughly 600–900 ms.

Treat these as starting values. Tune per glyph where its artwork, punctuation class, or script needs different spacing or baseline alignment.

## Revise artwork without restarting

After the first integrated preview, accept visual feedback at the level the user gives it: the whole direction, a material, or one grapheme occurrence. Keep approved glyphs and regenerate only rejected occurrences when possible. Use accepted neighboring artwork as visual reference, inspect the replacement, preserve its occurrence ID and public path, then rerun the affected interaction and layout checks. If the user wants choices before settling on a direction, generate a small candidate set for representative glyphs before completing the full phrase.

## Verify on the real route

Run the smallest checks that demonstrate the finished interaction:

1. Confirm the intended rendered occurrence changed and unrelated occurrences did not.
2. Confirm every referenced artwork file loads with nonzero natural dimensions, has the expected file signature and alpha channel, and produces no 404s or console errors.
3. Exercise the first, middle, repeated, punctuation, and CJK/emoji occurrences when present.
4. Verify hover exit, rapid pointer movement across adjacent graphemes, touch tap duration, keyboard focus, and reduced-motion behavior.
5. Measure representative hit-target rectangles before and during activation; their position and size should remain unchanged within browser rounding tolerance.
6. Check the original target width plus supported desktop and mobile viewports for wrapping and horizontal overflow.
7. Capture a resting and active screenshot when browser automation is available. Reject a final result whose active state is merely the original font silhouette with a gradient or filter.

Report the route, source files changed, artwork directory, generation prompt if artwork was generated, and concrete verification results.
