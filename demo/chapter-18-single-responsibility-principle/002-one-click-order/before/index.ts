// 改前：下单函数一肩挑四责 -- 查库存、算价格、落库、发通知，四个互不相干的变化都盯上它

interface CartItem {
  sku: string;
  name: string;
  price: number; // 单价（元）
  quantity: number;
}

// 模拟数据：库存表、订单库全被下单函数“私有”把持着
const stock: Record<string, number> = { 'SKU-01': 10, 'SKU-02': 0 };
const orderStore: string[] = []; // 模拟订单“数据库”
let orderSeq = 1000; // 订单号自增序号

function placeOrder(cart: CartItem[], userLevel: 'normal' | 'vip'): string | null {
  // 职责一：校验库存
  for (const item of cart) {
    if ((stock[item.sku] ?? 0) < item.quantity) {
      console.log(`下单失败：${item.name} 库存不足`);
      return null;
    }
  }

  // 职责二：计价（VIP 打 9 折，满 200 再减 30）
  let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (userLevel === 'vip') total *= 0.9;
  if (total >= 200) total -= 30;
  total = Math.round(total * 100) / 100;

  // 职责三：落库（扣库存 + 生成订单号 + 保存）
  orderSeq += 1;
  const orderNo = `SO-${orderSeq}`;
  for (const item of cart) stock[item.sku] -= item.quantity;
  orderStore.push(orderNo);

  // 职责四：通知（短信 + 邮件，渠道写死）
  console.log(`[短信] 订单 ${orderNo} 创建成功，应付 ${total} 元`);
  console.log(`[邮件] 您的订单 ${orderNo} 已生成`);

  console.log(`下单成功：${orderNo}，应付 ${total} 元`);
  return orderNo;
}

// ========== 使用 ==========
placeOrder([{ sku: 'SKU-01', name: '《设计模式》', price: 89, quantity: 2 }], 'vip'); // 应付 160.2 元
placeOrder([{ sku: 'SKU-02', name: '机械键盘', price: 399, quantity: 1 }], 'normal'); // 库存不足

// 问题：
// 1. 四个变化原因全挤在一处：库存规则、促销规则、存储方式、通知渠道，任何一个调整都要改 placeOrder
// 2. 计价逻辑无法复用：结算预览页只想要“算价格”，却只能把整段代码复制过去再删掉三段
// 3. 函数越长越没人敢动：改促销规则的人被迫连通知代码一起读懂，回归测试范围永远是整个函数

export {};
