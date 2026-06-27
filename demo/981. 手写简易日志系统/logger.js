/**
 * 手写简易日志系统 (Simple Logging System)
 * ========================================
 *
 * 概念说明:
 * 一个完整的日志系统通常包含以下要素:
 * 1. 日志级别 (Log Levels): DEBUG < INFO < WARN < ERROR < FATAL, 用于过滤不同严重程度的日志
 * 2. 格式化输出 (Formatting): 时间戳 / 级别 / 消息 / 上下文的结构化展示
 * 3. 多传输通道 (Transports): console / 内存 / 文件模拟 / 网络等不同输出目标
 * 4. 结构化日志 (Structured Logging): 以 JSON 形式输出, 便于机器解析与检索
 * 5. 子日志器 (Child Logger): 继承父日志器的上下文, 添加额外字段, 便于模块化追踪
 * 6. 上下文 (Context): 贯穿日志的元数据, 如 requestId / userId 等
 *
 * 本实现要点:
 * - 使用 LEVELS 常量定义级别数值, 便于比较过滤
 * - Transport 抽象统一接口 write(level, formatted, raw), 易于扩展
 * - Logger 支持链式 child() 调用, 上下文合并
 */

"use strict";

/** 日志级别枚举 (数值越大, 优先级越高) */
const LEVELS = Object.freeze({
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
});

/** 级别名称 -> 数值 的反向映射 */
const LEVEL_NAMES = Object.freeze(
  Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [v, k])),
);

/**
 * 控制台传输通道
 * 直接使用 console 输出, 按级别选择 console 方法.
 */
class ConsoleTransport {
  constructor() {
    this.name = "console";
  }

