# 案例详情配置规范

> 适用范围：所有已发布案例详情页  
> 配置入口：`window.__workCaseData.en` / `window.__workCaseData.zh`

## 1. 必填基础信息

每个语言版本都必须包含以下字段：

```js
{
  title: '案例标题',
  subtitle: '案例副标题或一句话简介',
  cover: {
    src: 'assets/works/example/cover.png',
    alt: '封面内容描述',
    caption: '可选的封面说明',
    fit: 'cover' // cover 或 contain
  }
}
```

缺少 `title`、`subtitle` 或 `cover.src` 时，详情页会显示配置错误，不会把不完整案例当作已发布页面呈现。

## 2. 可选信息

```js
{
  accent: '标题中的强调文字',
  client: '客户',
  year: '2026',
  role: '产品设计',
  team: '1 位设计师，2 位工程师',
  // 或使用自定义元信息：
  meta: [
    { label: '平台', value: 'iOS / Android' },
    { label: '周期', value: '12 周' }
  ],
  nextLabel: '下一个 · 03',
  nextTitle: '下一个案例 →'
}
```

## 3. 自定义区块

`sections` 决定详情页正文结构和左侧导航。背景、过程、画廊、成果只是推荐命名，不是固定模板。

```js
sections: [
  {
    id: 'context',       // 页面锚点，单个案例内唯一
    title: '背景',        // 左侧导航与区块标题
    accent: false,       // 可选，使用强调色
    blocks: []           // 按顺序渲染的内容块
  }
]
```

可以调整区块顺序、改名、删除或新增区块。例如可新增“研究”“设计系统”“复盘”。

## 4. 内容块类型

### 纯文本 `text`

```js
{ type: 'text', title: '问题', subtitle: '可选副标题', body: '支持\n换行的正文。' }
```

### 图片 `image`

PNG、JPG、WebP、GIF 等浏览器图片格式均使用此类型。

```js
{
  type: 'image',
  src: 'assets/works/example/image.png',
  alt: '图片说明',
  title: '图片标题',
  subtitle: '图片副文本',
  caption: '可选图注',
  fit: 'contain',
  radius: 16
}
```

### 视频 `video`

```js
{
  type: 'video',
  src: 'assets/works/example/demo.mp4',
  poster: 'assets/works/example/poster.jpg',
  title: '交互演示',
  subtitle: '视频副文本',
  controls: true,
  autoplay: false,
  loop: false,
  muted: true,
  aspectRatio: '16/9',
  radius: 16
}
```

### Lottie / JSON `lottie`

```js
{
  type: 'lottie', // type: 'json' 也支持
  src: 'assets/works/example/animation.json',
  alt: '动画内容描述',
  title: '动效方案',
  subtitle: '动画副文本',
  autoplay: true,
  loop: true,
  aspectRatio: '16/9',
  radius: 16
}
```

Lottie 由项目本地的 `vendor/lottie.min.js` 渲染。也可以通过 `data` 字段直接传入已经解析的 JSON 对象。

### 文配媒体 `text-media`

```js
{
  type: 'text-media',
  text: { title: '设计目标', body: '文字位于左侧。' },
  media: { type: 'image', src: 'assets/works/example/image.png', alt: '设计画面' }
}
```

### 媒体配文 `media-text`

```js
{
  type: 'media-text',
  media: { type: 'video', src: 'assets/works/example/demo.mp4' },
  text: { title: '设计结果', body: '媒体位于左侧，文字位于右侧。' }
}
```

手机端会自动变为单列，仍保持配置中的先后顺序。

### 画廊 `gallery`

```js
{
  type: 'gallery',
  columns: 1,
  gap: 20,
  radius: 16,
  fit: 'contain',
  items: [
    { src: 'assets/works/example/01.png', title: '标题', subtitle: '副文本', alt: '说明' },
    { src: 'assets/works/example/02.png', title: '标题', subtitle: '副文本', alt: '说明' }
  ]
}
```

### 流程 `steps`

```js
{
  type: 'steps',
  intro: '三轮迭代，一套系统。',
  command: '$ history | tail', // 不需要时省略
  items: ['研究', '定义', '原型', '测试', '交付'],
  specs: [['工具', 'Figma'], ['周期', '8 周']] // 不需要时省略
}
```

### 嵌套内容 `stack`

```js
{ type: 'stack', gap: 32, blocks: [/* 任意内容块 */] }
```

## 5. 发布检查

- [ ] 中英文配置均包含标题、副标题、封面和封面 `alt`。
- [ ] 每个 `section.id` 唯一，且只使用英文、数字和短横线。
- [ ] 图片和视频路径能从静态网站根目录访问。
- [ ] 自动播放视频必须静音，并保留 `playsInline`。
- [ ] Lottie JSON 使用受信任的本地文件，动画在明暗主题下都可辨识。
- [ ] 桌面端和手机端均检查文配图、图配文的顺序。
- [ ] 更新详情模板后同步更新 HTML 中的脚本版本号。

