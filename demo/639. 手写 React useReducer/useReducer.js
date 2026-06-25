/**
 * 手写 React useReducer
 *
 * useReducer 是 useState 的底层实现基础。它接受：
 *   - reducer: (state, action) => newState
 *   - initialArg: 初始状态（或传给 init 的参数）
 *   - init?: (initialArg) => state  惰性初始化函数
 * 返回 [state, dispatch]。dispatch(action) 会用 reducer 计算新状态并触发重渲染。
 *
 * 与 useState 的关系：useState(s) 等价于
 *   useReducer((prev, action) => typeof action === "function" ? action(prev) : action, s)
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

// ===== useReducer 实现 =====
function useReducer(reducer, initialArg, init) {
  const fiber = currentFiber;
  const hook = resolveHook();
  if (!hook.initialized) {
    hook.state = init ? init(initialArg) : initialArg;
    hook.initialized = true;
  }
  const dispatch = (action) => {
    const next = reducer(hook.state, action);
    if (Object.is(next, hook.state)) return; // bailout
    hook.state = next;
    scheduleRerender(fiber);
  };
  return [hook.state, dispatch];
}

// ===== 测试：一个计数器 reducer =====
function counterReducer(state, action) {
  switch (action.type) {
    case "inc":
      return { ...state, count: state.count + 1 };
    case "dec":
      return { ...state, count: state.count - 1 };
    case "set":
      return { ...state, count: action.payload };
    case "reset":
      return { count: 0 };
    default:
      return state;
  }
}

let dispatch;
function Counter() {
  const [state, dispatchFn] = useReducer(counterReducer, { count: 0 });
  dispatch = dispatchFn;
  return `count=${state.count}`;
}

const fiber = render(Counter, {});
// render: count=0

dispatch({ type: "inc" });
// render: count=1

dispatch({ type: "inc" });
// render: count=2

dispatch({ type: "dec" });
// render: count=1

dispatch({ type: "set", payload: 100 });
// render: count=100

dispatch({ type: "reset" });
// render: count=0

// 惰性初始化：init 只在首次渲染执行
let initCalls = 0;
function Todos() {
  const [state, d] = useReducer(
    (s, a) => (a.type === "add" ? { items: [...s.items, a.item] } : s),
    ["a", "b", "c"],
    (arg) => {
      initCalls++;
      return { items: arg.map((x) => x.toUpperCase()) };
    },
  );
  if (!globalThis._d) globalThis._d = d;
  return `items=${state.items.join(",")}`;
}
const f2 = render(Todos, {});
// render: items=A,B,C
console.log("init calls:", initCalls); // 1
globalThis._d({ type: "add", item: "D" });
// render: items=A,B,C,D

// 用 useReducer 实现 useState
function useState(initialValue) {
  return useReducer(
    (prev, action) => (typeof action === "function" ? action(prev) : action),
    initialValue,
  );
}
let setN;
function UseAsState() {
  const [n, setNFn] = useState(10);
  setN = setNFn;
  return `n=${n}`;
}
render(UseAsState, {}); // render: n=10
setN(20); // render: n=20
setN((x) => x + 5); // render: n=25
