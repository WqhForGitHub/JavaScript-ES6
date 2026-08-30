// 改前：支付成功后，订单服务亲自调用每一个下游系统 -- 支付流程被无限撑大
interface Order {
  orderNo: string;
  amount: number;
}

const inventory = {
  deduct(order: Order): void {
    console.log(`[库存系统] 订单 ${order.orderNo} 扣减库存`);
  },
};

const points = {
  add(order: Order): void {
    console.log(`[积分系统] 订单 ${order.orderNo} 发放 ${order.amount} 积分`);
  },
};

const sms = {
  send(order: Order): void {
    console.log(`[短信系统] 支付成功：${order.orderNo}，实付 ${order.amount} 元`);
  },
};

class OrderService {
  pay(order: Order): void {
    console.log(`[订单系统] 订单 ${order.orderNo} 支付成功`);

    // 支付方法被迫串联所有下游系统，每接一个新系统就要改一次 pay
    inventory.deduct(order);
    points.add(order);
    sms.send(order);
    // 接下来还要接"物流系统""风控系统""抽奖活动"……pay 越来越长
  }
}

const orderService = new OrderService();
orderService.pay({ orderNo: 'SO-1001', amount: 299 });

// 问题：
// 1. OrderService 必须认识所有下游系统，接入新系统就得修改 pay（违反开放-封闭原则）
// 2. 某个下游系统接口变动，订单系统要跟着改，跨团队联调成本高
// 3. 支付主流程和一堆后续动作混在一起，出问题很难定位是哪一环

export {};
