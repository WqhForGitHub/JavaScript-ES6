// 改前：每个操作函数都要记住“我变了之后哪些控件要刷新”，同样的刷新逻辑抄三遍

interface CartItem {
  name: string;
  price: number;
  checked: boolean;
}

const items: CartItem[] = [
  { name: '《设计模式》', price: 79, checked: true },
  { name: '机械键盘', price: 329, checked: true },
  { name: '显示器支架', price: 159, checked: true },
];

let coupon = 0; // 已使用的优惠券金额

// ========== 页面上的控件，各自维护自己的显示状态 ==========
const selectAllBox = { checked: true }; // 全选框
const totalLabel = { text: '' }; // 合计金额
const shippingHint = { text: '' }; // 包邮提示
const checkoutBtn = { enabled: true }; // 结算按钮

function payable(): number {
  const goods = items.filter((item) => item.checked).reduce((sum, item) => sum + item.price, 0);
  return Math.max(0, goods - coupon);
}

function log(): void {
  console.log(
    `[页面] 全选=${selectAllBox.checked} | 合计=${totalLabel.text} | ${shippingHint.text} | 结算按钮=${checkoutBtn.enabled ? '可点' : '禁用'}`,
  );
}

// ========== 操作 1：勾选/取消某件商品，得手动刷新 4 个控件 ==========
function toggleItem(item: CartItem): void {
  item.checked = !item.checked;
  selectAllBox.checked = items.every((i) => i.checked);
  totalLabel.text = `￥${payable()}`;
  shippingHint.text = payable() >= 99 ? '已满 99 元，包邮' : '未满 99 元，运费 ￥6';
  checkoutBtn.enabled = payable() > 0;
  log();
}

// ========== 操作 2：点击全选，又把同样的刷新抄一遍 ==========
function toggleSelectAll(): void {
  const target = !items.every((i) => i.checked);
  items.forEach((i) => (i.checked = target));
  selectAllBox.checked = target;
  totalLabel.text = `￥${payable()}`;
  shippingHint.text = payable() >= 99 ? '已满 99 元，包邮' : '未满 99 元，运费 ￥6';
  checkoutBtn.enabled = payable() > 0;
  log();
}

// ========== 操作 3：使用优惠券，再抄一遍（这次全选框要不要刷？你敢确定吗） ==========
function applyCoupon(amount: number): void {
  coupon = amount;
  totalLabel.text = `￥${payable()}`;
  shippingHint.text = payable() >= 99 ? '已满 99 元，包邮' : '未满 99 元，运费 ￥6';
  checkoutBtn.enabled = payable() > 0;
  log();
}

toggleItem(items[2]); // 取消勾选显示器支架
applyCoupon(50); // 使用 50 元优惠券
toggleSelectAll(); // 点击全选
toggleItem(items[0]); // 取消《设计模式》
toggleItem(items[1]); // 取消机械键盘
toggleItem(items[2]); // 取消显示器支架 -> 应付 0 元，结算按钮禁用

// 问题：
// 1. 每个操作函数都要手动刷新所有受影响的控件，同样的计算抄了三遍
// 2. 新增一个控件（如“已省￥xx”标签），必须找出所有操作函数逐个补刷新
// 3. “哪个操作漏刷了哪个控件”没有保障，只能靠测试碰运气
// 4. 金额计算散落在各个操作里，包邮门槛一变（99 改 199）要改多处

export {};
