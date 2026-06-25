/**
 * 手写 Vue3 ref
 *
 * ref 用于包装「任意类型」值（包括原始值）为响应式：
 *   - 原始值无法被 Proxy 代理，所以 ref 用一个带 .value 访问器的对象包装
 *   - 访问 .value 时 track，修改 .value 时 trigger
 *   - 若传入对象，内部用 reactive 包装（深层响应）
 *   - 模板中自动 unwrap（这里只演示 .value 机制）
 *
 * 依赖 649 的 track / trigger / effect / reactive 核心。
 */

// ===== 响应式核心（与 649 一致，精简版）=====
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
  const handlers = {
    get(obj, key, receiver) {
      const res = Reflect.get(obj, key, receiver);
      track(obj, key);
      if (isObject(res)) return reactive(res);
      return res;
    },
    set(obj, key, value, receiver) {
      const old = obj[key];
      const res = Reflect.set(obj, key, value, receiver);
      if (old !== value) trigger(obj, key);
      return res;
    },
  };
  return new Proxy(target, handlers);
}

// ===== ref 实现 =====
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function ref(value) {
  if (isRef(value)) return value;
  const r = {
    __v_isRef: true,
    _raw: value,
    _value: isObject(value) ? reactive(value) : value,
  };
  Object.defineProperty(r, "value", {
    get() {
      track(r, "value");
      return this._value;
    },
    set(newVal) {
      const raw = isObject(newVal) ? newVal : newVal;
      if (raw !== this._raw) {
        this._raw = raw;
        this._value = isObject(newVal) ? reactive(newVal) : newVal;
        trigger(r, "value");
      }
    },
    enumerable: true,
  });
  return r;
}

// 便捷：把 ref 解包到 reactive 中（unref）
function unref(r) {
  return isRef(r) ? r.value : r;
}

// ===== 测试 =====
// 1) 原始值 ref
const count = ref(0);
effect(() => {
  console.log("count effect:", count.value);
});
// count effect: 0
count.value = 1; // count effect: 1
count.value = 2; // count effect: 2
count.value = 2; // 值未变，不触发

// 2) 对象 ref：内部 reactive，深层响应
const obj = ref({ a: 1 });
effect(() => {
  console.log("obj effect: a =", obj.value.a);
});
// obj effect: a = 1
obj.value.a = 99; // obj effect: a = 99（深层响应）
obj.value = { a: 5 }; // 整体替换也触发：obj effect: a = 5

// 3) isRef / unref
console.log("isRef(count):", isRef(count)); // true
console.log("isRef(123):", isRef(123)); // false
console.log("unref(count):", unref(count)); // 2

// 4) 多个 effect 共享同一个 ref
const name = ref("A");
let renderLog = [];
effect(() => renderLog.push("render1:" + name.value));
effect(() => renderLog.push("render2:" + name.value));
console.log("initial logs:", renderLog); // ['render1:A','render2:A']
renderLog = [];
name.value = "B";
console.log("after change:", renderLog); // ['render1:B','render2:B']
