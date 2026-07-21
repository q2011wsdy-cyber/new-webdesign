/**
 * 全站共用顶栏：品牌文案、导航、主题切换、吸附与实底背景。
 * 修改此处即可同步首页与各作品详情页。
 */

function getAsciiThemePalette(dark) {
  return dark ? {
    bg: '#0b0b0b', fg: '#e6e6e6', dim: '#666', faint: '#777', mute: '#888',
    bigFg: '#f0e8d8', heading: '#aaa', line: '#2a2a2a', dot: '#222',
    green: '#6fb36f', accent: '#d97757', chatBg: '#0e0e0e',
    linkBorder: '#555', chip: '#333', chipText: '#bbb',
    curText: '#e6e6e6', curDefault: '#6fb36f',
  } : {
    bg: '#ffffff', fg: '#1a1714', dim: '#8a8578', faint: '#7a7568', mute: '#6f6a5d',
    bigFg: '#1a1714', heading: '#5a5448', line: '#c8c2b3', dot: '#d8d2c3',
    green: '#3d7a4a', accent: '#c15528', chatBg: '#ebe6d8',
    linkBorder: '#a8a295', chip: '#c8c2b3', chipText: '#3a3630',
    curText: '#1a1714', curDefault: '#3d7a4a',
  };
}

/** 导航顺序与锚点 id（与首页 section id 一致） */
const SITE_NAV_ROUTES = [
  { label: 'work', hash: 'works' },
  { label: 'writing', hash: 'writing' },
  { label: 'lab', hash: 'lab' },
  { label: 'about', hash: 'about' },
];

/**
 * @param {object} props
 * @param {string} [props.brand] 左侧品牌文案，默认 Super lee
 * @param {object} props.linkProbe 光标 hover
 * @param {boolean} props.dark
 * @param {string} props.theme
 * @param {function} props.setTheme
 * @param {string} [props.homeHrefPrefix] 详情页填 'ascii-terminal.html'，首页留空
 * @param {string} [props.brandHref] 点击品牌回首页，默认 ascii-terminal.html
 * @param {function} [props.anchorClickFactory] 首页：(href) => (e) => void；详情页不传
 */
function SiteTopbar({
  brand = 'Super lee',
  brandHref = 'ascii-terminal.html',
  linkProbe,
  dark,
  theme,
  setTheme,
  lang = 'en',
  setLang,
  homeHrefPrefix = '',
  anchorClickFactory,
}) {
  const C = getAsciiThemePalette(dark);
  const topbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -20,
    marginLeft: -32,
    marginRight: -32,
    marginBottom: 24,
    paddingTop: 20,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 10,
    color: C.faint,
    fontSize: 11,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: C.bg,
  };
  const navLinks = { display: 'flex', gap: 14, alignItems: 'center' };

  return (
    <div style={topbarStyle}>
      <a
        href={brandHref}
        {...linkProbe}
        style={{ color: C.faint, textDecoration: 'none' }}
        aria-label="回到首页">
        {brand}
      </a>
      <div style={navLinks}>
        <button
          {...linkProbe}
          type="button"
          onClick={() => setLang && setLang(lang === 'en' ? 'zh' : 'en')}
          style={{
            background: 'transparent',
            border: `1px solid ${C.line}`,
            color: C.mute,
            padding: '5px 7px',
            cursor: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            minWidth: 46,
          }}
          aria-label={lang === 'en' ? '切换为中文' : 'Switch to English'}>
          {lang === 'en' ? '中' : 'EN'}
        </button>
        <button
          {...linkProbe}
          type="button"
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          style={{
            marginLeft: 6,
            background: 'transparent',
            border: `1px solid ${C.line}`,
            color: C.mute,
            padding: '5px 7px',
            cursor: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 0,
          }}
          aria-label={dark ? '切换为浅色' : '切换为深色'}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

window.getAsciiThemePalette = getAsciiThemePalette;
window.SITE_NAV_ROUTES = SITE_NAV_ROUTES;
window.SiteTopbar = SiteTopbar;
