#!/usr/bin/env node
// Generate on-brand social graphics with Gemini 3 Pro Image (Nano Banana Pro)
// on Vertex AI Express Mode. Mirrors the call used in the vitrino project, so
// the same free-credit key works here unchanged.
//
// Required env (identical to vitrino):
//   GEMINI_API_KEY            Vertex AI Express key
//   GOOGLE_CLOUD_PROJECT_ID   GCP project bound to that key
//   GOOGLE_CLOUD_LOCATION     optional, defaults to "global"
//
// Usage:
//   node socialmedia/generate.mjs \
//     --prompt-file socialmedia/prompts/ethos.txt \
//     --aspect 16:9 --out socialmedia/out/ethos.png
//
//   node socialmedia/generate.mjs --prompt "..." \
//     --logo public/images/logo-dark.png --out socialmedia/out/card.png
//
// Read brand.md for the prompt scaffold and styling rules. Output goes to
// socialmedia/out/ which is gitignored: we keep the rules and tooling in git,
// not the individual renders.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

const MODEL_ID = 'gemini-3-pro-image-preview'; // Nano Banana Pro
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION?.trim() || 'global';
const MAX_ATTEMPTS = 4;

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
if (!apiKey || !projectId) {
  console.error(
    'Missing GEMINI_API_KEY and/or GOOGLE_CLOUD_PROJECT_ID.\n' +
      'Same Vertex AI Express vars the vitrino project uses. Export them first, e.g.:\n' +
      '  export GEMINI_API_KEY=...\n' +
      '  export GOOGLE_CLOUD_PROJECT_ID=...',
  );
  process.exit(2);
}

const out = arg('out', 'socialmedia/out/card.png');
const aspect = arg('aspect', '16:9'); // 16:9 | 1:1 | 9:16 | 4:3 | 3:4
const size = arg('size', '2K'); // 2K | 4K
const logoPath = arg('logo'); // optional reference image for brand fidelity
let prompt = arg('prompt');
const promptFile = arg('prompt-file');
if (!prompt && promptFile) prompt = (await readFile(resolve(promptFile), 'utf8')).trim();
if (!prompt) {
  console.error('Provide --prompt "..." or --prompt-file <path>');
  process.exit(2);
}

const parts = [{ text: prompt }];
if (logoPath) {
  const buf = await readFile(resolve(logoPath));
  const ext = extname(logoPath).toLowerCase();
  const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  parts.push({ inlineData: { mimeType, data: buf.toString('base64') } });
}

const url =
  `https://aiplatform.googleapis.com/v1/projects/${projectId}` +
  `/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;
const body = {
  contents: [{ role: 'user', parts }],
  generationConfig: {
    responseModalities: ['IMAGE'],
    imageConfig: { aspectRatio: aspect, imageSize: size },
  },
};

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    if ((resp.status === 429 || resp.status === 503) && attempt < MAX_ATTEMPTS) {
      const delay = 1500 * attempt;
      console.warn(
        `[gemini] HTTP ${resp.status} - retry ${attempt + 1}/${MAX_ATTEMPTS} in ${delay}ms`,
      );
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    console.error(`[gemini] HTTP ${resp.status}: ${errBody.slice(0, 400)}`);
    process.exit(1);
  }

  const json = await resp.json();
  const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!inline?.data) {
    console.error('[gemini] response carried no image data');
    process.exit(1);
  }
  const png = Buffer.from(inline.data, 'base64');
  await mkdir(dirname(resolve(out)), { recursive: true });
  await writeFile(resolve(out), png);
  console.log(`wrote ${out}  (${(png.length / 1024).toFixed(0)} KB, ${aspect}, ${size})`);
  break;
}
