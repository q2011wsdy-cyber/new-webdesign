const workEditor = document.getElementById('work-editor');
const workCount = document.getElementById('work-count');
const playEditor = document.getElementById('play-editor');
const playCount = document.getElementById('play-count');
const statusEl = document.getElementById('status');
const defaultContent = {
  works: [
    { id: '02', title: 'Pimax', description: 'A smart light string experience.', href: 'work-pimax.html', cover: null },
    { id: '01', title: 'Huolala', description: 'A simpler way to move goods.', href: 'work-harbor.html', cover: null }
  ],
  play: []
};
let content = structuredClone(defaultContent);

const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const fileType = file => file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4') ? 'video' : 'image';
const fileToDataUrl = file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });

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
  const response = await fetch('/api/upload', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: pending.file.name, data: pending.src })
  });
  if (!response.ok) throw new Error((await response.json()).error || '上传失败');
  return response.json();
}

document.getElementById('save-all').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = '保存中…';
  try {
    for (const work of content.works) {
      if (work._pending) { work.cover = await uploadPending(work._pending); delete work._pending; }
    }
    for (const item of content.play) {
      if (item._pending) { Object.assign(item, await uploadPending(item._pending)); delete item._pending; }
    }
    const payload = { works: content.works.map(({ _pending, ...work }) => work), play: content.play.map(({ _pending, ...item }) => item) };
    const response = await fetch('/api/content', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(payload) });
    if (!response.ok) throw new Error((await response.json()).error || '保存失败');
    content = payload;
    if ('BroadcastChannel' in window) { const channel = new BroadcastChannel('portfolio-content'); channel.postMessage('updated'); channel.close(); }
    renderWorks(); renderPlay(); notify('已保存并同步到首页');
  } catch (error) { notify(error.message); }
  finally { button.disabled = false; button.textContent = '保存并同步'; }
});

fetch('/api/content', { cache:'no-store' })
  .then(response => response.ok ? response.json() : Promise.reject(new Error('读取失败')))
  .then(data => { content = data; renderWorks(); renderPlay(); })
  .catch(() => { renderWorks(); renderPlay(); notify('正在使用默认内容'); });
