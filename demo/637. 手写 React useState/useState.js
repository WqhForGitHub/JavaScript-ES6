/**
 * 手写 React useState
 *
 * React Hooks 的核心机制：
 *   - 每个函数组件对应一个 fiber，fiber 上挂一条「hooks 链表 / 数组」
 *   - 组件每次渲染时，按调用顺序从 hooks 数组中取出对应的 hook 对象
 *     （因此 hooks 必须在顶层调用、顺序稳定，不能放在条件分支里）
 *   - useState 返回 [state, setState]；setState 更新 hook.state 并触发重渲染
 *   - 真实 React 用 Object.is 比较，相等则跳过更新（bailout）
 *
 * 下面用一个极简的函数组件渲染器演示 useState 的工作原理。
 */

// ===== 极简函数组件渲染器 =====
let currentFiber = null;
let hookIndex = 0;

function createFiber(component, props) {
  return {
    component,
    props,
    hooks: [],
    output: null,
    mounted: false,
  };
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
  // 真实 React 是异步调度，这里简化为同步重渲染
  runRender(fiber);
}

function resolveHook() {
  const fiber = currentFiber;
  if (hookIndex >= fiber.hooks.length) {
    fiber.hooks.push({});
  }
  return fiber.hooks[hookIndex++];
}

// ===== useState 实现 =====
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
    if (Object.is(next, hook.state)) return; // bailout：值未变则不重渲染
    hook.state = next;
    scheduleRerender(fiber);
  };
  return [hook.state, setState];
}

// ===== 测试 =====
let setCount; // 用于在组件外触发 setState

function Counter() {
  const [count, setCountFn] = useState(0);
  setCount = setCountFn; // 暴露 setter 便于测试
  return `count=${count}`;
}

const fiber = render(Counter, {});
// render: count=0

setCount(1);
// render: count=1

setCount((c) => c + 1);
// render: count=2

setCount(2); // 值未变，不会重渲染（bailout）

setCount((c) => c + 5);
// render: count=7

// 惰性初始化：initialValue 只在首次渲染时计算
let initCalls = 0;
function Lazy() {
  const [v] = useState(() => {
    initCalls++;
    return 42;
  });
  return `v=${v}`;
}
const lazyFiber = render(Lazy, {}); // render: v=42
// 模拟重渲染（通过 setState 触发）
lazyFiber.hooks[0].state; // 42
console.log("init calls after first render:", initCalls); // 1
// 再次渲染：useState 不会再次调用 initialValue
runRender(lazyFiber); // render: v=42
console.log("init calls after second render:", initCalls); // 1
