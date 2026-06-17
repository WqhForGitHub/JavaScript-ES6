// 188. 并发请求控制器

function limit(tasks, max) {
  let index = 0,
    active = 0;
  const results = [];
  return new Promise((resolve) => {
    function next() {
      if (index === tasks.length && active === 0) return resolve(results);
      while (active < max && index < tasks.length) {
        const current = index++;
        active++;
        tasks[current]()
          .then((v) => (results[current] = v))
          .finally(() => {
            active--;
            next();
          });
      }
    }
    next();
  });
}
limit(
  [1, 2, 3, 4].map((n) => () => Promise.resolve(n)),
  2,
).then(console.log);
