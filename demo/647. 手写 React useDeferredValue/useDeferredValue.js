/**
 * 手写 React useDeferredValue
 *
 * useDeferredValue 返回一个「延迟」版本的值：
 *   const deferred = useDeferredValue(value);
 *   - 当 value 急剧变化时，urgent 渲染先用旧的 deferred 值（保持 UI 响应），
 *     然后在低优先级任务里把 deferred 更新为新值并重新渲染。
 *   - 常用于：输入框搜索时，输入本身高优响应，搜索结果列表用 deferred 值延迟刷新。
 *
 * 实现要点：
 *   - hook 中保存 lastValue（最新输入）与 deferred（延迟输出）
 *   - 输入变化时立即返回旧 deferred，并安排一个低优先级（setTimeout）任务更新 deferred
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

// ===== useDeferredValue 实现 =====
function useDeferredValue(value) {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.deferred = value;
    hook.lastValue = value;
    hook.initialized = true;
    return value;
  }
  // 输入变化：urgent 渲染返回旧 deferred，并安排低优先级更新
  if (hook.lastValue !== value) {
    hook.lastValue = value;
    if (!hook.scheduled) {
      hook.scheduled = true;
      // 模拟低优先级调度（真实 React 用更低的 lane 优先级）
      setTimeout(() => {
        hook.deferred = hook.lastValue;
        hook.scheduled = false;
        scheduleRerender(fiber);
      }, 0);
    }
  }
  return hook.deferred;
}

// ===== 测试：搜索框 + 结果列表 =====
const ALL = ["apple", "banana", "apricot", "cherry", "avocado", "blueberry"];
let setQuery;
let renderCount = 0;

function SearchApp() {
  const [query, setQueryFn] = useState("");
  setQuery = setQueryFn;
  const deferredQuery = useDeferredValue(query);

  const results = ALL.filter((x) => x.includes(deferredQuery));
  renderCount++;
  return `input="${query}" | deferred="${deferredQuery}" | results=[${results.join(",")}] (render #${renderCount})`;
}

const fiber = render(SearchApp, {});
// render: input="" | deferred="" | results=[apple,banana,apricot,cherry,avocado,blueberry] (render #1)

// 模拟用户快速输入 "a"：urgent 渲染 deferred 仍是 ""，然后延迟更新为 "a"
console.log("\n--- 输入 'a' ---");
setQuery("a");
// render #2: input="a" | deferred="" (urgent，保持响应)

// 等待 deferred 更新
setTimeout(() => {
  console.log("\n--- deferred 更新完成 ---");
  // render #3: input="a" | deferred="a" | results=[apple,apricot,avocado]
}, 20);
