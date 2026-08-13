// 231. scrollTop计算器

function getScrollTop() {
  if (typeof document === 'undefined') return 0;
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}
console.log('scrollTop:', getScrollTop());
