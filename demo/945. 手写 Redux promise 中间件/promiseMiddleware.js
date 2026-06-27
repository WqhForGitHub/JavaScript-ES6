/**
 * 手写 Redux promise 中间件
 *
 * redux-promise 允许 action.payload 为 Promise（或 thenable）。
 * 当检测到 payload 是 Promise 时：
 * - 等待 Promise 完成
 * - resolve：派发一个新 action，payload 替换为 resolved 值，附加 status: 'success'
 * - reject：派发一个新 action，payload 替换为 error，附加 status: 'error', error: true
 *
 * 如果 payload 不是 Promise，直接传递给下一个中间件。
 *
 * 典型用法：
 *   dispatch({ type: 'FETCH', payload: fetch(url).then(r => r.json()) })
 *   // resolve 后 reducer 收到 { type: 'FETCH', payload: data, status: 'success' }
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
 * promise 中间件
 * 判断 action.payload 是否是 Promise（duck-typing：有 then 方法即视为 thenable）
 * @returns {Promise|*} 返回 Promise（便于调用方链式处理）或 next 的结果
 */
const promiseMiddleware = (store) => (next) => (action) => {
  const { payload } = action;

  // 判断 payload 是否为 Promise / thenable
  if (payload && typeof payload.then === "function") {
    // 返回 Promise，便于调用方 .then / await
    return payload.then(
      // 成功：派发带 resolved payload 的新 action
      (result) =>
        next({
          ...action,
          payload: result,
          status: "success",
        }),
      // 失败：派发带 error 的新 action，标记 error: true
      (error) =>
        next({
          ...action,
          payload: error,
          status: "error",
          error: true,
        }),
    );
  }

  // 非 Promise，直接放行给下一个中间件
  return next(action);
};

// ===== 测试用例 =====

/**
 * reducer 根据 action.status 处理成功/失败结果
 */
function dataReducer(state = { data: null, error: null }, action) {
  switch (action.type) {
    case "FETCH_DATA":
      if (action.status === "success") {
        return { data: action.payload, error: null };
      }
      if (action.status === "error") {
        return { data: null, error: action.payload };
      }
      // 原始 Promise 形式的 action 被中间件拦截，不会到达 reducer
      return state;
    default:
      return state;
  }
}

console.log("===== Redux promise 中间件测试 =====\n");

const store = createStore(
  dataReducer,
  undefined,
  applyMiddleware(promiseMiddleware),
);

store.subscribe(() => {
  console.log("  [状态更新]", store.getState());
});

// 模拟异步 fetch（返回 Promise）
function fakeFetch(
  shouldSucceed = true,
  delay = 300,
  data = { id: 1, name: "Alice" },
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve(data);
      } else {
        reject(new Error("网络请求失败"));
      }
    }, delay);
  });
}

console.log("1. 派发成功请求（payload 为 Promise）:");
// dispatch 返回 Promise，可以链式处理
store
  .dispatch({
    type: "FETCH_DATA",
    payload: fakeFetch(true, 300, { id: 1, name: "Alice", age: 28 }),
  })
  .then(() => {
    console.log("  -> 请求 Promise 已 resolve");
  });

console.log("\n2. 派发失败请求:");
store.dispatch({
  type: "FETCH_DATA",
  payload: fakeFetch(false, 300),
});

// 等待所有 Promise 完成后再测试普通 action
setTimeout(() => {
  console.log("\n===== 测试普通 action（非 Promise payload）=====");

  const plainReducer = (state = { count: 0 }, action) => {
    if (action.type === "ADD") return { count: state.count + action.payload };
    return state;
  };
  const store2 = createStore(
    plainReducer,
    undefined,
    applyMiddleware(promiseMiddleware),
  );

  // payload 为数字，不是 Promise，直接放行
  store2.dispatch({ type: "ADD", payload: 5 });
  console.log("普通 action 后状态:", store2.getState());
}, 500);
