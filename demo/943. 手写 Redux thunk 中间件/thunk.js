/**
 * 手写 Redux thunk 中间件
 *
 * redux-thunk 让 action 可以是函数（称为 thunk function），用于处理异步逻辑。
 * 普通的 Redux action 必须是纯对象，无法表达"先等一会再 dispatch"的需求。
 *
 * thunk 中间件逻辑：
 * - 如果 action 是函数，调用它，并传入 dispatch 和 getState
 *   该函数内部可以执行异步操作，完成后调用 dispatch 派发普通 action
 * - 否则，将 action 传给下一个中间件（即按普通 action 处理）
 *
 * 典型用法：
 *   const fetchUser = () => (dispatch) => {
 *     dispatch({ type: 'REQUEST' });
 *     api.getUser().then(user => dispatch({ type: 'SUCCESS', payload: user }));
 *   };
 *   store.dispatch(fetchUser()); // dispatch 一个函数
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
 * thunk 中间件
 * @param {Object} store - 包含 dispatch 和 getState
 * @returns {Function} next => action => result
 */
const thunk = (store) => (next) => (action) => {
  // 如果 action 是函数，调用它并传入 dispatch 和 getState
  if (typeof action === "function") {
    return action(store.dispatch, store.getState);
  }
  // 否则作为普通 action 传递给下一个中间件
  return next(action);
};

// ===== 测试用例 =====

function counterReducer(state = { count: 0, loading: false }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const store = createStore(counterReducer, undefined, applyMiddleware(thunk));

store.subscribe(() => {
  console.log("  [状态更新]", store.getState());
});

/**
 * 同步 action creator
 */
const increment = () => ({ type: "INCREMENT" });

/**
 * 异步 action creator（返回 thunk function）
 * @param {number} delay - 延迟毫秒数
 */
const incrementAsync =
  (delay = 1000) =>
  (dispatch, getState) => {
    console.log(`[thunk] 准备在 ${delay}ms 后 INCREMENT`);
    dispatch({ type: "SET_LOADING", payload: true });
    setTimeout(() => {
      dispatch(increment());
      dispatch({ type: "SET_LOADING", payload: false });
    }, delay);
  };

console.log("===== Redux thunk 中间件测试 =====\n");

// 1. 派发普通 action（同步）
console.log("1. 派发普通 action:");
store.dispatch(increment());

// 2. 派发 thunk function（异步）
console.log("\n2. 派发异步 action（thunk function）:");
store.dispatch(incrementAsync(300));

// 3. thunk 内部可以访问当前状态，实现条件逻辑
const conditionalIncrement = () => (dispatch, getState) => {
  const state = getState();
  console.log(`[thunk] 当前 count=${state.count}，仅当为偶数时自增`);
  if (state.count % 2 === 0) {
    dispatch(increment());
  } else {
    console.log("[thunk] count 是奇数，不自增");
  }
};

console.log("\n3. 条件异步 action:");
store.dispatch(conditionalIncrement()); // count=1 奇数，不自增
store.dispatch(conditionalIncrement()); // count=1 仍是奇数

// 等待异步完成后再输出最终状态
setTimeout(() => {
  console.log("\n最终状态:", store.getState());
}, 500);
