# Letter Pop

An agent skill for turning a specific text fragment on an existing webpage into a per-character image replacement interaction. Each grapheme keeps the original page typography at rest, then becomes custom artwork on hover, tap, or focus while neighboring text smoothly makes room.

The workflow was derived from the interaction pattern used in OpenAI's ChatGPT Images 2.5 launch page, then generalized for existing React, Next.js, Vue, Svelte, and vanilla frontends.

## What it handles

- Finds the requested text in an existing codebase and changes only that rendered occurrence.
- Preserves the host page's font, size, weight, color, semantics, wrapping, and breakpoints.
- Plans artwork by grapheme occurrence, including repeated letters, CJK, emoji, and combining sequences.
- Keeps punctuation visually smaller and aligned to its natural baseline.
- Generates or integrates transparent raster artwork.
- Implements a stable hit layer so expanding artwork does not cause hover jitter.
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

### Download without Git

Download the repository ZIP:

```text
https://github.com/neal-c611/letter-pop-skill/archive/refs/heads/main.zip
```

Extract it, rename the folder to `letter-pop`, and place it inside the agent's user-level or project-level skills directory.

## Use

```text
$letter-pop

Project: /path/to/my-website
Page: /about
Target: .hero-title
Text: "Hello, 我是Neal"

Turn this text into a per-letter artwork hover effect. Preserve the existing font,
size, color, and responsive layout. Keep punctuation smaller. Use hover on desktop
and tap on touch devices, then run the page and verify the result.
```

If the text is unique, the page route and exact text are usually enough. A selector or source component is useful when the same copy appears more than once.

## Requirements

The skill itself has no runtime package dependency. Creating new glyph artwork requires an image-generation capability or user-provided transparent assets. Browser automation is recommended for visual verification. ImageMagick or another image tool is optional when a generated atlas needs deterministic cropping.

## Structure

```text
letter-pop-skill/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    ├── artwork-generation.md
    └── implementation-pattern.md
```

## License

MIT
