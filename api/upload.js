import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async pathname => ({
        allowedContentTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'video/mp4'],
        maximumSizeInBytes: 100 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ pathname })
      }),
      onUploadCompleted: async () => {}
    });
    return response.status(200).json(result);
  } catch (error) {
    const setup = !process.env.BLOB_READ_WRITE_TOKEN
      ? '请先在 Vercel 项目中创建并连接 Blob Store。'
      : error.message;
    return response.status(500).json({ error: setup });
  }
}