  /**
   * @param {string} levelName - 级别名称
   * @param {string} formatted - 已格式化的字符串
   * @param {object} raw - 原始日志对象
   */
  write(levelName, formatted, raw) {
    switch (levelName) {
      case "DEBUG":
        console.debug(formatted);
        break;
      case "INFO":
        console.info(formatted);
        break;
      case "WARN":
        console.warn(formatted);
        break;
      case "ERROR":
        console.error(formatted);
        break;
      case "FATAL":
        console.error(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

/**
 * 内存传输通道
 * 把日志保存在数组中, 用于测试或后续回放.
 */
class MemoryTransport {
  constructor(maxSize = 1000) {
    this.name = "memory";
    this.maxSize = maxSize;
    /** @type {object[]} */
    this.records = [];
  }

  write(levelName, formatted, raw) {
    this.records.push({ levelName, formatted, raw, time: Date.now() });
    // 简单的环形缓冲, 超出容量丢弃最旧记录
    if (this.records.length > this.maxSize) {
      this.records.shift();
    }
  }

  clear() {
    this.records = [];
  }
}

/**
 * 文件模拟传输通道
 * 不真正写文件 (Node 环境下也可用 fs), 这里把内容累积成字符串以便演示.
 */
class FileTransport {
  constructor(filename = "app.log") {
    this.name = "file";
    this.filename = filename;
    this.buffer = "";
  }

  write(levelName, formatted, raw) {
    this.buffer += formatted + "\n";
  }

  flush() {
    return this.buffer;
  }
}

/**
 * 默认格式化器: 生成可读文本
 * 形如: [2024-01-01T00:00:00.000Z] [INFO] [module=user] message {extra}
 * @param {object} entry
 * @returns {string}
 */
function textFormatter(entry) {
  const { time, levelName, context, message, ...extra } = entry;
  const ctxStr = Object.keys(context).length
    ? " " + JSON.stringify(context)
    : "";
  const extraStr = Object.keys(extra).length ? " " + JSON.stringify(extra) : "";
  return `[${time}] [${levelName}]${ctxStr} ${message}${extraStr}`;
}

/**
 * JSON 格式化器: 输出结构化日志, 便于 ELK 等系统采集
 * @param {object} entry
 * @returns {string}
 */
function jsonFormatter(entry) {
  return JSON.stringify(entry);
}

/**
 * Logger 日志器主类
 */
class Logger {
  /**
   * @param {object} options
   * @param {string} [options.name] - 日志器名称
   * @param {number} [options.level] - 最低输出级别
   * @param {Array} [options.transports] - 传输通道列表
   * @param {Function} [options.format] - 格式化函数
   * @param {object} [options.context] - 基础上下文
   */
  constructor(options = {}) {
    this.name = options.name || "root";
    this.level = options.level != null ? options.level : LEVELS.INFO;
    this.transports = options.transports || [new ConsoleTransport()];
    this.format = options.format || textFormatter;
    this.context = Object.assign({}, options.context);
  }

  /**
   * 创建子日志器, 合并父上下文
   * @param {string} childName
   * @param {object} [extraContext]
   * @returns {Logger}
   */
  child(childName, extraContext = {}) {
    return new Logger({
      name: `${this.name}:${childName}`,
      level: this.level,
      transports: this.transports,
      format: this.format,
      context: Object.assign({}, this.context, extraContext),
    });
  }

  /** 设置最低输出级别 */
  setLevel(level) {
    this.level = level;
  }

  /**
   * 核心日志方法
   * @param {number} levelValue
   * @param {string} message
   * @param {object} [meta] - 额外元数据
   */
  log(levelValue, message, meta = {}) {
    // 级别过滤: 低于设定级别则丢弃
    if (levelValue < this.level) {
      return;
    }

    const entry = {
      time: new Date().toISOString(),
      level: levelValue,
      levelName: LEVEL_NAMES[levelValue] || "LOG",
      logger: this.name,
      context: Object.assign({}, this.context),
      message,
      ...meta,
    };

    const formatted = this.format(entry);
    for (const transport of this.transports) {
      transport.write(entry.levelName, formatted, entry);
    }
  }

  // 便捷方法
  debug(message, meta) {
    this.log(LEVELS.DEBUG, message, meta);
  }
  info(message, meta) {
    this.log(LEVELS.INFO, message, meta);
  }
  warn(message, meta) {
    this.log(LEVELS.WARN, message, meta);
  }
  error(message, meta) {
    this.log(LEVELS.ERROR, message, meta);
  }
  fatal(message, meta) {
    this.log(LEVELS.FATAL, message, meta);
  }
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 1. 文本格式 + 多通道 ==========");
const memTransport = new MemoryTransport();
const fileTransport = new FileTransport("demo.log");
const logger = new Logger({
  name: "app",
  level: LEVELS.DEBUG,
  transports: [new ConsoleTransport(), memTransport, fileTransport],
  context: { service: "demo-service", version: "1.0.0" },
});

logger.debug("调试信息, 仅开发可见", { traceId: "t-001" });
logger.info("服务启动成功");
logger.warn("缓存命中率偏低", { hitRate: 0.42 });
logger.error("数据库连接失败", { code: "ECONNREFUSED" });
logger.fatal("致命错误, 进程即将退出", { pid: process.pid });

console.log("\n========== 2. 级别过滤 (INFO 以上才输出) ==========");
const prodLogger = new Logger({
  name: "prod",
  level: LEVELS.INFO,
  transports: [new ConsoleTransport()],
});
prodLogger.debug("这条 DEBUG 不会出现");
prodLogger.info("这条 INFO 会出现");
prodLogger.warn("这条 WARN 会出现");

console.log("\n========== 3. 子日志器 (携带模块上下文) ==========");
const userLogger = logger.child("user", { module: "user", requestId: "r-123" });
userLogger.info("用户登录成功", { userId: 42 });
userLogger.error("用户登录失败, 密码错误", { userId: 42, attempts: 3 });

const orderLogger = logger.child("order", { module: "order" });
orderLogger.info("订单已创建", { orderId: "A100", amount: 99.5 });

console.log("\n========== 4. JSON 结构化日志 ==========");
const jsonLogger = new Logger({
  name: "json-app",
  level: LEVELS.DEBUG,
  transports: [new ConsoleTransport()],
  format: jsonFormatter,
  context: { env: "production" },
});
jsonLogger.info("结构化日志示例", { user: { id: 7, name: "Alice" } });
jsonLogger.error("操作失败", {
  op: "checkout",
  reason: "insufficient_balance",
});

console.log("\n========== 5. 内存通道回放 ==========");
console.log(`内存通道共保存 ${memTransport.records.length} 条记录`);
console.log("第一条记录:", memTransport.records[0].formatted);
console.log(
  "最后一条记录:",
  memTransport.records[memTransport.records.length - 1].formatted,
);

console.log("\n========== 6. 文件模拟通道内容 ==========");
console.log("--- file buffer ---");
console.log(fileTransport.flush().trim());

console.log("\n========== 7. 错误对象序列化 ==========");
try {
  JSON.parse("{invalid json");
} catch (err) {
  logger.error("解析 JSON 失败", {
    errorName: err.name,
    errorMessage: err.message,
  });
}

console.log("\n[日志系统演示完成]");
