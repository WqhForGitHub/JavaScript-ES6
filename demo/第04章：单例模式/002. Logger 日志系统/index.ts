// 第04章：单例模式 - 002：Logger 日志系统
//
// 场景：日志系统需要统一输出到同一个地方（终端、文件、远程收集器），
// 日志级别也应该全局统一。如果每个模块各建一个 Logger，
// 就会出现级别不一致、日志历史分散无法统一导出的问题。

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private static instance: Logger | null = null;

  private minLevel: LogLevel = 'debug';
  private buffer: string[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /** 全局统一设置级别，只改一次，所有模块同时生效 */
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.minLevel];
  }

  private write(level: LogLevel, msg: string): void {
    if (!this.shouldLog(level)) return;
    const line = `[${new Date().toISOString()}] [${level.toUpperCase().padEnd(5)}] ${msg}`;
    this.buffer.push(line);
    console.log(line);
  }

  debug(msg: string): void {
    this.write('debug', msg);
  }

  info(msg: string): void {
    this.write('info', msg);
  }

  warn(msg: string): void {
    this.write('warn', msg);
  }

  error(msg: string): void {
    this.write('error', msg);
  }

  /** 统一的日志历史，方便排查问题 */
  getHistory(): readonly string[] {
    return this.buffer;
  }
}

// ============================================================
// 使用演示
// ============================================================

// 模块 A：user 模块
const loggerA = Logger.getInstance();
// 模块 B：order 模块
const loggerB = Logger.getInstance();

console.log('两个模块拿到的是同一个 Logger：', loggerA === loggerB); // true

loggerA.info('用户登录成功');
loggerB.debug('这是一条 debug 日志（默认级别下会输出）');

// 全局只改一次级别，两个模块同时生效
loggerB.setLevel('warn');
console.log('\n--- 级别已调为 warn，debug/info 被过滤 ---');
loggerA.debug('这条 debug 不会输出');
loggerA.info('这条 info 不会输出');
loggerB.warn('库存不足警告');
loggerA.error('数据库连接失败');

// 日志历史集中保存在唯一实例里，任何模块都能导出
console.log('\n日志历史条数：', loggerA.getHistory().length);
console.log('模块 B 拿到的也是同一份历史：', loggerB.getHistory() === loggerA.getHistory()); // true

export {};
