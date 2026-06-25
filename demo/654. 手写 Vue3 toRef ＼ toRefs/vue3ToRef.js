/**
 * 手写 Vue3 toRef / toRefs
 *
 * toRef / toRefs 用于「解构」reactive 对象时保持响应性：
 *   - 解构 reactive 对象会丢失响应（因为得到的是原始值副本）
 *   - toRef(obj, key)：把某个属性包装成 ref，该 ref 的 .value 读写代理到 obj[key]
 *   - toRefs(obj)：把所有可枚举属性都转成 ref，返回普通对象
 *   - 这样解构后每个变量仍是 ref，修改会反映回原 reactive 对象
 *
 * 实现要点：返回的 ref 用 getter/setter 代理到原对象属性，
 *   读 .value 触发 track(obj, key)，写 .value 触发 trigger(obj, key)。
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
function isRef(r) {
  return !!(r && r.__v_isRef === true);
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

// ===== toRef 实现 =====
function toRef(object, key, defaultValue) {
  const val = defaultValue;
  const r = { __v_isRef: true, _object: object, _key: key };
  Object.defineProperty(r, "value", {
    get() {
      const v = this._object[this._key];
      return v === undefined ? val : v;
    },
    set(v) {
      this._object[this._key] = v;
    },
    enumerable: true,
  });
  return r;
}

// ===== toRefs 实现 =====
function toRefs(object) {
  const ret = Array.isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

// ===== proxyRefs：自动 unwrap（模板 / setup 返回值用）=====
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}

// ===== 测试 =====
const state = reactive({ name: "Vue", count: 0 });

// 1) 直接解构丢失响应性
let directName = state.name; // 原始值副本
effect(() => {
  console.log("direct effect: name =", directName);
});
directName = "React"; // 改副本，state 不变，effect 也不重跑
console.log("state.name after direct change:", state.name); // Vue

// 2) toRefs 解构保持响应
const { name, count } = toRefs(state);
console.log("isRef(name):", isRef(name)); // true
effect(() => {
  console.log("toRefs effect: name =", name.value, "count =", count.value);
});
// toRefs effect: name = Vue count = 0
name.value = "React";
// toRefs effect: name = React count = 0
console.log("state.name after ref change:", state.name); // React（同步回原对象）

count.value = 5;
// toRefs effect: name = React count = 5
console.log("state.count:", state.count); // 5

// 3) 反向：改 reactive 对象，ref 也跟着变
state.name = "Angular";
console.log("name.value:", name.value); // Angular
effect(() => console.log("reflect effect: name =", name.value)); // Angular
state.name = "Svelte"; // reflect effect: name = Svelte

// 4) proxyRefs 自动 unwrap
const setup = proxyRefs({ visible: ref(false), title: "hi" });
effect(() => {
  console.log("proxyRefs effect: visible =", setup.visible); // 直接访问，无需 .value
});
// proxyRefs effect: visible = false
setup.visible = true; // 自动写入 ref.value
// proxyRefs effect: visible = true
console.log("visible ref value:", setup.visible); // true
