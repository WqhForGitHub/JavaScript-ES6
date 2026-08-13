// 216. insertBefore测试

if (typeof document !== 'undefined') {
  const ul = document.createElement('ul'),
    a = document.createElement('li'),
    b = document.createElement('li');
  a.textContent = 'first';
  b.textContent = 'second';
  ul.appendChild(b);
  ul.insertBefore(a, b);
  console.log(ul.textContent);
}
