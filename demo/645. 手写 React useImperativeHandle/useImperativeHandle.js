/**
 * 手写 React useImperativeHandle
 *
 * useImperativeHandle 自定义「通过 ref 暴露给父组件的实例值」，
 * 避免把整个 DOM 节点暴露出去，只暴露受控的方法：
 *   useImperativeHandle(ref, () => ({ focus, clear }), []);
 *
 * 实现要点：
 *   - 类似 useLayoutEffect：在 commit 阶段同步执行
 *   - 依赖变化时重新生成 handle 并赋值给 ref
 *   - 支持函数式 ref：ref(value) 与对象式 ref：ref.current = value
 *
 * 这里复用 forwardRef 机制：子组件用 forwardRef 接收 ref，
 * 内部用 useImperativeHandle 暴露自定义 API。
 */

// ===== mock DOM =====
function createDom(tag) {
  return { tagName: tag, attributes: {}, children: [], _text: tag === "#text" };
}
const FORWARD_REF = Symbol.for("react.forward_ref");
function forwardRef(render) {
  return { $$typeof: FORWARD_REF, render };
}
function createElement(type, props, ...children) {
  return {
    type,
    props: { ...(props || {}), children: children.flat() },
    ref: props && props.ref ? props.ref : null,
  };
}

// ===== 极简 hooks 渲染器 =====
let currentFiber = null;
let hookIndex = 0;
let pendingImperative = []; // commit 阶段同步执行
function createFiber() {
  return { hooks: [], dom: null };
}
function resolveHook() {
  const fiber = currentFiber;
  if (hookIndex >= fiber.hooks.length) fiber.hooks.push({});
  return fiber.hooks[hookIndex++];
}
function depsChanged(prev, next) {
  if (prev === undefined) return true;
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++)
    if (!Object.is(prev[i], next[i])) return true;
  return false;
}
function flushImperative() {
  const arr = pendingImperative;
  pendingImperative = [];
  arr.forEach((fn) => fn());
}

// 渲染 forwardRef 组件（含 hooks）
function renderForwardRef(fwd, props, ref) {
  const fiber = createFiber();
  currentFiber = fiber;
  hookIndex = 0;
  pendingImperative = [];
  const vnode = fwd.render(props, ref);
  currentFiber = null;
  // 把 vnode 挂到 mock DOM
  const dom = mount(vnode);
  fiber.dom = dom;
  flushImperative();
  return { fiber, dom };
}
function mount(node, parentDom) {
  parentDom = parentDom || createDom("#root");
  renderNode(node, parentDom);
  return parentDom;
}
function renderNode(node, parentDom) {
  if (node == null) return;
  if (typeof node === "string") {
    const t = createDom("#text");
    t.text = node;
    parentDom.children.push(t);
    return;
  }
  const ref = node.ref;
  if (typeof node.type === "function") {
    renderNode(node.type(node.props), parentDom);
    return;
  }
  if (node.type && node.type.$$typeof === FORWARD_REF) {
    renderNode(node.type.render(node.props, ref), parentDom);
    return;
  }
  const dom = createDom(node.type);
  for (const k in node.props) {
    if (k === "children" || k === "ref") continue;
    dom.attributes[k] = node.props[k];
  }
  parentDom.children.push(dom);
  if (ref) ref.current = dom;
  for (const c of node.props.children || []) renderNode(c, dom);
}

// ===== useImperativeHandle 实现 =====
function useImperativeHandle(ref, createHandle, deps) {
  const hook = resolveHook();
  const shouldRun = !hook.initialized || depsChanged(hook.deps, deps);
  if (shouldRun) {
    hook.deps = deps;
    hook.initialized = true;
    pendingImperative.push(() => {
      const handle = createHandle();
      if (typeof ref === "function") ref(handle);
      else if (ref) ref.current = handle;
    });
  }
}

// ===== useRef / useState（供测试）=====
function useRef(initial) {
  return { current: initial };
}
function useState(initial) {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.state = initial;
    hook.initialized = true;
  }
  return [hook.state];
}

// ===== 测试 =====
// 一个自定义输入框，只暴露 focus / getValue / clear，而不暴露 DOM
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);
  // 把 inputRef 绑定到内部 input
  // 这里简化：在 mount 阶段直接给 inputRef.current 赋值
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current.attributes.autofocus = "true";
        console.log("  [FancyInput] focus()");
      },
      getValue: () => inputRef.current.attributes.value || "",
      clear: () => {
        inputRef.current.attributes.value = "";
        console.log("  [FancyInput] clear()");
      },
    }),
    [],
  );
  // 让 inputRef 指向内部 input（通过 ref 转发）
  const vnode = createElement("input", {
    ref: inputRef,
    value: props.initialValue || "",
  });
  return vnode;
});

const parentRef = useRef(null);
const { dom } = renderForwardRef(
  FancyInput,
  { initialValue: "hello" },
  parentRef,
);

console.log("ref.current 暴露的方法:", Object.keys(parentRef.current));
// [ 'focus', 'getValue', 'clear' ]
console.log("getValue():", parentRef.current.getValue()); // hello
parentRef.current.focus();
parentRef.current.clear();
console.log("after clear:", parentRef.current.getValue()); // （空）

// 验证：父组件拿不到内部 DOM 节点（只拿到自定义 handle，无 tagName）
console.log(
  "ref 不是 DOM（无 tagName）?",
  parentRef.current.tagName === undefined,
); // true
console.log(
  "serialize:",
  (function s(n) {
    if (n._text) return n.text;
    return `<${n.tagName}>${n.children.map(s).join("")}</${n.tagName}>`;
  })(dom),
);
