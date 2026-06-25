/**
 * 手写 React useMemo
 *
 * useMemo 用于「记忆」一次昂贵的计算结果，避免每次渲染都重算：
 *   const value = useMemo(() => compute(a, b), [a, b]);
 *   - 首次渲染：执行 compute，缓存结果
 *   - 后续渲染：若 deps 未变，直接返回缓存；若变了，重新计算
 *
 * 实现：在 hook 中缓存上次的 deps 与 value，用 Object.is 逐项比较 deps。
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
function depsChanged(prev, next) {
  if (prev === undefined) return true;
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) return true;
  }
  return false;
}

// ===== useMemo 实现 =====
function useMemo(factory, deps) {
  const hook = resolveHook();
  if (!hook.initialized || depsChanged(hook.deps, deps)) {
    hook.value = factory();
    hook.deps = deps;
    hook.initialized = true;
  }
  return hook.value;
}

// ===== 测试 =====
let setN, setM;
let computeCalls = 0;

function App() {
  const [n, setNFn] = useState(1);
  const [m, setMFn] = useState(100);
  setN = setNFn;
  setM = setMFn;

  // 只依赖 n 的昂贵计算
  const squared = useMemo(() => {
    computeCalls++;
    return n * n;
  }, [n]);

  return `n=${n}, m=${m}, squared=${squared}`;
}

const fiber = render(App, {});
// render: n=1, m=100, squared=1
console.log("compute calls:", computeCalls); // 1

// 改 m（与 squared 无关），useMemo 应命中缓存，不重算
setM(200);
// render: n=1, m=200, squared=1
console.log("compute calls:", computeCalls); // 1（缓存命中）

// 改 n，useMemo 应重新计算
setN(3);
// render: n=3, m=200, squared=9
console.log("compute calls:", computeCalls); // 2

setN(3); // 值未变，不重渲染
setM(300);
// render: n=3, m=300, squared=9
console.log("compute calls:", computeCalls); // 2（仍命中缓存）

// 不传 deps：每次渲染都重算
let rawCalls = 0;
function NoDeps() {
  const [x, setX] = useState(0);
  globalThis.__setX = setX;
  const v = useMemo(() => {
    rawCalls++;
    return x;
  }, undefined); // 不传 / undefined => 每次都算
  return `x=${x}, v=${v}`;
}
const f2 = render(NoDeps, {}); // rawCalls=1
globalThis.__setX(1); // rawCalls=2
globalThis.__setX(2); // rawCalls=3
console.log("raw calls (no deps):", rawCalls); // 3
