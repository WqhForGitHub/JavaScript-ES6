/**
 * 手写 Vue3 computed
 *
 * computed 是「惰性」的响应式引用：
 *   - 只有在 .value 被读取时才计算，并缓存结果
 *   - 依赖变化时不会立即重算，只是把缓存标记为 dirty
 *   - 下次读取 .value 时若 dirty 才重新计算
 *   - computed 自身也可被其它 effect 依赖：依赖变化时通过 scheduler 通知上层 effect
 *
 * 实现：
 *   - 用一个 lazy effect 包装 getter
 *   - dirty 标志 + 缓存 value
 *   - getter 依赖变化 → scheduler → 置 dirty + trigger computed 自身
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

// ===== computed 实现 =====
function computed(getter) {
  let value;
  let dirty = true;

  // 用 lazy effect 包装 getter：依赖变化时不重算，只置 dirty
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        trigger(c, "value"); // 通知依赖该 computed 的 effect
      }
    },
  });

  const c = { __v_isRef: true };
  Object.defineProperty(c, "value", {
    get() {
      if (dirty) {
        value = runner.run(); // 重新计算（run 内会重新收集依赖）
        dirty = false;
      }
      track(c, "value"); // 让上层 effect 依赖此 computed
      return value;
    },
  });
  return c;
}

// ===== 测试 =====
const count = ref(1);
const double = computed(() => {
  console.log("  [computed] recompute");
  return count.value * 2;
});

// 1) 惰性：未读取前不计算
console.log("--- 首次读取 ---");
console.log("double =", double.value); // 触发计算：[computed] recompute -> 2

// 2) 缓存：再读不重算
console.log("--- 再次读取（命中缓存）---");
console.log("double =", double.value); // 2（无 recompute）

// 3) 依赖变化：仅置 dirty，不立即重算
console.log("--- 修改 count ---");
count.value = 10; // 不打印 recompute（惰性）
console.log("double =", double.value); // 触发重算 -> 20

// 4) computed 可被 effect 依赖
console.log("--- effect 依赖 computed ---");
const plus = computed(() => count.value + 100);
effect(() => {
  console.log("effect: plus =", plus.value);
});
// effect: plus = 110
count.value = 20; // 依赖链：count 变 -> plus dirty -> 通知 effect -> effect 重读 plus -> 重算
// effect: plus = 120

// 5) 链式 computed
const a = ref(1);
const b = computed(() => a.value + 1);
const c2 = computed(() => b.value * 10);
effect(() => console.log("chain:", c2.value)); // chain: 20
a.value = 5; // chain: 60
