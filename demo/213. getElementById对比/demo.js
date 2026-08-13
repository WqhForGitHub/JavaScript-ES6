// 213. getElementById对比

if (typeof document !== 'undefined') {
  const a = document.getElementById('app');
  const b = document.querySelector('#app');
  console.log(a === b);
  console.log('getElementById 按 id 查找，querySelector 支持 CSS 选择器');
}
