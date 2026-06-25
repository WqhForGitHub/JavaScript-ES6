/**
 * 手写 React useTransition
 *
 * useTransition 把某些状态更新标记为「过渡（transition）」，降低其优先级：
 *   const [isPending, startTransition] = useTransition();
 *   - startTransition(() => setState(...))：其中的更新低优先级执行
 *   - isPending：过渡期间为 true，可用于展示 loading / 降级 UI
 *
 * 适用场景：切 tab、大列表筛选等。让输入/点击高优响应，重计算延后。
 *
 * 实现要点：
 *   - startTransition 先把 isPending 置 true 并高优重渲染（显示 pending）
 *   - 再用低优先级（setTimeout）执行回调里的状态更新，完成后 isPending 置 false
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

// ===== useTransition 实现 =====
function useTransition() {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.isPending = false;
    hook.initialized = true;
  }
  const startTransition = (callback) => {
    // 1) 高优：先标记 pending 并重渲染（让用户看到 loading）
    hook.isPending = true;
    scheduleRerender(fiber);
    // 2) 低优先级：延迟执行真正的状态更新
    setTimeout(() => {
      callback(); // 内部 setState 会触发重渲染
      hook.isPending = false;
      scheduleRerender(fiber);
    }, 0);
  };
  return [hook.isPending, startTransition];
}

// ===== 测试：切 tab，重计算用 transition 包裹 =====
const TAB_DATA = {
  home: "首页内容...",
  big: Array.from({ length: 5 }, (_, i) => `item-${i}`).join(","),
};
let startTransition;
let setTabRef;

function Tabs() {
  const [tab, setTab] = useState("home");
  const [isPending, start] = useTransition();
  startTransition = start;
  setTabRef = setTab;
  return `tab=${tab} | pending=${isPending} | content=${TAB_DATA[tab].slice(0, 24)}`;
}

const fiber = render(Tabs, {});
// render: tab=home | pending=false | content=首页内容...

console.log("\n--- 用 startTransition 切到 big tab ---");
startTransition(() => {
  setTabRef("big"); // 低优先级切换
});
// render: tab=home | pending=true ...  （urgent：先显示 pending）
// （延迟后）render: tab=big | pending=false ...  （低优先级更新完成）
