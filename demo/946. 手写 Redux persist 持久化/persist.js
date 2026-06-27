/**
 * 手写 Redux persist 持久化
 *
 * 目标：将 Redux 状态持久化到 storage，应用重启时恢复（rehydrate）。
 *
 * 实现：
 * 1. 内存 storage（模拟浏览器 localStorage，便于 Node.js 运行）
 * 2. REHYDRATE action：携带持久化状态，reducer 据此合并状态
 * 3. persistStore(store, key)：
 *    - 读取 storage，若有则派发 REHYDRATE action 恢复状态
 *    - 订阅 store，每次状态变化自动写入 storage
 *    - 返回 persistor，提供 purge（清除持久化数据）方法
 *
 * 使用方式：
 *   const store = createStore(reducer);
 *   const persistor = persistStore(store, 'my-app');
 *   // reducer 需要处理 REHYDRATE action 以合并持久化状态
 */

/**
 * 内存 storage，模拟 localStorage 的接口
 */
const storage = (() => {
  const map = {};
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = String(value);
    },
    removeItem: (key) => {
      delete map[key];
    },
    _dump: () => ({ ...map }), // 调试用：查看所有存储内容
  };
})();

/**
 * REHYDRATE action 类型
 * 持久化恢复时派发此 action，payload 为恢复的状态
 */
const REHYDRATE = "@@redux-persist/REHYDRATE";

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
 * persistStore：启动持久化
 * @param {Object} store - Redux store
 * @param {string} key - storage 的 key
 * @returns {{ purge: Function }} persistor，包含 purge 方法
 */
function persistStore(store, key) {
  // 1. Rehydrate：从 storage 恢复状态
  const persisted = storage.getItem(key);
  if (persisted) {
    const restoredState = JSON.parse(persisted);
    store.dispatch({ type: REHYDRATE, payload: restoredState });
    console.log("[persist] 已从 storage 恢复状态:", restoredState);
  } else {
    console.log("[persist] storage 无数据，跳过恢复");
  }

  // 2. 自动保存：每次状态变化写入 storage
  store.subscribe(() => {
    storage.setItem(key, JSON.stringify(store.getState()));
  });

  // 3. 返回 persistor，提供 purge 清除持久化数据
  return {
    purge: () => {
      storage.removeItem(key);
      console.log("[persist] 已清除持久化数据");
    },
  };
}

// ===== 测试用例 =====

/**
 * reducer 需要处理 REHYDRATE，将持久化的状态合并进来
 */
function counterReducer(state = { count: 0, theme: "light" }, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case REHYDRATE:
      // 合并持久化状态（覆盖默认状态）
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

console.log("===== Redux persist 持久化测试 =====\n");

console.log("--- 第一次创建 store（模拟首次启动）---");
const store1 = createStore(counterReducer, undefined);
const persistor1 = persistStore(store1, "app_state");

store1.subscribe(() => {
  console.log("  [状态变化]", store1.getState());
});

console.log("派发 INCREMENT 两次:");
store1.dispatch({ type: "INCREMENT" });
store1.dispatch({ type: "INCREMENT" });
console.log("设置主题为 dark:");
store1.dispatch({ type: "SET_THEME", payload: "dark" });

console.log("\n当前 storage 内容:", storage._dump());

console.log("\n--- 第二次创建 store（模拟应用重启，应恢复状态）---");
const store2 = createStore(counterReducer, undefined);
console.log("恢复前初始状态:", store2.getState());
const persistor2 = persistStore(store2, "app_state");
console.log("恢复后状态:", store2.getState());

console.log("\n验证：count 应为 2，theme 应为 dark");
console.log("count =", store2.getState().count, "(期望 2)");
console.log("theme =", store2.getState().theme, "(期望 dark)");

console.log("\n--- 清除持久化数据后重建 store ---");
persistor2.purge();
console.log("storage 内容:", storage._dump());

const store3 = createStore(counterReducer, undefined);
persistStore(store3, "app_state");
console.log("清除后创建 store 状态:", store3.getState(), "(应为默认值)");

// 验证：清除后修改不再持久化（因为新建的 store3 仍会自动保存）
console.log("\n--- 清除后再次操作，重新建立持久化 ---");
store3.dispatch({ type: "INCREMENT" });
console.log("storage 内容:", storage._dump());
