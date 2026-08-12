// Mini Vue
function isObject(v) { return v && typeof v === "object"; }
function observe(data) {
  Object.keys(data).forEach(k => defineReactive(data, k, data[k]));
}
function defineReactive(obj, key, val) {
  if (isObject(val)) observe(val);
  const subs = [];
  Object.defineProperty(obj, key, {
    get() { if (Dep.target) subs.push(Dep.target); return val; },
    set(v) { if (v === val) return; val = v; if (isObject(v)) observe(v); subs.forEach(w => w.update()); }
  });
}
function Watcher(fn) { this.fn = fn; this.update = () => this.fn(); Dep.target = this; this.fn(); Dep.target = null; }
function compile(el, vm) {
  const node = typeof el === "string" ? document.querySelector(el) : el;
  walk(node, vm);
}
function walk(node, vm) {
  node.childNodes.forEach(child => {
    if (child.nodeType === 3) {
      const text = child.textContent;
      if (/\{\{(.+?)\}\}/.test(text)) {
        new Watcher(() => { child.textContent = text.replace(/\{\{(.+?)\}\}/g, (_, k) => vm.$data[k.trim()]); });
      }
    } else if (child.nodeType === 1) {
      [...child.attributes].forEach(a => {
        if (a.name.startsWith("@")) child.addEventListener(a.name.slice(1), vm.$methods[a.value].bind(vm.$data));
        if (a.name.startsWith(":") || a.name === "v-model") {
          const k = a.value; if (a.name === "v-model") child.oninput = e => vm.$data[k] = e.target.value;
          new Watcher(() => { child.value = vm.$data[k]; });
        }
      });
      walk(child, vm);
    }
  });
}
function MiniVue(opts) {
  this.$data = opts.data; this.$methods = opts.methods || {};
  document.querySelector(opts.el).innerHTML = opts.template;
  Object.keys(this.$data).forEach(k => defineReactive(this.$data, k, this.$data[k]));
  compile(opts.el, this);
  if (opts.mounted) opts.mounted.call(this.$data);
}
new MiniVue({
  el: "#app",
  template: `<h1>{{ name }}</h1><p>count = {{ count }}</p><input v-model="name"><br><button @click="dec">-</button><button @click="inc">+</button>`,
  data: { count: 0, name: "Mini Vue" },
  methods: {
    inc() { this.count++; },
    dec() { this.count--; }
  },
  mounted() { this.count = 5; }
});