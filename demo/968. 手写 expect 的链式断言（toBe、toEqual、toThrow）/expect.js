/**
 * 手写 expect 的链式断言（toBe / toEqual / toThrow 等）
 * ===========================================================================
 * 实现 Jest 风格的 expect 链式断言 API。
 *
 * 支持的匹配器（matcher）：
 *   - .toBe(expected)             严格相等 (===)
 *   - .toEqual(expected)          深度相等
 *   - .toBeTruthy()               为真值
 *   - .toBeFalsy()                为假值
 *   - .toBeNull()                 为 null
 *   - .toBeUndefined()            为 undefined
 *   - .toBeDefined()              非 undefined
 *   - .toContain(item)            字符串/数组包含
 *   - .toHaveLength(n)            长度匹配
 *   - .toBeGreaterThan(n)         大于
 *   - .toBeLessThan(n)            小于
 *   - .toThrow([msg])             函数抛错
 *   - .toMatch(regexp|str)        字符串匹配
 *
 * 支持 .not 取反前缀：
 *   expect(x).not.toBe(y)
 *   expect(fn).not.toThrow()
 *
 * 失败时抛出包含详细信息的 ExpectationError。
 */

// ------------------------------ 错误类 ------------------------------

class ExpectationError extends Error {
  constructor(message, { actual, expected, matcher } = {}) {
    super(message);
    this.name = "ExpectationError";
    this.actual = actual;
    this.expected = expected;
    this.matcher = matcher;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExpectationError);
    }
  }
}

// ------------------------------ 工具函数 ------------------------------

/**
 * 深度相等
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual(a[k], b[k]));
}

/** 简单格式化值 */
function format(v) {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "function") return "[Function]";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// ------------------------------ 匹配器实现 ------------------------------

/**
 * 创建匹配器集合
 * @param {*} actual 实际值
 * @param {boolean} [isNot=false] 是否取反
 */
function createMatchers(actual, isNot = false) {
  /**
   * 包装一个匹配器：失败时抛 ExpectationError，若 isNot 则反过来
   * @param {string} matcherName 匹配器名（如 'toBe'）
   * @param {Function} passFn (expected?) => { pass: boolean }
   * @param {string} verbPhrase 失败描述中的动词短语（如 'to be'、'to deeply equal'）
   * @param {boolean} [takesExpected=true] 是否接收 expected 参数
   */
  const wrap =
    (matcherName, passFn, verbPhrase, takesExpected = true) =>
    (expected) => {
      const result = takesExpected ? passFn(expected) : passFn();
      const passed = isNot ? !result.pass : result.pass;

      if (!passed) {
        const notStr = isNot ? "not " : "";
        // 消息格式：Expected <actual> [not ]<verbPhrase> [<expected>]
        const expectedPart = takesExpected ? ` ${format(expected)}` : "";
        throw new ExpectationError(
          `Expected ${format(actual)} ${notStr}${verbPhrase}${expectedPart}`,
          { actual, expected, matcher: matcherName },
        );
      }
    };

  return {
    // 严格相等
    toBe: wrap("toBe", (expected) => ({ pass: actual === expected }), "to be"),
    // 深度相等
    toEqual: wrap(
      "toEqual",
      (expected) => ({ pass: deepEqual(actual, expected) }),
      "to deeply equal",
    ),
    // 真值
    toBeTruthy: wrap(
      "toBeTruthy",
      () => ({ pass: !!actual }),
      "to be truthy",
      false,
    ),
    // 假值
    toBeFalsy: wrap(
      "toBeFalsy",
      () => ({ pass: !actual }),
      "to be falsy",
      false,
    ),
    // null
    toBeNull: wrap(
      "toBeNull",
      () => ({ pass: actual === null }),
      "to be null",
      false,
    ),
    // undefined
    toBeUndefined: wrap(
      "toBeUndefined",
      () => ({ pass: actual === undefined }),
      "to be undefined",
      false,
    ),
    // defined
    toBeDefined: wrap(
      "toBeDefined",
      () => ({ pass: actual !== undefined }),
      "to be defined",
      false,
    ),
    // 大于
    toBeGreaterThan: wrap(
      "toBeGreaterThan",
      (n) => ({ pass: actual > n }),
      "to be greater than",
    ),
    // 小于
    toBeLessThan: wrap(
      "toBeLessThan",
      (n) => ({ pass: actual < n }),
      "to be less than",
    ),
    // 长度
    toHaveLength: wrap(
      "toHaveLength",
      (n) => ({
        pass:
          actual != null &&
          typeof actual.length === "number" &&
          actual.length === n,
      }),
      "to have length",
    ),
    // 包含
    toContain: wrap(
      "toContain",
      (item) => {
        if (typeof actual === "string") return { pass: actual.includes(item) };
        if (Array.isArray(actual)) return { pass: actual.includes(item) };
        return { pass: false };
      },
      "to contain",
    ),
    // 正则匹配
    toMatch: wrap(
      "toMatch",
      (pattern) => {
        if (pattern instanceof RegExp) return { pass: pattern.test(actual) };
        return { pass: typeof actual === "string" && actual.includes(pattern) };
      },
      "to match",
    ),
    // 抛错
    toThrow: wrap(
      "toThrow",
      (expectedMsg) => {
        if (typeof actual !== "function") return { pass: false };
        let threw = false;
        let err = null;
        try {
          actual();
        } catch (e) {
          threw = true;
          err = e;
        }
        if (!threw) return { pass: false };
        if (expectedMsg === undefined) return { pass: true };
        if (expectedMsg instanceof RegExp)
          return { pass: expectedMsg.test(err.message) };
        if (typeof expectedMsg === "function")
          return { pass: err instanceof expectedMsg };
        return { pass: err.message === expectedMsg };
      },
      "to throw",
    ),
  };
}

