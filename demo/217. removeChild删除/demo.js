// 217. removeChild删除

if (typeof document !== 'undefined') {
  const box = document.createElement('div'),
    child = document.createElement('span');
  box.appendChild(child);
  box.removeChild(child);
  console.log(box.children.length);
}
