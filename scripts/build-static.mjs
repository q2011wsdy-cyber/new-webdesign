import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.cwd();
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const dir of ['assets', 'styles', 'frames', 'components', 'vendor']) {
  await cp(join(root, dir), join(out, dir), { recursive: true });
}
// The editor and upload code only run on the local development server.
await rm(join(out, 'frames/admin.js'), { force: true });
for (const file of await readdir(root)) {
  if (!file.endsWith('.html') || file === 'admin.html') continue;
  let html = await readFile(join(root, file), 'utf8');
  html = html.replace('<head>', '<head>\n  <script>window.__STATIC_CONTENT__ = true;</script>');
  await writeFile(join(out, file), html);
}
const content = JSON.parse(await readFile(join(root, 'data/site-content.json'), 'utf8'));
const optimized = JSON.parse(await readFile(join(root, 'data/media-optimized.json'), 'utf8'));
function optimize(value) {
  if (Array.isArray(value)) return value.map(optimize);
  if (!value || typeof value !== 'object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, optimize(item)]));
  for (const key of ['src', 'poster']) {
    const media = optimized[result[key]];
    if (!media) continue;
    result[key] = media.src;
    if (key === 'src' && media.png) result.pngBackground = true;
  }
  return result;
}
await mkdir(join(out, 'data'));
await writeFile(join(out, 'data/site-content.json'), JSON.stringify(optimize(content)));
console.log('Static site generated. Local editor, upload endpoints and Blob are excluded.');
