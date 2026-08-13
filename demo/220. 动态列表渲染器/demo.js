// 220. 动态列表渲染器

function renderList(container, data) {
  container.innerHTML = '';
  data.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    container.appendChild(li);
  });
}
if (typeof document !== 'undefined') {
  const ul = document.createElement('ul');
  renderList(ul, ['JavaScript', 'DOM']);
  console.log(ul.outerHTML);
}
