// Figma 410:41272. Visuals deliberately remain placeholders until supplied exports arrive.
(() => {
  const media = (id, label, width, height, nodeId) => ({type: 'placeholder', id, label, aspectRatio: `${width}/${height}`, nodeId});
  const copy = (body, variant = 'body', title = '') => ({type: 'case-copy', body, variant, title});
  const sections = [
    {id: 'project-cover', hideTitle: true, blocks: [media('01-cover', '项目封面', 1200, 675, '410:41283')]},
    {id: 'background', hideTitle: true, blocks: [
      copy('近三年框架没有变动，整体框架比较陈旧，在承载新业务上面有比较大的局限性。并且因为框架问题，随着迭代，页面功能堆砌越来越多，没有有效的组织手段，无法被更快地关注到。不同的业务结构差异越来越大，缺乏通用性。', 'background', '背景：'),
      copy('随之而来的问题就是\n1、页面越来越臃肿。\n2、开发成本越来越高。\n3、业务增长缺少新动力', 'problems'),
      copy('所以在改版的设计目标上，我们继续做一个面向未来的框架\n1、通过重构来承载业务的新增长，并减少页面冗余，\n2、统一多业务的设计语言，减少适配成本。\n3、加入情感化设计，来调动用户的正向决策意愿。', 'goals'),
      media('02-design-goals', '设计目标示意图', 1200, 600, '412:58664'),
      {type: 'gallery', columns: 2, gap: 26, frame: false, items: [
        media('03-driver-avatars', '司机头像设计', 587.234, 594.894, '410:41288'),
        media('04-icon-system', '图标设计系统', 587.234, 594.894, '411:58595'),
      ]},
      media('05-framework', '改版后的司货匹配界面', 1200, 976, '410:51169'),
    ]},
    {id: 'emotional-design', hideTitle: true, blocks: [
      copy('就讲通过把自己做单难的场景情感化，利用正向文案加场景加表情的钩子，渲染情绪，让加价更有说服力。', 'feature', '我把司机「做单难」场景情感化，\n让加价更有说服力'),
      media('06-emotional-pricing', '情感化加价场景', 1200, 1099, '410:51452'),
    ]},
    {id: 'weather-particles', hideTitle: true, blocks: [
      copy('此外，我补充了天气场景、并与研发同学共创“天气粒子系统”，使天气场景的动效与信息表达更具沉浸感与可信度。', 'feature', '“呼风唤雨”的天气粒子\n让恶劣天气更沉浸'),
      media('07-weather-particles', '天气粒子与天气场景', 1200, 1099, '410:55204'),
    ]},
    {id: 'broadcast-motion', hideTitle: true, blocks: [
      copy('叫车更远更快，这里应该是讲通过调整地图中的动效速度，提高流畅度，同时联动地图的缩放比例，去表达扩播范围的广度。所以这里主要体现两点：一个是速度，一个是广度。让用户有更明确的感知，相比以往，感知上变得更流畅、更快了。', 'feature'),
      media('08-broadcast-motion', '地图扩播动效', 1200, 1099, '410:51798'),
    ]},
    {id: 'waiting-experience', hideTitle: true, blocks: [
      copy('一系列的交互转场，来延长用户的愿等时间。在不同的时间段，让页面处于活跃的状态，并在感知层面，加强了平台努力帮助用户找车的感知', 'closing', '建立用户等待时间的预期\n强化平台找车感知'),
      media('09-waiting-experience', '等待找车的交互转场', 1200, 1099, '410:54440'),
    ]},
  ];
  const content = {
    title: 'huolala',
    subtitle: '工作期间，负责货运中，司货匹配的主链路设计，通俗来讲就是如何帮助货主更快找到适合的车的；帮助产品的指标增长的同时，在设计上平衡双方角色的体验；\n\n身为此模块的 设计owner，推动了一次大的设计改版。构建了天气粒子的设计系统，以及 AI 的运用与探索。',
    bannerCover: {src: '', alt: '货拉拉通栏封面，图片待补充'},
    className: 'huolala-case', hideIndex: true, compactCaseLayout: true,
    showMeta: false, showCover: false, hideNextNav: true, hideFooter: true,
    sections,
  };
  // The supplied case copy is Chinese; preserve it in either UI language.
  window.__workCaseData = {zh: content, en: content};
})();
