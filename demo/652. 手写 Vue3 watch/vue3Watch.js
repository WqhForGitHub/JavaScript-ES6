/**
 * 手写 Vue3 watch
 *
 * watch 显式监听一个响应式数据源，并在其变化时执行回调，可拿到新旧值：
 *   watch(source, (newVal, oldVal) => {...}, options?)
 *   - source 可以是 ref / reactive 对象 / getter 函数 / 数组
 *   - options.immediate：立即以当前值执行一次回调
 *   - options.flush: 'pre' | 'post' | 'sync'（这里简化为同步）
 *
 * 实现：
 *   - 用一个 lazy effect 包装 getter，getter 中读取 source 以收集依赖
 *   - 依赖变化时不立即重跑 effect，而是走 scheduler：调用 cb(newValue, oldValue)
 *   - 首次运行只收集依赖、记录 oldValue，不触发 cb（除非 immediate）
 */

// ===== 响应式核心 =====
let activeEffect = null;
const targetMap = new WeakMap();
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  [...dep].forEach((eff) => {
    if (eff === activeEffect) return;
    if (eff.scheduler) eff.scheduler();
    else eff.run();
  });
}
function effect(fn, options = {}) {
  const _effect = {
    fn,
    deps: [],
    scheduler: options.scheduler,
    run() {
      const prev = activeEffect;
      activeEffect = this;
      try {
        return this.fn();
      } finally {
        activeEffect = prev;
      }
    },
  };
  if (!options.lazy) _effect.run();
  return _effect;
}
function isObject(v) {
  return v !== null && typeof v === "object";
}
function reactive(target) {
  return new Proxy(target, {
    get(obj, key, r) {
      const res = Reflect.get(obj, key, r);
      track(obj, key);
      return isObject(res) ? reactive(res) : res;
    },
    set(obj, key, v, r) {
      const old = obj[key];
      const res = Reflect.set(obj, key, v, r);
      if (old !== v) trigger(obj, key);
      return res;
    },
  });
}
function ref(value) {
  const r = { __v_isRef: true, _value: value };
  Object.defineProperty(r, "value", {
    get() {
      track(r, "value");
      return this._value;
    },
    set(v) {
      if (v !== this._value) {
        this._value = v;
        trigger(r, "value");
      }
    },
  });
  return r;
}

// ===== watch 实现 =====
function traverse(obj, seen = new Set()) {
  if (!isObject(obj) || seen.has(obj)) return obj;
  seen.add(obj);
  for (const k in obj) traverse(obj[k], seen);
  return obj;
}

function watch(source, cb, options = {}) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else if (isObject(source) && source.__v_isReactive) {
    getter = () => traverse(source);
  } else if (source && source.__v_isRef) {
    getter = () => source.value;
  } else if (Array.isArray(source)) {
    getter = () => source.map((s) => (s && s.__v_isRef ? s.value : s));
  } else {
    getter = () => source;
  }

  let oldValue;
  const job = () => {
    const newValue = runner.run();
    if (newValue !== oldValue || isObject(newValue)) {
      cb(newValue, oldValue);
      oldValue = newValue;
    }
  };

  const runner = effect(getter, {
    lazy: true,
    scheduler: job,
  });

  oldValue = runner.run();
  if (options.immediate) {
    cb(oldValue, undefined);
  }
  // 返回停止函数
  return () => runner.stop && runner.stop();
}

// 给 reactive 对象打标记
function markReactive(obj) {
  obj.__v_isReactive = true;
  return obj;
}

// ===== 测试 =====
// 1) 监听 ref
const count = ref(0);
watch(count, (n, o) => {
  console.log(`[watch ref] ${o} -> ${n}`);
});
count.value = 1; // [watch ref] 0 -> 1
count.value = 2; // [watch ref] 1 -> 2

// 2) 监听 getter
const state = reactive({ user: { name: "A", age: 18 } });
watch(
  () => state.user.age,
  (n, o) => console.log(`[watch getter] age ${o} -> ${n}`),
);
state.user.age = 19; // [watch getter] age 18 -> 19
state.user.age = 19; // 值未变，不触发

// 3) immediate
const obj = ref("x");
watch(obj, (n, o) => console.log(`[watch immediate] n=${n}, o=${o}`), {
  immediate: true,
});
// [watch immediate] n=x, o=undefined
obj.value = "y"; // [watch immediate] n=y, o=x

// 4) 监听 reactive 对象（深度遍历）
const deep = markReactive(reactive({ a: { b: 1 } }));
let deepCount = 0;
watch(deep, () => {
  deepCount++;
  console.log(`[watch deep] triggered #${deepCount}`);
});
deep.a.b = 2; // [watch deep] triggered #1
deep.a.b = 3; // [watch deep] triggered #2
