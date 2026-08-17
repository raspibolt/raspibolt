# Social image brand system

The visual rules for RaspiBolt social graphics. Feed these into the prompt so
every card looks like it belongs to the same account. Pair with `generate.mjs`.

## Palette

| Role          | Hex                   | Notes                             |
| ------------- | --------------------- | --------------------------------- |
| Primary amber | `#f59e0b`             | headlines, the bolt, key accents  |
| Orange        | `#f97316`             | gradient mid, energy              |
| Deep amber    | `#b45309`             | gradient end, depth               |
| Bolt orange   | `#fb7e02`             | the lightning mark itself         |
| Ink           | `#0f1010`             | dark background (default)         |
| Warm white    | `#fffbeb`             | light background                  |
| Amber tint    | `#fef3c7`             | light background gradient partner |
| Amber text    | `#78350f`             | body text on light grounds        |
| Hairline      | warm gray, ~20% alpha | borders, dividers                 |

Default to a **dark ground** (`#0f1010`). Bitcoin Twitter lives in dark mode and
the amber reads hottest against ink. Use the light palette only for contrast in a
series.

## Logo and mark

- The mark is a single orange lightning bolt. Files: `public/images/logo-dark.png`
  (for dark grounds), `public/images/logo-light.png` (for light grounds).
- The model does NOT reproduce the logo exactly, even with `--logo`. It reinterprets
  the shape (a tested run redrew it as a literal raspberry fruit). For any card where
  the **real mark must appear**, composite `logo-*.png` in afterwards. For stylistic
  cards, a freshly drawn bolt is fine and looks good.
- The wordmark text "RaspiBolt" does render correctly, so the model is fine for the
  name even when it cannot be trusted with the exact mark.
- Place the mark small, one corner or beside the wordmark. It is a signature, not the
  subject.

## Type

- Geist Sans for everything, tight tracking on big headlines. Geist Mono only for
  command-style accents.
- Heavy weight for the hero line, regular for support text.

## Composition

- Lots of negative space. One idea per card.
- Optional texture: a faint amber grid (`#f59e0b` at very low opacity, 64px cells)
  echoing the site hero. Keep it in the background, never busy.
- No generic stock photos, no people, no fake app screenshots, no QR codes. A
  purpose-built photorealistic product shot of the hardware (a Pi plus SSD under
  warm amber light) is a fine separate register and tested well.
- Always include the handle `@raspibolt` or `raspibolt.org` small in a corner.

## On-image text: what renders reliably

Tested against Gemini 3 Pro Image. All of the following came back correct and
legible, so text is not the constraint it usually is with image models:

- Full short sentences and two-line statements, not just a few words.
- Monospace commands, file names, and version strings, e.g.
  `sha256sum --check SHA256SUMS` and `bitcoin-31.1-aarch64-linux-gnu.tar.gz: OK`.
- Numbers and symbols: `~700 GB`, `31.1`.
- Several short labels in one diagram (Bitcoin Core, Electrs, LND, Tor, RTL).

Keep text purposeful, but you are not capped at six words. Still proof every
render: if a glyph is malformed, regenerate rather than ship it.

## Proven card formats

All tested and reliable: ethos statement, privacy/value tip, software update
(version bump), new bonus guide, a stat/number, a terminal "verify" card, and a
labeled architecture diagram. Light and dark grounds both work.

## Aspect ratios

| Use                    | `--aspect` | Why                                              |
| ---------------------- | ---------- | ------------------------------------------------ |
| Single in-stream image | `16:9`     | default, fills the timeline card                 |
| Quote / ethos card     | `1:1`      | takes more vertical space, strong for statements |
| Avoid                  | `9:16`     | story format, not for the timeline               |

## Prompt scaffold

Slot your concept and on-image line into this. Keep the brand block verbatim.

```
A social graphic for RaspiBolt, a self-custody Bitcoin and Lightning node guide.

Style: clean, technical, confident, lots of negative space. Dark ink background
(#0f1010) with a single orange lightning bolt mark and warm amber accents
(#f59e0b to #f97316). A faint amber grid texture in the far background. Geist-style
geometric sans typography, heavy weight.

Subject: <DESCRIBE THE VISUAL IDEA>

On-image text, set cleanly and correctly, nothing else: "<SHORT LINE>"

Small in a bottom corner: "raspibolt.org"

No people, no photos, no fake UI, no extra text.
```

## Card types

- **Ethos card** (`1:1`): a single sovereignty line. Subject is abstract, the bolt
  plus type carry it. Caption holds the full statement.
- **Tip card** (`16:9`): one concrete node tip. Subject can hint at the mechanic
  (a node, a private connection) without a literal screenshot.
- **Launch card** (`16:9`): the logo, the wordmark, `raspibolt.org`, one line. Only
  when v4 is live.

## Twitter profile assets

The committed pair lives in `assets/` (tracked, unlike `out/`):

- `assets/twitter-banner.png` (1500x500): the header. It follows the **v4 landing
  page**, not the dark cards above: warm off-white ground, faint amber grid, bold
  Geist-style sans, near-black text with amber-to-orange accents, and the
  "do-everything-yourself Bitcoin node" headline. Content sits right of center so
  the profile picture has clear space on the left.
- `assets/twitter-avatar.png` (800x800): the real logo on a light ground, to match
  the light banner. `assets/twitter-avatar-dark.png` is the dark alternate. Avatars
  are derived from `images/sources/raspibolt-v4-{light,dark}.png`, never generated,
  the model redraws the mark.

To redo the banner: screenshot the landing page (via the browserless container,
see project memory), pass it to `generate.mjs` with `--logo` as a style reference,
then crop the 21:9 render to 1500x500 with ImageMagick.

Both registers are valid: dark cards for in-feed statements, the light
landing-page style for the profile header.
