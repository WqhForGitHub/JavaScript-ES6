/**
 * 手写 Pinia 简易版
 * ==================
 * Pinia 是 Vue 的官方状态管理库，主要特性：
 * 1. 每个 store 有唯一 id
 * 2. 使用 setup 函数定义 store，返回 state、getters、actions
 *    - state: ref / reactive
 *    - getters: computed
 *    - actions: 普通函数，可直接修改 state
 * 3. 通过 useXxxStore() 获取 store 实例
 *
 * 此简化版不依赖 Vue，使用普通闭包 + 手动订阅实现响应式效果：
 *   - state: 普通对象
 *   - getters: 函数（基于 state 计算）
 *   - actions: 函数（可修改 state）
 *   - 提供 $subscribe / $onAction 等扩展
 */

/**
 * 全局 store 注册表，按 id 缓存，保证单例
 */
const storeMap = new Map();

/**
 * defineStore：定义一个 Pinia-like store
 * @param {string} id - store 唯一标识
 * @param {(store) => object} setup - setup 函数，接收 store 上下文，返回 { state, getters, actions }
 * @returns {() => object} useStore 函数
 */
function defineStore(id, setup) {
  // 返回 useStore 函数（Pinia 的惯用形式）
  return function useStore() {
    // 单例：已存在直接返回
    if (storeMap.has(id)) {
      return storeMap.get(id);
    }

    // 订阅者列表
    const listeners = new Set();

    /**
     * 内部 setState：修改 state 并通知订阅者
     * @param {object} partial - 部分更新
     */
    const setState = (partial) => {
      Object.assign(store._state, partial);
      // 触发 $subscribe 回调
      for (const fn of listeners) {
        fn(store._state);
      }
    };

    // store 上下文（提供给 setup 使用）
    const context = {
      id,
      // state 是普通对象，可通过 patch 更新
      patch: setState,
    };

    // 执行 setup，得到 state / getters / actions
    const definition = setup(context);

    // 构造 store 对象
    const store = {
      $id: id,
      _state: definition.state || {},
      _getters: definition.getters || {},
      _actions: definition.actions || {},
      _listeners: listeners,
    };

    // 暴露 state（只读视图）
    store.$state = store._state;

    // 暴露 getters（getter 实际是函数，每次访问重新计算）
    for (const key of Object.keys(store._getters)) {
      Object.defineProperty(store, key, {
        get() {
          return store._getters[key](store._state);
        },
        enumerable: true,
      });
    }

    // 暴露 actions（绑定 this 为 store 上下文，便于直接调用）
    for (const key of Object.keys(store._actions)) {
      store[key] = (...args) => {
        // action 调用时提供 patch 和 state
        const ctx = {
          state: store._state,
          patch: setState,
          get: (k) => store._state[k],
        };
        return store._actions[key].apply(ctx, args);
      };
    }

    /**
     * $subscribe：监听 state 变更
     * @param {(state: object) => void} fn
     * @returns {() => void} 取消订阅
     */
    store.$subscribe = (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    };

    /**
     * $reset：重置 state（这里只清空字段，因为简化版没有保存初始快照）
     */
    store.$reset = () => {
      for (const key of Object.keys(store._state)) {
        delete store._state[key];
      }
    };

    // 缓存单例
    storeMap.set(id, store);
    return store;
  };
}

// ============================================================
// 测试用例：counter store
// ============================================================
console.log("===== 952. 手写 Pinia 简易版 =====");

const useCounterStore = defineStore("counter", () => ({
  // state
  state: {
    count: 0,
    name: "counter",
  },
  // getters（基于 state 计算）
  getters: {
    double: (state) => state.count * 2,
    description: (state) => `${state.name}: ${state.count}`,
  },
  // actions（修改 state）
  actions: {
    increment() {
      // 通过 this.patch 修改
      this.patch({ count: this.state.count + 1 });
    },
    incrementBy(n) {
      this.patch({ count: this.state.count + n });
    },
    setName(name) {
      this.patch({ name });
    },
    reset() {
      this.patch({ count: 0 });
    },
  },
}));

const counter = useCounterStore();

console.log("初始 state:", counter.$state);
console.log("getter double:", counter.double);
console.log("getter description:", counter.description);

// 订阅 state 变更
const unsubscribe = counter.$subscribe((state) => {
  console.log(
    "[subscribe] state 变更:",
    { ...state },
    "double =",
    state.count * 2,
  );
});

console.log("\n--- increment() ---");
counter.increment();
console.log("count =", counter.$state.count, ", double =", counter.double);

console.log("\n--- incrementBy(10) ---");
counter.incrementBy(10);
console.log("count =", counter.$state.count, ", double =", counter.double);

console.log('\n--- setName("my-counter") ---');
counter.setName("my-counter");
console.log("description:", counter.description);

console.log("\n--- reset() ---");
counter.reset();
console.log("count =", counter.$state.count, ", double =", counter.double);

// 单例验证
const sameStore = useCounterStore();
console.log("\n单例验证:", sameStore === counter);

unsubscribe();
console.log("已取消订阅");
