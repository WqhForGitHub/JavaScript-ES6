interface PaymentStrategy {
  pay(amount: number): void;
}

class AlipayStrategy implements PaymentStrategy {
  pay(amount: number) { console.log(`支付宝支付 ¥${amount}`); }
}

class WechatStrategy implements PaymentStrategy {
  pay(amount: number) { console.log(`微信支付 ¥${amount}`); }
}

class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number) { console.log(`信用卡支付 ¥${amount}`); }
}

class PaymentService {
  private strategy!: PaymentStrategy;
  setStrategy(s: PaymentStrategy) { this.strategy = s; }
  pay(amount: number) { this.strategy.pay(amount); }
}

const svc = new PaymentService();
svc.setStrategy(new AlipayStrategy());
svc.pay(100);
svc.setStrategy(new WechatStrategy());
svc.pay(50);
// 加 Paypal？新建一个 class，PaymentService 一行不改 ✅

export { }