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
- Pass it with `--logo` so the model keeps the real shape instead of inventing one.
- Place it small, one corner or beside the wordmark. It is a signature, not the
  subject.

## Type

- Geist Sans for everything, tight tracking on big headlines. Geist Mono only for
  command-style accents.
- Heavy weight for the hero line, regular for support text.

## Composition

- Lots of negative space. One idea per card.
- Optional texture: a faint amber grid (`#f59e0b` at very low opacity, 64px cells)
  echoing the site hero. Keep it in the background, never busy.
- No stock photos, no people, no fake app screenshots, no QR codes.
- Always include the handle `@raspibolt` or `raspibolt.org` small in a corner.

## On-image text: keep it short

Put at most a **short punchy line (about six words)** on the image. The full
sentence goes in the tweet caption, not the graphic. Short on-image text renders
cleanly and reads better in the feed. Always proof the render: if a letter is
malformed, regenerate rather than ship it.

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
