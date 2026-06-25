/**
 * 手写 React useEffect
 *
 * useEffect 用于处理副作用，它在「渲染完成（paint）之后」异步执行。
 * 依赖数组（deps）决定何时重新执行：
 *   - 不传 deps：每次渲染后都执行
 *   - 传 []：仅在挂载后执行一次
 *   - 传 [a, b]：a 或 b 变化时执行
 * 执行新 effect 前，会先调用上一次 effect 返回的 cleanup 函数。
 * 卸载时也会调用最后一次的 cleanup。
 *
 * 实现要点：
 *   - 渲染期间收集待执行的 effect（pendingEffects），渲染结束后统一 flush
 *   - 每个 hook 记录 deps 与上次 cleanup
 */

// ===== 极简函数组件渲染器 =====
let currentFiber = null;
let hookIndex = 0;
let pendingEffects = [];

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
  flushEffects();
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
function flushEffects() {
  const effects = pendingEffects;
  pendingEffects = [];
  effects.forEach((fn) => fn());
}
function depsChanged(prev, next) {
  if (prev === undefined) return true;
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return true;
  }
  return false;
}

// ===== useEffect 实现 =====
function useEffect(callback, deps) {
  const hook = resolveHook();
  const shouldRun = !hook.initialized || depsChanged(hook.deps, deps);
  hook.deps = deps;
  hook.initialized = true;
  if (shouldRun) {
    pendingEffects.push(() => {
      // 执行新 effect 前先清理上一次
      if (typeof hook.cleanup === "function") {
        hook.cleanup();
        hook.cleanup = null;
      }
      const cleanup = callback();
      hook.cleanup = typeof cleanup === "function" ? cleanup : null;
    });
  }
}

// ===== 测试 =====
let setCount;
function Timer() {
  const [count, setCountFn] = useState(0);
  setCount = setCountFn;
  useEffect(() => {
    console.log(`  [effect] subscribe, count=${count}`);
    return () => console.log(`  [cleanup] unsubscribe, count=${count}`);
  }, [count]);
  return `count=${count}`;
}

// 为了复用 useState，把 637 的 useState 内联进来
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

const fiber = render(Timer, {});
// render: count=0
//   [effect] subscribe, count=0

setCount(1);
// render: count=1
//   [cleanup] unsubscribe, count=0
//   [effect] subscribe, count=1

setCount(2);
// render: count=2
//   [cleanup] unsubscribe, count=1
//   [effect] subscribe, count=2

setCount(2); // 值未变，不重渲染
console.log("--- 卸载组件：执行最后一次 cleanup ---");
const hook0 = fiber.hooks[1];
if (typeof hook0.cleanup === "function") hook0.cleanup();
//   [cleanup] unsubscribe, count=2

// 仅挂载一次的 effect（空依赖）
console.log("\n--- 空依赖 effect：只执行一次 ---");
let setVal;
function Once() {
  const [val, setValFn] = useState(0);
  setVal = setValFn;
  useEffect(() => {
    console.log(`  [mount effect] only once`);
  }, []);
  return `val=${val}`;
}
const f2 = render(Once, {}); // render + mount effect
setVal(1); // render，但 effect 不再执行
setVal(2); // render，effect 不再执行
