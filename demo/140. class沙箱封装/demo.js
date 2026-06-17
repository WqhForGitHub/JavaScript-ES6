// 140. class沙箱封装

class Sandbox {
  #state = {};
  set(k, v) {
    this.#state[k] = v;
  }
  run(fn) {
    return fn({ ...this.#state });
  }
}
const box = new Sandbox();
box.set("x", 1);
console.log(box.run((s) => s.x + 1));
