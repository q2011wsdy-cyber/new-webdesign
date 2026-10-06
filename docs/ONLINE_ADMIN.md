# 本地编辑与线上发布

后台仅在本地运行：`npm run dev`，访问 http://127.0.0.1:4173/admin.html。
保存会更新 data/site-content.json，上传文件保存在 assets/uploads。

编辑完提交并推送 GitHub main，Vercel 会执行 npm run build，发布 dist 静态网站。
线上不提供 admin.html 和上传接口，不读取 Vercel Blob，不轮询内容。
中英文文案、素材、布局来自已提交的本地内容快照。

无损优化图片放在 assets/optimized，映射记录在 data/media-optimized.json。
发布脚本仅在生成 dist 时替换素材路径，原始素材和本地编辑数据保留。
后续新上传素材未压缩时会直接使用原文件，不会丢失。
