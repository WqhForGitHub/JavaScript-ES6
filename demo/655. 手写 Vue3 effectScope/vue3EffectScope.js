/**
 * 手写 Vue3 effectScope
 *
 * effectScope 创建一个「作用域」，在其中创建的 effect / computed / watch
 * 都会被收集到该作用域；调用 scope.stop() 可一次性停止作用域内所有 effect，
 * 释放依赖与内存（常用于组件卸载、可组合函数清理）。
 *
 * 实现：
 *   - 维护 activeEffectScope 栈，effect 创建时若处于某 scope 则登记
 *   - scope.stop() 遍历自身 effects 与子 scopes，递归停止
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

// ===== effect（支持 scope 与 stop）=====
let activeEffectScope = null;
function effect(fn, options = {}) {
  const _effect = {
    fn,
    deps: [],
    scheduler: options.scheduler,
    scope: activeEffectScope,
    active: true,
    run() {
      if (!this.active) return this.fn();
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
        for (const dep of this.deps) dep.delete(this);
        this.deps.length = 0;
        this.active = false;
      }
    },
  };
  // 登记到当前 scope
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(_effect);
  }
  if (!options.lazy) _effect.run();
  return _effect;
}

// ===== effectScope 实现 =====
function effectScope(detached = false) {
  const scope = {
    effects: [],
    cleanups: [],
    parent: null,
    scopes: [], // 子作用域
    active: true,
    run(fn) {
      if (!this.active) return;
      const prev = activeEffectScope;
      activeEffectScope = this;
      try {
        return fn();
      } finally {
        activeEffectScope = prev;
      }
    },
    onCleanup(fn) {
      if (this.active) this.cleanups.push(fn);
    },
    stop() {
      if (!this.active) return;
      // 停止所有 effect
      for (const e of this.effects) e.stop();
      this.effects.length = 0;
      // 执行清理回调
      for (const c of this.cleanups) c();
      this.cleanups.length = 0;
      // 递归停止子作用域
      for (const s of this.scopes) s.stop();
      this.scopes.length = 0;
      this.active = false;
    },
  };
  // 非独立 scope 挂到父 scope
  if (activeEffectScope && activeEffectScope.active && !detached) {
    activeEffectScope.scopes.push(scope);
    scope.parent = activeEffectScope;
  }
  return scope;
}

// ===== 测试 =====
const state = ref(0);
let triggerCount = 0;

// 1) 在 scope 内创建 effect，stop 后不再响应
const scope = effectScope();
scope.run(() => {
  effect(() => {
    triggerCount++;
    console.log("effect in scope: state =", state.value);
  });
});
// effect in scope: state = 0
console.log("initial triggerCount:", triggerCount); // 1

state.value = 1; // effect in scope: state = 1
console.log("after change:", triggerCount); // 2

scope.stop();
state.value = 2; // 不再触发（scope 已停止）
console.log("after stop:", triggerCount); // 仍是 2

// 2) 嵌套 scope：父停止时子也停止
const parent = effectScope();
let childEffectCount = 0;
parent.run(() => {
  effect(() => console.log("parent effect:", state.value));
  const child = effectScope();
  child.run(() => {
    effect(() => {
      childEffectCount++;
      console.log("child effect:", state.value);
    });
  });
});
// parent effect: 0, child effect: 0
state.value = 10; // parent effect: 10, child effect: 10
console.log("child count:", childEffectCount); // 2

parent.stop();
state.value = 20; // 父子都不再响应
console.log("child count after parent stop:", childEffectCount); // 仍 2

// 3) onCleanup：scope 停止时执行清理
const scope2 = effectScope();
let cleaned = false;
scope2.run(() => {
  scope2.onCleanup(() => {
    cleaned = true;
    console.log("scope2 cleanup called");
  });
});
scope2.stop(); // scope2 cleanup called
console.log("cleaned:", cleaned); // true
