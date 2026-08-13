// 218. classList操作器

if (typeof document !== 'undefined') {
  const el = document.createElement('div');
  el.classList.add('active');
  el.classList.toggle('hidden');
  el.classList.remove('active');
  console.log(el.className);
}
