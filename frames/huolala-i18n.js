// Media and layout are shared; translations override only editable text fields.
(() => {
  const fields = new Set(['title', 'subtitle', 'body', 'intro', 'caption', 'alt', 'label', 'value']);
  function entries(root) {
    const result = [];
    function walk(node, path) {
      if (Array.isArray(node)) return node.forEach((item, index) => walk(item, `${path}.${item.id || item.variant || index}`));
      if (!node || typeof node !== 'object') return;
      for (const [key, value] of Object.entries(node)) {
        const location = `${path}.${key}`;
        if (fields.has(key) && typeof value === 'string') result.push({object:node, key, path:location, value});
        else if (value && typeof value === 'object' && key !== '_pending') walk(value, location);
      }
    }
    walk(root, 'case');
    return result;
  }
  window.huolalaTextEntries = entries;
  window.buildHuolalaEnglish = (chinese, overrides = {}) => {
    const english = structuredClone(chinese);
    const defaults = new Map(entries(window.__workCaseData.en).map(item => [item.path, item.value]));
    for (const item of entries(english)) {
      item.object[item.key] = Object.hasOwn(overrides, item.path)
        ? overrides[item.path] : (defaults.get(item.path) ?? item.value);
    }
    return english;
  };
})();
