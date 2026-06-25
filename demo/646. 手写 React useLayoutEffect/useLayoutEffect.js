/**
 * 手写 React useLayoutEffect
 *
 * useLayoutEffect 与 useEffect 的签名、依赖逻辑完全相同，区别在执行时机：
 *   - useLayoutEffect：在 DOM 变更后「同步」执行，在浏览器 paint 之前
 *     适合需要读取/同步修改 DOM 布局的场景（如测量尺寸后设置样式）
 *   - useEffect：在 paint 之后「异步」执行，不阻塞视觉更新
 *
 * 执行顺序：render -> DOM commit -> useLayoutEffect(同步) -> 浏览器 paint -> useEffect(异步)
 *
 * 实现要点：
 *   - 用两条独立的待执行队列：layoutEffects（commit 后同步 flush）、passiveEffects（之后 flush）
 *   - 都支持 cleanup 与 deps
 */

// ===== 极简函数组件渲染器 =====
let currentFiber = null;
let hookIndex = 0;
let pendingLayout = [];
let pendingPassive = [];

function createFiber(component, props) {
  return { component, props, hooks: [], output: null, dom: null };
}
function runRender(fiber) {
  currentFiber = fiber;
  hookIndex = 0;
  const out = fiber.component(fiber.props);
  currentFiber = null;
  fiber.output = out;
  console.log("  render:", out);
  // 1) commit 阶段同步执行 layoutEffect
  flushLayout();
  // 2) 模拟 paint（这里只是占位）
  // 3) paint 之后异步执行 passive effect
  Promise.resolve().then(flushPassive);
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
function depsChanged(prev, next) {
  if (prev === undefined) return true;
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++)
    if (!Object.is(prev[i], next[i])) return true;
  return false;
}
function flushLayout() {
  const arr = pendingLayout;
  pendingLayout = [];
  arr.forEach((fn) => fn());
}
function flushPassive() {
  const arr = pendingPassive;
  pendingPassive = [];
  arr.forEach((fn) => fn());
}

// ===== useState =====
function useState(initialValue) {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.state = initialValue;
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

// ===== useLayoutEffect（同步）=====
function useLayoutEffect(callback, deps) {
  const hook = resolveHook();
  const shouldRun = !hook.initialized || depsChanged(hook.deps, deps);
  hook.deps = deps;
  hook.initialized = true;
  if (shouldRun) {
    pendingLayout.push(() => {
      if (typeof hook.cleanup === "function") hook.cleanup();
      const c = callback();
      hook.cleanup = typeof c === "function" ? c : null;
    });
  }
}

// ===== useEffect（异步）=====
function useEffect(callback, deps) {
  const hook = resolveHook();
  const shouldRun = !hook.initialized || depsChanged(hook.deps, deps);
  hook.deps = deps;
  hook.initialized = true;
  if (shouldRun) {
    pendingPassive.push(() => {
      if (typeof hook.cleanup === "function") hook.cleanup();
      const c = callback();
      hook.cleanup = typeof c === "function" ? c : null;
    });
  }
}

// ===== 测试 =====
let setWidth;
function Measure() {
  const [width, setWidthFn] = useState(100);
  setWidth = setWidthFn;

  // layoutEffect：在 paint 前同步读取/设置布局
  useLayoutEffect(() => {
    console.log("  [layoutEffect] sync, width=", width);
    return () => console.log("  [layoutEffect cleanup] width=", width);
  }, [width]);

  // useEffect：在 paint 之后异步执行
  useEffect(() => {
    console.log("  [effect] async, width=", width);
    return () => console.log("  [effect cleanup] width=", width);
  }, [width]);

  return `box width=${width}`;
}

console.log("--- 首次渲染 ---");
const fiber = render(Measure, {});
// 顺序：render -> [layoutEffect] sync -> (paint) -> [effect] async

// 等 passive effect 跑完再触发下一次
setTimeout(() => {
  console.log("\n--- 改变 width 触发重渲染 ---");
  setWidth(200);
  // 顺序：render -> [layoutEffect cleanup] old -> [layoutEffect] sync new
  //       -> (paint) -> [effect cleanup] old -> [effect] async new
}, 10);
