// 237. 节点批量更新

function batchAppend(container, texts) {
  const frag = document.createDocumentFragment();
  texts.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    frag.appendChild(li);
  });
  container.appendChild(frag);
}
if (typeof document !== 'undefined') batchAppend(document.createElement('ul'), ['a', 'b']);
