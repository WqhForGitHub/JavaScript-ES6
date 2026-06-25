/**
 * 手写 Vue3 watchEffect
 *
 * watchEffect 立即执行一次副作用函数，并自动收集其中用到的响应式依赖；
 * 依赖变化时自动重新执行。与 watch 的区别：
 *   - 无需指定数据源，自动追踪
 *   - 拿不到旧值（除非自己记录）
 *   - 立即执行（相当于 immediate）
 *   - 支持通过 onCleanup 注册「上一次副作用的清理函数」，重跑前调用
 *
 * 实现：
 *   - 用 effect 包装 fn，scheduler = 重新 run
 *   - 每次执行前调用上一次的 cleanup
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
    stop() {
      for (const dep of this.deps) dep.delete(this);
      this.deps.length = 0;
    },
  };
  if (!options.lazy) _effect.run();
  return _effect;
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

// ===== onCleanup 机制 =====
let activeCleanup = null;
function onCleanup(fn) {
  if (activeCleanup) activeCleanup._cleanup = fn;
}

// ===== watchEffect 实现 =====
function watchEffect(fn) {
  let cleanupFn = null;
  const _effect = {
    deps: [],
    run() {
      // 重跑前先清理上一次副作用
      if (typeof cleanupFn === "function") {
        cleanupFn();
        cleanupFn = null;
      }
      const prev = activeEffect;
      activeEffect = this;
      // 让 onCleanup 注册的 cleanup 绑定到本次执行
      const prevCleanupSetter = activeCleanup;
      const holder = {};
      activeCleanup = holder;
      try {
        // 通过 onCleanup 注入：把 cleanup 存到 holder
        const wrapped = () => fn(onCleanupRef);
        // 直接调用 fn，并把一个 setter 作为参数传入
        fn(setCleanup);
        function setCleanup(f) {
          cleanupFn = f;
        }
      } finally {
        activeEffect = prev;
        activeCleanup = prevCleanupSetter;
      }
    },
  };
  _effect.scheduler = () => _effect.run();
  _effect.run();
  return () => _effect.stop();
}

// 上面实现略复杂，下面用更直接的方式重写 watchEffect（清晰版）
function watchEffect2(fn) {
  let cleanupFn = null;
  const runner = effect(
    () => {
      // 执行前清理上次
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = null;
      }
      // 把注册 cleanup 的函数传给用户
      fn((cleanup) => {
        cleanupFn = cleanup;
      });
    },
    {
      scheduler: () => runner.run(),
    },
  );
  return () => runner.stop();
}

// 覆盖上面的 watchEffect，使用清晰版
watchEffect = watchEffect2;

// ===== 测试 =====
const id = ref(1);

// 1) 自动追踪 + 立即执行
watchEffect(() => {
  console.log("watchEffect: id =", id.value);
});
// watchEffect: id = 1
id.value = 2; // watchEffect: id = 2
id.value = 3; // watchEffect: id = 3

// 2) cleanup：模拟请求竞态
const keyword = ref("a");
let requestSeq = 0;
const stop = watchEffect((onCleanup) => {
  const seq = ++requestSeq;
  console.log(`  [effect] 发起请求: keyword=${keyword.value}, seq=${seq}`);
  const timer = setTimeout(() => {
    console.log(`  [response] seq=${seq} 返回: 结果 for ${keyword.value}`);
  }, 0);
  onCleanup(() => {
    clearTimeout(timer);
    console.log(`  [cleanup] 取消 seq=${seq} 的请求`);
  });
});
// 立即执行：发起请求 seq=1
keyword.value = "b"; // cleanup seq=1，再发起 seq=2
keyword.value = "c"; // cleanup seq=2，再发起 seq=3

setTimeout(() => {
  console.log("--- 停止 watchEffect ---");
  stop();
  keyword.value = "d"; // 不再触发
}, 10);
