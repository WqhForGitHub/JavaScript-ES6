// 改后：接口和面向接口编程 -- 定义 Logger 接口作为全站唯一的日志出口，模块只管"记什么"，"记到哪"由注入的实现决定，运行时还能整体切换

// ========== 接口：约定一个日志出口必须提供的方法 ==========
interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}

// ========== 实现一：控制台（本地开发用） ==========
class ConsoleLogger implements Logger {
  info(msg: string): void {
    console.log(`[INFO] ${new Date().toISOString()} ${msg}`);
  }

  error(msg: string): void {
    console.log(`[ERROR] ${new Date().toISOString()} ${msg}`);
  }
}

// ========== 实现二：远程日志服务器（生产用） ==========
class RemoteLogger implements Logger {
  info(msg: string): void {
    console.log(`上报到日志服务器 /api/info：${msg}`);
  }

  error(msg: string): void {
    console.log(`上报到日志服务器 /api/error：${msg}`);
  }
}

// ========== 日志上下文：全站统一出口，持有的是接口而非具体实现 ==========
class LogContext {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  setLogger(logger: Logger): void {
    this.logger = logger; // 运行时整体切换实现，业务代码毫无感知
  }

  info(msg: string): void {
    this.logger.info(msg);
  }

  error(msg: string): void {
    this.logger.error(msg);
  }
}

const log = new LogContext(new ConsoleLogger());

// ========== 各模块只调接口方法，完全不关心日志最终去向 ==========
function createOrder(orderNo: string): void {
  log.info(`创建订单 ${orderNo}`);
}

function payOrder(orderNo: string, amount: number): void {
  log.info(`订单 ${orderNo} 支付 ${amount} 元`);
}

function riskCheck(userId: number): void {
  log.error(`用户 ${userId} 触发风控规则`);
}

console.log('--- 本地开发：控制台输出 ---');
createOrder('SO-1001');
payOrder('SO-1001', 99);
riskCheck(1001);

// 上线：整体切到远程上报，一行搞定，任何业务模块都不用改
console.log('--- 生产环境：切换为远程上报 ---');
log.setLogger(new RemoteLogger());
createOrder('SO-1002');
payOrder('SO-1002', 199);

// 优势：
// 1. 模块只依赖 Logger 接口，"记什么"与"记到哪"彻底分离
// 2. 换日志实现（控制台/远程/文件）只动 LogContext 一处，业务模块零修改
// 3. 时间戳、级别、上报格式在实现类里统一处理，全站日志一个长相
// 4. TS 是结构化类型（鸭子辨型）：新类哪怕不写 implements，只要方法签名对得上就能当 Logger 用

export {};
