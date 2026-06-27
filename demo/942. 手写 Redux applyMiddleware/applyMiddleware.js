/**
 * 手写 Redux applyMiddleware
 *
 * applyMiddleware 是 Redux 的 store 增强器（enhancer），
 * 用于在 dispatch 前后插入中间件逻辑（如日志、异步处理、持久化等）。
 *
 * 中间件签名：store => next => action => result
 * - store：包含 getState 和 dispatch 的精简版 store
 * - next：调用下一个中间件的 dispatch（链尾是原始 dispatch）
 * - action：当前派发的 action
 *
 * 工作原理：
 * 1. 每个 middleware 接收 middlewareAPI 得到 next => action => result
 * 2. 用 compose 从右到左组合这些函数，得到增强后的 dispatch
 * 3. 调用 dispatch 时，action 依次经过每个中间件，最后到达 reducer
 *
 * 调用链示意（两个中间件 m1, m2）：
 *   dispatch(action) -> m1 的处理 -> next -> m2 的处理 -> next -> 原始 dispatch -> reducer
 */

/**
 * compose 函数：从右到左组合函数
 */
function compose(...funcs) {
  if (funcs.length === 0) return (arg) => arg;
  if (funcs.length === 1) return funcs[0];
  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args)),
  );
}

/**
 * createStore（支持 enhancer）
 */
function createStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, preloadedState);
  }
  let state = preloadedState;
  const listeners = [];

  function getState() {
    return state;
  }
  function dispatch(action) {
    state = reducer(state, action);
    listeners.slice().forEach((l) => l());
    return action;
  }
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const i = listeners.indexOf(listener);
      if (i >= 0) listeners.splice(i, 1);
    };
  }
  dispatch({ type: "@@INIT" });
  return { getState, dispatch, subscribe };
}

/**
 * applyMiddleware 增强器
 * @param {...Function} middlewares - 中间件列表
 * @returns {Function} enhancer，签名为 createStore => (reducer, preloadedState) => store
 */
function applyMiddleware(...middlewares) {
  return function (createStore) {
    return function (reducer, preloadedState) {
      // 先用原始 createStore 创建基础 store
      const store = createStore(reducer, preloadedState);

      // 占位的 dispatch：防止中间件构造期间提前调用 dispatch
      // （此时增强后的 dispatch 尚未就绪）
      let dispatch = () => {
        throw new Error(
          "Dispatching while constructing middleware is not allowed. " +
            "Other middleware would not be applied to this dispatch.",
        );
      };

      // 传给中间件的精简 store API
      // 注意：dispatch 用箭头函数包裹，确保中间件用的是改造后的 dispatch（闭包引用）
      // 这样即使 dispatch 后续被重新赋值，中间件拿到的也永远是最新的
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action) => dispatch(action),
      };

      // 每个 middleware(middlewareAPI) 得到 next => action => result
      const chain = middlewares.map((middleware) => middleware(middlewareAPI));

      // 用 compose 组合，最右侧接收原始 store.dispatch
      // 调用链：m1(m2(...(store.dispatch)))
      dispatch = compose(...chain)(store.dispatch);

      // 返回新 store，用增强后的 dispatch 覆盖原始 dispatch
      return {
        ...store,
        dispatch,
      };
    };
  };
}

// ===== 测试用例 =====

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "ADD":
      return { count: state.count + action.payload };
    default:
      return state;
  }
}

// 日志中间件：记录 dispatch 前后的状态
const loggingMiddleware = (store) => (next) => (action) => {
  console.log(`[logging] 即将派发: ${action.type}`);
  console.log("[logging] 前置状态:", store.getState());
  const result = next(action); // 交给下一个中间件 / 原始 dispatch
  console.log("[logging] 后置状态:", store.getState());
  return result;
};

// 计数中间件：统计 dispatch 次数
let dispatchCount = 0;
const countMiddleware = () => (next) => (action) => {
  dispatchCount++;
  console.log(`[count] 这是第 ${dispatchCount} 次派发`);
  return next(action);
};

console.log("===== applyMiddleware 测试 =====\n");

// createStore 第三参数为 enhancer
const store = createStore(
  counterReducer,
  { count: 0 },
  applyMiddleware(countMiddleware, loggingMiddleware),
);

console.log("--- 派发 INCREMENT ---");
store.dispatch({ type: "INCREMENT" });

console.log("\n--- 派发 ADD payload=10 ---");
store.dispatch({ type: "ADD", payload: 10 });

console.log("\n--- 派发 DECREMENT ---");
store.dispatch({ type: "DECREMENT" });

console.log("\n最终状态:", store.getState());
console.log("总派发次数:", dispatchCount);

// 验证：未使用中间件的 store 不受影响
console.log("\n===== 无中间件对比 =====");
const plainStore = createStore(counterReducer, { count: 0 });
plainStore.dispatch({ type: "INCREMENT" });
console.log("普通 store 状态:", plainStore.getState());
