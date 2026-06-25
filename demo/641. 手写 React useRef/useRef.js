/**
 * 手写 React useRef
 *
 * useRef 返回一个可变引用对象 { current: initialValue }，其特点是：
 *   - 在组件整个生命周期内，每次渲染都返回「同一个」对象（引用稳定）
 *   - 修改 ref.current 不会触发重渲染
 *   - 常用于保存 DOM 引用、定时器 id、或任意可变值
 *
 * 实现：ref 对象被存在 fiber 的 hooks 数组中，首次创建后每次直接复用，
 *   不会因渲染而重置 current。
 */

// ===== 极简函数组件渲染器 =====
let currentFiber = null;
let hookIndex = 0;
function createFiber(component, props) {
  return { component, props, hooks: [], output: null, mounted: false };
}
function runRender(fiber) {
  currentFiber = fiber;
  hookIndex = 0;
  const out = fiber.component(fiber.props);
  currentFiber = null;
  fiber.output = out;
  fiber.mounted = true;
  console.log("render:", out);
}
function render(Component, props) {
  const fiber = createFiber(Component, props || {});
  runRender(fiber);
  return fiber;
}
function scheduleRerender(fiber) {
  runRender(fiber);
}
function resolveHook() {
  const fiber = currentFiber;
  if (hookIndex >= fiber.hooks.length) fiber.hooks.push({});
  return fiber.hooks[hookIndex++];
}

// ===== useState（供测试用）=====
function useState(initialValue) {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.state =
      typeof initialValue === "function" ? initialValue() : initialValue;
    hook.initialized = true;
  }
  const setState = (action) => {
    const next = typeof action === "function" ? action(hook.state) : action;
    if (Object.is(next, hook.state)) return;
    hook.state = next;
    scheduleRerender(fiber);
  };
  return [hook.state, setState];
}

// ===== useRef 实现 =====
function useRef(initialValue) {
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.ref = { current: initialValue };
    hook.initialized = true;
  }
  return hook.ref;
}

// ===== 测试 =====
let setCount;
let timerRef; // 用于跨渲染保存定时器 id

function Stopwatch() {
  const [count, setCountFn] = useState(0);
  setCount = setCountFn;
  const ref = useRef({ id: null, label: "stopwatch" });
  timerRef = ref; // 暴露出来便于测试
  // 用 ref 记录渲染次数（修改 ref 不触发重渲染）
  if (ref.current.renderCount == null) ref.current.renderCount = 0;
  ref.current.renderCount++;
  return `count=${count}, renders=${ref.current.renderCount}`;
}

const fiber = render(Stopwatch, {});
// render: count=0, renders=1

// 渲染多次，验证 ref 对象引用不变、renderCount 累加
const refBefore = timerRef;
setCount(1);
// render: count=1, renders=2
console.log("ref 引用稳定?", refBefore === timerRef); // true

setCount(2);
// render: count=2, renders=3
console.log("renderCount =", timerRef.current.renderCount); // 3

// 直接修改 ref.current 不触发重渲染
timerRef.current.label = "updated";
console.log("label =", timerRef.current.label); // updated

// 用 ref 保存 DOM 节点（模拟）
function Input() {
  const inputRef = useRef(null);
  // 模拟挂载时拿到 DOM
  globalThis.__inputRef = inputRef;
  return "input";
}
render(Input, {});
globalThis.__inputRef.current = { value: "hello" }; // 模拟 DOM 赋值
console.log("dom value:", globalThis.__inputRef.current.value); // hello

// 验证：ref 在多次渲染间不会重置 current
function Persist() {
  const [n, setN] = useState(0);
  globalThis.__setN = setN;
  const r = useRef(0);
  r.current++; // 每次渲染自增
  return `n=${n}, ref=${r.current}`;
}
const pf = render(Persist, {}); // n=0, ref=1
globalThis.__setN(1); // n=1, ref=2
globalThis.__setN(2); // n=2, ref=3
// ref.current 持续累加，说明 ref 没有被重置
