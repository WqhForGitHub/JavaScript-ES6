// 234. 拖拽系统实现

function makeDraggable(el) {
  let ox = 0,
    oy = 0;
  el.addEventListener('mousedown', (e) => {
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
    document.onmousemove = (m) => {
      el.style.left = `${m.clientX - ox}px`;
      el.style.top = `${m.clientY - oy}px`;
    };
    document.onmouseup = () => (document.onmousemove = null);
  });
}
console.log('makeDraggable ready');
