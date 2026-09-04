# 设计系统 Token 使用说明

全站 Token 的唯一维护入口是：

`styles/design-tokens.css`

可视化预览入口是：

`design-system.html`

首页、备用首页、Harbor 案例页和 Pimax 案例页均已加载该文件。

## 如何修改

### 修改全站主题颜色

- 深色主题：编辑 `:root, :root[data-theme="dark"]` 下的 `--color-*`
- 浅色主题：编辑 `:root[data-theme="light"]` 下的 `--color-*`

例如，修改 `--color-accent` 会同步影响链接光标和强调色；修改 `--color-bg` 会同步影响页面背景及转场遮罩。

### 修改字体与字号

编辑 `--font-*`。`--font-family-mono` 控制全站字体族，标题、正文、标签字号均有独立 Token。

### 修改布局密度

编辑 `--space-*`、`--page-gutter`、`--page-padding` 和 `--content-max-width`。移动端页面内边距在文件底部的媒体查询中单独维护。

### 修改圆角

编辑 `--radius-*`。作品卡片默认使用 `--radius-card`，顶栏控制器使用 `--radius-pill`。

### 修改动效

编辑 `--duration-*` 和 `--ease-*`。页面滚动平滑度由 `--scroll-smoothing` 控制：数值越大，跟随越快；数值越小，拖尾越明显。

## Token 分层约定

1. 基础层：字号、间距、圆角、时长。
2. 语义层：`--color-bg`、`--color-fg`、`--color-accent` 等描述用途的变量。
3. 组件层：页面组件只引用语义 Token，不直接写主题色值。

以后新增页面时，应先加载 `styles/design-tokens.css`，再复用现有语义 Token。只有案例独有的图片背景色或内容表现可以保留为局部值。
