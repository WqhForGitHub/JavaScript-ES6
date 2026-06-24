/**
 * 手写函数 noop（空操作函数）
 *
 * 作用：
 *   - noop() => undefined
 *   - 不做任何事，返回 undefined
 *   - 典型场景：默认回调占位、避免 null 检查、Promise 链空操作、
 *     测试 mock、可选回调的默认值
 *
 * 实现思路：
 *   - 空函数体，自然返回 undefined
 */

function noop() {}

// 异步 noop：返回已完成的 Promise
function noopAsync() {
  return Promise.resolve();
}

// ===== 测试 =====

// 基本用法
console.log(noop()); // undefined
console.log(typeof noop); // 'function'

// 作为默认回调，避免 null 检查
function fetchData(url, onSuccess = noop, onError = noop) {
  // 模拟请求
  if (url === "/error") {
    onError("network error");
  } else {
    onSuccess("data");
  }
}
fetchData("/ok"); // 无 onSuccess，使用 noop 不报错
fetchData("/error"); // 无 onError，使用 noop 不报错
console.log("默认回调测试通过");

// 应用：map / forEach 默认空操作
const arr = [1, 2, 3];
arr.forEach(noop); // 什么都不做
console.log(arr.map(noop)); // [undefined, undefined, undefined]

// 应用：Promise 链中"吞掉"结果
Promise.resolve("data")
  .then(noop) // 吞掉，返回 undefined
  .then((v) => console.log("链中 noop:", v)); // undefined

// 应用：catch 后静默处理
Promise.reject(new Error("boom"))
  .catch(noop) // 静默忽略错误
  .then(() => console.log("错误已静默处理"));

// 应用：可选事件回调
class Emitter {
  constructor() {
    this.handlers = {};
  }
  on(type, handler = noop) {
    this.handlers[type] = handler;
  }
  emit(type, data) {
    (this.handlers[type] || noop)(data);
  }
}
const e = new Emitter();
e.emit("click", "no handler"); // 不报错（用 noop）
e.on("click");
e.emit("click", "noop handler"); // 不报错

// 应用：作为 stub / mock
const logger = {
  log: noop, // 测试时禁用日志
};
logger.log("this will be ignored");
console.log("日志被 noop 吞掉");

// 应用：reduce 的空操作初始函数
const numbers = [1, 2, 3];
const sum = numbers.reduce((a, b) => a + b, 0);
const noOpResult = numbers.reduce((acc) => acc, undefined);
console.log(noOpResult); // undefined（noop 累加）

// 异步 noop
noopAsync().then(() => console.log("async noop 完成"));

// 应用：节流 / 防抖的空操作默认
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const safe = debounce(noop, 100); // 空操作防抖，占位用
safe();
safe();
console.log("防抖 noop 无副作用");

// 与 constant 对比
function constant(v) {
  return () => v;
}
console.log(noop()); // undefined
console.log(constant(null)()); // null（显式返回值）

// 应用：作为函数式编程中的占位（noop 返回 undefined，会"打断"链式计算）
const fns = [noop, (x) => x + 1, noop, (x) => x * 2];
let val = 5;
fns.forEach((fn) => {
  val = fn(val);
});
console.log(val); // NaN（noop 返回 undefined，导致后续运算变 NaN）

// 对比：identity 才是"不影响"链式计算的元素
function identity(x) {
  return x;
}
const fns2 = [identity, (x) => x + 1, identity, (x) => x * 2];
let val2 = 5;
fns2.forEach((fn) => {
  val2 = fn(val2);
});
console.log(val2); // 12 = (5+1)*2，identity 不影响
