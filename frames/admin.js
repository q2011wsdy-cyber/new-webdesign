const workEditor = document.getElementById('work-editor');
const workCount = document.getElementById('work-count');
const playEditor = document.getElementById('play-editor');
const playCount = document.getElementById('play-count');
const statusEl = document.getElementById('status');
const defaultContent = {
  works: [
    { id: '02', title: 'Pimax', description: 'A smart light string experience.', href: 'work-pimax.html', cover: null },
    { id: '01', title: 'Huolala', description: 'A simpler way to move goods.', href: 'work-huolala.html', cover: null }
  ],
  play: []
};
let content = structuredClone(defaultContent);

const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const fileType = file => file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4') ? 'video' : 'image';
const fileToDataUrl = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

async function readJson(response) {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(response.ok ? '服务器返回了无法识别的内容' : `接口不可用（${response.status}）`); }
  if (!response.ok) throw new Error(data.error || `请求失败（${response.status}）`);
  return data;
}

function notify(message) {
  statusEl.textContent = message;
  statusEl.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => statusEl.classList.remove('show'), 2600);
}

function mediaMarkup(media, fallback = '') {
  if (!media || !media.src) return `<span class="empty">${fallback || '使用当前默认封面'}</span>`;
  return media.type === 'video'
    ? `<video src="${escapeHtml(media.src)}" muted loop autoplay playsinline></video>`
    : `<img src="${escapeHtml(media.src)}" alt="">`;
}

function renderWorks() {
  workCount.textContent = `${content.works.length} 个案例`;
  workEditor.innerHTML = content.works.map((work, index) => `
    <article class="work-form" data-work-index="${index}">
      <div class="media-preview">${mediaMarkup(work._pending || work.cover)}</div>
      <div class="field-stack">
        <label class="field">标题<input data-key="title" type="text" value="${escapeHtml(work.title)}"></label>
        <label class="field">描述<input data-key="description" type="text" value="${escapeHtml(work.description)}"></label>
        <label class="field">链接<input data-key="href" type="text" value="${escapeHtml(work.href)}"></label>
        <div class="cover-actions">
          <label class="upload-button">上传封面<input class="work-upload" type="file" accept=".webp,.png,.jpg,.jpeg,.gif,.mp4,image/webp,image/png,image/jpeg,image/gif,video/mp4"></label>
          <button class="remove-cover" type="button">恢复默认封面</button>
          <button class="remove-work" type="button">删除案例</button>
        </div>
      </div>
    </article>`).join('');
}

function renderPlay() {
  playCount.textContent = `${content.play.length} / 12`;
  playEditor.innerHTML = content.play.length ? content.play.map((item, index) => `
    <article class="play-item" data-play-index="${index}">
      <div class="media-preview">${mediaMarkup(item._pending || item)}</div>
      <input class="play-alt" type="text" aria-label="图片描述" placeholder="图片描述" value="${escapeHtml(item.alt)}">
      <div class="item-actions">
        <button class="move-left" type="button" ${index === 0 ? 'disabled' : ''}>← 前移</button>
        <button class="move-right" type="button" ${index === content.play.length - 1 ? 'disabled' : ''}>后移 →</button>
        <button class="remove-play" type="button">删除</button>
      </div>
    </article>`).join('') : '<p style="grid-column:1/-1;color:#999;margin:32px;text-align:center">上传第一张图片或视频</p>';
}

workEditor.addEventListener('input', event => {
  const article = event.target.closest('[data-work-index]');
  if (!article || !event.target.dataset.key) return;
  content.works[Number(article.dataset.workIndex)][event.target.dataset.key] = event.target.value;
});

workEditor.addEventListener('change', async event => {
  if (!event.target.classList.contains('work-upload') || !event.target.files[0]) return;
  const index = Number(event.target.closest('[data-work-index]').dataset.workIndex);
  const file = event.target.files[0];
  content.works[index]._pending = { src: await fileToDataUrl(file), type: fileType(file), file };
  renderWorks();
});

workEditor.addEventListener('click', event => {
  const article = event.target.closest('[data-work-index]');
  if (!article) return;
  const index = Number(article.dataset.workIndex);
  if (event.target.classList.contains('remove-cover')) {
    content.works[index].cover = null;
    delete content.works[index]._pending;
  } else if (event.target.classList.contains('remove-work')) {
    content.works.splice(index, 1);
  } else return;
  renderWorks();
});

