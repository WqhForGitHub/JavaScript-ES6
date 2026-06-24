/**
 * 手写惰性函数
 *
 * 作用：
 *   - 函数第一次调用时做一次性判断 / 初始化，之后"重写"自身为优化版本
 *   - 后续调用直接走快速路径，省去重复判断
 *   - 典型场景：浏览器特性检测（addEventListener vs attachEvent）、
 *     单次配置读取后固定实现
 *
 * 实现思路：
 *   1. 首次调用执行判断逻辑，并把函数自身覆盖为更高效的版本
 *   2. 之后调用直接执行覆盖后的函数
 */

// 方式1：函数自重写
function addEvent(element, type, handler) {
  if (window && window.addEventListener) {
    // 标准浏览器：覆盖为标准实现
    addEvent = function (element, type, handler) {
      element.addEventListener(type, handler, false);
    };
  } else {
    // IE 老版本
    addEvent = function (element, type, handler) {
      element.attachEvent("on" + type, handler);
    };
  }
  // 首次调用也要执行一次
  addEvent(element, type, handler);
}

// 方式2：惰性求值工厂（更通用）
function lazy(factory) {
  let instance;
  let initialized = false;
  return function (...args) {
    if (!initialized) {
      instance = factory.apply(this, args);
      initialized = true;
      // 重写自身：之后直接返回 / 调用实例
    }
    return instance;
  };
}

// 方式3：惰性函数对象（首次调用后替换实现）
function lazyFn(initial, optimized) {
  let fn = function (...args) {
    const result = initial.apply(this, args);
    // 用优化版替换自己
    fn = optimized;
    return result;
  };
  return function (...args) {
    return fn.apply(this, args);
  };
}

// ===== 测试 =====

// 模拟环境检测（Node 环境用 globalThis 模拟）
let detectionCount = 0;
function getEnvInfo() {
  detectionCount++;
  if (typeof globalThis !== "undefined") {
    getEnvInfo = function () {
      return "node/global environment";
    };
  } else {
    getEnvInfo = function () {
      return "unknown environment";
    };
  }
  return getEnvInfo();
}

console.log(getEnvInfo()); // 'node/global environment'
console.log(getEnvInfo()); // 'node/global environment'
console.log(getEnvInfo()); // 'node/global environment'
console.log("检测次数:", detectionCount); // 1（只检测一次）

// 惰性工厂：只创建一次昂贵对象
let createCount = 0;
const getDbConnection = lazy(() => {
  createCount++;
  return { query: (sql) => `result of ${sql}` };
});

const conn1 = getDbConnection();
const conn2 = getDbConnection();
const conn3 = getDbConnection();
console.log("同一实例:", conn1 === conn2 && conn2 === conn3); // true
console.log("创建次数:", createCount); // 1

// 惰性替换实现：首次走慢路径，之后走快路径
let slowCount = 0;
let fastCount = 0;
const process = lazyFn(
  // 首次：慢路径（带初始化）
  function slow(x) {
    slowCount++;
    return x + 100;
  },
  // 之后：快路径
  function fast(x) {
    fastCount++;
    return x + 100;
  }
);

console.log(process(1)); // 101（慢路径）
console.log(process(2)); // 102（快路径）
console.log(process(3)); // 103（快路径）
console.log("慢路径次数:", slowCount); // 1
console.log("快路径次数:", fastCount); // 2

// 应用：配置只读取一次
let configReadCount = 0;
const getConfig = lazy(() => {
  configReadCount++;
  // 模拟读取配置文件
  return { api: "/api/v1", timeout: 5000, debug: false };
});

console.log(getConfig().api); // '/api/v1'
console.log(getConfig().timeout); // 5000
console.log(getConfig().debug); // false
console.log("配置读取次数:", configReadCount); // 1

// 对比非惰性：每次都重新检测
let normalCount = 0;
function normalEnv() {
  normalCount++;
  return typeof globalThis !== "undefined"
    ? "node/global environment"
    : "unknown";
}
normalEnv();
normalEnv();
console.log("非惰性检测次数:", normalCount); // 2
