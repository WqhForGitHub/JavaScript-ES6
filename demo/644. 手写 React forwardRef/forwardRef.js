/**
 * 手写 React forwardRef
 *
 * 函数组件默认无法接收 ref（ref 不同于 props，会被 React 单独处理）。
 * forwardRef 包装一个函数组件，使其能拿到父组件传入的 ref，
 * 并将其转发给内部某个 DOM 节点或子组件：
 *   const FancyInput = forwardRef((props, ref) => <input ref={ref} />);
 *   <FancyInput ref={myRef} />
 *
 * 实现要点：
 *   - forwardRef(render) 返回一个带 $$typeof 标记的对象，render = (props, ref) => VNode
 *   - 渲染器识别该标记，调用 render(props, ref) 并把 ref 一路传到目标 host 节点
 *   - host 节点挂载时，若有 ref 则执行 ref.current = dom
 */

// ===== mock DOM =====
function createDom(tag) {
  return { tagName: tag, attributes: {}, children: [], _text: tag === "#text" };
}

const FORWARD_REF = Symbol.for("react.forward_ref");

// ===== forwardRef 实现 =====
function forwardRef(render) {
  return {
    $$typeof: FORWARD_REF,
    render,
  };
}

// ===== createElement =====
function createElement(type, props, ...children) {
  const flat = children.flat();
  return {
    type,
    props: { ...(props || {}), children: flat },
    ref: props && props.ref ? props.ref : null,
  };
}

// ===== 渲染器 =====
function renderNode(node, parentDom) {
  if (node == null || node === false) return;
  if (typeof node === "string" || typeof node === "number") {
    const t = createDom("#text");
    t.text = String(node);
    parentDom.children.push(t);
    return;
  }
  const ref = node.ref;
  // 函数组件
  if (typeof node.type === "function") {
    const child = node.type(node.props);
    renderNode(child, parentDom);
    return;
  }
  // forwardRef 组件
  if (node.type && node.type.$$typeof === FORWARD_REF) {
    const child = node.type.render(node.props, ref);
    renderNode(child, parentDom);
    return;
  }
  // host 元素
  const dom = createDom(node.type);
  // 属性
  for (const k in node.props) {
    if (k === "children" || k === "ref") continue;
    dom.attributes[k] = node.props[k];
  }
  parentDom.children.push(dom);
  if (ref) ref.current = dom; // 转发 ref
  for (const c of node.props.children || []) renderNode(c, dom);
}

function render(node, container) {
  renderNode(node, container);
}

// ===== 序列化 =====
function serialize(node) {
  if (node._text) return node.text;
  const attrs = Object.entries(node.attributes)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");
  return `<${node.tagName}${attrs}>${node.children.map(serialize).join("")}</${node.tagName}>`;
}

// ===== useRef（用于测试）=====
function useRef(initial) {
  return { current: initial };
}

// ===== 测试 =====
// 定义一个 forwardRef 组件：把 ref 转发给内部 input
const FancyInput = forwardRef(function FancyInput(props, ref) {
  return createElement("input", { ...props, ref });
});

function App() {
  const inputRef = useRef(null);
  globalThis.__inputRef = inputRef;
  return createElement(
    "div",
    null,
    createElement(FancyInput, { ref: inputRef, placeholder: "type here" }),
    createElement("button", null, "submit"),
  );
}

const container = createDom("#root");
render(createElement(App, null), container);
console.log(serialize(container));
// <#root><div><input placeholder="type here"></input><button>submit</button></div></#root>

// ref 是否被转发到内部 input？
console.log("ref forwarded to input?", globalThis.__inputRef.current.tagName); // input
console.log(
  "placeholder:",
  globalThis.__inputRef.current.attributes.placeholder,
); // type here

// 模拟聚焦：通过 ref 直接操作内部 DOM
globalThis.__inputRef.current.attributes.value = "hello";
console.log("after set value:", serialize(container));

// 嵌套 forwardRef：外层转发给内层 forwardRef
const Inner = forwardRef((props, ref) =>
  createElement("span", { ref, ...props }),
);
const Outer = forwardRef((props, ref) =>
  createElement(Inner, { ref, ...props }),
);
const spanRef = useRef(null);
const c2 = createDom("#root");
render(createElement(Outer, { ref: spanRef }), c2);
console.log("nested ref:", spanRef.current.tagName); // span
