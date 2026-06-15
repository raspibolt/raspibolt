# Social media

Rules, copy, and tooling for the `@raspibolt` account. This folder holds the
**system**, not the individual posts: the styling, the tweet library, and the
image generator. Renders land in `out/` and are gitignored.

## Posting policy

- **No pre-announcement of the v4 launch.** The launch tweet goes out only once
  `raspibolt.org` actually serves v4.
- **Ethos and value tweets can post anytime.** They make no claim about a launch,
  so they run before, during, and after.
- Never share `next.raspibolt.org` publicly. It is noindexed staging and the link
  changes at cutover.

## Voice

Direct, plain, sovereignty-first. No hype adjectives, no marketing tone, no
em-dashes, straight quotes only. Say the thing once, clearly. The same writing
rules as the guide apply (see the repo `CLAUDE.md`).

## Tweet library

Ready to post. Pair each with a generated image where noted.

**Ethos (evergreen, can post now)**

> If someone else runs the node, you're following their rules.
> Run your own. Validate your own transactions, connect your own wallet, ask no
> one for permission.
> No custodian, no cloud, just you and the protocol.

**Privacy tip (evergreen)**

> Stop telling strangers your balance.
> Public Electrum servers see every address your wallet asks about. Run your own
> on your own node and that leak is gone.
> RaspiBolt walks you through it.

**Community (evergreen)**

> RaspiBolt has been a community project since 2017. Dozens of contributors,
> countless issues from readers who hit a wall and reported it.
> If you run a node because of this guide, that's the whole point. Thank you.

**Launch (hold until v4 is live)**

> RaspiBolt v4 is live.
> Build your own sovereign Bitcoin and Lightning node on a Raspberry Pi. No
> custodian, no cloud, just you and the protocol.
> Start here: raspibolt.org

**v3 archive (post-launch)**

> On an older RaspiBolt? The v3 guide stays online at v3.raspibolt.org.
> For a new node, a clean v4 rebuild is the recommended path. Keep your seed and
> channel.backup, build fresh.

## Generating images

Uses Gemini 3 Pro Image (Nano Banana Pro) on Vertex AI Express, the same setup and
key as the vitrino project. Set the env first:

```bash
export GEMINI_API_KEY=...
export GOOGLE_CLOUD_PROJECT_ID=...
```

Then write a prompt from the scaffold in `brand.md` and run:

```bash
node socialmedia/generate.mjs \
  --prompt-file socialmedia/prompts/ethos.txt \
  --aspect 1:1 \
  --logo public/images/logo-dark.png \
  --out socialmedia/out/ethos.png
```

Reusable prompt templates live in `prompts/`: `ethos.txt`, `update.txt` (version
bumps, swap the software and version), and `bonus-guide.txt` (swap the guide name
and what it does). Read `brand.md` for the palette, the prompt scaffold, and what
text the model renders reliably (full sentences, monospace, numbers, and labels all
work; the exact logo does not, composite it in for launch cards).

Run renders **one at a time, not in parallel**. Concurrent calls hit HTTP 429 rate
limits; the script retries, but a serial loop is the reliable path. Proof every
render before it ships.
