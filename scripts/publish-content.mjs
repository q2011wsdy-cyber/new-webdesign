import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, extname, resolve } from 'node:path';
import { list, put } from '@vercel/blob';

if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Missing BLOB_READ_WRITE_TOKEN');
const root = process.cwd();
const content = JSON.parse(await readFile(resolve(root, 'data/site-content.json'), 'utf8'));
const refs = new Set();
function walk(node, callback) {
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (['src', 'poster'].includes(key) && typeof value === 'string') callback(node, key, value);
    else if (value && typeof value === 'object') walk(value, callback);
  }
}
walk(content, (_, __, value) => { if (value.startsWith('assets/')) refs.add(value); });
for (const file of refs) await stat(resolve(root, file));
const path = 'portfolio-content/site-content.json';
const existing = await list({ prefix: path });
const current = existing.blobs.find(blob => blob.pathname === path);
if (current) {
  const response = await fetch(`${current.url}?backup=${Date.now()}`, { cache:'no-store' });
  if (!response.ok) throw new Error('Could not back up existing online content');
  const text = await response.text(); JSON.parse(text);
  await put(`portfolio-content/backups/${Date.now()}.json`, text, {access:'public',contentType:'application/json',addRandomSuffix:false});
  console.log('Existing online content backed up.');
}
const types = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4'};
const urls = new Map();
for (const file of refs) {
  const bytes = await readFile(resolve(root, file));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0,16);
  const blob = await put(`portfolio-media/imported/${hash}-${basename(file)}`, bytes, {
    access:'public',contentType:types[extname(file).toLowerCase()] || 'application/octet-stream',
    addRandomSuffix:false,allowOverwrite:true,multipart:bytes.length>4*1024*1024
  });
  urls.set(file, blob.url);
  console.log(`Media uploaded: ${urls.size}/${refs.size}`);
}
walk(content, (node,key,value) => {if(urls.has(value)) node[key]=urls.get(value);});
const saved = await put(path, JSON.stringify(content,null,2), {access:'public',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json',cacheControlMaxAge:60});
const response = await fetch(`${saved.url}?verify=${Date.now()}`,{cache:'no-store'});
if (!response.ok) throw new Error('Content saved, but verification fetch failed');
const verified = await response.json();
if (JSON.stringify(verified)!==JSON.stringify(content)) throw new Error('Saved content verification failed');
console.log(`Verified: all ${urls.size} media files and current editable content published.`);
