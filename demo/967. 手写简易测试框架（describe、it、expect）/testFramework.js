/**
 * 手写简易测试框架（describe / it / expect）
 * ===========================================================================
 * 实现一个类似 Jest / Mocha 风格的极简测试框架。
 *
 * API：
 *   - describe(name, fn)        定义一个测试套件（可嵌套）
 *   - it(name, fn)              定义一个测试用例
 *   - expect(value)             返回一个可链式调用的断言对象（含 toBe / toEqual 等）
 *   - run()                     运行所有已注册的测试，并打印结果
 *
 * 特性：
 *   - 支持 describe 嵌套
 *   - 同步执行用例并统计 pass / fail 数量
 *   - 失败用例打印原因，不中断整体运行
 *   - 提供 expect 链式断言（简易版，详细版见 968 题）
 */

// ------------------------------ 内部状态 ------------------------------

/**
 * 测试套件结构
 * @typedef {Object} Suite
 * @property {string} name
 * @property {Suite[]} children
 * @property {TestCase[]} tests
 * @property {Function[]} beforeAlls
 * @property {Function[]} beforeEachs
 */

/**
 * 测试用例结构
 * @typedef {Object} TestCase
 * @property {string} name
 * @property {Function} fn
 */

/** 根套件 */
const rootSuite = {
  name: "",
  children: [],
  tests: [],
  beforeAlls: [],
  beforeEachs: [],
};

/** 当前所在的套件（describe 嵌套用） */
let currentSuite = rootSuite;

// ------------------------------ AssertionError ------------------------------

class AssertionError extends Error {
  constructor(message, { actual, expected } = {}) {
    super(message);
    this.name = "AssertionError";
    this.actual = actual;
    this.expected = expected;
  }
}

// ------------------------------ expect ------------------------------

/**
 * 深度相等
 */
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

/**
 * expect 断言对象（简易版）
 * @param {*} actual
 */
function expect(actual) {
  return {
    // 严格相等
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`,
          { actual, expected },
        );
      }
    },
    // 深度相等
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`,
          { actual, expected },
        );
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be truthy`,
          { actual },
        );
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be falsy`,
          { actual },
        );
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be null`,
          { actual },
        );
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new AssertionError(
          `Expected ${JSON.stringify(actual)} to be undefined`,
          { actual },
        );
      }
    },
    toContain(item) {
      if (typeof actual === "string") {
        if (!actual.includes(item)) {
          throw new AssertionError(
            `Expected "${actual}" to contain "${item}"`,
            { actual, item },
          );
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new AssertionError(
            `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`,
            { actual, item },
          );
        }
      } else {
        throw new AssertionError(`toContain 只支持字符串和数组`, { actual });
      }
    },
    toHaveLength(n) {
      if (!actual || actual.length !== n) {
        throw new AssertionError(
          `Expected length ${n}, got ${actual ? actual.length : "N/A"}`,
          { actual },
        );
      }
    },
    toThrow(expectedMsg) {
      if (typeof actual !== "function") {
        throw new AssertionError(`toThrow 期望传入函数`, { actual });
      }
      let threw = false;
      let err = null;
      try {
        actual();
      } catch (e) {
        threw = true;
        err = e;
      }
      if (!threw) {
        throw new AssertionError(`Expected function to throw`, { actual });
      }
      if (expectedMsg && err.message !== expectedMsg) {
        throw new AssertionError(
          `Expected throw message "${expectedMsg}", got "${err.message}"`,
          { actual: err.message, expected: expectedMsg },
        );
      }
    },
  };
}

// ------------------------------ describe / it ------------------------------

/**
 * 定义测试套件
 * @param {string} name 套件名
 * @param {Function} fn 套件函数，内部用 it 定义用例
 */
function describe(name, fn) {
  const suite = {
    name,
    children: [],
    tests: [],
    beforeAlls: [],
    beforeEachs: [],
  };
  currentSuite.children.push(suite);

  const prev = currentSuite;
  currentSuite = suite;
  try {
    fn(); // 执行套件函数，收集其中的 it / describe
  } finally {
    currentSuite = prev;
  }
}

/**
 * 定义测试用例
 * @param {string} name 用例名
 * @param {Function} fn 用例函数
 */
function it(name, fn) {
  currentSuite.tests.push({ name, fn });
}

// 兼容：it.skip / it.only（此处仅简单实现 skip）
it.skip = function (name, fn) {
  currentSuite.tests.push({ name, fn, skipped: true });
};

// ------------------------------ 运行器 ------------------------------

let passCount = 0;
let failCount = 0;
let skipCount = 0;
const failures = [];

/**
 * 递归运行套件
 * @param {Suite} suite
 * @param {string} prefix 套件名前缀
 */
function runSuite(suite, prefix = "") {
  const fullName = prefix ? `${prefix} > ${suite.name}` : suite.name;

  suite.tests.forEach((test) => {
    const testFullName = fullName ? `${fullName} > ${test.name}` : test.name;

    if (test.skipped) {
      skipCount++;
      console.log(`  SKIP  ${testFullName}`);
      return;
    }

    try {
      test.fn();
      passCount++;
      console.log(`  PASS  ${testFullName}`);
    } catch (err) {
      failCount++;
      console.log(`  FAIL  ${testFullName}`);
      console.log(`        ${err.name}: ${err.message}`);
      failures.push({ name: testFullName, err });
    }
  });

  // 递归子套件
  suite.children.forEach((child) => runSuite(child, fullName));
}

/**
 * 运行所有测试
 */
function run() {
  console.log("\n========== 开始运行测试 ==========\n");
  passCount = 0;
  failCount = 0;
  skipCount = 0;
  failures.length = 0;

  runSuite(rootSuite, "");

  console.log("\n---------- 测试结果 ----------");
  console.log(`通过: ${passCount}，失败: ${failCount}，跳过: ${skipCount}`);

  if (failures.length > 0) {
    console.log("\n失败详情：");
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}) ${f.name}`);
      console.log(`     ${f.err.name}: ${f.err.message}`);
    });
  }
  console.log("==============================\n");
  return { passCount, failCount, skipCount };
}

