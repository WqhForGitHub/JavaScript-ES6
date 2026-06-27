/**
 * 手写异步测试支持（done / async-await）
 * ===========================================================================
 * 在 967 题简易测试框架基础上扩展，支持异步测试：
 *
 *   1. it(name, fn) 中 fn 可以接收一个 done 回调：
 *        it('异步用例', (done) => { setTimeout(() => { expect(x).toBe(y); done(); }, 100); });
 *      - 调用 done() 表示用例完成；调用 done(err) 表示用例失败。
 *
 *   2. it(name, fn) 中 fn 可以返回 Promise，支持 async/await：
 *        it('async 用例', async () => { const v = await fetchSomething(); expect(v).toBe(...); });
 *
 *   3. 超时处理：每个用例有默认超时时间（如 1000ms），超时则用例失败。
 *
 *   4. done() 错误：在 done 之前抛错或调用 done(err) 会被捕获为失败。
 *
 * 实现思路：
 *   - runTest 返回一个 Promise，等待 fn 完成或超时。
 *   - 串行执行用例（用 await），确保一个用例完成后再跑下一个。
 */

// ------------------------------ 内部状态 ------------------------------

const rootSuite = { name: "", children: [], tests: [] };
let currentSuite = rootSuite;

// ------------------------------ AssertionError & expect ------------------------------

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (typeof a === "object") {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
        );
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected))
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`,
        );
    },
    toBeTruthy() {
      if (!actual)
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be truthy`,
        );
    },
    toBeFalsy() {
      if (actual)
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be falsy`,
        );
    },
    toContain(item) {
      if (
        typeof actual === "string"
          ? !actual.includes(item)
          : !Array.isArray(actual) || !actual.includes(item)
      ) {
        throw new AssertionError(`Expected to contain ${JSON.stringify(item)}`);
      }
    },
  };
}

// ------------------------------ describe / it ------------------------------

function describe(name, fn) {
  const suite = { name, children: [], tests: [] };
  currentSuite.children.push(suite);
  const prev = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prev;
  }
}

/**
 * 定义测试用例
 * @param {string} name 用例名
 * @param {Function} fn 用例函数，可接收 done 参数或返回 Promise
 * @param {number} [timeout=2000] 超时时间（毫秒）
 */
function it(name, fn, timeout = 2000) {
  currentSuite.tests.push({ name, fn, timeout });
}

// ------------------------------ 异步运行单个用例 ------------------------------

/**
 * 运行一个用例，返回 Promise，resolve 时表示通过，reject 时表示失败
 * @param {Function} fn
 * @param {number} timeout
 */
function runTest(fn, timeout) {
  return new Promise((resolve, reject) => {
    let done = false; // 防止重复调用 done / 多次 resolve

    // 超时定时器
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error(`测试超时（${timeout}ms）`));
    }, timeout);

    // 构造 done 回调
    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };

    try {
      const result =
        fn.length === 1
          ? // fn 接收 done 参数（带参函数）
            fn(finish)
          : // fn 不接收 done，可能返回 Promise
            fn();

      // 如果 fn 没有接收 done 且返回了 Promise
      if (result && typeof result.then === "function") {
        result
          .then(() => {
            if (!done) finish();
          })
          .catch((err) => {
            if (!done) finish(err);
          });
      } else if (fn.length !== 1) {
        // 同步用例，立即完成
        finish();
      }
      // 否则等待用户调用 done()
    } catch (err) {
      finish(err);
    }
  });
}

// ------------------------------ 串行运行所有用例 ------------------------------

let passCount = 0;
let failCount = 0;
const failures = [];

async function runSuite(suite, prefix = "") {
  const fullName = prefix ? `${prefix} > ${suite.name}` : suite.name;

  // 串行执行每个用例
  for (const test of suite.tests) {
    const testFullName = fullName ? `${fullName} > ${test.name}` : test.name;
    try {
      await runTest(test.fn, test.timeout);
      passCount++;
      console.log(`  PASS  ${testFullName}`);
    } catch (err) {
      failCount++;
      console.log(`  FAIL  ${testFullName}`);
      console.log(`        ${err.name}: ${err.message}`);
      failures.push({ name: testFullName, err });
    }
  }

  // 递归子套件
  for (const child of suite.children) {
    await runSuite(child, fullName);
  }
}

async function run() {
  console.log("\n========== 开始运行测试（异步） ==========\n");
  passCount = 0;
  failCount = 0;
  failures.length = 0;

  await runSuite(rootSuite, "");

  console.log("\n---------- 测试结果 ----------");
  console.log(`通过: ${passCount}，失败: ${failCount}`);
  if (failures.length > 0) {
    console.log("\n失败详情：");
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}) ${f.name}`);
      console.log(`     ${f.err.name}: ${f.err.message}`);
    });
  }
  console.log("==============================\n");
}

// 暴露
globalThis.describe = describe;
globalThis.it = it;
globalThis.expect = expect;
globalThis.run = run;

// ============================ 测试用例 ============================

// ---------- 同步用例 ----------
describe("同步用例", () => {
  it("1 + 1 = 2", () => {
    expect(1 + 1).toBe(2);
  });

  it("对象深度相等", () => {
    expect({ a: 1 }).toEqual({ a: 1 });
  });
});

// ---------- done 回调用例 ----------
describe("done 回调异步测试", () => {
  it("setTimeout 后断言通过", (done) => {
    setTimeout(() => {
      try {
        expect("async").toBe("async");
        done();
      } catch (e) {
        done(e);
      }
    }, 50);
  });

  it("done(err) 表示失败（演示失败）", (done) => {
    setTimeout(() => {
      done(new Error("主动失败"));
    }, 50);
  });
});

// ---------- async/await 用例 ----------
/**
 * 模拟一个异步函数：返回一个 Promise
 */
function fetchData(delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: "Alice" }), delay);
  });
}

function fetchError() {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("网络错误")), 50);
  });
}

describe("async/await 测试", () => {
  it("await 后断言通过", async () => {
    const data = await fetchData(50);
    expect(data).toEqual({ id: 1, name: "Alice" });
  });

  it("Promise.catch 会被捕获为失败", async () => {
    await fetchError(); // 会 reject，导致用例失败
  });

  it("Promise 返回值断言", async () => {
    const data = await fetchData(30);
    expect(data.id).toBe(1);
    expect(data.name).toContain("Alic");
  });
});

// ---------- 超时用例 ----------
describe("超时处理", () => {
  it("超时用例（演示超时失败）", (done) => {
    // 设置 100ms 超时，但里面 300ms 才调用 done
    // 注意：这里通过第三个参数覆盖默认超时
  }, 100);

  // 真正的超时用例：里面永不调用 done
  it("永不调用 done 会超时", (done) => {
    // 故意不调用 done
  }, 200);
});

// 运行所有测试
run().then((/* 结果 */) => {
  console.log("异步测试运行结束。");
});
