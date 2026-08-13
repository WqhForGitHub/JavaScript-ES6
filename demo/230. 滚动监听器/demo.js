// 230. 滚动监听器

function onScroll(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(window.scrollY);
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}
console.log(typeof onScroll((y) => console.log(y)));
