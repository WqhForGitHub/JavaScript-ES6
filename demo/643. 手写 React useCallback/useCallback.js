/**
 * 手写 React useCallback
 *
 * useCallback 用于「记忆」函数引用，避免每次渲染都创建新函数：
 *   const handler = useCallback(() => doSomething(a), [a]);
 *   - deps 未变时，返回同一个函数引用
 *   - deps 变化时，返回新函数
 *
 * 与 useMemo 的关系：
 *   useCallback(fn, deps) === useMemo(() => fn, deps)
 * 主要用途：把回调传给被 memo 优化的子组件，避免子组件因 props 引用变化而无谓重渲染。
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
function useMemo(factory, deps) {
  const hook = resolveHook();
  if (!hook.initialized || depsChanged(hook.deps, deps)) {
    hook.value = factory();
    hook.deps = deps;
    hook.initialized = true;
  }
  return hook.value;
}

// ===== useCallback 实现（基于 useMemo）=====
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

// ===== 一个被 memo 的子组件（props 引用相等则不重渲染）=====
function memo(component) {
  let lastProps = null;
  let lastOutput = null;
  return function Memoized(props) {
    if (lastProps && shallowEqual(lastProps, props)) {
      console.log("  [memo] child skipped (props 未变)");
      return lastOutput;
    }
    lastProps = props;
    lastOutput = component(props);
    return lastOutput;
  };
}
function shallowEqual(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.is(a[k], b[k])) return false;
  return true;
}

// ===== 测试 =====
let setCount, setText;
const Child = memo(function Child(props) {
  console.log("  [child] render, onClick ref stable?");
  return `child: text=${props.text}`;
});

function Parent() {
  const [count, setCountFn] = useState(0);
  const [text, setTextFn] = useState("hi");
  setCount = setCountFn;
  setText = setTextFn;

  // 用 useCallback 稳定 onClick 引用，只依赖 count
  const onClick = useCallback(() => {
    console.log("    clicked, count=", count);
  }, [count]);

  globalThis.__onClick = onClick;
  return Child({ text, onClick });
}

const fiber = render(Parent, {}); // Parent 渲染 + child 首次渲染
const firstOnClick = globalThis.__onClick;

// 改 text（onClick deps 未变）=> 父重渲染，但 child 因 text 变也重渲染；
// onClick 引用应保持不变
setText("hello");
console.log("onClick 引用稳定?", firstOnClick === globalThis.__onClick); // true

// 再改 text => child 重渲染，onClick 仍稳定
setText("world");
console.log("onClick 引用稳定?", firstOnClick === globalThis.__onClick); // true

// 改 count => onClick deps 变化，引用应更新
setCount(1);
console.log("onClick 引用更新?", firstOnClick === globalThis.__onClick); // false
