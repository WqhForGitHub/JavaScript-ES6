// 改前：各模块自己 new Logger，日志各写各的，序号错乱、无法统一输出
class Logger {
  private logs: string[] = [];

  log(msg: string) {
    this.logs.push(msg);
  }

  flush() {
    console.log('--- 输出日志 ---');
    this.logs.forEach((msg, i) => console.log(`${i + 1}. ${msg}`));
  }
}

// 模块 A：订单服务
const loggerA = new Logger();
loggerA.log('用户登录');

// 模块 B：支付服务 -- ❌ 又 new 了一个，缓冲区是空的
const loggerB = new Logger();
loggerB.log('创建订单');
loggerB.log('支付成功');

// 两边各自输出，日志被割裂，排查问题时得自己拼时间线
loggerA.flush();
loggerB.flush();
console.log('是同一个 Logger 吗：', loggerA === loggerB); // false

export {};
