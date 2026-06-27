/**
 * 手写简易断言库（assert）
 * ===========================================================================
 * 实现一个类似 Node.js assert 模块 / chai 断言风格的简易断言库。
 *
 * 提供的方法：
 *   - assert.ok(condition, message)               断言条件为真
 *   - assert.equal(actual, expected, message)     宽松相等（==）
 *   - assert.notEqual(actual, expected, message)  宽松不相等
 *   - assert.strictEqual(actual, expected, ...)   严格相等（===）
 *   - assert.notStrictEqual(actual, expected,...) 严格不相等
 *   - assert.deepEqual(actual, expected, ...)     深度相等
 *   - assert.notDeepEqual(actual, expected,...)   深度不相等
 *   - assert.throws(fn, expected?, message)       断言函数会抛错
 *   - assert.doesNotThrow(fn, message)            断言函数不会抛错
 *   - assert.fail(message)                        直接失败
 *
 * 失败时抛出 AssertionError，包含 message、actual、expected、operator 等信息。
 */

// ------------------------------ AssertionError ------------------------------

/**
 * 断言错误类
 */
class AssertionError extends Error {
  constructor(options = {}) {
    const {
      message = "Assertion failed",
      actual,
      expected,
      operator,
    } = options;

    super(message);
    this.name = "AssertionError";
    this.actual = actual;
    this.expected = expected;
    this.operator = operator;

    // 兼容 Error.captureStackTrace（Node 环境）
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssertionError);
    }
  }

  toString() {
    let s = `${this.name}`;
    if (this.message) s += `: ${this.message}`;
    if (this.operator) s += ` [${this.operator}]`;
    if (this.actual !== undefined || this.expected !== undefined) {
      s += `\n  actual:   ${JSON.stringify(this.actual)}\n  expected: ${JSON.stringify(this.expected)}`;
    }
    return s;
  }
}

// ------------------------------ 内部工具 ------------------------------

/**
 * 深度相等比较
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
  // 严格相等 / 同一引用
  if (a === b) return true;

  // 处理 NaN
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  // 类型不同
  if (typeof a !== typeof b) return false;

  // null 与 undefined
  if (a === null || b === null) return a === b;

  // 都是数组
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // 都是对象
  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }

  return false;
}

/**
 * 格式化错误信息
 */
function formatMessage(actual, expected, operator, message) {
  return (
    (message ? message + " " : "") +
    `${JSON.stringify(actual)} ${operator} ${JSON.stringify(expected)}`
  );
}

// ------------------------------ 断言库主体 ------------------------------

const assert = {};

/**
 * 断言条件为真
 * @param {*} condition
 * @param {string} [message]
 */
assert.ok = function (condition, message) {
  if (!condition) {
    throw new AssertionError({
      message:
        message || `Expected value to be truthy: ${JSON.stringify(condition)}`,
      actual: condition,
      expected: true,
      operator: "==",
    });
  }
};

/**
 * 直接失败
 * @param {string} [message]
 */
assert.fail = function (message) {
  throw new AssertionError({
    message: message || "assert.fail called",
    actual: "fail called",
    expected: "no fail",
    operator: "fail",
  });
};

/**
 * 宽松相等（==）
 */
assert.equal = function (actual, expected, message) {
  /* eslint-disable eqeqeq */
  if (actual != expected) {
    throw new AssertionError({
      message: formatMessage(actual, expected, "!=", message),
      actual,
      expected,
      operator: "==",
    });
  }
};

/**
 * 宽松不相等
 */
assert.notEqual = function (actual, expected, message) {
  /* eslint-disable eqeqeq */
  if (actual == expected) {
    throw new AssertionError({
      message: formatMessage(actual, expected, "==", message),
      actual,
      expected,
      operator: "!=",
    });
  }
};

/**
 * 严格相等（===）
 */
assert.strictEqual = function (actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError({
      message: formatMessage(actual, expected, "!==", message),
      actual,
      expected,
      operator: "===",
    });
  }
};

/**
 * 严格不相等
 */
assert.notStrictEqual = function (actual, expected, message) {
  if (actual === expected) {
    throw new AssertionError({
      message: formatMessage(actual, expected, "===", message),
      actual,
      expected,
      operator: "!==",
    });
  }
};

/**
 * 深度相等
 */
assert.deepEqual = function (actual, expected, message) {
  if (!deepEqual(actual, expected)) {
    throw new AssertionError({
      message: message || "deepEqual failed",
      actual,
      expected,
      operator: "deepEqual",
    });
  }
};

/**
 * 深度不相等
 */
