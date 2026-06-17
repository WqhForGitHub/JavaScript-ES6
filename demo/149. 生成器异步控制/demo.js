// 149. 生成器异步控制

function run(genFn) {
  const gen = genFn();
  function next(v) {
    const r = gen.next(v);
    if (!r.done) Promise.resolve(r.value).then(next);
  }
  next();
}
run(function* () {
  const value = yield Promise.resolve(42);
  console.log(value);
});
