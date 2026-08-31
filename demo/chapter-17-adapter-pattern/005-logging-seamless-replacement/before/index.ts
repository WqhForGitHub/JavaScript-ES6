// 改前：换日志 SDK 靠"人肉逐处替换"，改到一半全站风格撕裂，谁也不敢保证改完那天一处不漏

// ========== 自家旧日志函数：全项目 500 处调用 ==========
function log(level: string, message: string): void {
  console.log(`[旧日志 ${level}] ${message}`);
}

// ========== 公司统一要求接入的 Sentry SDK：API 完全不同（内容在前、级别在后、级别名也不一样） ==========
const Sentry = {
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
    console.log(`（Sentry 上报 ${level}）${message}`);
  },
};

// ========== 订单模块：已完成"人肉迁移"，调用点已改成 Sentry ==========
function createOrder(): void {
  console.log('--- 下单流程 ---');
  Sentry.captureMessage('订单创建成功', 'info'); // 参数顺序得手动颠倒
  Sentry.captureMessage('库存不足', 'error');
}

// ========== 退款模块：还没排到，仍然调用旧 log ==========
function refund(): void {
  log('info', '退款发起');
  log('warn', '退款金额超过订单的 80%'); // 旧代码用 warn，Sentry 偏叫 warning，逐处替换时极易踩坑
}

createOrder();
refund();

// 全站现状：一半新一半旧，剩下 490 多处还在排队等人肉修改

// 问题：
// 1. 500 处调用点逐一修改，工期长、易漏改，漏一处就静默丢一条线上日志
// 2. 两套 API 参数顺序相反（级别在前 vs 内容在前），人肉颠倒就是事故温床
// 3. 级别命名不一致（warn vs warning）这种细节只能靠肉眼逐处对齐，没有任何兜底
// 4. 迁移期两套风格并存，代码评审与线上排障都得在"两个频道"间来回切换

export {};
