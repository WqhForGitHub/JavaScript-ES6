class MyPromise {
  constructor(exec) {
    this.state = "pending"; this.value = undefined; this.cbs = [];
    const resolve = v => this._settle("fulfilled", v);
    const reject = r => this._settle("rejected", r);
    try { exec(resolve, reject); } catch (e) { reject(e); }
  }
  _settle(state, v) {
    if (this.state !== "pending") return;
    if (v && typeof v.then === "function") return v.then(this._settle.bind(this, "fulfilled"), this._settle.bind(this, "rejected"));
    this.state = state; this.value = v;
    setTimeout(() => this.cbs.forEach(([onF, onR]) => this._exec(onF, onR)), 0);
  }
  _exec(onF, onR) {
    if (this.state === "fulfilled") (onF || (v => v))(this.value);
    else (onR || (e => { throw e; }))(this.value);
  }
  then(onF, onR) {
    return new MyPromise((res, rej) => {
      const handle = (cb, settle, fallback) => val => {
        try { const r = cb ? cb(val) : fallback(val); settle(r); }
        catch (e) { rej(e); }
      };
      this.cbs.push([handle(onF, res, v => v), handle(onR, rej, e => { throw e; })]);
      if (this.state !== "pending") setTimeout(() => this._exec(onF, onR));
    });
  }
  catch(onR) { return this.then(null, onR); }
  static resolve(v) { return new MyPromise(r => r(v)); }
  static reject(r) { return new MyPromise((_, j) => j(r)); }
  static all(arr) { return new MyPromise((res, rej) => { const out = []; let n = 0; arr.forEach((p, i) => MyPromise.resolve(p).then(v => { out[i] = v; if (++n === arr.length) res(out); }, rej); }); }
}
const out = [];
MyPromise.resolve(1).then(v => { out.push("then 1: " + v); return v + 1; }).then(v => out.push("then 2: " + v));
MyPromise.all([MyPromise.resolve(3), MyPromise.resolve(5), 7]).then(arr => { out.push("all: [" + arr.join(",") + "]"); document.getElementById("out").textContent = out.join("\n"); });
new MyPromise(r => setTimeout(() => r(100), 200)).then(v => { out.push("async: " + v); document.getElementById("out").textContent = out.join("\n"); });
document.getElementById("code").textContent = MyPromise.toString();