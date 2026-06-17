// 167. 惰性求值迭代器

function* mapLazy(items, fn) {
  for (const item of items) {
    console.log("compute", item);
    yield fn(item);
  }
}
const lazy = mapLazy([1, 2, 3], (n) => n * n);
console.log(lazy.next().value);
console.log(lazy.next().value);
