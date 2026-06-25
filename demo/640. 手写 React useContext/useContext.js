/**
 * 手写 React useContext
 *
 * Context 提供一种「跨层级传值」的方式，避免逐层 props 透传。
 *   - createContext(defaultValue) 创建一个 context，内部维护当前值
 *   - Provider 组件向其子树提供新值
 *   - useContext(context) 读取最近 Provider 的值；没有 Provider 则用默认值
 *
 * 实现思路：
 *   - context 内部用一个「值栈」，Provider 渲染子树前 push value、结束后 pop
 *   - useContext 取栈顶值（或默认值）
 *   - 真实 React 中，Provider value 变化会触发所有消费该 context 的组件重渲染
 *     （这里用订阅集合 + 触发重渲染来模拟）
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
  // 把自身注册到 currentFiber，方便 useContext 订阅
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

// ===== Context 实现 =====
function createContext(defaultValue) {
  const ctx = {
    _defaultValue: defaultValue,
    _stack: [], // Provider 嵌套值栈
    _subscribers: new Set(), // 订阅者（消费该 context 的 fiber）
  };
  // Provider：在调用子树前 push value，结束后 pop
  ctx.Provider = function Provider(props) {
    ctx._stack.push(props.value);
    const out = props.children(); // 子树渲染（函数形式，便于演示）
    ctx._stack.pop();
    return out;
  };
  return ctx;
}

function useContext(ctx) {
  const fiber = currentFiber;
  if (fiber) ctx._subscribers.add(fiber);
  return ctx._stack.length > 0
    ? ctx._stack[ctx._stack.length - 1]
    : ctx._defaultValue;
}

// 触发所有订阅者重渲染（模拟 Provider value 变化的广播）
function notify(ctx) {
  ctx._subscribers.forEach((fiber) => scheduleRerender(fiber));
}

// ===== 测试 =====
const ThemeContext = createContext("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return `<button theme=${theme}>`;
}

function App() {
  // App 作为 Provider，向子树提供 dark 主题
  return ThemeContext.Provider({
    value: "dark",
    children: () => ThemedButton(),
  });
}

render(App, {});
// render: <button theme=dark>

// 嵌套 Provider：内层覆盖外层
function NestedApp() {
  return ThemeContext.Provider({
    value: "blue",
    children: () =>
      ThemeContext.Provider({
        value: "red",
        children: () => ThemedButton(),
      }),
  });
}
render(NestedApp, {});
// render: <button theme=red>

// 没有 Provider 时使用默认值
render(ThemedButton, {});
// render: <button theme=light>

// 演示订阅：Provider value 变化时通知消费组件重渲染
console.log("\n--- 演示订阅与广播（独立 context）---");
const CountContext = createContext(0);
function Consumer() {
  const n = useContext(CountContext);
  return `consumer n=${n}`;
}
// Provider 组件：把 value 存起来，便于测试时改变并广播
function ProviderApp() {
  return CountContext.Provider({
    value: CountContext._current ?? 0,
    children: () => Consumer(),
  });
}
const consumerFiber = render(ProviderApp, {});
// render: consumer n=0
console.log("subscribers:", CountContext._subscribers.size); // 1（ProviderApp fiber）

// 改变 Provider value 并广播
CountContext._current = 99;
CountContext._stack.push(99); // 让 useContext 读到新值
notify(CountContext);
CountContext._stack.pop();
// 期望：ProviderApp 重渲染 -> consumer n=99
