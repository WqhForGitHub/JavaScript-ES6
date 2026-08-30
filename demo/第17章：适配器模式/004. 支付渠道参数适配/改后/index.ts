// 改后：适配器模式 -- 每家网关配一个适配器统一暴露 pay(order)，命名翻译和"元转分"全部锁进适配器

// ========== 业务侧的统一订单（金额单位：元） ==========
interface Order {
  orderNo: string;
  amountYuan: number;
  description: string;
}

// ========== 目标接口：收银台唯一认识的"支付渠道"长什么样 ==========
interface PaymentChannel {
  pay(order: Order): void;
}

// ========== 被适配者：两家网关原样保留，一行不改 ==========
const alipayGateway = {
  trade(params: { out_trade_no: string; total_amount: string; subject: string }): void {
    console.log(
      `（支付宝下单 ${params.out_trade_no}：${params.total_amount} 元 - ${params.subject}）`,
    );
  },
};

const wxpayGateway = {
  unifiedOrder(params: { out_trade_no: string; total_fee: number; body: string }): void {
    console.log(`（微信下单 ${params.out_trade_no}：${params.total_fee} 分 - ${params.body}）`);
  },
};

// ========== 适配器：参数命名翻译 + 金额单位换算，各自锁在自己家里 ==========
class AlipayAdapter implements PaymentChannel {
  pay(order: Order): void {
    alipayGateway.trade({
      out_trade_no: order.orderNo,
      total_amount: order.amountYuan.toFixed(2), // 元 -> 两位小数的字符串
      subject: order.description, // description -> subject
    });
  }
}

class WxPayAdapter implements PaymentChannel {
  pay(order: Order): void {
    wxpayGateway.unifiedOrder({
      out_trade_no: order.orderNo,
      total_fee: Math.round(order.amountYuan * 100), // 元 -> 分：只在这一处换算
      body: order.description, // description -> body
    });
  }
}

// ========== 收银台：只面向 PaymentChannel 接口，if-else 消失 ==========
function checkout(channel: PaymentChannel, order: Order): void {
  channel.pay(order);
}

const order: Order = { orderNo: 'SO-20250101-0001', amountYuan: 19.9, description: '无线机械键盘' };

checkout(new AlipayAdapter(), order);
checkout(new WxPayAdapter(), order);

// ========== 扩展：新接 PayPal（要美元、参数又叫别的名字），加一个适配器即可，checkout 零修改 ==========
const paypalGateway = {
  createPayment(params: { invoice_id: string; amount: string; currency: string }): void {
    console.log(`（PayPal 下单 ${params.invoice_id}：${params.amount} ${params.currency}）`);
  },
};

class PayPalAdapter implements PaymentChannel {
  pay(order: Order): void {
    paypalGateway.createPayment({
      invoice_id: order.orderNo, // orderNo -> invoice_id
      amount: (order.amountYuan * 0.14).toFixed(2), // 连汇率换算也锁在适配器里（示例汇率 0.14）
      currency: 'USD',
    });
  }
}

checkout(new PayPalAdapter(), order);

// 优势：
// 1. 收银台只依赖 PaymentChannel 接口，"元转分"、字符串格式化等脏活全部下沉到适配器
// 2. 参数命名翻译（subject / body / invoice_id）各有归属，收银台代码保持业务语言
// 3. 新增渠道 = 新增一个适配器类，checkout 一行不改，符合开放-封闭原则
// 4. 渠道成为统一类型，可入数组做支付方式列表、可在测试里替换成"假渠道"验证下单逻辑

export {};
