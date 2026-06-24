/**
 * 手写异步回调转 Promise（promisify）
 *
 * 背景：Node.js 的传统异步 API 用「error-first callback」风格：
 *      fn(arg1, arg2, ..., (err, data) => { ... })
 *   promisify 把这种函数转成返回 Promise 的函数，方便配合 async/await。
 *
 * 规则：
 *   - 成功：err 为 null/undefined 时，把后续参数 resolve 出去
 *   - 失败：err 有值时 reject(err)
 *   - 单参数回调：若 callback 只接收一个非 err 参数，promisify 仍按 error-first 处理
 *   - 多参数回调：默认只 resolve 第一个结果；可用 promisifyCustom 适配多参数
 *
 * 这里实现一个通用 promisify，并附带 promisifyAll（批量转换对象方法）。
 */

function promisify(original, options = {}) {
  if (typeof original !== "function") {
    throw new TypeError("promisify expects a function");
  }

  const { multiArgs = false, context = null } = options;

  function fn(...args) {
    return new Promise((resolve, reject) => {
      // 保证回调在 original 执行完后被调用
      args.push(function callback(err, ...values) {
        if (err) {
          return reject(err);
        }
        if (multiArgs) {
          // 多参数模式：把所有非 err 参数组成数组 resolve
          resolve(values);
        } else {
          resolve(values[0]);
        }
      });

      try {
        original.apply(context, args);
      } catch (e) {
        reject(e);
      }
    });
  }

  // 保留原函数名，方便调试
  Object.defineProperty(fn, "name", {
    value: "promisified_" + (original.name || "anonymous"),
  });
  return fn;
}

// 批量转换对象上的方法
function promisifyAll(obj, options) {
  const result = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "function") {
      result[key + "Async"] = promisify(obj[key], {
        ...options,
        context: obj,
      });
    }
  }
  return result;
}

// ===== 测试 =====

// 模拟 error-first 风格的 Node API
function readFileMock(name, delay, cb) {
  setTimeout(() => {
    if (name === "error") return cb(new Error("file not found: " + name));
    cb(null, "content of " + name);
  }, delay);
}

// 多参数回调 API
function queryMulti(id, cb) {
  setTimeout(() => cb(null, { id }, "extra-info", 42), 10);
}

(async () => {
  // 1. 基本成功
  const readFile = promisify(readFileMock);
  const data = await readFile("a.txt", 20);
  console.log("basic:", data); // basic: content of a.txt

  // 2. 失败 -> reject
  try {
    await readFile("error", 10);
  } catch (e) {
    console.log("error:", e.message); // error: file not found: error
  }

  // 3. 多参数回调
  const query = promisify(queryMulti, { multiArgs: true });
  const multi = await query(7);
  console.log("multiArgs:", multi); // multiArgs: [ { id: 7 }, 'extra-info', 42 ]

  // 4. 同步抛错的函数也能被 reject
  const syncThrow = promisify((x, cb) => {
    throw new Error("sync throw, x=" + x);
  });
  try {
    await syncThrow(1);
  } catch (e) {
    console.log("sync throw caught:", e.message);
    // sync throw caught: sync throw, x=1
  }

  // 5. promisifyAll 批量转换
  const fsMock = {
    readA(cb) {
      setTimeout(() => cb(null, "A"), 10);
    },
    readB(cb) {
      setTimeout(() => cb(null, "B"), 10);
    },
    readC(cb) {
      setTimeout(() => cb(new Error("C missing")), 10);
    },
  };
  const fsAsync = promisifyAll(fsMock);
  const [a, b] = await Promise.all([fsAsync.readAAsync(), fsAsync.readBAsync()]);
  console.log("promisifyAll:", a, b); // promisifyAll: A B
})();
