/**
 * 手写函数管道（支持异步函数）
 *
 * 作用：
 *   - pipe 的异步版本：从左到右串联多个函数，函数可为同步或异步
 *   - 上一步结果（含 Promise）作为下一步输入，await 后再传递
 *   - 典型场景：异步数据流水线、请求 + 转换 + 过滤链
 *
 * 实现思路：
 *   1. 用 for...of 顺序 await 每个函数
 *   2. 用 Promise.resolve 包装首次输入，兼容同步初始值
 *   3. 用 reduce 也可实现
 */

// for...of 版
function asyncPipe(...fns) {
  if (fns.length === 0) return (x) => Promise.resolve(x);
  if (fns.length === 1) return (x) => Promise.resolve(fns[0](x));

  return async function (input) {
    let result = await Promise.resolve(input);
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

// reduce 版
function asyncPipeReduce(...fns) {
  return (input) =>
    fns.reduce(
      (chain, fn) => chain.then(fn),
      Promise.resolve(input)
    );
}

// 支持初始多参数：第一个函数接收全部参数
function asyncPipeMulti(...fns) {
  return async function (...args) {
    const [first, ...rest] = fns;
    let result = await first(...args);
    for (const fn of rest) {
      result = await fn(result);
    }
    return result;
  };
}

// ===== 测试 =====

const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

// 混合同步异步
const pipeline = asyncPipe(
  (x) => x + 1, // 同步
  async (x) => {
    await delay(20);
    return x * 2;
  }, // 异步
  (x) => x + 3, // 同步
  (x) => `result:${x}` // 同步
);

(async () => {
  console.log(await pipeline(5)); // 'result:15' ((5+1)*2+3)
})();

// 全异步
const allAsync = asyncPipe(
  () => delay(10, "a"),
  (s) => delay(10, s + "b"),
  (s) => delay(10, s + "c")
);
(async () => {
  console.log(await allAsync()); // 'abc'
})();

// reduce 版
const pipe2 = asyncPipeReduce(
  (x) => x + 1,
  (x) => Promise.resolve(x * 10),
  (x) => x - 5
);
(async () => {
  console.log(await pipe2(2)); // 25 = (2+1)*10-5
})();

// 多参数首函数
const multiPipe = asyncPipeMulti(
  (a, b) => delay(10, a + b),
  (x) => delay(10, x * 2),
  (x) => `final:${x}`
);
(async () => {
  console.log(await multiPipe(3, 4)); // 'final:14'
})();

// 应用：请求 + 解析 + 过滤 + 映射
async function fetchUser(id) {
  return delay(10, { id, name: "Tom", age: 20, admin: false });
}
const getUserLabel = asyncPipe(
  fetchUser, // 获取用户
  (user) => delay(10, { ...user, label: user.name.toUpperCase() }), // 加标签
  (user) => `${user.label}(${user.age})` // 格式化
);
(async () => {
  console.log(await getUserLabel(1)); // 'TOM(20)'
})();

// 错误处理
const errorPipe = asyncPipe(
  () => Promise.resolve("ok"),
  () => {
    throw new Error("step2 fail");
  }
);
(async () => {
  try {
    await errorPipe();
  } catch (e) {
    console.log("管道错误:", e.message); // 'step2 fail'
  }
})();

// 空管道返回原值
(async () => {
  console.log(await asyncPipe()(42)); // 42
})();
