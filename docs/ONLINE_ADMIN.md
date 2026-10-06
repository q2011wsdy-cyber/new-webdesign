# 在线后台

线上入口为网站域名下的 `/admin.html`。货拉拉案例、中英文文案、前后对比图片与首页内容使用同一保存接口。

## Vercel 设置

在项目 Storage 中连接一个 public Vercel Blob Store，确保 `BLOB_READ_WRITE_TOKEN` 对 Production 和需要的 Preview 环境可用。连接或调整环境变量后重新部署。

初次读取使用 GitHub 中 `data/site-content.json` 的内容。若 Blob 中已有旧首页数据，会保留它并补上仓库中的案例数据。在线保存后以 Blob 中的内容为准，重新部署不会覆盖已保存的案例。

图片和视频直接上传到 Blob；内容保存在 `portfolio-content/site-content.json`。自定义域名与 `.vercel.app` 均支持。没有配置 Blob 时后台会提示配置错误，并禁止保存，避免覆盖原内容。

## GitHub 与后台的关系

GitHub 保存网站代码与初始内容；在 GitHub 推送更新后，关联的 Vercel 项目会按其部署设置构建网站。在线后台的日常编辑保存到 Vercel Blob，不会自动写入 GitHub。仓库中的本地上传素材必须随代码提交才能用于初始内容。

## 验证

打开线上 `/admin.html`，检查货拉拉章节和英文编辑栏。修改一条文案，保存后刷新案例页面确认；再上传一个图片或 MP4 确认能预览与保存。
