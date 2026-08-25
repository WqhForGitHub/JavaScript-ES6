class PaymentService {
  pay(type: string, amount: number) {
    if (type === 'alipay') {
      console.log(`支付宝支付 ¥${amount}`);
    } else if (type === 'wechat') {
      console.log(`微信支付 ¥${amount}`);
    } else if (type === 'creditcard') {
      console.log(`信用卡支付 ¥${amount}`);
    } else {
      throw new Error('不支持的支付方式');
    }
  }
}

const svc = new PaymentService();
svc.pay('alipay', 100);
svc.pay('wechat', 50);
// 加一种 Paypal？必须改 PaymentService —— 违反开闭原则

export { }