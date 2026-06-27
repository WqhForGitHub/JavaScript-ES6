/**
 * 手写简易性能分析器（Performance Profiler）
 *
 * 通过包裹函数调用，测量每个函数的执行时间。
 * 跟踪以下指标：
 * - 调用次数 (callCount)
 * - 总时间 (totalTime)        - 包括嵌套子调用的时间
 * - 自身时间 (self time)      - 不包括嵌套被追踪函数的时间
 * - 平均时间 (avg)
 *
 * 自身时间（self time）的计算：
 *   当函数 A 调用函数 B（B 也被追踪）时，B 的执行时间应从 A 的 self time 中扣除。
 *   通过维护一个调用栈，每帧记录 childTime（子函数累计耗时），
 *   函数结束时：selfTime = elapsed - childTime，
 *   并把本次 elapsed 累加到父帧的 childTime。
 *
 * 使用 performance.now() 进行高精度计时。
 */

/**
 * 获取高精度计时函数
 */
function getNow() {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return () => performance.now();
  }
  try {
    const { performance: perf } = require("perf_hooks");
    return () => perf.now();
  } catch (e) {
    return () => Date.now();
  }
}

class Profiler {
  constructor() {
    /** @type {Map<string, object>} 函数名 -> profile 数据 */
    this.profiles = new Map();
    /** 调用栈，每帧: { name, start, childTime } */
    this.stack = [];
    this.enabled = false;
    this.now = getNow();
  }

  /**
   * 包裹一个函数，使其被 profiling
   * @param {Function} fn - 原始函数
   * @param {string} [name] - 函数名
   * @returns {Function} 包装后的函数
   */
  wrap(fn, name) {
    const profileName = name || fn.name || "anonymous";
    const profiler = this;

    if (!this.profiles.has(profileName)) {
      this.profiles.set(profileName, {
        name: profileName,
        callCount: 0,
        totalTime: 0,
        selfTime: 0,
      });
    }

    const wrapped = function (...args) {
      // 未启用时直接执行
      if (!profiler.enabled) {
        return fn.apply(this, args);
      }

      const profile = profiler.profiles.get(profileName);
      const start = profiler.now();

      // 压栈，记录进入此函数
      const frame = { name: profileName, start, childTime: 0 };
      profiler.stack.push(frame);

      try {
        return fn.apply(this, args);
      } finally {
        // 弹栈
        profiler.stack.pop();
        const elapsed = profiler.now() - start;
        const selfTime = elapsed - frame.childTime;

        profile.callCount++;
        profile.totalTime += elapsed;
        profile.selfTime += selfTime;

        // 把本次耗时累加到父帧的 childTime
        if (profiler.stack.length > 0) {
          profiler.stack[profiler.stack.length - 1].childTime += elapsed;
        }
      }
    };

    wrapped.profileName = profileName;
    wrapped.original = fn;
    return wrapped;
  }

  /** 开始 profiling */
  start() {
    this.enabled = true;
  }

  /** 停止 profiling */
  stop() {
    this.enabled = false;
  }

  /** 重置所有 profile 数据 */
  reset() {
    this.profiles.clear();
    this.stack = [];
  }

  /**
   * 打印报告
   * @param {string} [sortBy] - 排序字段：totalTime | selfTime | callCount
   * @returns {object[]} 排序后的 profile 列表
   */
  report(sortBy = "totalTime") {
    const entries = Array.from(this.profiles.values());
    entries.sort((a, b) => b[sortBy] - a[sortBy]);

    const header =
      pad("函数名", 20) +
      pad("调用次数", 10) +
      pad("总时间(ms)", 14) +
      pad("自身时间(ms)", 14) +
      pad("平均(ms)", 14);

    console.log("\n=== Profiler 报告（按 " + sortBy + " 降序） ===");
    console.log(header);
    console.log("-".repeat(header.length));

    for (const p of entries) {
      const avg = p.callCount > 0 ? p.totalTime / p.callCount : 0;
      console.log(
        pad(p.name, 20) +
          pad(String(p.callCount), 10) +
          pad(p.totalTime.toFixed(4), 14) +
          pad(p.selfTime.toFixed(4), 14) +
          pad(avg.toFixed(6), 14),
      );
    }
    console.log("-".repeat(header.length));
    return entries;
  }

  /**
   * 获取某个函数的 profile
   */
  getProfile(name) {
    return this.profiles.get(name);
  }
}

/** 字符串右补空格 */
function pad(str, len) {
  str = String(str);
  if (str.length >= len) return str + " ";
  return str + " ".repeat(len - str.length);
}

// ===================== 测试用例 =====================

console.log("========== 性能分析器（Profiler）测试 ==========\n");

const profiler = new Profiler();

// --- 定义一些有嵌套调用的函数并 wrap ---
function heavyCompute(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
}

function processData(size) {
  // 内部调用 heavyCompute
  let result = 0;
  result += heavyCompute(size);
  result += heavyCompute(size / 2);
  return result;
}

function runAll() {
  processData(100000);
  processData(50000);
  // 一些自身的计算
  let x = 0;
  for (let i = 0; i < 100000; i++) x += i;
  return x;
}

// 包装所有函数
const wHeavy = profiler.wrap(heavyCompute, "heavyCompute");
const wProcess = profiler.wrap(function processData(size) {
  let result = 0;
  result += wHeavy(size);
  result += wHeavy(size / 2);
  return result;
}, "processData");
const wRun = profiler.wrap(function runAll() {
  wProcess(100000);
  wProcess(50000);
  let x = 0;
  for (let i = 0; i < 100000; i++) x += i;
  return x;
}, "runAll");

// 启动 profiling 并执行
console.log("--- 启动 profiler 并执行嵌套调用 ---");
profiler.start();
wRun();
wRun();
profiler.stop();

// 打印报告（按总时间排序）
profiler.report("totalTime");

// 按 self time 排序（更能看出哪个函数自身耗时最多）
console.log("\n--- 按 selfTime 排序 ---");
profiler.report("selfTime");

// 打印各函数明细
console.log("\n--- 各函数明细 ---");
for (const [name, p] of profiler.profiles) {
  const avg = p.callCount > 0 ? (p.totalTime / p.callCount).toFixed(4) : "0";
  console.log(
    `${name}: 调用 ${p.callCount} 次, 总 ${p.totalTime.toFixed(3)}ms, ` +
      `自身 ${p.selfTime.toFixed(3)}ms, 平均 ${avg}ms`,
  );
}

// --- 验证 self time 逻辑 ---
console.log(
  "\n--- 验证：runAll 的 selfTime = totalTime - processData totalTime ---",
);
const runP = profiler.getProfile("runAll");
const procP = profiler.getProfile("processData");
console.log(
  `runAll.selfTime (${runP.selfTime.toFixed(3)}) ≈ runAll.totalTime (${runP.totalTime.toFixed(3)}) - ` +
    `processData.totalTime (${procP.totalTime.toFixed(3)}) = ${(runP.totalTime - procP.totalTime).toFixed(3)}`,
);
