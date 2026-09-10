<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

# Letter Pop

An agent skill for turning a specific text fragment on an existing webpage into a per-character image replacement interaction. Each grapheme keeps the original page typography at rest, then becomes custom artwork on hover, tap, or focus while neighboring text smoothly makes room.

The workflow was derived from the interaction pattern used in [OpenAI's ChatGPT Images 2.5 launch page](https://openai.com/index/introducing-chatgpt-images-2-5/), then generalized for existing React, Next.js, Vue, Svelte, and vanilla frontends.

The live demos use fixed files so they load quickly and consistently. The skill ships a tested, dependency-free browser component, so agents copy the interaction instead of inventing it again. When the skill is applied to a new phrase or project, it generates fresh artwork for that task by default. If part of the result misses, you can keep the approved glyphs and ask the agent to regenerate only a specific occurrence.

## Live demos

Try the hover, tap, and keyboard interactions on the [live demo page](https://neal-c611.github.io/letter-pop-skill/). The same artwork is shown inside three different typographic contexts to demonstrate that Letter Pop inherits the host page's font.

| Sans / mixed script | Editorial serif | Compact CJK |
| --- | --- | --- |
| [![Sans demo showing Hello, 我是Neal](docs/previews/demo-sans.png)](https://neal-c611.github.io/letter-pop-skill/#sans) | [![Serif demo showing Hello, Neal](docs/previews/demo-serif.png)](https://neal-c611.github.io/letter-pop-skill/#serif) | [![Compact demo showing 我是Neal](docs/previews/demo-compact.png)](https://neal-c611.github.io/letter-pop-skill/#compact) |

The same skill was also run in WorkBuddy and Doubao. These are their preserved generated asset sets, mounted with the shared Letter Pop runtime:

| WorkBuddy-generated set | Doubao-generated set |
| --- | --- |
| [![WorkBuddy-generated Letter Pop demo](docs/previews/demo-workbuddy.png)](https://neal-c611.github.io/letter-pop-skill/#workbuddy) | [![Doubao-generated Letter Pop demo](docs/previews/demo-doubao.png)](https://neal-c611.github.io/letter-pop-skill/#doubao) |

### Two images per glyph

[![Letter Pop demo with two artwork variants per glyph](docs/previews/demo-variants.png)](https://neal-c611.github.io/letter-pop-skill/#variants)

This demo gives every one of the 11 character occurrences in `大家好，我是Neal。` two independently art-directed transparent PNGs: 22 files in total. The first hover, tap, or focus shows image A; after that character returns to rest, the next activation shows image B, then the cycle repeats. Both files are generated ahead of time and preloaded—the live page makes no image-generation calls. One image per occurrence remains the default when using the skill; ask for two variants for the whole phrase or only selected characters when you want this behavior.

## What it handles

- Finds the requested text in an existing codebase and changes only that rendered occurrence.
- Preserves the host page's font, size, weight, color, semantics, wrapping, and breakpoints.
- Plans artwork by grapheme occurrence, including repeated letters, CJK, emoji, and combining sequences.
- Gives every glyph a separate visual medium, construction, and depiction method; palette changes alone do not count as variation.
- Supports one image per glyph by default or optional per-glyph variants that cycle on separate activations.
- Keeps punctuation visually smaller and aligned to its natural baseline.
- Generates or integrates transparent raster artwork.
- Implements a stable hit layer so expanding artwork does not cause hover jitter.
- Uses a one-glyph capability probe, then a small high-contrast batch before spending on the remaining artwork.
- Includes automatic PNG/alpha checks plus light, dark, and grayscale reports.
- Supports mouse, touch, keyboard focus, and `prefers-reduced-motion`.
- Verifies asset loading, console errors, wrapping, and mobile overflow on the real route.

## Install

### Codex

Ask Codex to install directly from GitHub:

```text
$skill-installer install https://github.com/neal-c611/letter-pop-skill
```

Or clone it manually into your configured global skills directory:

```bash
mkdir -p "$HOME/.agents/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.agents/skills/letter-pop"
```

Some Codex installations use `$CODEX_HOME/skills` instead. With the default Codex home, that command is:

```bash
mkdir -p "$HOME/.codex/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.codex/skills/letter-pop"
```

### WorkBuddy

Install it as a user-level WorkBuddy skill:

```bash
mkdir -p "$HOME/.workbuddy/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.workbuddy/skills/letter-pop"
```

Restart or open a new WorkBuddy conversation, then use `/skills` to confirm that `letter-pop` is loaded.

When the phrase needs new artwork, make sure WorkBuddy's `ImageGen` tool is enabled and approve its tool request. Kimi-K3's visual capability can understand images, while generation is provided by the separate `ImageGen` tool. Letter Pop first validates one representative glyph, then tests 3–5 deliberately incompatible art directions in a small atlas. Only after both gates pass does it generate the remaining small batches. It copies the supplied browser component instead of rebuilding the interaction.

### OpenClaw

Install the repository-level skill globally:

```bash
openclaw skills install git:neal-c611/letter-pop-skill@main --global
```

Start a new session and confirm it with `openclaw skills list`. OpenClaw follows the AgentSkills `SKILL.md` format and installs the supporting component and scripts with the repository.

### Hermes Agent

Clone the complete skill into Hermes' local skill directory:

```bash
mkdir -p "$HOME/.hermes/skills"
git clone https://github.com/neal-c611/letter-pop-skill.git \
  "$HOME/.hermes/skills/letter-pop"
```

Then start a new session or use `/reset`, and verify it with `hermes skills list`. Use the complete clone rather than the Raw `SKILL.md` URL on Hermes versions that treat direct URLs as single-file skills.

### Download without Git

Download the repository ZIP:

```text
https://github.com/neal-c611/letter-pop-skill/archive/refs/heads/main.zip
```

Extract it, rename the folder to `letter-pop`, and place it inside the agent's user-level or project-level skills directory.

## Use

```text
$letter-pop Make "Hello, 我是Neal" on the homepage use this effect.
```

That is enough for a normal task. The skill owns asset generation, transparency checks, interaction details, accessibility, responsive behavior, and browser verification. Add a selector or source component only when the same text appears more than once and the intended occurrence is unclear.

## Requirements

The supplied browser component has no runtime dependency. Creating new glyph artwork requires an image-generation capability or user-provided assets. If a generator cannot emit alpha, Letter Pop can test one glyph on a solid color matte and use the included ImageMagick script to create a true RGBA PNG. A failed transparency probe or style-contrast batch stops the remaining image spend. Longer phrases are split into atlases of no more than five glyphs so the model does not impose one global render style. Browser automation verifies stable hit geometry, asset loading, wrapping, and overflow through the component's `verify()` method.

If an active glyph shows a square, inspect the actual file signature and alpha channel. A checkerboard drawn into an RGB/JPEG image is still an opaque background, even when the filename ends in `.png`. Regenerate on a flat solid matte and run `scripts/remove-solid-matte.sh`; do not try to hide the square with CSS.

## Structure

```text
letter-pop-skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── vanilla/
│       ├── letter-pop.js
│       ├── letter-pop.css
│       └── example.js
├── scripts/
│   ├── remove-solid-matte.sh
│   └── validate-glyph-assets.sh
└── references/
    ├── artwork-generation.md
    └── implementation-pattern.md
```

## License

MIT