document.getElementById('add-work').addEventListener('click', () => {
  content.works.push({
    id: `work-${Date.now()}`,
    title: 'New case',
    description: 'Add a short project description.',
    href: '#',
    cover: null
  });
  renderWorks();
  workEditor.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('play-upload').addEventListener('change', async event => {
  const room = 12 - content.play.length;
  const selectedCount = event.target.files.length;
  const files = Array.from(event.target.files).slice(0, room);
  for (const file of files) {
    content.play.push({ alt: file.name.replace(/\.[^.]+$/, ''), _pending: { src: await fileToDataUrl(file), type: fileType(file), file } });
  }
  event.target.value = '';
  renderPlay();
  if (files.length < selectedCount) notify('最多只能保留 12 项');
});

playEditor.addEventListener('input', event => {
  if (!event.target.classList.contains('play-alt')) return;
  const index = Number(event.target.closest('[data-play-index]').dataset.playIndex);
  content.play[index].alt = event.target.value;
});

playEditor.addEventListener('click', event => {
  const article = event.target.closest('[data-play-index]');
  if (!article) return;
  const index = Number(article.dataset.playIndex);
  if (event.target.classList.contains('remove-play')) content.play.splice(index, 1);
  if (event.target.classList.contains('move-left') && index > 0) [content.play[index - 1], content.play[index]] = [content.play[index], content.play[index - 1]];
  if (event.target.classList.contains('move-right') && index < content.play.length - 1) [content.play[index + 1], content.play[index]] = [content.play[index], content.play[index + 1]];
  renderPlay();
});

async function uploadPending(pending) {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    const { upload } = await import('https://esm.sh/@vercel/blob@2/client');
    const safeName = pending.file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
    const blob = await upload(`portfolio-media/${Date.now()}-${safeName}`, pending.file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      multipart: pending.file.size > 4 * 1024 * 1024
    });
    return { src: blob.url, type: fileType(pending.file) };
  }
  const response = await fetch('/api/upload', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: pending.file.name, data: pending.src })
  });
  return readJson(response);
}

document.getElementById('save-all').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  caseEditor.inert = true;
  button.textContent = '保存中…';
  try {
    for (const work of content.works) {
      if (work._pending) { work.cover = await uploadPending(work._pending); delete work._pending; }
    }
    for (const item of content.play) {
      if (item._pending) { Object.assign(item, await uploadPending(item._pending)); delete item._pending; }
    }
    await saveCaseUploads();
    const payload = { ...content, works: content.works.map(({ _pending, ...work }) => work), play: content.play.map(({ _pending, ...item }) => item) };
    const response = await fetch('/api/content', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(payload) });
    await readJson(response);
    content = payload;
    caseDirty = false;
    if ('BroadcastChannel' in window) { const channel = new BroadcastChannel('portfolio-content'); channel.postMessage('updated'); channel.close(); }
    renderWorks(); renderPlay(); renderCase(); notify('已保存，首页与案例已同步');
  } catch (error) { notify(error.message); }
  finally { button.disabled = false; caseEditor.inert = false; button.textContent = '保存并同步'; }
});

fetch('/api/content', { cache:'no-store' })
  .then(readJson)
  .then(data => { content = data; document.getElementById('save-all').disabled = false; initializeCase(); renderWorks(); renderPlay(); renderCase(); })
  .catch(() => { document.getElementById('save-all').disabled = true; notify('内容加载失败，请刷新重试'); });

// Case rows retain the original layout metadata and stable asset slots.
const caseEditor = document.getElementById('case-editor');
let caseRows = [];
let caseTextPaths = new WeakMap();
let caseDefaultEnglish = new Map();
let caseDirty = false;
let caseBusy = 0;
const sectionNames = { 'project-cover':'项目封面', background:'项目背景与设计目标', 'emotional-design':'情感化设计', 'weather-particles':'天气粒子', 'broadcast-motion':'地图扩播', 'waiting-experience':'等待体验' };
function initializeCase() {
  content.cases ||= {};
  content.cases.huolala ||= structuredClone(window.__workCaseData.zh);
  content.cases.huolalaEnglish ||= {overrides:{}};
  content.cases.huolalaEnglish.overrides ||= {};
  const detailSection = content.cases.huolala.sections.find(section => section.id === 'emotional-design');
  const detailGallery = detailSection?.blocks.find(block => block.id === 'pricing-details');
  for (const item of detailGallery?.items || []) item.invertOnTheme = 'dark';
}
function caseField(object, key, label, multiline = false) {
  const row = caseRows.push({object}) - 1;
  const chinese = `<label class="field">${label}${multiline
    ? `<textarea data-row="${row}" data-field="${key}" rows="5">${escapeHtml(object[key])}</textarea>`
    : `<input type="text" data-row="${row}" data-field="${key}" value="${escapeHtml(object[key])}">`}</label>`;
  const fields = caseTextPaths.get(object);
  let path = fields?.[key];
  if (!path && fields && ['title','body','intro','alt','caption','subtitle'].includes(key)) {
    const known = Object.values(fields)[0];
    path = `${known.slice(0, known.lastIndexOf('.'))}.${key}`;
    object[key] ||= ''; fields[key] = path;
  }
  if (!path) return chinese;
  const overrides = content.cases.huolalaEnglish.overrides;
  const custom = Object.hasOwn(overrides, path);
  const value = custom ? overrides[path] : (caseDefaultEnglish.get(path) || '');
  const english = `<label class="field">英文 · ${custom ? '你的译文' : '默认译文'}${multiline
    ? `<textarea data-english-path="${escapeHtml(path)}" rows="5">${escapeHtml(value)}</textarea>`
    : `<input type="text" data-english-path="${escapeHtml(path)}" value="${escapeHtml(value)}">`}</label>`;
  return `<div class="case-bilingual-fields">${chinese}<div>${english}${custom ? `<button class="translation-reset" data-reset-english="${escapeHtml(path)}">恢复默认译文</button>` : ''}</div></div>`;
}