assert.notDeepEqual = function (actual, expected, message) {
  if (deepEqual(actual, expected)) {
    throw new AssertionError({
      message: message || "notDeepEqual failed",
      actual,
      expected,
      operator: "notDeepEqual",
    });
  }
};

/**
 * 断言 fn 会抛错
 * @param {Function} fn
 * @param {Error|string|RegExp} [expected] 预期的错误类型/消息
 * @param {string} [message]
 */
assert.throws = function (fn, expected, message) {
  let threw = false;
  let actualError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    actualError = err;
  }

  if (!threw) {
    throw new AssertionError({
      message: message || "Expected function to throw, but it did not",
      actual: "no throw",
      expected: "throw",
      operator: "throws",
    });
  }

  // 校验抛出的错误是否符合预期
  if (expected) {
    if (typeof expected === "function") {
      // 期望是某个错误类
      if (!(actualError instanceof expected)) {
        throw new AssertionError({
          message:
            message ||
            `Expected error to be instance of ${expected.name}, got ${actualError.constructor.name}`,
          actual: actualError.constructor.name,
          expected: expected.name,
          operator: "throws",
        });
      }
    } else if (expected instanceof RegExp) {
      if (!expected.test(actualError.message)) {
        throw new AssertionError({
          message:
            message ||
            `Expected error message to match ${expected}, got "${actualError.message}"`,
          actual: actualError.message,
          expected: expected.toString(),
          operator: "throws",
        });
      }
    } else if (typeof expected === "string") {
      if (actualError.message !== expected) {
        throw new AssertionError({
          message:
            message ||
            `Expected error message to be "${expected}", got "${actualError.message}"`,
          actual: actualError.message,
          expected,
          operator: "throws",
        });
      }
    }
  }
};

/**
 * 断言 fn 不会抛错
 */
assert.doesNotThrow = function (fn, message) {
  try {
    fn();
  } catch (err) {
    throw new AssertionError({
      message:
        message ||
        `Expected function not to throw, but it threw: ${err.message}`,
      actual: err.message,
      expected: "no throw",
      operator: "doesNotThrow",
    });
  }
};

// 暴露 AssertionError 以便外部捕获
assert.AssertionError = AssertionError;

// ============================ 测试用例 ============================

console.log("===== 测试 ok / equal / strictEqual / deepEqual 通过 =====");
assert.ok(1 === 1, "1 应该等于 1");
assert.ok(true);
assert.equal(1, "1", '宽松相等：1 == "1"');
assert.strictEqual(1, 1);
assert.deepEqual([1, 2, 3], [1, 2, 3]);
assert.deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } });
console.log("全部通过");

console.log("\n===== 测试 notEqual / notStrictEqual / notDeepEqual 通过 =====");
assert.notEqual(1, 2);
assert.notStrictEqual(1, "1");
assert.notDeepEqual({ a: 1 }, { a: 2 });
console.log("全部通过");

console.log("\n===== 测试 throws / doesNotThrow 通过 =====");
assert.throws(() => {
  throw new Error("boom");
});
assert.throws(() => {
  throw new TypeError("type");
}, TypeError);
assert.throws(() => {
  throw new Error("something failed");
}, /failed/);
assert.throws(() => {
  throw new Error("exact");
}, "exact");
assert.doesNotThrow(() => {
  const _ = 1 + 1;
});
console.log("全部通过");

console.log("\n===== 测试 fail 会抛出 AssertionError =====");
try {
  assert.fail("手动失败");
} catch (e) {
  console.log("捕获到:", e.name, "-", e.message);
}

console.log("\n===== 测试失败场景会抛出带详细信息的 AssertionError =====");
function expectFail(fn, desc) {
  try {
    fn();
    console.log("[未抛错] " + desc);
  } catch (e) {
    if (e instanceof AssertionError) {
      console.log("[抛出 AssertionError] " + desc);
      console.log("  =>", e.toString().split("\n").join("\n  "));
    } else {
      console.log("[抛出其他错误] " + desc, e);
    }
  }
}

expectFail(() => assert.ok(false, "应为真"), "ok(false)");
expectFail(() => assert.strictEqual(1, "1"), 'strictEqual(1, "1")');
expectFail(() => assert.deepEqual({ a: 1 }, { a: 2 }), "deepEqual 不相等");
expectFail(() => assert.throws(() => {}), "throws 但未抛错");
expectFail(
  () =>
    assert.doesNotThrow(() => {
      throw new Error("x");
    }),
  "doesNotThrow 但抛错了",
);

console.log("\n所有断言库测试结束。");
