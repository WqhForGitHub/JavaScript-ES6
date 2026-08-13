// 221. 虚拟DOM简化版

function h(tag, props, children = []) {
  return { tag, props: props || {}, children };
}
function render(v) {
  const el = document.createElement(v.tag);
  Object.entries(v.props).forEach(([k, val]) => el.setAttribute(k, val));
  v.children.forEach((c) => el.append(typeof c === 'string' ? c : render(c)));
  return el;
}
if (typeof document !== 'undefined')
  console.log(render(h('div', { class: 'app' }, [h('span', null, ['hello'])])).outerHTML);
