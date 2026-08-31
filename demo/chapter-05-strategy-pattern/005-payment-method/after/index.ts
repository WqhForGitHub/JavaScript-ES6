// 改后：策略模式 -- 每种支付方式封装成策略类，环境类只负责选策略 + 收尾

interface PayResult {
  ok: boolean;
  channel: string;
}

// ========== 策略接口：统一 doPay 入口 ==========
interface PayStrategy {
  readonly channel: string;
  doPay(amount: number): PayResult;
}

// ========== 具体策略：各自封装自己的流程差异 ==========
class WechatPay implements PayStrategy {
  readonly channel = '微信支付';
  doPay(amount: number): PayResult {
    console.log(`[${this.channel}] 1. 拉起微信收银台（${amount} 元）`);
    console.log(`[${this.channel}] 2. 用户扫码/指纹确认`);
    console.log(`[${this.channel}] 3. 监听微信回调，校验签名`);
    return { ok: true, channel: this.channel };
  }
}

class Alipay implements PayStrategy {
  readonly channel = '支付宝';
  doPay(amount: number): PayResult {
    console.log(`[${this.channel}] 1. 拉起支付宝网页支付窗（${amount} 元）`);
    console.log(`[${this.channel}] 2. 用户输密码确认`);
    console.log(`[${this.channel}] 3. 监听支付宝异步通知`);
    return { ok: true, channel: this.channel };
  }
}

class BankCardPay implements PayStrategy {
  readonly channel = '银行卡';
  doPay(amount: number): PayResult {
    console.log(`[${this.channel}] 1. 校验银行卡四要素`);
    console.log(`[${this.channel}] 2. 发送短信验证码`);
    console.log(`[${this.channel}] 3. 用户输入验证码，网关扣款（${amount} 元）`);
    return { ok: true, channel: this.channel };
  }
}

// ========== 环境类：只负责"选策略 -> 执行 -> 统一收尾"，不关心流程细节 ==========
class PaymentContext {
  private strategy: PayStrategy;

  constructor(strategy: PayStrategy) {
    this.strategy = strategy;
  }

  // 运行时随时可切换策略（比如用户在收银台切换支付方式）
  setStrategy(strategy: PayStrategy): this {
    this.strategy = strategy;
    return this;
  }

  pay(amount: number): PayResult {
    const result = this.strategy.doPay(amount); // 委托给当前策略
    if (result.ok) {
      console.log(`[收银台] ${result.channel} 支付成功，跳转订单页`); // 收尾逻辑只写一份
    }
    return result;
  }
}

// ========== 使用：先选微信，中途切换成支付宝 ==========
const payment = new PaymentContext(new WechatPay());
payment.pay(99.9);

console.log('');

payment.setStrategy(new Alipay()); // 运行时切换策略
payment.pay(199.9);

console.log('');

payment.setStrategy(new BankCardPay());
payment.pay(2999.0);

// 优势：
// 1. 每种支付方式的流程封装在自己的策略类里，互不干扰
// 2. "支付成功后跳转订单页"这类公共收尾只写一份，不再每个分支重复
// 3. 支持运行时切换策略，新接支付渠道 = 新增一个策略类

export {};
