// 改后：适配器模式（反向适配）-- log() 的旧签名原样保留当"外壳"，内部转接新 SDK，500 处调用一行不改

// ========== 新上位的 Sentry SDK：API 与旧 log 完全不同 ==========
const Sentry = {
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
    console.log(`（Sentry 上报 ${level}）${message}`);
  },
};

// ========== 适配器：保留旧签名当外壳，内部完成"参数顺序颠倒 + 级别名映射"两项翻译 ==========
type LogLevel = 'info' | 'warn' | 'error';

const levelMap: Record<LogLevel, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warn: 'warning', // 旧体系的 warn -> Sentry 的 warning
  error: 'error',
};

function log(level: LogLevel, message: string): void {
  Sentry.captureMessage(message, levelMap[level]); // 参数顺序在这里完成颠倒
}

// ========== 业务代码：原封不动，"500 处"调用零修改 ==========
function createOrder(): void {
  console.log('--- 下单流程 ---');
  log('info', '订单创建成功');
  log('error', '库存不足');
}

function refund(): void {
  log('info', '退款发起');
  log('warn', '退款金额超过订单的 80%'); // warn 经适配器自动翻译成 warning
}

createOrder();
refund();

// ========== 以后再换日志方案？只改 log() 内部实现，业务代码依旧一行不动 ==========
// 比如公司三年后又要换回自研日志，只需把函数体替换成：
// function log(level: LogLevel, message: string): void {
//   console.log(`[自研日志 ${level}] ${message}`);
// }
// 500 处调用点照样零修改 -- 这就是"适配器把变化锁在一个函数里"的价值

// 优势：
// 1. 旧签名原样保留，500 处调用点零修改，一次函数内部改造完成全量切换
// 2. "参数顺序颠倒、warn -> warning 映射"等差异被锁死在适配器一处，改漏改错无从谈起
// 3. 日志实现随时可替换（Sentry / 自研 / 别家），业务代码与日志方案彻底解耦
// 4. 新老代码可平滑共存：老代码继续用 log()，新代码可直接用 Sentry，互不干扰

export {};
