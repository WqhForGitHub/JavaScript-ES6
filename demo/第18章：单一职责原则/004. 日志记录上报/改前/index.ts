// 改前：一个 log 函数同时管格式化、本地存储和远程上报 -- 三种毫不相干的变更全往它身上招呼

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logStore: string[] = []; // 模拟本地日志仓库

function log(level: LogLevel, message: string): void {
  // 职责一：格式化（时间戳 + 等级大写 + 消息）
  const time = '2026-08-30 10:00:00'; // 演示写死，真实场景取当前时间
  const formatted = `[${time}] [${level.toUpperCase()}] ${message}`;

  // 职责二：存储（所有日志都存本地）
  logStore.push(formatted);

  // 职责三：上报（warn 以上发请求 + 发邮件）
  if (level === 'warn' || level === 'error') {
    console.log(`[上报] POST /api/log-report ${formatted}`);
    console.log(`[邮件] 发送告警邮件：${message}`);
  }
}

// ========== 使用 ==========
log('info', '用户登录成功');
log('warn', '接口响应超过 3 秒');
log('error', '数据库连接超时');
console.log(`本地日志共 ${logStore.length} 条`);

// 问题：
// 1. 三个变化原因：调整日志格式、存储换 Redis、上报通道换 Kafka，都得改 log 函数
// 2. 只想要格式化能力（往控制台打日志）做不到 -- 一调 log 就必然连存储一起触发
// 3. 上报开关藏在函数深处：本地开发不想上报，又得往里塞一个 if，越塞越像迷宫

export {};
