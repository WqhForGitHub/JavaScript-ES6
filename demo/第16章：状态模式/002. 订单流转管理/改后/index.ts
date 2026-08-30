// 改后：状态模式 -- 每种订单状态是一个类，该状态下四个操作的行为集中在同一个类里，订单只负责转发

// ========== 状态接口：任何状态都要回答“四个操作分别怎么处理” ==========
interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  confirmReceive(order: Order): void;
  cancel(order: Order): void;
}

// ========== 上下文：订单不含任何状态判断，只把操作委托给当前状态 ==========
class Order {
  private currentState: OrderState;

  constructor(
    readonly orderNo: string,
    initial: OrderState,
  ) {
    this.currentState = initial;
  }

  pay(): void {
    this.currentState.pay(this);
  }

  ship(): void {
    this.currentState.ship(this);
  }

  confirmReceive(): void {
    this.currentState.confirmReceive(this);
  }

  cancel(): void {
    this.currentState.cancel(this);
  }

  // 状态流转的统一出口：记一笔日志就切换
  setState(next: OrderState, message: string): void {
    console.log(`订单 ${this.orderNo}：${message}`);
    this.currentState = next;
  }
}

// ========== 具体状态：待支付 ==========
class UnpaidState implements OrderState {
  pay(order: Order): void {
    order.setState(orderPaid, '支付成功，等待商家发货'); // 待支付 -> 已支付
  }

  ship(order: Order): void {
    console.log(`订单 ${order.orderNo}：未支付订单不能发货`);
  }

  confirmReceive(order: Order): void {
    console.log(`订单 ${order.orderNo}：订单还未支付，无法确认收货`);
  }

  cancel(order: Order): void {
    order.setState(orderCancelled, '订单已取消'); // 待支付 -> 已取消
  }
}

// ========== 具体状态：已支付 ==========
class PaidState implements OrderState {
  pay(order: Order): void {
    console.log(`订单 ${order.orderNo}：请勿重复支付`);
  }

  ship(order: Order): void {
    order.setState(orderShipped, '商品已发货'); // 已支付 -> 已发货
  }

  confirmReceive(order: Order): void {
    console.log(`订单 ${order.orderNo}：商品还未发货，无法确认收货`);
  }

  cancel(order: Order): void {
    order.setState(orderCancelled, '订单已取消'); // 已支付 -> 已取消
  }
}

// ========== 具体状态：已发货 ==========
class ShippedState implements OrderState {
  pay(order: Order): void {
    console.log(`订单 ${order.orderNo}：请勿重复支付`);
  }

  ship(order: Order): void {
    console.log(`订单 ${order.orderNo}：订单已发货，请勿重复发货`);
  }

  confirmReceive(order: Order): void {
    order.setState(orderCompleted, '确认收货，交易完成'); // 已发货 -> 已完成
  }

  cancel(order: Order): void {
    console.log(`订单 ${order.orderNo}：商品已发货，请走售后退货流程`);
  }
}

// ========== 具体状态：已完成（终态，一切操作拒绝） ==========
class CompletedState implements OrderState {
  pay(order: Order): void {
    console.log(`订单 ${order.orderNo}：请勿重复支付`);
  }

  ship(order: Order): void {
    console.log(`订单 ${order.orderNo}：当前状态无法发货`);
  }

  confirmReceive(order: Order): void {
    console.log(`订单 ${order.orderNo}：当前状态无法确认收货`);
  }

  cancel(order: Order): void {
    console.log(`订单 ${order.orderNo}：当前状态无法取消`);
  }
}

// ========== 具体状态：已取消（终态，一切操作拒绝） ==========
class CancelledState implements OrderState {
  pay(order: Order): void {
    console.log(`订单 ${order.orderNo}：订单已取消，无法支付`);
  }

  ship(order: Order): void {
    console.log(`订单 ${order.orderNo}：当前状态无法发货`);
  }

  confirmReceive(order: Order): void {
    console.log(`订单 ${order.orderNo}：当前状态无法确认收货`);
  }

  cancel(order: Order): void {
    console.log(`订单 ${order.orderNo}：订单已取消`);
  }
}

// 状态对象无字段，全局共享一份
const orderUnpaid = new UnpaidState();
const orderPaid = new PaidState();
const orderShipped = new ShippedState();
const orderCompleted = new CompletedState();
const orderCancelled = new CancelledState();

// ========== 使用：一笔顺利走完全程的订单 ==========
const order1 = new Order('SO-1001', orderUnpaid);
order1.pay(); // 支付成功，等待商家发货
order1.ship(); // 商品已发货
order1.confirmReceive(); // 确认收货，交易完成
order1.cancel(); // 当前状态无法取消

// ========== 使用：一笔被取消的订单 ==========
const order2 = new Order('SO-1002', orderUnpaid);
order2.ship(); // 未支付订单不能发货
order2.cancel(); // 订单已取消
order2.pay(); // 订单已取消，无法支付

// 优势：
// 1. 行为按状态聚集：UnpaidState 一个类就是“待支付”的全部规则，读一个类看全一个状态
// 2. 流转统一走 setState，订单生命周期即状态类清单：待支付->已支付->已发货->已完成/已取消
// 3. 新增状态（如“退货中”）只需新增一个类，再在 ShippedState 的售后入口改一处跳转，符合开放-封闭原则
// 4. 订单类零分支判断，加操作只需扩展状态接口，各状态各自决定行为，互不牵连

export {};
