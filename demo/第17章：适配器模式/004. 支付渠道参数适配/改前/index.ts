// 改前：两家支付网关的参数名和金额单位都不一样，收银台被迫堆 if-else 手工拼参数

// ========== 业务侧的统一订单（金额单位：元） ==========
interface Order {
  orderNo: string;
  amountYuan: number;
  description: string;
}

// ========== 支付宝网关：out_trade_no + total_amount（字符串，单位：元） ==========
const alipayGateway = {
  trade(params: { out_trade_no: string; total_amount: string; subject: string }): void {
    console.log(
      `（支付宝下单 ${params.out_trade_no}：${params.total_amount} 元 - ${params.subject}）`,
    );
  },
};

// ========== 微信支付网关：out_trade_no + total_fee（数字，单位：分！） ==========
const wxpayGateway = {
  unifiedOrder(params: { out_trade_no: string; total_fee: number; body: string }): void {
    console.log(`（微信下单 ${params.out_trade_no}：${params.total_fee} 分 - ${params.body}）`);
  },
};

// ========== 收银台：每家渠道一套参数拼装逻辑 ==========
function pay(channel: string, order: Order): void {
  if (channel === 'alipay') {
    alipayGateway.trade({
      out_trade_no: order.orderNo,
      total_amount: order.amountYuan.toFixed(2), // 元，还得转成保留两位小数的字符串
      subject: order.description, // 商品描述这家叫 subject
    });
  } else if (channel === 'wxpay') {
    wxpayGateway.unifiedOrder({
      out_trade_no: order.orderNo,
      total_fee: Math.round(order.amountYuan * 100), // 元 -> 分，乘 100 还得防浮点误差
      body: order.description, // 同一个东西这家又叫 body
    });
  } else {
    console.log('暂不支持的支付渠道：', channel);
  }
}

const order: Order = { orderNo: 'SO-20250101-0001', amountYuan: 19.9, description: '无线机械键盘' };

pay('alipay', order);
pay('wxpay', order);

// "元转分"是经典的资损事故来源：浮点数乘法并不精确，不加 Math.round 直接就少收钱
console.log('手工换算的陷阱：19.9 * 100 =', 19.9 * 100); // 1989.9999999999998

// 问题：
// 1. "元转分"、字符串格式化这类换算细节泄漏进收银台，是 1 分钱资损事故的经典来源
// 2. 同一个商品描述，支付宝叫 subject、微信叫 body，命名翻译散落在 if-else 里
// 3. 新接一家渠道（云闪付、PayPal...）就继续改 pay 函数，改动点永远在老代码
// 4. "一种支付方式"没有统一类型，支付方式列表没法配置化，测试也没法换成假渠道

export {};
