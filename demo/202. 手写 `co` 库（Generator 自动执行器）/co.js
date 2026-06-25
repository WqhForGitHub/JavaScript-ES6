/**
 * 手写 co 库（Generator 自动执行器）
 *
 * 背景：co 是 tj 写的经典库，用于自动执行 Generator，让 Generator 里
 *      的 yield 表达式支持多种「可异步对象」：Promise / thenable /
 *      数组（并行）/ 对象（并行）/ Generator / 普通值。
 *
 * 思路：
 *   - co(gen) 返回一个 Promise
 *   - 递归调用 gen.next()，对每个 value 进行「转 Promise」后 .then 回传
 *   - 关键是 toPromise(value)：把不同形态的 yield 值统一转成 Promise
 *
 * 支持的 yield 值：
 *   - Promise / thenable -> 直接用
 *   - 普通值 -> Promise.resolve(value)
 *   - 数组 -> Promise.all（元素也递归 toPromise）
 *   - 对象 -> 类似 all，按 key 收集结果
 *   - Generator -> 递归 co 执行
 */

function co(gen) {
  const ctx = this;
  const args = Array.prototype.slice.call(arguments, 1);

  return new Promise((resolve, reject) => {
    if (typeof gen === "function") gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== "function") {
      // 不是 generator，直接 resolve
      return resolve(gen);
    }

    function onFulfilled(res) {
      let ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    function onRejected(err) {
      let ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      // 把 yield 的值转成 Promise 后继续
      const promise = toPromise(ret.value, ctx);
      return promise.then(onFulfilled, onRejected);
    }

    onFulfilled(undefined);
  });
}

function toPromise(obj, ctx) {
  if (!obj) return Promise.resolve(obj);
  if (typeof obj.then === "function") return obj; // Promise / thenable
  if (typeof obj.next === "function") return co.call(ctx, obj); // generator
  if (Array.isArray(obj)) return arrayToPromise(obj, ctx);
  if (isObject(obj)) return objectToPromise(obj, ctx);
  return Promise.resolve(obj);
}

function isObject(obj) {
  return Object === obj.constructor || obj.constructor === undefined;
}

function arrayToPromise(arr, ctx) {
  return Promise.all(arr.map((item) => toPromise(item, ctx)));
}

function objectToPromise(obj, ctx) {
  const keys = Object.keys(obj);
  const result = {};
  const promises = [];
  for (const key of keys) {
    const p = toPromise(obj[key], ctx);
    if (p && typeof p.then === "function") {
      promises.push(
        p.then((v) => {
          result[key] = v;
        }),
      );
    } else {
      result[key] = obj[key];
    }
  }
  return Promise.all(promises).then(() => result);
}

// ===== 测试 =====

// 工具
const delay = (v, ms = 30) =>
  new Promise((resolve) => setTimeout(() => resolve(v), ms));

// 1. 基本：yield Promise
co(function* () {
  const a = yield delay(1);
  const b = yield delay(2);
  return a + b;
}).then((v) => console.log("basic:", v)); // basic: 3

// 2. yield 数组（并行）
co(function* () {
  const [x, y, z] = yield [delay("a", 40), delay("b", 20), delay("c", 30)];
  return x + y + z;
}).then((v) => console.log("array:", v)); // array: abc

// 3. yield 对象（并行）
co(function* () {
  const res = yield {
    name: delay("Tom", 20),
    age: delay(18, 10),
  };
  return res.name + " - " + res.age;
}).then((v) => console.log("object:", v)); // object: Tom - 18

// 4. yield 普通值
co(function* () {
  const n = yield 42;
  return n;
}).then((v) => console.log("plain:", v)); // plain: 42

// 5. yield 嵌套 generator（注意：yield 的是 generator 实例，由 co 递归执行）
co(function* () {
  function* sub() {
    const v = yield delay(10);
    return v * 2;
  }
  const r = yield sub(); // 调用得到 generator 实例
  return r;
}).then((v) => console.log("nested:", v)); // nested: 20

// 6. 错误处理
co(function* () {
  try {
    yield Promise.reject("err in co");
  } catch (e) {
    return "caught: " + e;
  }
}).then((v) => console.log("error:", v)); // error: caught: err in co
