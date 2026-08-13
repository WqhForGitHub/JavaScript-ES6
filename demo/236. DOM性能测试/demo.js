// 236. DOM性能测试

function measureDomUpdate(count) {
  if (typeof document === 'undefined') return 0;
  const start = performance.now();
  const box = document.createElement('div');
  for (let i = 0; i < count; i++) box.appendChild(document.createElement('span'));
  return performance.now() - start;
}
console.log('cost:', measureDomUpdate(1000));
