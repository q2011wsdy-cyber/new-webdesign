import { readFile } from 'node:fs/promises';
import { list, put } from '@vercel/blob';

const contentPath = 'portfolio-content/site-content.json';
// Read the committed content snapshot so a new deployment includes case edits.
const defaultContentUrl = new URL('../data/site-content.json', import.meta.url);
async function readDefaults() {
  return JSON.parse(await readFile(defaultContentUrl, 'utf8'));
}
export function mergeContent(defaults, saved) {
  return {
    ...defaults,
    ...saved,
    cases: { ...defaults.cases, ...saved.cases }
  };
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    if (request.method === 'GET') {
      const defaults = await readDefaults();
      const result = await list({ prefix: contentPath, limit: 1 });
      if (!result.blobs.length) return response.status(200).json(defaults);
      const remote = await fetch(`${result.blobs[0].url}?v=${Date.now()}`, { cache: 'no-store' });
      if (!remote.ok) throw new Error('Unable to read saved content');
      return response.status(200).json(mergeContent(defaults, await remote.json()));
    }
    if (request.method === 'POST') {
      const content = request.body;
      if (!content || !Array.isArray(content.works) || !Array.isArray(content.play)) {
        return response.status(400).json({ error: '内容格式不正确' });
      }
      content.play = content.play.slice(0, 12);
      await put(contentPath, JSON.stringify(content, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        cacheControlMaxAge: 60
      });
      return response.status(200).json({ ok: true });
    }
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const setup = !process.env.BLOB_READ_WRITE_TOKEN
      ? '请先在 Vercel 项目中创建并连接 Blob Store。'
      : error.message;
    return response.status(500).json({ error: setup });
  }
}