// ============================ 测试用例 ============================

// 暴露到全局，方便测试使用
globalThis.describe = describe;
globalThis.it = it;
globalThis.expect = expect;
globalThis.run = run;

// ---------- 套件 1：基本数学函数 ----------
describe("数学函数", () => {
  function add(a, b) {
    return a + b;
  }
  function isEven(n) {
    return n % 2 === 0;
  }

  it("1 + 1 应该等于 2", () => {
    expect(add(1, 1)).toBe(2);
  });

  it("2 应该是偶数", () => {
    expect(isEven(2)).toBeTruthy();
  });

  it("3 不应该是偶数", () => {
    expect(isEven(3)).toBeFalsy();
  });

  it("故意失败的用例（演示失败输出）", () => {
    expect(add(1, 1)).toBe(3); // 这会失败
  });
});

// ---------- 套件 2：数组与对象 ----------
describe("数组与对象", () => {
  it("数组深度相等", () => {
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

  it("对象深度相等", () => {
    expect({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } });
  });

  it("数组包含元素", () => {
    expect([1, 2, 3]).toContain(2);
  });

  it("字符串包含子串", () => {
    expect("hello world").toContain("world");
  });

  it("数组长度", () => {
    expect([1, 2, 3]).toHaveLength(3);
  });
});

// ---------- 套件 3：嵌套 describe ----------
describe("嵌套套件", () => {
  describe("内层 A", () => {
    it("内层用例 1", () => {
      expect(true).toBeTruthy();
    });
  });

  describe("内层 B", () => {
    it("内层用例 2", () => {
      expect(null).toBeNull();
    });

    it("内层用例 3 - 抛错测试", () => {
      expect(() => {
        throw new Error("boom");
      }).toThrow("boom");
    });
  });

  it.skip("被跳过的用例（演示 SKIP）", () => {
    expect(false).toBeTruthy();
  });
});

// 运行所有测试
run();
