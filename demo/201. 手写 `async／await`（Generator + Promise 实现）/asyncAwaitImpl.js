/**
 * 手写 async/await（Generator + Promise 实现）
 *
 * 原理：async/await 是 Generator + Promise 的语法糖。
 *   - async 函数 -> 一个返回 Promise 的函数
 *   - await expr -> yield expr（expr 通常是个 Promise）
 *   - Generator 的 yield 暂停执行，把 Promise 交给我们写的执行器
 *   - 执行器拿到 Promise，等它 resolve 后把值通过 gen.next(value) 回传给 Generator
 *   - 若 Promise reject，则通过 gen.throw(reason) 把错误抛回 Generator
 *
 * 本文件实现 asyncToGenerator：把一个 Generator 函数转成 async 函数。
 *
 * 说明：文件夹名中的 `async／await` 因 `/` 在 Windows 下是路径分隔符，
 *      故用全角斜杠 `／` 替代，以保持标题可视效果一致。
 */

function asyncToGenerator(generatorFn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const gen = generatorFn.apply(this, args);

      // 用递归驱动 Generator
      function step(method, arg) {
        let result;
        try {
          result = gen[method](arg); // gen.next(arg) 或 gen.throw(arg)
        } catch (err) {
          return reject(err); // Generator 内同步抛错
        }

        const { done, value } = result;
        if (done) {
          // 生成器结束，return 的值作为最终 resolve 值
          return resolve(value);
        }

        // value 通常是 Promise；用 Promise.resolve 兼容非 Promise 值
        Promise.resolve(value).then(
          (v) => step("next", v), // 成功：把值回传，继续执行
          (err) => step("throw", err), // 失败：把错误抛回 Generator
        );
      }

      // 启动：第一次 next，不传参数
      step("next", undefined);
    });
  };
}

// ===== 测试 =====

// 用 generator 模拟 async 函数体（await 对应 yield）
const fakeAsync = asyncToGenerator(function* () {
  console.log("start");
  const a = yield Promise.resolve(1); // await Promise.resolve(1)
  console.log("a =", a);
  const b = yield delay(2, 100); // await delay(2, 100)
  console.log("b =", b);
  const c = yield a + b; // await (普通值)
  console.log("c =", c);
  return a + b + c; // 最终 resolve 值
});

function delay(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

(async () => {
  // 1. 正常流程
  const r1 = await fakeAsync();
  console.log("final:", r1);
  // 输出顺序：
  // start
  // a = 1
  // b = 2
  // c = 3
  // final: 6

  // 2. await 的 Promise reject -> 走 generator 内 try/catch
  const withTry = asyncToGenerator(function* () {
    try {
      const v = yield Promise.reject("boom");
      return "never: " + v;
    } catch (e) {
      return "caught: " + e;
    }
  });
  console.log(await withTry()); // caught: boom

  // 3. generator 内未捕获的 reject -> async 函数 reject
  const uncaught = asyncToGenerator(function* () {
    const v = yield Promise.reject(new Error("uncaught"));
    return v;
  });
  try {
    await uncaught();
  } catch (e) {
    console.log("uncaught rejected:", e.message); // uncaught rejected: uncaught
  }

  // 4. 支持传参 & this
  const bound = asyncToGenerator(function* (x, y) {
    const sum = yield Promise.resolve(x + y);
    return sum * 10;
  });
  console.log("with args:", await bound(3, 4)); // with args: 70
})();
