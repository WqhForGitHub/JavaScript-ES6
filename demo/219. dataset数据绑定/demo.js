// 219. dataset数据绑定

if (typeof document !== 'undefined') {
  const btn = document.createElement('button');
  btn.dataset.action = 'save';
  btn.dataset.id = '1001';
  console.log(btn.dataset.action, btn.dataset.id);
}
