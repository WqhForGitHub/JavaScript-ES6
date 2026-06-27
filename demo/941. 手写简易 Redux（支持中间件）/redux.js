/**
 * 手写简易 Redux（支持中间件）
 *
 * Redux 三大原则：
 * 1. 单一数据源：整个应用的状态存储在一个 object tree 中
 * 2. 状态只读：唯一改变状态的方式是触发 action
 * 3. 纯函数修改：使用 reducer 描述 action 如何改变 state
 *
 * 核心概念：
 * - Store：保存状态的对象，提供 getState / dispatch / subscribe
 * - Action：描述发生了什么的普通对象，必须包含 type 字段
 * - Reducer：(state, action) => newState 的纯函数
 *
 * 本文件实现核心 createStore 与 compose，并支持通过 enhancer 扩展。
 */

/**
 * compose 函数：从右到左组合多个函数
 * compose(f, g, h)(x) === f(g(h(x)))
 * 这是 applyMiddleware 和中间件链的核心工具。
 * @param {...Function} funcs - 要组合的函数列表
 * @returns {Function} 组合后的函数
 */
function compose(...funcs) {
  if (funcs.length === 0) {
    // 没有函数时返回恒等函数
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    // 只有一个函数时直接返回
    return funcs[0];
  }
  // reduce 累积：a(b(...args))，最终形成从右到左的调用链
  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
  );
}

/**
 * createStore：创建 Redux store
 * @param {Function} reducer - 纯函数 (state, action) => newState
 * @param {*} [preloadedState] - 初始状态
 * @param {Function} [enhancer] - 增强器函数，如 applyMiddleware(...)
 * @returns {{getState: Function, dispatch: Function, subscribe: Function}} store 对象
 */
function createStore(reducer, preloadedState, enhancer) {
  // 如果传入了 enhancer，交给 enhancer 处理 store 的创建
  // enhancer 签名：createStore => (reducer, preloadedState) => store
  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let state = preloadedState;
  const listeners = [];
  let isDispatching = false; // 防止 reducer 内部派发 action 造成死循环

  /**
   * 获取当前状态
   * @returns {*} 当前状态
   */
  function getState() {
    return state;
  }

  /**
   * 派发 action，触发状态更新并通知订阅者
   * @param {Object} action - 必须包含 type 字段的普通对象
   * @returns {Object} 派发的 action
   */
  function dispatch(action) {
    if (typeof action !== "object" || action === null) {
      throw new Error("Actions must be plain objects.");
    }
    if (typeof action.type === "undefined") {
      throw new Error('Actions must have a "type" field.');
    }
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }
    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }
    // 通知所有订阅者（slice 防止遍历时被取消订阅影响）
    listeners.slice().forEach((listener) => listener());
    return action;
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 状态变化时的回调
   * @returns {Function} 取消订阅函数
   */
  function subscribe(listener) {
    let isSubscribed = true;
    listeners.push(listener);
    return () => {
      if (!isSubscribed) return;
      isSubscribed = false;
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  // 初始化状态：派发一个内部 init action，让 reducer 返回各自的默认值
  dispatch({ type: "@@INIT" });

  return {
    getState,
    dispatch,
    subscribe,
  };
}

// ===== 测试用例 =====

// 计数器 reducer
function counterReducer(state = { count: 0, history: [] }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1, history: [...state.history, "+1"] };
    case "DECREMENT":
      return { count: state.count - 1, history: [...state.history, "-1"] };
    case "ADD":
      return {
        count: state.count + action.payload,
        history: [...state.history, `+${action.payload}`],
      };
    case "RESET":
      return { count: 0, history: [] };
    default:
      return state;
  }
}

console.log("===== Redux createStore 测试 =====\n");

// 1. 创建 store（带初始状态）
const store = createStore(counterReducer, { count: 10, history: [] });

// 2. 订阅状态变化
const unsubscribe = store.subscribe(() => {
  console.log("  [订阅回调] 当前状态:", store.getState());
});

console.log("初始状态:", store.getState());

console.log("\n--- 派发 INCREMENT ---");
store.dispatch({ type: "INCREMENT" });

console.log("\n--- 派发 ADD payload=5 ---");
store.dispatch({ type: "ADD", payload: 5 });

console.log("\n--- 派发 DECREMENT ---");
store.dispatch({ type: "DECREMENT" });

console.log("\n--- 取消订阅后派发 RESET ---");
unsubscribe();
store.dispatch({ type: "RESET" });
console.log("（订阅已取消，上面没有回调输出）");
console.log("当前状态:", store.getState());

// 3. 不传初始状态时使用 reducer 默认值
console.log("\n--- 不传初始状态 ---");
const store2 = createStore(counterReducer);
console.log("默认状态:", store2.getState());

// 4. compose 函数测试
console.log("\n===== compose 函数测试 =====");
const f = (x) => x + 1;
const g = (x) => x * 2;
const h = (x) => x - 3;
const composed = compose(f, g, h);
console.log("compose(f, g, h)(5) =", composed(5)); // f(g(h(5))) = f(g(2)) = f(4) = 5
console.log("compose()(42) =", compose()(42)); // 空组合返回恒等函数：42
console.log("compose(f)(10) =", compose(f)(10)); // 单函数：11
