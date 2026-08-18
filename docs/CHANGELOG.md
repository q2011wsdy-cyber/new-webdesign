# 更新日志｜Super Lee Portfolio

> 用途：每次网站更新都在此留档。提交到 GitHub 后，版本记录与代码提交可相互对应。

## 记录规则

每次更新前后，请新增一个版本块，至少记录：

- 日期与版本号（可使用 `v1.0.1` 或 `YYYY.MM.DD`）。
- 更新目的。
- 变更内容与涉及页面。
- 是否新增 / 替换素材。
- 验证方式与 Git 提交号。

## 当前版本

### v1.1 · 2026-08-06

**主题：案例详情升级为可编排内容架构**

- 明确已发布案例的必填基础信息：标题、副标题与封面。
- 将背景、过程、画廊、成果改为可自定义的 `sections[]`，名称和顺序不再写死。
- 新增文字、图片、视频、Lottie/JSON、文配媒体、媒体配文、画廊、流程和嵌套内容块。
- Harbor 与 Pimax 已迁移到同一内容块渲染器。
- 新增案例配置规范与发布检查清单。

**涉及文件**

- `frames/work-harbor-page.jsx`
- `work-harbor.html`、`work-pimax.html`
- `vendor/lottie.min.js`
- `docs/CASE_CONFIG.md`、`docs/PRODUCT_ARCHITECTURE.md`、`docs/PRD.md`

**验证**

- 基础字段缺失校验
- 内容块静态语法检查
- Harbor / Pimax 本地页面检查

### v1.0 · 2026-08-05

**主题：Pimax 案例上线与首页精简**

- 新增 `work-pimax.html`，支持中英文内容与共享详情页模板。
- Pimax 年份设为 2024；隐藏规格表、鸣谢与过程终端提示。
- 新增 8 张 Pimax 画廊素材，单列完整展示，增加圆角、标题和副文本。
- 首页新增 Pimax 案例入口；保留案例卡片进入/返回转场。
- 调整案例素材为等比例显示，改善响应式浏览。
- 优化 Hero 头像进入动效与介绍文字字重。
- 移除首页 Writing、Lab、Contact 区块。

**涉及文件**

- `ascii-terminal.html`、`index.html`
- `frames/01-ascii-terminal.jsx`
- `frames/work-harbor-page.jsx`
- `work-harbor.html`、`work-pimax.html`
- `assets/works/pimax/*`

**验证**

- 本地预览：`http://127.0.0.1:4173/ascii-terminal.html`
- Git 提交：`e28cb1f Add Pimax case study and refine homepage`
- GitHub 分支：`main`

## 历史版本

### 2026-07

- 优化案例图片自适应比例与页面交互。
- 优化顶栏、液态玻璃控件、光标及个人头像动效。

## 更新模板

复制以下内容，在“当前版本”上方新增记录：

```md
### vX.Y · YYYY-MM-DD

**主题：一句话说明本次更新目的**

- 变更 1：
- 变更 2：
- 新增 / 替换素材：

**涉及页面 / 文件**

- 

**验证**

- 本地预览：
- Git 提交：
- GitHub 分支：
```