function renderCaseBlock(block, list, index) {
  const row = caseRows.push({object:block, list, index}) - 1;
  if (block.type === 'gallery') return `<div class="case-gallery-editor">${block.items.map((item,i) => renderCaseBlock(item,block.items,i)).join('')}</div>`;
  const actions = block === content.cases.huolala.bannerCover || !list.length ? '' : `<div class="item-actions"><button data-action="up" data-row="${row}" ${index===0?'disabled':''}>↑ 上移</button><button data-action="down" data-row="${row}" ${index===list.length-1?'disabled':''}>↓ 下移</button><button data-action="delete" data-row="${row}">移除内容</button></div>`;
  if (block.type === 'weather-tabs') return `<article class="case-edit-block"><p class="eyebrow">天气切换 · 默认下雪天</p><p>每个天气可独立上传图片或视频，素材显示在同一个手机容器中。</p>${block.options.map(option => `<div>${caseField(option,'label','选项名称')}${renderCaseBlock(option.media,[],0)}</div>`).join('')}${actions}</article>`;
  if (block.type === 'comparison') return `<article class="case-edit-block"><p class="eyebrow">BEFORE / AFTER · 鼠标移动对比</p><p>分别上传比例相同的两张界面。两侧共用背景与居中位置，鼠标左右移动即可切换。</p><div class="case-compare-editors">${renderCaseBlock(block.before,[],0)}${renderCaseBlock(block.after,[],0)}</div>${caseField(block,'caption','对比说明')}${actions}</article>`;
  if (['case-copy','text'].includes(block.type)) return `<article class="case-edit-block"><p class="eyebrow">文字</p>${caseField(block,'title','标题')}${['problems','goals'].includes(block.variant) ? caseField(block,'intro','标题下的说明') : ''}${caseField(block,'body',['problems','goals'].includes(block.variant) ? '卡片内容（每行一项，标题与说明用 ｜ 分隔）' : '正文',true)}${actions}</article>`;
  return `<article class="case-edit-block case-media-editor"><div><p class="eyebrow">${escapeHtml(block.label || block.id || '素材')}</p><div class="media-preview">${mediaMarkup(block._pending || block,'待上传图片或视频')}</div><div class="cover-actions"><label class="upload-button">上传 / 替换素材<input type="file" data-upload-row="${row}" accept="${block.imageOnly ? '.webp,.png,.jpg,.jpeg,.gif' : '.webp,.png,.jpg,.jpeg,.gif,.mp4'}"></label><button data-action="clear" data-row="${row}">清空素材</button></div></div><div class="field-stack">${caseField(block,'alt','素材描述')}${caseField(block,'caption','图片 / 视频说明')}${caseField(block,'aspectRatio','显示比例（如 1200/675，留空使用原比例）')}${(block._pending?.type || block.type)==='video' ? `<div class="video-options">${[['autoplay','自动播放'],['loop','循环播放'],['muted','静音'],['controls','显示播放控件']].map(([key,label])=>`<label><input type="checkbox" data-row="${row}" data-field="${key}" ${block[key] || (['muted','controls'].includes(key)&&block[key]!==false)?'checked':''}> ${label}</label>`).join('')}</div>` : ''}${actions}</div></article>`;
}
function renderCase() {
  if (!content.cases?.huolala) return;
  caseRows = [];
  const c = content.cases.huolala;
  caseTextPaths = new WeakMap();
  for (const item of window.huolalaTextEntries(c)) {
    const map = caseTextPaths.get(item.object) || {};
    map[item.key] = item.path; caseTextPaths.set(item.object, map);
  }
  caseDefaultEnglish = new Map(window.huolalaTextEntries(window.buildHuolalaEnglish(c)).map(item => [item.path, item.value]));
  caseEditor.innerHTML = `<div class="case-edit-block"><p class="eyebrow">案例简介</p>${caseField(c,'title','案例名称')}${caseField(c,'subtitle','简介',true)}</div>
    <details class="case-edit-section"><summary>通栏封面</summary>${renderCaseBlock(c.bannerCover, [c.bannerCover],0)}</details>` + c.sections.map((section,index) => `<details class="case-edit-section" open><summary><span>${String(index+1).padStart(2,'0')}</span> ${escapeHtml(sectionNames[section.id] || section.title || section.id)}</summary>${section.blocks.map((block,i)=>renderCaseBlock(block,section.blocks,i)).join('')}<div class="cover-actions"><button data-add="image" data-section="${index}">＋ 图片 / 视频</button><button data-add="text" data-section="${index}">＋ 文字</button><button data-add="comparison" data-section="${index}">＋ 前后对比</button></div></details>`).join('');
}
caseEditor.addEventListener('input', event => {
  if (event.target.dataset.englishPath) {
    content.cases.huolalaEnglish.overrides[event.target.dataset.englishPath] = event.target.value;
    caseDirty = true; return;
  }
  const {row,field} = event.target.dataset;
  if (row===undefined || !field) return;
  caseRows[row].object[field] = event.target.type==='checkbox' ? event.target.checked : event.target.value;
  caseDirty = true;
});
caseEditor.addEventListener('change', async event => {
  const row = event.target.dataset.uploadRow;
  const file = event.target.files?.[0];
  if (row===undefined || !file) return;
  if (!/\.(webp|png|jpe?g|gif|mp4)$/i.test(file.name)) { notify('请选择图片、GIF 或 MP4 视频'); return; }
  if (file.size > 100*1024*1024) { notify('文件超过 100 MB，请压缩后上传'); return; }
  const block = caseRows[row].object;
  if (block.imageOnly && fileType(file) === 'video') { notify('前后对比请上传图片'); return; }
  caseBusy++;
  document.getElementById('save-all').disabled = true;
  try {
    block._pending = {src:await fileToDataUrl(file),type:fileType(file),file};
    block.alt ||= file.name.replace(/\.[^.]+$/,'');
    caseDirty = true;
    renderCase(); notify('素材已加入，点击保存并同步后生效');
  } catch { notify('素材读取失败，请重试'); }
  finally { caseBusy--; document.getElementById('save-all').disabled = caseBusy>0; }
});
caseEditor.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || caseBusy) return;
  if (button.dataset.resetEnglish) {
    delete content.cases.huolalaEnglish.overrides[button.dataset.resetEnglish];
    caseDirty = true; renderCase(); return;
  }
  if (button.dataset.add) {
    const blocks = content.cases.huolala.sections[button.dataset.section].blocks;
    if (button.dataset.add === 'comparison') {
      const id = `comparison-${Date.now()}`;
      blocks.push({type:'comparison',id,before:{type:'placeholder',id:`${id}-before`,label:'Before / 改版前',imageOnly:true},after:{type:'placeholder',id:`${id}-after`,label:'After / 改版后',imageOnly:true}});
      caseDirty = true; renderCase(); return;
    }
    blocks.push(button.dataset.add==='text' ? {type:'case-copy',variant:'body',title:'',body:''} : {type:'placeholder',id:`media-${Date.now()}`,label:'新素材',frame:false,radius:20});
  } else if (button.dataset.action) {
    const {object,list,index} = caseRows[button.dataset.row];
    switch (button.dataset.action) {
      case 'up': if(index>0) [list[index-1],list[index]]=[list[index],list[index-1]]; break;
      case 'down': if(index<list.length-1) [list[index+1],list[index]]=[list[index],list[index+1]]; break;
      case 'delete': list.splice(index,1); break;
      case 'clear': delete object._pending; delete object.src; object.type='placeholder'; object.id ||= 'banner'; object.label ||= '待上传素材'; break;
    }
  } else return;
  caseDirty = true; renderCase();
});
async function saveCaseUploads() {
  async function visit(value) {
    if (!value || typeof value!=='object') return;
    if (value._pending) { Object.assign(value,await uploadPending(value._pending)); delete value._pending; value.frame=false; value.radius=20; delete value.aspectRatio; delete value.height; }
    for(const child of Object.values(value)) await visit(child);
  }
  await visit(content.cases);
  content.cases.huolalaEnglish.content = window.buildHuolalaEnglish(content.cases.huolala, content.cases.huolalaEnglish.overrides);
}
window.addEventListener('beforeunload', event => { if(caseDirty) { event.preventDefault(); event.returnValue=''; } });
