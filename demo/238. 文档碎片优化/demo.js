// 238. 文档碎片优化

function createRows(count) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.textContent = `row ${i}`;
    frag.appendChild(row);
  }
  return frag;
}
if (typeof document !== 'undefined') console.log(createRows(3).childNodes.length);
