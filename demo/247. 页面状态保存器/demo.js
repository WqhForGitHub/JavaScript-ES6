// 247. 页面状态保存器

const pageState = {
  save(key, value) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    if (typeof sessionStorage === 'undefined') return null;
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  },
};
console.log('pageState ready');
