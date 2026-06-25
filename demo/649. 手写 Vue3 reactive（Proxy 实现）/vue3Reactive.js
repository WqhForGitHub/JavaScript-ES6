/**
 * 手写 Vue3 reactive（Proxy 实现）
 *
 * Vue3 用 ES6 Proxy 取代 Vue2 的 Object.defineProperty 实现响应式：
 *   - Proxy 能监听属性的新增 / 删除（defineProperty 不能）
 *   - 能监听数组索引 / length 变化
 *   - 惰性递归：访问嵌套对象时才把它代理化（性能更好）
 *
 * 核心三件套：
 *   - effect(fn)：把 fn 设为当前活跃 effect 并执行，执行过程中被读取的属性会收集该 effect
 *   - track(target, key)：建立 target -> key -> Set<effect> 的依赖映射
 *   - trigger(target, key)：取出依赖该属性的 effect 们并重新执行
 *   - reactive(target)：返回 Proxy，get 时 track、set 时 trigger
 */

// ===== 响应式核心 =====
let activeEffect = null;
const targetMap = new WeakMap(); // target -> Map<key, Set<effect>>

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  // 拷贝一份再遍历，避免 effect 执行过程中增删 dep 导致无限循环
  [...dep].forEach((eff) => {
    if (eff === activeEffect) return; // 避免自增递归
    if (eff.scheduler) eff.scheduler();
    else eff.run();
  });
}

function cleanup(effect) {
  // 从所有依赖 dep 中移除自己，便于重新收集
  for (const dep of effect.deps) dep.delete(effect);
  effect.deps.length = 0;
}

function effect(fn, options = {}) {
  const _effect = {
    fn,
    deps: [],
    scheduler: options.scheduler,
    active: true,
    run() {
      if (!this.active) return this.fn();
      cleanup(this);
      const prev = activeEffect;
      activeEffect = this;
      try {
        return this.fn();
      } finally {
        activeEffect = prev;
      }
    },
    stop() {
      if (this.active) {
        cleanup(this);
        this.active = false;
      }
    },
  };
  if (!options.lazy) _effect.run();
  return _effect;
}

// ===== reactive 实现 =====
const reactiveMap = new WeakMap(); // 缓存，避免重复代理
function isObject(v) {
  return v !== null && typeof v === "object";
}
function reactive(target) {
  if (!isObject(target)) return target;
  if (target.__v_isReactive) return target; // 已是代理
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const handlers = {
    get(obj, key, receiver) {
      if (key === "__v_isReactive") return true;
      const res = Reflect.get(obj, key, receiver);
      track(obj, key);
      // 惰性递归：嵌套对象访问时才代理
      if (isObject(res)) return reactive(res);
      return res;
    },
    set(obj, key, value, receiver) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const old = obj[key];
      const res = Reflect.set(obj, key, value, receiver);
      // 新增或值真正变化才触发
      if (!had || old !== value) {
        trigger(obj, key);
        // 数组 length 变化 / 新增 key 也触发 ITERATE
        if (!had) trigger(obj, ITERATE_KEY);
      }
      return res;
    },
    deleteProperty(obj, key) {
      const had = Object.prototype.hasOwnProperty.call(obj, key);
      const res = Reflect.deleteProperty(obj, key);
      if (had) {
        trigger(obj, key);
        trigger(obj, ITERATE_KEY);
      }
      return res;
    },
    has(obj, key) {
      const res = Reflect.has(obj, key);
      track(obj, key);
      return res;
    },
    ownKeys(obj) {
      track(obj, ITERATE_KEY);
      return Reflect.ownKeys(obj);
    },
  };
  const proxy = new Proxy(target, handlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

const ITERATE_KEY = Symbol("iterate");

// ===== 测试 =====
const state = reactive({ count: 0, nested: { a: 1 }, list: [1, 2] });

// 1) 基本响应：读取 count 时收集 effect，修改后自动重跑
effect(() => {
  console.log("effect1: count =", state.count);
});
// effect1: count = 0
state.count = 1; // effect1: count = 1
state.count = 2; // effect1: count = 2
state.count = 2; // 值未变，不触发

// 2) 嵌套对象响应式（惰性递归）
effect(() => {
  console.log("effect2: nested.a =", state.nested.a);
});
// effect2: nested.a = 1
state.nested.a = 10; // effect2: nested.a = 10

// 3) 新增属性（Proxy 能监听，defineProperty 不能）
effect(() => {
  console.log("effect3: name =", state.name); // 初始 undefined
});
state.name = "Vue"; // effect3: name = Vue

// 4) 数组变更
effect(() => {
  console.log("effect4: list =", state.list.join(","));
});
// effect4: list = 1,2
state.list.push(3); // effect4: list = 1,2,3

// 5) 避免自增递归（state.count++ 在 effect 中不会无限循环）
let runs = 0;
effect(() => {
  runs++;
  if (state.count < 5) state.count++; // 自身修改自身，但不会递归触发自己
});
console.log("runs after self-increment loop:", runs, "count=", state.count);

// 6) stop 停止响应
const eff = effect(() => {
  console.log("effect6: count =", state.count);
});
eff.stop();
state.count = 99; // 不会触发 effect6
console.log("after stop, count =", state.count);
