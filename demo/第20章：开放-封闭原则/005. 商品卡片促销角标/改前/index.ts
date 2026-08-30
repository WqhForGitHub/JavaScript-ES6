// 改前：商品卡片组件把每期活动的角标逻辑写死在渲染函数里，每次大促都要改组件，活动下线还得记得删代码

// ========== 商品数据 ==========
interface Product {
  name: string;
  price: number;
  stock: number; // 库存数量
}

// ========== 当前活动：全局可变状态 ==========
let currentActivity = '';

// ========== 商品卡片组件：列表页、搜索页、推荐位共用 ==========
function renderProductCard(product: Product): string {
  let badge = '';

  if (currentActivity === 'double11') {
    badge = product.price >= 200 ? '｜限时5折' : '｜双11特价';
  } else if (currentActivity === 'blackFriday') {
    badge = '｜黑五直降';
  }
  // 每次大促都往组件里塞一个新的 if 分支，下线时再回来删

  const stockTip = product.stock < 10 ? '（仅剩少量）' : '';
  return `【${product.name}】￥${product.price}${badge}${stockTip}`;
}

const product: Product = { name: '机械键盘', price: 399, stock: 8 };

currentActivity = 'double11';
console.log(renderProductCard(product));

currentActivity = 'blackFriday';
console.log(renderProductCard(product));

// 问题：
// 1. 每次大促都要修改共用的渲染组件，列表页、搜索页、推荐位一起承担回归风险
// 2. 活动下线还得回来删分支，忘删一次"双11特价"就会常年挂在页面上
// 3. 组件被迫认识所有活动规则：哪个活动看价格、哪个活动看库存，业务知识越积越多
// 4. 运营想临时上一个"库存紧张"角标，也只能排队等组件发版

export {};
