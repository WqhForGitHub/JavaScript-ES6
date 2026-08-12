class Store {
  constructor({ state = {}, getters = {}, mutations = {}, actions = {} }) {
    this.state = new Proxy(state, { set: (t, k, v) => { t[k] = v; this.render(k); return true; } });
    this.getters = {}; this.mutations = mutations; this.actions = actions; this.subs = [];
    Object.keys(getters).forEach(k => Object.defineProperty(this.getters, k, { get: () => getters[k](this.state) }));
  }
  commit(type, payload) { const m = this.mutations[type]; m && m(this.state, payload); }
  dispatch(type, payload) { return this.actions[type]?.(this, payload); }
  subscribe(fn) { this.subs.push(fn); }
  render() { this.subs.forEach(f => f()); }
}
const store = new Store({
  state: { count: 0 },
  getters: { double: s => s.count * 2 },
  mutations: { INC(s, n = 1) { s.count += n; }, RESET(s) { s.count = 0; } },
  actions: { asyncInc(ctx, n) { return new Promise(r => setTimeout(() => { ctx.commit("INC", n); r(); }, 1000)); } }
});
function render() {
  document.getElementById("c").textContent = store.state.count;
  document.getElementById("d").textContent = store.getters.double;
}
const log = [];
store.subscribe(() => { render(); log.unshift(new Date().toLocaleTimeString() + " · count=" + store.state.count); document.getElementById("log").innerHTML = log.map(l => "<div>" + l + "</div>").join(""); });
document.getElementById("inc").onclick = () => store.commit("INC", 1);
document.getElementById("async").onclick = () => store.dispatch("asyncInc", 10);
document.getElementById("reset").onclick = () => store.commit("RESET");
render();