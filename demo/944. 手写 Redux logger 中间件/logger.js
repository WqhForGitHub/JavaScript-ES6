/**
 * 手写 Redux logger 中间件
 *
 * redux-logger 在每次 dispatch 时记录：
 * - action 的类型和内容
 * - 派发前的状态（previous state）
 * - 派发后的状态（next state）
 * - 本次 dispatch 耗时
 *
 * 这是一个典型的"切面"中间件：不影响业务逻辑，只做观测/调试。
 * 通过 next(action) 把控制权交给后续中间件，待 reducer 执行完毕后再读取新状态。
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

function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = () => {
      throw new Error("构造期间不允许 dispatch");
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };
    const chain = middlewares.map((mw) => mw(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return { ...store, dispatch };
  };
}

/**
 * logger 中间件
 * 记录 action 类型、前置状态、后置状态、耗时
 */
const logger = (store) => (next) => (action) => {
  // 在调用 next 前读取的是"前置状态"
  const prevState = store.getState();
  const startTime = Date.now();

  console.log("┌──────────────────────────────────");
  console.log(`│ action 类型 : ${action.type}`);
  console.log("│ action 内容:", action);
  console.log("│ prev state :", prevState);

  // 把控制权交给后续中间件 / 原始 dispatch（reducer 在此执行）
  const result = next(action);

  // next 返回后，state 已更新，读取的是"后置状态"
  const nextState = store.getState();
  const elapsed = Date.now() - startTime;

  console.log("│ next state :", nextState);
  console.log(`│ 耗时       : ${elapsed}ms`);
  console.log("└──────────────────────────────────\n");

  return result;
};

/**
 * 简易 logger：仅打印 action 类型和状态变化
 */
const simpleLogger = (store) => (next) => (action) => {
  console.log(`[${action.type}] prev:`, store.getState());
  next(action);
  console.log(`[${action.type}] next:`, store.getState());
};

// ===== 测试用例 =====

function todoReducer(state = { todos: [], filter: "all" }, action) {
  switch (action.type) {
    case "ADD_TODO":
      return { ...state, todos: [...state.todos, action.payload] };
    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload ? { ...t, done: !t.done } : t,
        ),
      };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "CLEAR":
      return { ...state, todos: [] };
    default:
      return state;
  }
}

console.log("===== Redux logger 中间件测试 =====\n");

const store = createStore(todoReducer, undefined, applyMiddleware(logger));

console.log("--- 派发多个 action ---\n");

store.dispatch({
  type: "ADD_TODO",
  payload: { id: 1, text: "学习 Redux", done: false },
});

store.dispatch({
  type: "ADD_TODO",
  payload: { id: 2, text: "手写中间件", done: false },
});

store.dispatch({ type: "TOGGLE_TODO", payload: 1 });

store.dispatch({ type: "SET_FILTER", payload: "completed" });

store.dispatch({ type: "CLEAR" });

console.log("最终状态:", JSON.stringify(store.getState(), null, 2));

// 使用 simpleLogger 对比
console.log("\n===== 使用 simpleLogger =====\n");
const store2 = createStore(
  todoReducer,
  undefined,
  applyMiddleware(simpleLogger),
);
store2.dispatch({
  type: "ADD_TODO",
  payload: { id: 1, text: "test", done: false },
});
store2.dispatch({ type: "SET_FILTER", payload: "active" });
