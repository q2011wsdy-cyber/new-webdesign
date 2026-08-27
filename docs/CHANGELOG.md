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

### v1.3 · 2026-08-27

**主题：按新版 Figma 重构 Pimax 案例**

- 以 Figma 节点 `147:83726` 为基准，重做 Pimax 案例的深色长页排布。
- 将画板中 12 个主要视觉区块完整导出为网页图片，替换旧版分段素材与文字画廊。
- 移除案例侧边目录，内容改为 940px 居中的连续视觉叙事流。
- 右上角语言、主题与关闭控件更新为新版 154 × 42px 玻璃胶囊样式。
- 保留中英文标题、项目简介、成果说明和案例返回动效。

**涉及文件**

- `work-pimax.html`
- `frames/work-harbor-page.jsx`
- `frames/site-topbar.jsx`
- `assets/works/pimax/figma-01-create.png` 至 `figma-12-audio.png`
- `docs/CHANGELOG.md`

**验证**

- 对照 Figma 画板全页截图检查视觉顺序与比例。
- 本地浏览器确认 12 张图片全部加载、无破图，页面无运行错误。

### v1.2 · 2026-08-19

**主题：补充 Pimax 案例视觉素材**

- 将 `pimax-web-image` 文件夹中的 7 张 3840 × 2160 PNG 素材完整归档到案例资源目录。
- Pimax 画廊替换为最新的 7 张素材，旧版 8 张内容不再展示；继续采用单列、完整比例、圆角展示。
- 为新增素材补充中英文标题、副文本和图片替代文字来源。
- 封面移动到项目标题上方，并隐藏封面说明与客户、年份、角色、团队信息。
- 隐藏画廊章节横线与过程清单，画廊图片间距调整为 48px。
- 将“品牌表达”移动到“视觉语言”下方，优化案例叙事顺序。

**涉及文件**

- `work-pimax.html`
- `assets/works/pimax/09-visual-language.png` 至 `15-brand-expression.png`
- `docs/CHANGELOG.md`

**验证**

- 检查 7 张新增素材文件与原始分辨率。
- 本地 Pimax 案例页浏览器检查。

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
