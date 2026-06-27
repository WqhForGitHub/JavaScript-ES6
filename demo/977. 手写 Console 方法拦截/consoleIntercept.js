/**
 * 手写 Console 方法拦截
 *
 * 拦截 console.log / error / warn / info / debug 等方法，
 * 将所有输出捕获到缓冲区。每条日志记录：
 * - 时间戳 (timestamp)
 * - 级别 (level)
 * - 序列化后的参数 (args)
 *
 * 功能：
 * - start(options)        : 开始拦截，options.silent=true 时不输出到原 console
 * - stop()                : 停止拦截并恢复原始方法
 * - filterByLevel(level)  : 按级别过滤
 * - filterByText(text)    : 按关键字过滤
 * - replay(filter)        : 回放日志（使用原始方法输出，避免重复捕获）
 * - getStats()            : 获取各级别统计
 * - clear()               : 清空缓冲区
 */

/**
 * 序列化任意值为字符串
 * @param {*} value
 * @returns {string}
 */
function serialize(value) {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "function")
    return `[Function: ${value.name || "anonymous"}]`;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

class ConsoleInterceptor {
  constructor() {
    /** @type {Array<{timestamp:number, level:string, args:string[], rawArgs:any[]}>} */
    this.buffer = [];
    /** 保存原始方法 */
    this.original = {};
    this.intercepting = false;
    this.levels = ["log", "error", "warn", "info", "debug"];
    this.silent = false;
  }

  /**
   * 开始拦截
   * @param {{silent?:boolean, levels?:string[]}} [options]
   */
  start(options = {}) {
    if (this.intercepting) return;
    this.silent = !!options.silent;
    const levels = options.levels || this.levels;
    const self = this;

    for (const level of levels) {
      // 保存原始方法
      this.original[level] = console[level].bind(console);

      console[level] = function (...args) {
        self.buffer.push({
          timestamp: Date.now(),
          level,
          args: args.map(serialize),
          rawArgs: args.slice(),
        });
        if (!self.silent) {
          self.original[level](...args);
        }
      };
    }
    this.intercepting = true;
  }

  /**
   * 停止拦截并恢复原始方法
   */
  stop() {
    if (!this.intercepting) return;
    for (const level of Object.keys(this.original)) {
      console[level] = this.original[level];
    }
    this.intercepting = false;
  }

  /**
   * 按级别过滤
   * @param {string} level
   * @returns {object[]}
   */
  filterByLevel(level) {
    return this.buffer.filter((entry) => entry.level === level);
  }

  /**
   * 按关键字过滤
   * @param {string} text
   * @returns {object[]}
   */
  filterByText(text) {
    return this.buffer.filter((entry) =>
      entry.args.some((arg) => String(arg).includes(text)),
    );
  }

  /**
   * 按时间范围过滤
   * @param {number} from - 起始时间戳
   * @param {number} to - 结束时间戳
   */
  filterByTime(from, to) {
    return this.buffer.filter(
      (entry) => entry.timestamp >= from && entry.timestamp <= to,
    );
  }

  /**
   * 使用原始 console 方法回放日志（避免重复捕获）
   * @param {(entries:object[])=>object[]} [filter] - 可选过滤函数
   */
  replay(filter) {
    let entries = this.buffer;
    if (typeof filter === "function") {
      entries = filter(this.buffer);
    }
    const log = this.original.log || console.log.bind(console);
    log(`\n=== 回放 ${entries.length} 条日志 ===`);
    for (const entry of entries) {
      const time = new Date(entry.timestamp).toISOString();
      log(`[${time}] [${entry.level.toUpperCase()}] ${entry.args.join(" ")}`);
    }
  }

  /**
   * 获取各级别统计
   */
  getStats() {
    const stats = {};
    for (const level of this.levels) {
      stats[level] = 0;
    }
    for (const entry of this.buffer) {
      stats[entry.level] = (stats[entry.level] || 0) + 1;
    }
    stats.total = this.buffer.length;
    return stats;
  }

  /**
   * 清空缓冲区
   */
  clear() {
    this.buffer = [];
  }

  /** 日志总数 */
  get count() {
    return this.buffer.length;
  }
}

// ===================== 测试用例 =====================

console.log("========== Console 方法拦截测试 ==========\n");

const interceptor = new ConsoleInterceptor();

// --- 测试 1：拦截并捕获 ---
console.log("--- 测试 1：开始拦截（silent 模式） ---");
interceptor.start({ silent: true }); // silent: 不输出到原 console，仅捕获

console.log("这条 log 不会被直接打印，但会被捕获");
console.error("一条错误信息");
console.warn("一条警告");
console.info("一条 info");
console.log("带对象:", { name: "test", value: 42 });
console.log("带数组:", [1, 2, 3]);

console.log("捕获总数:", interceptor.count);

const stats = interceptor.getStats();
console.log("各级别统计:", stats);

// 停止拦截
interceptor.stop();
console.log("\n已停止拦截。现在回放捕获的日志:");
interceptor.replay();

// --- 测试 2：过滤 ---
console.log("\n--- 测试 2：过滤日志 ---");
console.log("仅 error 级别:");
const errors = interceptor.filterByLevel("error");
errors.forEach((e) => console.log(`  [${e.level}] ${e.args.join(" ")}`));

console.log('\n含 "对象" 关键字的日志:');
const filtered = interceptor.filterByText("对象");
filtered.forEach((e) => console.log(`  [${e.level}] ${e.args.join(" ")}`));

// --- 测试 3：非 silent 模式（既输出又捕获） ---
console.log("\n--- 测试 3：非 silent 模式（同时输出并捕获） ---");
interceptor.clear();
interceptor.start(); // 默认非 silent
console.log("这条会同时打印和捕获");
console.warn("警告也会");
interceptor.stop();
console.log("捕获数量:", interceptor.count);

// --- 测试 4：实际场景 - 测试中验证 console 调用 ---
console.log("\n--- 测试 4：实际场景 - 验证被测函数的 console 输出 ---");
interceptor.clear();
interceptor.start({ silent: true });

// 被测函数：根据状态输出不同日志
function doWork(status) {
  if (status === "ok") {
    console.log("工作完成");
  } else if (status === "warn") {
    console.warn("工作有警告");
  } else {
    console.error("工作失败");
  }
}

doWork("ok");
doWork("warn");
doWork("error");

interceptor.stop();

console.log('验证 doWork("ok") 是否输出了 log:');
const okLogs = interceptor.filterByText("工作完成");
console.log("  找到:", okLogs.length === 1, ", 级别:", okLogs[0]?.level);

console.log('验证 doWork("error") 是否输出了 error:');
const errLogs = interceptor.filterByLevel("error");
console.log(
  "  找到:",
  errLogs.length === 1,
  ", 内容:",
  errLogs[0]?.args.join(" "),
);

// --- 测试 5：恢复后确认原始方法 ---
console.log("\n--- 测试 5：确认恢复后正常工作 ---");
console.log("这条 log 在 stop() 之后正常打印（未被捕获）");
console.log("当前缓冲区数量:", interceptor.count, "（应与 stop 前相同）");
