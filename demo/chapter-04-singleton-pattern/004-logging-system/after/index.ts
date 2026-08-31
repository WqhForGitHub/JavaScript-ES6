// 改后：Logger 单例 -- 全局共用一个缓冲区，日志天然有序、统一输出
class Logger {
  private static instance: Logger | null = null;
  private logs: string[] = [];

  private constructor() {} // 私有构造，禁止外部 new

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(msg: string) {
    this.logs.push(msg);
  }

  flush() {
    console.log('--- 输出日志 ---');
    this.logs.forEach((msg, i) => console.log(`${i + 1}. ${msg}`));
  }
}

// 模块 A：订单服务
const loggerA = Logger.getInstance();
loggerA.log('用户登录');

// 模块 B：支付服务 -- 拿到的是同一个 Logger
const loggerB = Logger.getInstance();
loggerB.log('创建订单');
loggerB.log('支付成功');

// 只需要 flush 一次，日志按真实顺序完整输出
loggerA.flush();
console.log('是同一个 Logger 吗：', loggerA === loggerB); // true ✅

export {};
