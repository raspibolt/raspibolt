import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const outDir = resolve(process.cwd(), 'out/docs');
mkdirSync(outDir, { recursive: true });

const target = `${basePath}/docs/backstory/`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${target}">
<link rel="canonical" href="${target}">
<title>RaspiBolt</title>
</head>
<body>
<p>Redirecting to <a href="${target}">${target}</a>...</p>
</body>
</html>
`;

writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
console.log(`wrote out/docs/index.html -> ${target}`);

// Next emits the generated root social image without a file extension. GitHub
// Pages consequently serves it as application/octet-stream, which social-card
// crawlers reject. Publish an explicit PNG path and rewrite the generated root
// metadata to use it.
const exportDir = resolve(process.cwd(), 'out');
const rootHtmlPath = resolve(exportDir, 'index.html');
const socialImagePath = resolve(exportDir, 'opengraph-image');
const socialImagePngPath = resolve(exportDir, 'opengraph-image.png');
const socialImagePattern = /opengraph-image\?[a-zA-Z0-9]+/g;
const rootHtml = readFileSync(rootHtmlPath, 'utf8');
const rewrittenRootHtml = rootHtml.replace(socialImagePattern, 'opengraph-image.png');

if (rewrittenRootHtml === rootHtml) {
  throw new Error('Could not find the generated root social-image URL in out/index.html');
}

copyFileSync(socialImagePath, socialImagePngPath);
writeFileSync(rootHtmlPath, rewrittenRootHtml, 'utf8');
console.log('wrote out/opengraph-image.png and updated root social metadata');
