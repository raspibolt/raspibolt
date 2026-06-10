import { mkdirSync, writeFileSync } from 'node:fs';
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
