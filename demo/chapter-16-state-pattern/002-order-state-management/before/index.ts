// 改前：订单用字符串记录状态，pay/ship/confirmReceive/cancel 四个方法里各自写满 if-else，规则散落一地

type OrderState = 'unpaid' | 'paid' | 'shipped' | 'completed' | 'cancelled';

class Order {
  private state: OrderState = 'unpaid'; // 初始状态：待支付

  constructor(readonly orderNo: string) {}

  pay(): void {
    if (this.state === 'unpaid') {
      console.log(`订单 ${this.orderNo}：支付成功，等待商家发货`);
      this.state = 'paid';
    } else if (this.state === 'cancelled') {
      console.log(`订单 ${this.orderNo}：订单已取消，无法支付`);
    } else {
      console.log(`订单 ${this.orderNo}：请勿重复支付`);
    }
  }

  ship(): void {
    if (this.state === 'unpaid') {
      console.log(`订单 ${this.orderNo}：未支付订单不能发货`);
    } else if (this.state === 'paid') {
      console.log(`订单 ${this.orderNo}：商品已发货`);
      this.state = 'shipped';
    } else if (this.state === 'shipped') {
      console.log(`订单 ${this.orderNo}：订单已发货，请勿重复发货`);
    } else {
      console.log(`订单 ${this.orderNo}：当前状态无法发货`);
    }
  }

  confirmReceive(): void {
    if (this.state === 'shipped') {
      console.log(`订单 ${this.orderNo}：确认收货，交易完成`);
      this.state = 'completed';
    } else if (this.state === 'unpaid') {
      console.log(`订单 ${this.orderNo}：订单还未支付，无法确认收货`);
    } else if (this.state === 'paid') {
      console.log(`订单 ${this.orderNo}：商品还未发货，无法确认收货`);
    } else {
      console.log(`订单 ${this.orderNo}：当前状态无法确认收货`);
    }
  }

  cancel(): void {
    if (this.state === 'unpaid' || this.state === 'paid') {
      console.log(`订单 ${this.orderNo}：订单已取消`);
      this.state = 'cancelled';
    } else if (this.state === 'shipped') {
      console.log(`订单 ${this.orderNo}：商品已发货，请走售后退货流程`);
    } else {
      console.log(`订单 ${this.orderNo}：当前状态无法取消`);
    }
  }
}

// ========== 使用：一笔顺利走完全程的订单 ==========
const order1 = new Order('SO-1001');
order1.pay(); // 支付成功，等待商家发货
order1.ship(); // 商品已发货
order1.confirmReceive(); // 确认收货，交易完成
order1.cancel(); // 当前状态无法取消

// ========== 使用：一笔被取消的订单 ==========
const order2 = new Order('SO-1002');
order2.ship(); // 未支付订单不能发货
order2.cancel(); // 订单已取消
order2.pay(); // 订单已取消，无法支付

// 问题：
// 1. 4 个操作 × 5 种状态，每个方法都要枚举所有状态，十几处分支，改一处都心惊胆战
// 2. “待支付”状态下的完整规则被切碎到 4 个方法里，想确认一个状态的所有行为要满文件跳转
// 3. 新增状态（如“退货中”）或新增操作（如“申请开票”），所有方法都要翻新，违反开放-封闭原则
// 4. 订单生命周期（待支付->已支付->已发货->已完成/已取消）藏在 if-else 里，没有任何一处能看全

export {};
