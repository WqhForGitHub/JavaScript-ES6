// reactive / effect / computed 实现
let activeEffect = null;
const depsMap = new WeakMap();
function track(target, key) {
  if (!activeEffect) return;
  let keyMap = depsMap.get(target); if (!keyMap) depsMap.set(target, keyMap = new Map());
  let dep = keyMap.get(key); if (!dep) keyMap.set(key, dep = new Set());
  dep.add(activeEffect);
}
function trigger(target, key) {
  const keyMap = depsMap.get(target); if (!keyMap) return;
  const dep = keyMap.get(key); if (dep) dep.forEach(f => f());
}
function reactive(target) {
  return new Proxy(target, {
    get(t, k) { track(t, k); return typeof t[k] === "object" && t[k] ? reactive(t[k]) : t[k]; },
    set(t, k, v) { t[k] = v; trigger(t, k); return true; }
  });
}
function effect(fn) { const _fn = () => { activeEffect = _fn; fn(); activeEffect = null; }; _fn(); }
function computed(fn) { let cache, dirty = true; const _fn = () => { activeEffect = _fn2; cache = fn(); }; const _fn2 = () => { dirty = true; trigger(state, "_"); }; _fn(); return { get value() { return cache; } }; }
const state = reactive({ first: "王", last: "小明", full_: "" });
effect(() => document.getElementById("full").textContent = state.first + state.last);
effect(() => document.getElementById("len").textContent = state.first.length);
const doubled = computed(() => (state.first + state.last).repeat(2));
effect(() => document.getElementById("double").textContent = doubled.value);
document.getElementById("first").oninput = e => state.first = e.target.value;
document.getElementById("last").oninput = e => state.last = e.target.value;