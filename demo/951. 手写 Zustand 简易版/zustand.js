/**
 * 手写 Zustand 简易版
 * =====================
 * Zustand 是一个轻量级状态管理库，核心思想是：
 * 1. 使用闭包维护一份 state
 * 2. 提供 getState / setState / subscribe 三个核心 API
 * 3. 通过 selector 支持订阅"局部" state，避免无关更新
 *
 * 本实现仿照 Zustand 的 create API：
 *   const useStore = create((set, get) => ({ count: 0, increment: ... }))
 *   useStore.getState()      // 读取状态
 *   useStore.setState(patch) // 更新状态
 *   useStore.subscribe(listener) // 订阅全部变更
 *   useStore.subscribe(selector, listener) // 订阅局部变更
 *
 * 注意：Zustand 真实实现还会处理 React 的 useSyncExternalStore，
 * 此处只做"普通 JS"层面（hook-like 函数）的简化实现。
 */

/**
 * 创建一个 Zustand-like store
 * @template T
 * @param {(set: (partial: any) => void, get: () => T) => T} init - 初始化函数，接收 set 和 get
 * @returns {object} store 对象，包含 getState / setState / subscribe / destroy
 */
function create(init) {
  // state 通过闭包保护，外部只能通过 API 访问
  let state;
  // 订阅者列表：{ selector, listener, prevSlice }[]
  const listeners = new Set();

  /**
   * setState：合并 patch 到当前 state
   * @param {Partial<T> | ((prev: T) => Partial<T>)} partial - 可以是对象或函数
   */
  const setState = (partial) => {
    // 如果 patch 是函数，传入当前 state 计算
    const nextState = typeof partial === "function" ? partial(state) : partial;
    // 浅合并
    state = Object.assign({}, state, nextState);
    // 通知订阅者
    notify();
  };

  /** getState：返回当前 state（只读引用） */
  const getState = () => state;

  /**
   * subscribe：订阅变更，支持两种重载
   *   subscribe(listener)                          // 订阅全部变更
   *   subscribe(selector, listener)                // 订阅局部切片
   * @returns {() => void} 取消订阅函数
   */
  const subscribe = (...args) => {
    let selector, listener;
    if (args.length === 1) {
      // subscribe(listener) —— 等价于 selector 为 () => state
      selector = () => state;
      listener = args[0];
    } else {
      selector = args[0];
      listener = args[1];
    }

    // 初始 slice（用于首次比较）
    const entry = { selector, listener, prevSlice: selector(state) };
    listeners.add(entry);

    // 返回取消订阅函数
    return () => listeners.delete(entry);
  };

  /** 内部：通知所有订阅者，selector 切片变化时才调用 listener */
  const notify = () => {
    // 注意：先复制一份，避免 listener 中 unsubscribe 导致迭代异常
    const snapshot = Array.from(listeners);
    for (const entry of snapshot) {
      const nextSlice = entry.selector(state);
      // 使用 Object.is 做浅比较，避免基本类型与引用类型误判
      if (!Object.is(entry.prevSlice, nextSlice)) {
        entry.prevSlice = nextSlice;
        entry.listener(nextSlice, state);
      }
    }
  };

  /** destroy：清空所有订阅者 */
  const destroy = () => listeners.clear();

  // 初始化 state（init 接收 set / get）
  state = init(setState, getState);

  // 返回 hook-like 函数（真实 Zustand 返回一个 React Hook，这里返回 store 对象本身）
  const useStore = (selector = (s) => s) => selector(state);
  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;
  useStore.destroy = destroy;
  return useStore;
}

// ============================================================
// 测试用例：计数器 store
// ============================================================
console.log("===== 951. 手写 Zustand 简易版 =====");

const useCounterStore = create((set, get) => ({
  count: 0,
  name: "counter",
  // action：直接调用 set
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  // action：使用 get
  incrementBy: (n) => set({ count: get().count + n }),
  reset: () => set({ count: 0 }),
}));

console.log("初始 state:", useCounterStore.getState());

// 订阅全部变更
const unsubAll = useCounterStore.subscribe((nextState) => {
  console.log("[全部订阅] state 变更:", nextState);
});

// 订阅局部切片：只关心 count
const unsubCount = useCounterStore.subscribe(
  (s) => s.count,
  (count, fullState) => {
    console.log(`[count 切片订阅] count = ${count}, name = ${fullState.name}`);
  },
);

// 订阅局部切片：只关心 name
const unsubName = useCounterStore.subscribe(
  (s) => s.name,
  (name) => console.log(`[name 切片订阅] name = ${name}`),
);

console.log("\n--- increment() ---");
useCounterStore.getState().increment();

console.log("\n--- incrementBy(5) ---");
useCounterStore.getState().incrementBy(5);

console.log("\n--- 仅修改 name（count 不变，count 订阅不应触发）---");
useCounterStore.setState({ name: "my-counter" });

console.log("\n--- decrement() ---");
useCounterStore.getState().decrement();

console.log("\n--- 取消 count 订阅后再 increment ---");
unsubCount();
useCounterStore.getState().increment();

console.log("\n最终 state:", useCounterStore.getState());

// 清理
unsubAll();
unsubName();
useCounterStore.destroy();
console.log("所有订阅已清空");
