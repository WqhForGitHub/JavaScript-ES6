/**
 * 手写简易版 React（Virtual DOM + Diff）
 * Minimal React: virtual DOM creation, simple diff/patch, and a tiny component model.
 *
 * Approach:
 * - `h(type, props, ...children)` creates a VNode `{ type, props, children }`.
 *   Strings/numbers become text VNodes.
 * - `render(vnode, container)` mounts a vnode tree to a real DOM node.
 * - `diff(oldVNode, newVNode)` returns a list of patch descriptors; `patch(dom, patches)`
 *   applies them. This implementation takes a simpler "reconcile in place" approach
 *   for brevity but demonstrates key diffing ideas: replace when type differs,
 *   update text, recurse into children, set/unset props.
 * - A `Component` base class supports `setState` triggering re-render via the saved
 *   container and vnode.
 *
 * Browser-only rendering; the vnode/diff helpers are pure and testable in Node.
 */

function h(type, props = {}, ...children) {
  const flat = [];
  (function push(c) {
    if (Array.isArray(c)) c.forEach(push);
    else if (c === false || c == null) {/* skip */}
    else flat.push(typeof c === 'object' ? c : { type: 'TEXT', props: { nodeValue: String(c) }, children: [] });
  })(children);
  return { type, props, children: flat };
}

function createElement(vnode) {
  if (vnode.type === 'TEXT') {
    return document.createTextNode(vnode.props.nodeValue);
  }
  const el = document.createElement(vnode.type);
  for (const k in vnode.props) {
    if (k === 'style' && typeof vnode.props[k] === 'object') {
      Object.assign(el.style, vnode.props[k]);
    } else if (k.startsWith('on') && typeof vnode.props[k] === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), vnode.props[k]);
    } else if (k !== 'children') {
      el.setAttribute(k, vnode.props[k]);
    }
  }
  vnode.children.forEach((c) => el.appendChild(createElement(c)));
  return el;
}

function render(vnode, container) {
  container.innerHTML = '';
  container.appendChild(createElement(vnode));
  return container;
}

// Reconcile two vnodes against an existing DOM node (in-place patching).
function diff(parent, oldVNode, newVNode, index = 0) {
  const dom = parent.childNodes[index];

  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
  } else if (!newVNode) {
    parent.removeChild(dom);
  } else if (changed(oldVNode, newVNode)) {
    parent.replaceChild(createElement(newVNode), dom);
  } else if (oldVNode.type !== 'TEXT') {
    // Update props.
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};
    for (const k in oldProps) {
      if (!(k in newProps) && k !== 'children') dom.removeAttribute(k);
    }
    for (const k in newProps) {
      if (oldProps[k] !== newProps[k] && k !== 'children') {
        if (k.startsWith('on') && typeof newProps[k] === 'function') {
          dom.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
          dom.addEventListener(k.slice(2).toLowerCase(), newProps[k]);
        } else if (k === 'style' && typeof newProps[k] === 'object') {
          Object.assign(dom.style, newProps[k]);
        } else {
          dom.setAttribute(k, newProps[k]);
        }
      }
    }
    // Recurse children.
    const max = Math.max(oldVNode.children.length, newVNode.children.length);
    for (let i = max - 1; i >= 0; i--) {
      diff(dom, oldVNode.children[i], newVNode.children[i], i);
    }
  }
}

function changed(a, b) {
  return (
    typeof a !== typeof b ||
    a.type !== b.type ||
    (a.type === 'TEXT' && a.props.nodeValue !== b.props.nodeValue)
  );
}

class Component {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(partial) {
    this.state = { ...this.state, ...partial };
    if (this._rerender) this._rerender();
  }
}

// ---------- Test cases ----------
// These tests use the pure vnode API (no DOM).
const tree1 = h('div', { id: 'a' }, h('span', null, 'hello'), 'world');
console.log('tree1.type:', tree1.type); // expected: div
console.log('tree1.children count:', tree1.children.length); // expected: 2
console.log('tree1 child0 type:', tree1.children[0].type); // expected: span
console.log('tree1 child1 nodeValue:', tree1.children[1].props.nodeValue); // expected: world

// changed() helper drives diff decisions.
console.log('changed span->p:', changed(h('span'), h('p'))); // expected: true
console.log('changed text a->b:', changed(h('TEXT', { nodeValue: 'a' }), h('TEXT', { nodeValue: 'b' }))); // expected: true
console.log('changed same:', changed(h('span'), h('span'))); // expected: false

// Component setState (logic-only, no DOM).
class Counter extends Component {
  constructor(p) { super(p); this.state = { n: 0 }; }
  render() { return h('div', null, String(this.state.n)); }
}
const c = new Counter({});
let rendered = '';
c._rerender = () => { rendered = c.render().children[0].props.nodeValue; };
rendered = c.render().children[0].props.nodeValue;
console.log('initial render:', rendered); // expected: 0
c.setState({ n: 5 });
console.log('after setState:', rendered); // expected: 5