// ------------------------------ expect 主体 ------------------------------

/**
 * expect 链式入口
 * @param {*} actual
 * @returns {Object} 含全部匹配器 + .not
 */
function expect(actual) {
  const matchers = createMatchers(actual, false);

  // .not：用 Proxy 拦截属性访问，返回取反版本的匹配器
  const notProxy = new Proxy(
    {},
    {
      get(_target, prop) {
        const matchersNot = createMatchers(actual, true);
        return matchersNot[prop];
      },
    },
  );

  Object.defineProperty(matchers, "not", {
    get() {
      return notProxy;
    },
    enumerable: false,
  });

  return matchers;
}

// 暴露
expect.ExpectationError = ExpectationError;

// ============================ 测试用例 ============================

// 辅助函数：验证某断言通过
function pass(desc, fn) {
  try {
    fn();
    console.log("  PASS:", desc);
  } catch (e) {
    console.log("  [未通过但预期应通过] ", desc, "=>", e.message);
  }
}

// 辅助函数：验证某断言会失败（用于测试 .not 与匹配器逻辑）
function expectFail(desc, fn) {
  try {
    fn();
    console.log("  [未抛错但预期应失败] ", desc);
  } catch (e) {
    if (e instanceof ExpectationError) {
      console.log("  PASS（正确失败）:", desc, "=>", e.message);
    } else {
      console.log("  [抛出非预期错误] ", desc, e);
    }
  }
}

console.log("===== toBe / toEqual =====");
pass("1 toBe 1", () => expect(1).toBe(1));
pass("[1,2,3] toEqual [1,2,3]", () => expect([1, 2, 3]).toEqual([1, 2, 3]));
pass("对象 toEqual", () =>
  expect({ a: 1, b: { c: 2 } }).toEqual({ a: 1, b: { c: 2 } }),
);
expectFail("1 not toBe 2", () => expect(1).toBe(2));

console.log("\n===== .not 取反 =====");
pass("1 not toBe 2", () => expect(1).not.toBe(2));
pass("1 not toEqual 2", () => expect(1).not.toEqual(2));
pass("[1,2] not toEqual [1,3]", () => expect([1, 2]).not.toEqual([1, 3]));
expectFail("1 not toBe 1（应失败）", () => expect(1).not.toBe(1));

console.log("\n===== truthy / falsy =====");
pass("1 toBeTruthy", () => expect(1).toBeTruthy());
pass("0 toBeFalsy", () => expect(0).toBeFalsy());
pass('"" toBeFalsy', () => expect("").toBeFalsy());
pass("非空字符串 toBeTruthy", () => expect("a").toBeTruthy());

console.log("\n===== null / undefined / defined =====");
pass("null toBeNull", () => expect(null).toBeNull());
pass("undefined toBeUndefined", () => expect(undefined).toBeUndefined());
pass("1 toBeDefined", () => expect(1).toBeDefined());
pass("null not toBeUndefined", () => expect(null).not.toBeUndefined());

console.log("\n===== toContain / toHaveLength / toMatch =====");
pass("数组 toContain", () => expect([1, 2, 3]).toContain(2));
pass("字符串 toContain", () => expect("hello").toContain("ell"));
pass("数组 toHaveLength", () => expect([1, 2, 3]).toHaveLength(3));
pass("字符串 toHaveLength", () => expect("abc").toHaveLength(3));
pass("toMatch 正则", () => expect("hello123").toMatch(/\d+/));
pass("toMatch 字符串", () => expect("hello").toMatch("ell"));
pass("not toContain", () => expect([1, 2]).not.toContain(5));

console.log("\n===== toBeGreaterThan / toBeLessThan =====");
pass("5 > 3", () => expect(5).toBeGreaterThan(3));
pass("3 < 5", () => expect(3).toBeLessThan(5));
pass("5 not > 10", () => expect(5).not.toBeGreaterThan(10));

console.log("\n===== toThrow =====");
pass("函数 toThrow", () =>
  expect(() => {
    throw new Error("x");
  }).toThrow(),
);
pass("toThrow 指定消息", () =>
  expect(() => {
    throw new Error("boom");
  }).toThrow("boom"),
);
pass("toThrow 正则", () =>
  expect(() => {
    throw new Error("error 404");
  }).toThrow(/404/),
);
pass("toThrow 类型", () =>
  expect(() => {
    throw new TypeError("t");
  }).toThrow(TypeError),
);
pass("不抛错的函数 not.toThrow", () =>
  expect(() => {
    const _ = 1;
  }).not.toThrow(),
);
expectFail("不抛错的函数 toThrow 应失败", () => expect(() => {}).toThrow());

console.log("\n===== 失败时的详细错误信息 =====");
try {
  expect([1, 2, 3]).toEqual([1, 2, 4]);
} catch (e) {
  console.log("  捕获 ExpectationError:", e.message);
  console.log("  matcher:", e.matcher);
  console.log("  actual:", format(e.actual));
  console.log("  expected:", format(e.expected));
}

console.log("\n所有 expect 链式断言测试结束。");
