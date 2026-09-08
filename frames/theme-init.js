/**
 * 全站主题初始化：06:00–17:59 使用浅色，18:00–05:59 使用深色。
 * 用户主动点击主题按钮后，保留手动选择。
 */
(function initAsciiTheme(global) {
  const THEME_KEY = 'ascii-theme';
  const THEME_SOURCE_KEY = 'ascii-theme-source';

  function getAsciiThemeForTime(date) {
    const hour = (date || new Date()).getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  }

  function getAsciiInitialTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const isManual = localStorage.getItem(THEME_SOURCE_KEY) === 'manual';
      if (isManual && (savedTheme === 'light' || savedTheme === 'dark')) return savedTheme;
    } catch (_) {}
    return getAsciiThemeForTime();
  }

  function markAsciiThemeManual() {
    try { localStorage.setItem(THEME_SOURCE_KEY, 'manual'); } catch (_) {}
  }

  function watchAsciiAutomaticTheme(setTheme) {
    let timer = 0;

    const isManual = () => {
      try { return localStorage.getItem(THEME_SOURCE_KEY) === 'manual'; } catch (_) { return false; }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (isManual()) return;

      const now = new Date();
      setTheme(getAsciiThemeForTime(now));

      const nextBoundary = new Date(now);
      if (now.getHours() < 6) {
        nextBoundary.setHours(6, 0, 0, 0);
      } else if (now.getHours() < 18) {
        nextBoundary.setHours(18, 0, 0, 0);
      } else {
        nextBoundary.setDate(nextBoundary.getDate() + 1);
        nextBoundary.setHours(6, 0, 0, 0);
      }
      timer = window.setTimeout(schedule, Math.max(1000, nextBoundary.getTime() - now.getTime() + 250));
    };

    const onVisibilityChange = () => {
      if (!document.hidden) schedule();
    };
    const onStorage = (event) => {
      if (event.key === THEME_KEY || event.key === THEME_SOURCE_KEY) schedule();
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorage);
    };
  }

  global.getAsciiThemeForTime = getAsciiThemeForTime;
  global.getAsciiInitialTheme = getAsciiInitialTheme;
  global.markAsciiThemeManual = markAsciiThemeManual;
  global.watchAsciiAutomaticTheme = watchAsciiAutomaticTheme;
  document.documentElement.dataset.theme = getAsciiInitialTheme();
})(window);
