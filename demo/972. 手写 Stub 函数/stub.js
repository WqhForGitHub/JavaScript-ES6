/**
 * 手写 Stub 函数
 *
 * Stub 函数用一个受控的"假"实现替换已存在的函数，
 * 完全不调用原始实现。可配置以下行为：
 * - returns(value)               : 固定返回值
 * - throws(error)                : 抛出错误
 * - callsFake(fn)                : 调用自定义函数
 * - onCall(n).returns(value)     : 第 n 次调用返回特定值（链式）
 * - onCall(n).throws(error)      : 第 n 次调用抛出错误
 * - onCall(n).callsFake(fn)      : 第 n 次调用执行自定义函数
 *
 * 与 Spy 不同，Stub 不委托原始实现，而是完全替换它。
 *
 * 典型用途：测试中替换不可控的外部依赖，如 Date.now、Math.random、
 * 网络请求等，使测试结果可预测、可重复。
 *
 * 支持两种创建方式：
 *   1. createStub()                         - 创建独立 stub
 *   2. createStub(obj, 'methodName')        - 替换对象方法（可 restore）
 */

/**
 * 创建一个 Stub
 * @param {object} [target] - 目标对象（可选）
 * @param {string} [method] - 方法名（可选）
 * @returns {Function} stub 函数
 */
function createStub(target, method) {
  const isMethodStub = !!(target && method);
  const originalFn = isMethodStub ? target[method] : undefined;

  // 默认行为配置
  let behavior = {
    type: "returns", // 'returns' | 'throws' | 'callsFake'
    value: undefined,
    fakeFn: undefined,
  };

  // 按调用序号覆盖的行为：callBehaviors[callIndex] = behavior
  const callBehaviors = [];
  // 调用记录
  const calls = [];

  const stub = function (...args) {
    const callIndex = calls.length;
    calls.push({ args, thisArg: this, callIndex });

    // 优先使用 onCall 配置，否则使用默认 behavior
    const activeBehavior =
      callBehaviors[callIndex] !== undefined
        ? callBehaviors[callIndex]
        : behavior;

    if (activeBehavior.type === "throws") {
      throw activeBehavior.value;
    } else if (activeBehavior.type === "callsFake") {
      return activeBehavior.fakeFn.apply(this, args);
    } else {
      // returns
      return activeBehavior.value;
    }
  };

  // ===================== 行为配置方法 =====================

  /** 固定返回指定值 */
  stub.returns = function (value) {
    behavior = { type: "returns", value, fakeFn: undefined };
    return stub;
  };

  /** 抛出错误（可传 Error 或字符串） */
  stub.throws = function (error) {
    behavior = {
      type: "throws",
      value: error instanceof Error ? error : new Error(String(error)),
    };
    return stub;
  };

  /** 调用自定义函数 */
  stub.callsFake = function (fn) {
    if (typeof fn !== "function") {
      throw new Error("callsFake 需要传入函数");
    }
    behavior = { type: "callsFake", fakeFn: fn, value: undefined };
    return stub;
  };

  /**
   * 为第 n 次调用配置行为（链式调用）
   * 用法：stub.onCall(0).returns(1).onCall(1).returns(2)
   * @param {number} n - 调用序号（从 0 开始）
   */
  stub.onCall = function (n) {
    const builder = {
      returns(value) {
        callBehaviors[n] = { type: "returns", value, fakeFn: undefined };
        return stub;
      },
      throws(error) {
        callBehaviors[n] = {
          type: "throws",
          value: error instanceof Error ? error : new Error(String(error)),
        };
        return stub;
      },
      callsFake(fn) {
        callBehaviors[n] = { type: "callsFake", fakeFn: fn, value: undefined };
        return stub;
      },
    };
    return builder;
  };

  /** 第 n 次之后所有调用使用该行为 */
  stub.onCallN = function (n) {
    return {
      returns(value) {
        for (let i = n; i < n + 1000; i++) {
          callBehaviors[i] = { type: "returns", value, fakeFn: undefined };
        }
        return stub;
      },
    };
  };

  // ===================== 状态管理 =====================

  /** 重置调用记录 */
  stub.reset = function () {
    calls.length = 0;
  };

  /** 重置所有行为配置 */
  stub.resetBehavior = function () {
    behavior = { type: "returns", value: undefined, fakeFn: undefined };
    callBehaviors.length = 0;
  };

  /** 恢复原始实现 */
  stub.restore = function () {
    if (isMethodStub && target) {
      target[method] = originalFn;
    }
  };

  /** 调用次数 */
  Object.defineProperty(stub, "callCount", {
    get() {
      return calls.length;
    },
  });

  /** 所有调用记录 */
  Object.defineProperty(stub, "calls", {
    get() {
      return calls.slice();
    },
  });

  /** 获取第 n 次调用的参数 */
  stub.argsFor = function (n) {
    return calls[n] ? calls[n].args : undefined;
  };

  stub.isStub = true;
  stub.original = originalFn;

  // 替换原方法
  if (isMethodStub && target) {
    target[method] = stub;
  }

  return stub;
}

