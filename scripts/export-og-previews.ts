import fs from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ArticleOg } from '../src/og-components/article';
import { IdentityOg } from '../src/og-components/identity';
import { splitEditorialTitle } from '../src/og-components/theme';

const projectRoot = process.cwd();
const defaultOutDir = path.join('/tmp', `og-previews-${Date.now()}`);
const outDirArgIndex = process.argv.indexOf('--outDir');
const outDir = outDirArgIndex >= 0 && process.argv[outDirArgIndex + 1]
  ? path.resolve(process.argv[outDirArgIndex + 1])
  : defaultOutDir;

const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

const loadFont = async (relativePath: string) =>
  toArrayBuffer(await fs.readFile(path.join(projectRoot, relativePath)));

const fonts = await Promise.all([
  loadFont('node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff').then((data) => ({
    name: 'Playfair Display',
    data,
    style: 'normal' as const,
    weight: 700 as const,
  })),
  loadFont('node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff').then((data) => ({
    name: 'Playfair Display',
    data,
    style: 'normal' as const,
    weight: 400 as const,
  })),
  loadFont('node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff').then((data) => ({
    name: 'Playfair Display',
    data,
    style: 'italic' as const,
    weight: 400 as const,
  })),
  loadFont('node_modules/@fontsource/dm-sans/files/dm-sans-latin-300-normal.woff').then((data) => ({
    name: 'DM Sans',
    data,
    style: 'normal' as const,
    weight: 300 as const,
  })),
]);

const renderToPng = async (element: ReturnType<typeof createElement>, outputPath: string) => {
  console.log(`rendering ${path.basename(outputPath)}`);
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  }).render().asPng();

  await fs.writeFile(outputPath, png);
  console.log(`wrote ${path.basename(outputPath)}`);
};

await fs.mkdir(outDir, { recursive: true });

const identityPages = [
  { page: 'home' as const, file: 'og-home.png' },
  { page: 'about' as const, file: 'og-about.png' },
  { page: 'writing' as const, file: 'og-writing.png' },
  { page: 'privacy' as const, file: 'og-privacy.png' },
];

for (const item of identityPages) {
  await renderToPng(
    createElement(IdentityOg, { page: item.page }),
    path.join(outDir, item.file),
  );
}

const approvalDelayTitle = splitEditorialTitle('The Approval Delay Trap');
await renderToPng(
  createElement(ArticleOg, {
    type: 'insight',
    section: 'INSIGHT',
    titleLine1: approvalDelayTitle.line1,
    titleLine2: approvalDelayTitle.line2,
    excerpt: 'Small approval rules look harmless until they turn every important move into delayed coordination.',
  }),
  path.join(outDir, 'og-article-approval-delay.png'),
);

const durableCompaniesTitle = splitEditorialTitle('The Architecture of Durable Companies');
await renderToPng(
  createElement(ArticleOg, {
    type: 'essay',
    section: 'ESSAY',
    titleLine1: durableCompaniesTitle.line1,
    titleLine2: durableCompaniesTitle.line2,
    excerpt: 'Durable companies protect clarity as they scale instead of trading it away for short-term motion.',
  }),
  path.join(outDir, 'og-article-durable-companies.png'),
);

const manifest = {
  outDir,
  files: [
    'og-home.png',
    'og-about.png',
    'og-writing.png',
    'og-privacy.png',
    'og-article-approval-delay.png',
    'og-article-durable-companies.png',
  ].map((file) => path.join(outDir, file)),
};

await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
