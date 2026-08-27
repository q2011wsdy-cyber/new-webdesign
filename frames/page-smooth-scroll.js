(function pageSmoothScroll() {
  if (window.__pageSmoothScrollEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;
  window.__pageSmoothScrollEnabled = true;

  var current = window.scrollY || window.pageYOffset || 0;
  var target = current;
  var frame = 0;
  var isAnimating = false;
  var smoothing = 0.115;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(value) {
    return Math.max(0, Math.min(maxScroll(), value));
  }

  function render() {
    var distance = target - current;
    current += distance * smoothing;
    if (Math.abs(distance) < 0.45) {
      current = target;
      window.scrollTo(0, current);
      frame = 0;
      isAnimating = false;
      return;
    }
    window.scrollTo(0, current);
    frame = window.requestAnimationFrame(render);
  }

  function start() {
    if (!frame) {
      isAnimating = true;
      frame = window.requestAnimationFrame(render);
    }
  }

  window.addEventListener('wheel', function (event) {
    if (event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    var scrollable = event.target && event.target.closest && event.target.closest('[data-native-scroll], textarea, select');
    if (scrollable) return;
    event.preventDefault();
    target = clamp(target + event.deltaY);
    start();
  }, { passive: false });

  window.addEventListener('scroll', function () {
    if (!isAnimating) {
      current = window.scrollY || window.pageYOffset || 0;
      target = current;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    target = clamp(target);
    current = clamp(current);
  }, { passive: true });
})();
