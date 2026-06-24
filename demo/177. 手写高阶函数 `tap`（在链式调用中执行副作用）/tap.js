/**
 * 手写高阶函数 tap（在链式调用中执行副作用）
 *
 * 作用：
 *   - tap(fn)(value) 执行 fn(value)（用于副作用如日志、调试），
 *     然后原样返回 value，不影响后续链式调用
 *   - 典型场景：在 pipe / compose 中插入日志、断言、缓存写入等副作用
 *
 * 实现思路：
 *   1. tap(fn) 返回一个新函数
 *   2. 新函数接收 value，执行 fn(value)，然后返回原 value
 */

function tap(fn) {
  return function (value) {
    fn(value);
    return value;
  };
}

// ===== 测试 =====

// 基本用法：插入日志
const log = (v) => console.log("  [log]", v);

const result = tap(log)("hello"); // 打印 [log] hello
console.log(result); // 'hello'（原值返回）

// 在 pipe 中使用
function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x);
}

const process = pipe(
  (x) => x + 1,
  tap((x) => console.log("  after +1:", x)), // 副作用：打印
  (x) => x * 2,
  tap((x) => console.log("  after *2:", x)),
  (x) => x - 3
);
console.log(process(5));
// 打印：
//   after +1: 6
//   after *2: 12
// 返回 9

// 应用：调试数据流
const data = [{ name: "Tom" }, { name: "Jerry" }];
const getNames = pipe(
  (list) => list.map((u) => u.name),
  tap((names) => console.log("  names:", names)), // ['Tom','Jerry']
  (names) => names.map((n) => n.toUpperCase()),
  tap((upper) => console.log("  upper:", upper)),
  (names) => names.join(", ")
);
console.log(getNames(data)); // 'TOM, JERRY'

// 应用：断言不破坏管道
const assertPositive = tap((x) => {
  if (x < 0) throw new Error("negative!");
});
const safePipe = pipe(
  (x) => x - 10,
  assertPositive,
  (x) => x * 2
);
console.log(safePipe(20)); // 20 = (20-10)*2
try {
  safePipe(5); // 5-10 = -5 → 断言失败
} catch (e) {
  console.log("断言失败:", e.message); // 'negative!'
}

// 应用：缓存写入副作用
const cache = new Map();
const writeToCache = tap((value) => {
  cache.set("last", value);
});
const compute = pipe(
  (x) => x * x,
  writeToCache,
  (x) => x + 1
);
console.log(compute(3)); // 10
console.log("缓存:", cache.get("last")); // 9（写入的是 *2 后的值）

// tap 模仿 lodash _.tap（接收值与拦截器）
function tapLodash(value, interceptor) {
  interceptor(value);
  return value;
}
const t = tapLodash([1, 2, 3], (arr) => console.log("  长度:", arr.length));
console.log(t); // [1, 2, 3]

// 异步场景：tap 也可返回异步副作用（但需 async pipe）
const asyncTap = (fn) => async (value) => {
  await fn(value);
  return value;
};
