/**
 * 手写 Vue3 provide / inject
 *
 * provide / inject 实现跨层级依赖注入：
 *   - 祖先组件用 provide(key, value) 提供值
 *   - 后代组件用 inject(key, default?) 注入值
 *   - inject 会沿组件父链向上查找最近的 provide
 *   - 支持注入响应式数据（ref / reactive），后代修改会反映到祖先
 *
 * 实现：用「组件实例树」模拟，每个实例有 provides 字段，
 *   provide 时写入当前实例的 provides（基于父级 provides 原型链），
 *   inject 时沿 parent 链查找。
 */

// ===== 响应式核心（精简）=====
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

// ===== 组件实例与 provide/inject =====
let currentInstance = null;

function createInstance(parent = null) {
  return {
    parent,
    provides: parent ? parent.provides : Object.create(null), // 原型链继承父级
    children: [],
    setup: null,
    mounted: null,
  };
}

// 在某实例上下文中执行 fn
function withInstance(instance, fn) {
  const prev = currentInstance;
  currentInstance = instance;
  try {
    return fn();
  } finally {
    currentInstance = prev;
  }
}

// provide：写入当前实例的 provides
//   用原型链：若直接在继承来的对象上写会污染父级，所以首次写时克隆
function provide(key, value) {
  const instance = currentInstance;
  if (!instance) return;
  // 若 provides 仍是父级的引用，则创建自己的 provides（以父级为原型）
  if (
    instance.provides === (instance.parent ? instance.parent.provides : null)
  ) {
    instance.provides = Object.create(
      instance.parent ? instance.parent.provides : null,
    );
  }
  instance.provides[key] = value;
}

// inject：沿原型链（provides）向上查找
function inject(key, defaultValue) {
  const instance = currentInstance;
  const provides = instance ? instance.provides : null;
  if (provides && key in provides) {
    return provides[key];
  }
  if (arguments.length > 1) {
    return typeof defaultValue === "function" ? defaultValue() : defaultValue;
  }
  return undefined;
}

// ===== 测试 =====
// 模拟组件树：App -> Toolbar -> Button
const themeRef = ref("dark");
const user = { name: "Evan" };

function setupApp(instance) {
  withInstance(instance, () => {
    provide("theme", themeRef); // 注入响应式 ref
    provide("user", user); // 注入普通对象
    provide("count", 0);
  });
}

function setupToolbar(instance) {
  withInstance(instance, () => {
    // 中间层不提供 theme，但提供自己的 'toolbar'
    provide("toolbar", "main");
  });
}

function setupButton(instance) {
  return withInstance(instance, () => {
    const theme = inject("theme"); // 沿父链找到 App 提供的 theme
    const toolbar = inject("toolbar"); // 找到 Toolbar 提供的
    const missing = inject("nope", "default"); // 没找到，用默认值
    const count = inject("count");
    return { theme, toolbar, missing, count };
  });
}

// 构建实例树
const app = createInstance(null);
setupApp(app);
const toolbar = createInstance(app);
app.children.push(toolbar);
setupToolbar(toolbar);
const button = createInstance(toolbar);
toolbar.children.push(button);
const result = setupButton(button);

console.log("injected:", JSON.stringify(result));
// injected: {"theme":{"_value":"dark"},"toolbar":"main","missing":"default","count":0}
console.log("theme.value:", result.theme.value); // dark
console.log("toolbar:", result.toolbar); // main
console.log("missing:", result.missing); // default

// 注入的是同一个 ref，修改会反映到祖先
result.theme.value = "light";
console.log("ancestor themeRef.value:", themeRef.value); // light

// 中间层覆盖：在 Toolbar 也 provide theme，Button 拿到的是最近的
function setupToolbarOverride(instance) {
  withInstance(instance, () => {
    provide("theme", ref("blue")); // 覆盖父级
  });
}
const tb2 = createInstance(app);
setupToolbarOverride(tb2);
const btn2 = createInstance(tb2);
const r2 = setupButton(btn2);
console.log("override theme:", r2.theme.value); // blue（取最近）
console.log("app theme still:", themeRef.value); // light（祖先未被覆盖）

// 响应式注入 + effect：注入的 ref 变化时 effect 自动重跑
function effect(fn) {
  const _e = {
    fn,
    deps: [],
    run() {
      const p = activeEffect;
      activeEffect = this;
      try {
        fn();
      } finally {
        activeEffect = p;
      }
    },
  };
  _e.run();
  return _e;
}
effect(() => console.log("reactive inject effect: theme =", themeRef.value));
// reactive inject effect: theme = light
themeRef.value = "purple";
// reactive inject effect: theme = purple
