// 改后：单一职责原则 -- 四件事拆成四个模块，placeOrder 只负责按流程编排

interface CartItem {
  sku: string;
  name: string;
  price: number; // 单价（元）
  quantity: number;
}

interface PriceBreakdown {
  subtotal: number; // 小计
  discount: number; // 满减优惠
  payable: number; // 应付
}

// ========== 职责一：库存服务 -- 只回答“够不够扣” ==========
class InventoryService {
  private stock: Record<string, number>;

  constructor(initial: Record<string, number>) {
    this.stock = { ...initial };
  }

  isEnough(sku: string, quantity: number): boolean {
    return (this.stock[sku] ?? 0) >= quantity;
  }

  deduct(sku: string, quantity: number): void {
    this.stock[sku] -= quantity;
  }
}

// ========== 职责二：计价器 -- 只回答“应该收多少钱”，促销规则再怎么变也只是这里的事 ==========
class PriceCalculator {
  total(cart: CartItem[], userLevel: 'normal' | 'vip'): PriceBreakdown {
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (userLevel === 'vip') subtotal *= 0.9; // VIP 打 9 折
    const discount = subtotal >= 200 ? 30 : 0; // 满 200 减 30
    subtotal = Math.round(subtotal * 100) / 100;
    return { subtotal, discount, payable: Math.round((subtotal - discount) * 100) / 100 };
  }
}

// ========== 职责三：订单仓库 -- 只负责生成订单号并保存 ==========
class OrderRepository {
  private orderSeq = 1000;

  create(): string {
    this.orderSeq += 1;
    return `SO-${this.orderSeq}`;
  }
}

// ========== 职责四：通知器 -- 只负责把消息发出去，渠道再多也只是这里的事 ==========
class OrderNotifier {
  notify(orderNo: string, payable: number): void {
    console.log(`[短信] 订单 ${orderNo} 创建成功，应付 ${payable} 元`);
    console.log(`[邮件] 您的订单 ${orderNo} 已生成`);
  }
}

// ========== 编排：流程一眼见底 -- 校验、算价、落库、扣库存、通知，各就各位 ==========
const inventory = new InventoryService({ 'SKU-01': 10, 'SKU-02': 0 });
const calculator = new PriceCalculator();
const repository = new OrderRepository();
const notifier = new OrderNotifier();

function placeOrder(cart: CartItem[], userLevel: 'normal' | 'vip'): string | null {
  const shortage = cart.find((item) => !inventory.isEnough(item.sku, item.quantity));
  if (shortage) {
    console.log(`下单失败：${shortage.name} 库存不足`);
    return null;
  }

  const price = calculator.total(cart, userLevel);
  const orderNo = repository.create();
  cart.forEach((item) => inventory.deduct(item.sku, item.quantity));
  notifier.notify(orderNo, price.payable);

  console.log(`下单成功：${orderNo}，应付 ${price.payable} 元`);
  return orderNo;
}

// ========== 使用 ==========
placeOrder([{ sku: 'SKU-01', name: '《设计模式》', price: 89, quantity: 2 }], 'vip'); // 应付 160.2 元
placeOrder([{ sku: 'SKU-02', name: '机械键盘', price: 399, quantity: 1 }], 'normal'); // 库存不足

// ========== 复用：结算预览页只借计价器，不带任何下单副作用 ==========
const preview = calculator.total(
  [{ sku: 'SKU-01', name: '《设计模式》', price: 89, quantity: 3 }],
  'vip',
);
console.log(
  `结算预览：小计 ${preview.subtotal}，满减 ${preview.discount}，应付 ${preview.payable}`,
);

// 优势：
// 1. 四个变化原因各归各位：促销改规则只动 PriceCalculator，通知加微信渠道只动 OrderNotifier
// 2. 计价模块独立复用：结算预览、购物车角标直接调用，不会误触扣库存、发通知等副作用
// 3. 编排函数短得像目录：下单流程一眼看清，四个模块各自都能单独写单元测试

export {};