// ===================== 测试用例 =====================

console.log("========== Stub 函数测试 ==========\n");

// --- 测试 1：Stub Math.random 使其可预测 ---
console.log("--- 测试 1：Stub Math.random ---");
const randomStub = createStub(Math, "random");
randomStub.returns(0.5);
console.log("Math.random() =", Math.random());
console.log("Math.random() =", Math.random());
console.log("callCount:", randomStub.callCount);
randomStub.restore();
console.log("恢复后 Math.random() =", Math.random());

// --- 测试 2：onCall 配置不同调用的返回值 ---
console.log("\n--- 测试 2：onCall 配置逐次返回值 ---");
const fakeRandom = createStub();
fakeRandom.onCall(0).returns(0.1).onCall(1).returns(0.5).onCall(2).returns(0.9);
// 第 3 次及之后返回默认 undefined
console.log("第 1 次:", fakeRandom());
console.log("第 2 次:", fakeRandom());
console.log("第 3 次:", fakeRandom());
console.log("第 4 次:", fakeRandom());

// --- 测试 3：throws ---
console.log("\n--- 测试 3：throws 抛出错误 ---");
const throwingStub = createStub();
throwingStub.throws("出错了");
try {
  throwingStub();
} catch (e) {
  console.log("捕获到错误:", e.message);
}

// --- 测试 4：callsFake ---
console.log("\n--- 测试 4：callsFake 自定义实现 ---");
const fakeStub = createStub();
fakeStub.callsFake((x, y) => x * y);
console.log("fakeStub(3, 4) =", fakeStub(3, 4));
console.log("fakeStub(5, 6) =", fakeStub(5, 6));

// --- 测试 5：Stub Date.now 模拟固定时间 ---
console.log("\n--- 测试 5：Stub Date.now ---");
const dateStub = createStub(Date, "now");
dateStub.returns(1000000);
console.log("Date.now() =", Date.now());
console.log("Date.now() =", Date.now());
console.log("callCount:", dateStub.callCount);
dateStub.restore();
console.log("恢复后 Date.now() =", Date.now());

// --- 测试 6：实际测试场景 ---
console.log("\n--- 测试 6：测试依赖 Math.random 的函数 ---");
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// 用 stub 让 Math.random 固定返回 0.5，使结果可预测
const stub2 = createStub(Math, "random");
stub2.returns(0.5);
console.log("getRandomInt(10) =", getRandomInt(10)); // 应为 5
console.log("getRandomInt(100) =", getRandomInt(100)); // 应为 50
stub2.restore();

// --- 测试 7：onCall 与 throws 混合 ---
console.log("\n--- 测试 7：onCall 混合 throws ---");
const mixedStub = createStub();
mixedStub
  .onCall(0)
  .returns("first")
  .onCall(1)
  .throws("boom")
  .onCall(2)
  .returns("third");

console.log("第 1 次:", mixedStub());
try {
  mixedStub();
} catch (e) {
  console.log("第 2 次抛出:", e.message);
}
console.log("第 3 次:", mixedStub());
