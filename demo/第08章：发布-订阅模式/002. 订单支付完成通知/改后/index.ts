// 改后：发布-订阅模式 -- 订单只广播"支付成功"事件，各系统自行订阅后续处理
interface Order {
  orderNo: string;
  amount: number;
}

type Handler<T> = (payload: T) => void;

// ========== 事件中心（EventBus） ==========
class EventBus {
  private handlers = new Map<string, Array<Handler<unknown>>>();

  subscribe<T>(event: string, handler: Handler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as Handler<unknown>);
    this.handlers.set(event, list);
  }

  emit<T>(event: string, payload: T): void {
    const list = this.handlers.get(event);
    if (!list) return;
    list.forEach((handler) => (handler as Handler<T>)(payload));
  }
}

const bus = new EventBus();

// ========== 各下游系统自行订阅"支付成功"，与订单系统互不相识 ==========
bus.subscribe<Order>('order:paid', (order) => {
  console.log(`[库存系统] 订单 ${order.orderNo} 扣减库存`);
});

bus.subscribe<Order>('order:paid', (order) => {
  console.log(`[积分系统] 订单 ${order.orderNo} 发放 ${order.amount} 积分`);
});

bus.subscribe<Order>('order:paid', (order) => {
  console.log(`[短信系统] 支付成功：${order.orderNo}，实付 ${order.amount} 元`);
});

// ========== 订单系统只广播事件，不关心谁在听 ==========
class OrderService {
  pay(order: Order): void {
    console.log(`[订单系统] 订单 ${order.orderNo} 支付成功`);
    bus.emit('order:paid', order);
  }
}

const orderService = new OrderService();
orderService.pay({ orderNo: 'SO-1001', amount: 299 });

// 大促要给支付用户发"抽奖资格"？新系统自己订阅即可，OrderService 一行不改
bus.subscribe<Order>('order:paid', (order) => {
  console.log(`[抽奖活动] 订单 ${order.orderNo} 获得 1 次抽奖机会`);
});

orderService.pay({ orderNo: 'SO-1002', amount: 860 });

// 优势：
// 1. 一次支付事件扇出给任意多个系统，订单系统对下游一无所知
// 2. 接入/下线一个下游系统 = 增删一个订阅者，pay 方法永远只有两行
// 3. 各系统只依赖事件契约（order:paid + Order），可独立开发、独立测试

export {};
