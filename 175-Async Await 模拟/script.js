// async/await 本质 ≈ Generator + 自动执行器
function asyncToGenerator(genFn) {
  return function (...args) {
    const gen = genFn.apply(this, args);
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let res;
        try { res = gen[key](arg); } catch (e) { return reject(e); }
        const { value, done } = res;
        if (done) return resolve(value);
        Promise.resolve(value).then(v => step("next", v), e => step("throw", e));
      }
      step("next");
    });
  };
}
const delay = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
const myAsync = asyncToGenerator(function* () {
  const out = document.getElementById("out"); out.textContent = "start\n";
  const a = yield delay(500, "a 500ms"); out.textContent += a + "\n";
  const b = yield delay(300, "b 300ms"); out.textContent += b + "\n";
  return "done";
});
document.getElementById("go").onclick = () => { document.getElementById("out").textContent = ""; myAsync().then(v => document.getElementById("out").textContent += v); };