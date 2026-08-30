// 改后：单一职责原则 -- 格式化、存储、上报各自成模块，Logger 门面只负责组装与分发

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  formatted: string;
}

// ========== 职责一：格式化器 -- 只关心“一条日志长什么样” ==========
class LogFormatter {
  format(level: LogLevel, message: string): string {
    const time = '2026-08-30 10:00:00'; // 演示写死，真实场景取当前时间
    return `[${time}] [${level.toUpperCase()}] ${message}`;
  }
}

// ========== 职责二：存储器 -- 只关心“日志放在哪”，换介质只改这里 ==========
class LogStorage {
  private records: string[] = [];

  save(entry: LogEntry): void {
    this.records.push(entry.formatted);
  }

  size(): number {
    return this.records.length;
  }
}

// ========== 职责三：上报器 -- 只关心“哪些日志要送出去、送到哪” ==========
class LogReporter {
  private reportLevels: Set<LogLevel>;

  constructor(reportLevels: LogLevel[]) {
    this.reportLevels = new Set(reportLevels);
  }

  report(entry: LogEntry): void {
    if (!this.reportLevels.has(entry.level)) return; // 不归我管的等级，直接跳过
    console.log(`[上报] POST /api/log-report ${entry.formatted}`);
    console.log(`[邮件] 发送告警邮件：${entry.message}`);
  }
}

// ========== 门面：组装三个职责，规定“先格式化、再存储、按需上报”的流程 ==========
class Logger {
  constructor(
    private formatter: LogFormatter,
    private storage: LogStorage,
    private reporter: LogReporter,
  ) {}

  log(level: LogLevel, message: string): void {
    const entry: LogEntry = {
      level,
      message,
      formatted: this.formatter.format(level, message),
    };
    this.storage.save(entry);
    this.reporter.report(entry);
  }
}

// ========== 使用：生产环境 -- warn 以上才上报 ==========
const logger = new Logger(new LogFormatter(), new LogStorage(), new LogReporter(['warn', 'error']));
logger.log('info', '用户登录成功');
logger.log('warn', '接口响应超过 3 秒');
logger.log('error', '数据库连接超时');

// ========== 组合自由：同一批零件，按环境拼出行为不同的 Logger ==========
// 本地开发：一个不上报的 Logger（换以前得往 log 里塞 if，现在只是换了个构造参数）
const devLogger = new Logger(new LogFormatter(), new LogStorage(), new LogReporter([]));
devLogger.log('warn', '本地开发环境，这条告警不会上报');

// 纯格式化场景：只借 LogFormatter 一个零件，存储和上报一概不带
console.log(`纯格式化：${new LogFormatter().format('debug', '单独借用格式化能力')}`);

// 优势：
// 1. 三个变化原因各自隔离：改时间格式只动 LogFormatter，换存储介质只动 LogStorage，换上报通道只动 LogReporter
// 2. 零件按需组合：开发不上报、调试只格式化，用同一批零件拼装即可，不用往函数里塞开关
// 3. 每个模块只有一个入口，各自可单测，互不牵连

export {};
