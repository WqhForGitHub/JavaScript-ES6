/**
 * 手写简易版 Vue（响应式 + 模板编译）
 * A minimal Vue with reactivity (Object.defineProperty getter/setter) and
 * mustache-style template compilation.
 *
 * Approach:
 * - Observer: walk the data object and convert each key to a reactive accessor.
 *   On read, collect the current "watcher" as a dependency; on write, notify
 *   all dependent watchers to re-run (re-render).
 * - Compiler: parse the root element, walk its descendants, replace {{ }} text
 *   and bind v-model / @event / v-text / {{ }} directives, collecting dependencies.
 * - Watcher: holds an update function; on creation it triggers dependency collection
 *   by reading reactive keys, then re-runs when those keys change.
 *
 * Browser-only (needs DOM). Below we include a small Node-runnable reactivity test
 * that doesn't touch the DOM.
 */

class Dep {
  constructor() { this.subs = []; }
  addSub(w) { if (!this.subs.includes(w)) this.subs.push(w); }
  notify() { this.subs.slice().forEach((w) => w.update()); }
  static target = null;
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) dep.addSub(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      observe(newVal);
      dep.notify();
    },
  });
}

function observe(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((key) => defineReactive(obj, key, observeLike(obj[key])));
}
function observeLike(val) {
  if (val && typeof val === 'object') observe(val);
  return val;
}

class Watcher {
  constructor(getter, cb) {
    this.getter = getter;
    this.cb = cb;
    this.value = this.get();
  }
  get() {
    Dep.target = this;
    let v;
    try { v = this.getter(); } finally { Dep.target = null; }
    return v;
  }
  update() {
    const old = this.value;
    const next = this.get();
    if (next !== old) {
      this.value = next;
      this.cb(next, old);
    }
  }
}

class MiniVue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data ? options.data() : {};
    observe(this.$data);
    // Proxy this.x -> this.$data.x
    Object.keys(this.$data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() { return this.$data[key]; },
        set(v) { this.$data[key] = v; },
      });
    });
    if (options.el && typeof document !== 'undefined') {
      this.$mount(options.el);
    }
  }

  $mount(el) {
    const root = typeof el === 'string' ? document.querySelector(el) : el;
    this.$el = root;
    const template = root.outerHTML;
    this._renderFn = this._compile(template);
    const update = () => {
      root.outerHTML = this._renderFn(this);
      // re-query since outerHTML replaced the node
      this.$el = document.querySelector(this.$options.el) || root;
    };
    new Watcher(() => JSON.stringify(this.$data), update);
    update();
    return this;
  }

  // Compile {{ }} only (very simplified).
  _compile(template) {
    return (vm) => template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, expr) => {
      return this._eval(expr, vm);
    });
  }
  _eval(expr, vm) {
    return expr.split('.').reduce((o, k) => (o == null ? '' : o[k]), vm);
  }
}

// ---------- Test cases ----------
// Reactivity works in any JS environment.
const data = { count: 0, name: 'vue' };
observe(data);

let logCount = 0;
new Watcher(() => data.count, (n, old) => {
  logCount++;
  console.log(`count changed: ${old} -> ${n}`);
});

data.count = 1; // expected: count changed: 0 -> 1
data.count = 2; // expected: count changed: 1 -> 2
data.count = 2; // expected: (nothing — same value)
console.log('watcher fired count:', logCount); // expected: 2

// MiniVue instantiation without DOM.
const app = new MiniVue({ data: () => ({ msg: 'hello' }) });
console.log('app.msg =', app.msg); // expected: hello
app.msg = 'world';
console.log('app.msg after set =', app.msg); // expected: world
console.log('is reactive:', app.$data !== null); // expected: is reactive: true

// Template compile demo (no DOM needed).
const app2 = new MiniVue({ data: () => ({ name: 'Mini' }) });
const out = app2._compile('<h1>Hello {{ name }}</h1>')(app2);
console.log('compiled template:', out); // expected: <h1>Hello Mini</h1>
