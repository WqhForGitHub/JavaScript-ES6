/**
 * 手写 Spy 函数
 *
 * Spy 函数会包裹一个已存在的函数，在不改变原函数行为的前提下，
 * 记录函数的调用信息，包括：
 * - 调用次数 (call count)
 * - 每次调用的参数 (arguments per call)
 * - 每次调用的返回值 (return values)
 * - 调用时的 this 上下文 (this context)
 * - 是否抛出异常 (threw / error)
 *
 * 与 Mock 不同，Spy 始终委托给原始实现执行（即真实函数照常运行），
 * Spy 只是在旁边"偷看"并记录。
 *
 * 典型用途：单元测试中验证函数是否被调用、调用次数、参数、返回值等。
 *
 * 支持两种创建方式：
 *   1. createSpy(fn)                       - 监视一个独立函数
 *   2. createSpy(obj, 'methodName')        - 监视并替换对象方法（可 restore）
 */

/**
 * 创建一个 Spy 函数
 * @param {object|Function} target - 目标对象，或直接传入函数
 * @param {string} [method] - 方法名（当 target 为对象时）
 * @returns {Function} 返回 spy 函数，附带访问器与 restore/reset 方法
 */
function createSpy(target, method) {
  let originalFn;
  let isMethodSpy = false;
  let owner = null;

  if (typeof target === "function") {
    // 用法 1：createSpy(fn)
    originalFn = target;
  } else if (target && typeof method === "string") {
    // 用法 2：createSpy(obj, 'methodName')
    originalFn = target[method];
    isMethodSpy = true;
    owner = target;
    if (typeof originalFn !== "function") {
      throw new Error(`无法 spy 非函数属性: ${method}`);
    }
  } else {
    throw new Error("createSpy 参数无效");
  }

  // 记录每次调用信息
  const calls = [];

  const spy = function (...args) {
    const callInfo = {
      args: args,
      thisArg: this,
      returnValue: undefined,
      threw: false,
      error: undefined,
      timestamp: Date.now(),
    };
    try {
      const result = originalFn.apply(this, args);
      callInfo.returnValue = result;
      return result;
    } catch (err) {
      callInfo.threw = true;
      callInfo.error = err;
      throw err;
    } finally {
      // 即使抛出异常也记录这次调用
      calls.push(callInfo);
    }
  };

  // ===================== 访问器 / 查询方法 =====================

  /** 调用次数 */
  Object.defineProperty(spy, "callCount", {
    get() {
      return calls.length;
    },
  });

  /** 所有调用记录的副本 */
  Object.defineProperty(spy, "calls", {
    get() {
      return calls.slice();
    },
  });

  /** 获取第 n 次调用记录（从 0 开始） */
  spy.getCall = function (n) {
    return calls[n];
  };

  /** 获取第 n 次调用的参数 */
  spy.argsFor = function (n) {
    return calls[n] ? calls[n].args : undefined;
  };

  /** 获取第 n 次调用的返回值 */
  spy.returnValueFor = function (n) {
    return calls[n] ? calls[n].returnValue : undefined;
  };

  /** 是否被调用过 */
  spy.called = function () {
    return calls.length > 0;
  };

  /** 是否被调用恰好一次 */
  spy.calledOnce = function () {
    return calls.length === 1;
  };

  /** 是否以指定参数被调用过（深度比较） */
  spy.calledWith = function (...expectedArgs) {
    return calls.some((call) =>
      expectedArgs.every((arg, i) => deepEqual(call.args[i], arg)),
    );
  };

  /** 是否曾经返回过指定值 */
  spy.returned = function (value) {
    return calls.some((call) => deepEqual(call.returnValue, value));
  };

  /** 是否每次都返回指定值 */
  spy.alwaysReturned = function (value) {
    return (
      calls.length > 0 &&
      calls.every((call) => deepEqual(call.returnValue, value))
    );
  };

  /** 是否总是抛出异常 */
  spy.alwaysThrew = function () {
    return calls.length > 0 && calls.every((call) => call.threw);
  };

  /** 重置 spy 的调用记录 */
  spy.reset = function () {
    calls.length = 0;
  };

  /** 恢复原始方法（仅对方法 spy 有效） */
  spy.restore = function () {
    if (isMethodSpy && owner) {
      owner[method] = originalFn;
    }
  };

  spy.isSpy = true;
  spy.original = originalFn;

  // 如果是方法 spy，则替换对象上的方法
  if (isMethodSpy && owner) {
    owner[method] = spy;
  }

  return spy;
}

/**
 * 简单的深度相等比较
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}

// ===================== 测试用例 =====================

console.log("========== Spy 函数测试 ==========\n");

// --- 测试 1：监视一个独立函数 ---
console.log("--- 测试 1：监视独立函数 add ---");
function add(a, b) {
  return a + b;
}

const spyAdd = createSpy(add);
console.log("调用前 callCount:", spyAdd.callCount);
console.log("调用前 called():", spyAdd.called());

console.log("add(2, 3)  =", spyAdd(2, 3));
console.log("add(4, 5)  =", spyAdd(4, 5));
console.log("add(10,20) =", spyAdd(10, 20));

console.log("调用后 callCount:", spyAdd.callCount);
console.log("called():", spyAdd.called());
console.log("calledOnce():", spyAdd.calledOnce());
console.log("第 0 次参数:", spyAdd.argsFor(0));
console.log("第 1 次返回值:", spyAdd.returnValueFor(1));
console.log("是否以 (2,3) 调用过:", spyAdd.calledWith(2, 3));
console.log("是否返回过 9:", spyAdd.returned(9));
console.log("是否总是返回 5:", spyAdd.alwaysReturned(5));

// --- 测试 2：监视对象方法（含 this 上下文） ---
console.log("\n--- 测试 2：监视对象方法 multiply ---");
const calc = {
  value: 100,
  multiply(x) {
    return this.value * x;
  },
};

const spyMultiply = createSpy(calc, "multiply");
console.log("calc.multiply(5) =", calc.multiply(5));
console.log("calc.multiply(2) =", calc.multiply(2));
console.log("callCount:", spyMultiply.callCount);
console.log(
  "第 0 次 this 是否为 calc:",
  spyMultiply.getCall(0).thisArg === calc,
);
console.log("第 0 次 this.value:", spyMultiply.getCall(0).thisArg.value);
console.log("第 0 次返回值:", spyMultiply.getCall(0).returnValue);

// 恢复原始方法
spyMultiply.restore();
console.log("恢复后 calc.multiply(5) =", calc.multiply(5));
console.log("恢复后是否仍为 spy:", calc.multiply.isSpy === true);

// --- 测试 3：监视会抛出异常的函数 ---
console.log("\n--- 测试 3：监视会抛出异常的函数 risky ---");
function risky(x) {
  if (x < 0) throw new Error("不能为负数");
  return x * 2;
}

const spyRisky = createSpy(risky);
console.log("risky(5) =", spyRisky(5));
try {
  spyRisky(-1);
} catch (e) {
  console.log("捕获到异常:", e.message);
}
console.log("callCount:", spyRisky.callCount);
console.log("第 1 次是否抛出异常:", spyRisky.getCall(1).threw);
console.log("第 1 次的错误信息:", spyRisky.getCall(1).error.message);
console.log("是否总是抛出异常:", spyRisky.alwaysThrew());

// --- 测试 4：reset 重置 ---
console.log("\n--- 测试 4：reset 重置调用记录 ---");
console.log("reset 前 callCount:", spyAdd.callCount);
spyAdd.reset();
console.log("reset 后 callCount:", spyAdd.callCount);
console.log("reset 后 called():", spyAdd.called());
