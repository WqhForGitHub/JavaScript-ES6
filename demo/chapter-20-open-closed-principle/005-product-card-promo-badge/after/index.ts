// 改后：开放-封闭原则 -- 组件只预留一个"角标增强器"挂钩，活动方注册回调注入角标，组件对活动规则一无所知

// ========== 商品数据 ==========
interface Product {
  name: string;
  price: number;
  stock: number; // 库存数量
}

// ========== 角标增强器：输入商品，返回角标文案（空串表示不加角标） ==========
type BadgeEnhancer = (product: Product) => string;

const enhancerRegistry: BadgeEnhancer[] = [];

function registerBadgeEnhancer(enhancer: BadgeEnhancer): void {
  enhancerRegistry.push(enhancer);
}

// ========== 商品卡片组件：只管基础渲染 + 调用挂钩，此后不再因活动而修改 ==========
function renderProductCard(product: Product): string {
  const badge = enhancerRegistry
    .map((enhancer) => enhancer(product)) // 逐个询问增强器：要不要给这张卡片加角标
    .filter((text) => text !== '')
    .join('');

  const stockTip = product.stock < 10 ? '（仅剩少量）' : '';
  return `【${product.name}】￥${product.price}${badge}${stockTip}`;
}

// ========== 双 11 活动方：自己注册自己的角标规则 ==========
registerBadgeEnhancer((product) => (product.price >= 200 ? '｜限时5折' : '｜双11特价'));

const product: Product = { name: '机械键盘', price: 399, stock: 8 };
console.log(renderProductCard(product));

// ========== 扩展：黑五大促上线，只新增一个注册，renderProductCard 一行未改 ==========
registerBadgeEnhancer(() => '｜黑五直降');
console.log(renderProductCard(product));

// ========== 再扩展：物流模块注册"次日达"角标，组件同样零修改 ==========
registerBadgeEnhancer((product) => (product.price >= 99 ? '｜次日达' : ''));
console.log(renderProductCard({ name: '蓝牙耳机', price: 199, stock: 3 }));

// ========== 活动下线：删掉对应活动的那行注册代码即可，组件和其他角标不受影响 ==========

// 优势：
// 1. 大促角标 = 一条新注册，共用的渲染组件零修改，回归风险锁死在活动代码里
// 2. 活动下线只删自己的注册行，不存在"忘删分支导致双11特价常年挂着"的事故
// 3. 组件对活动规则一无所知，"看价格还是看库存"的判断分散在各增强器内部
// 4. 营销模块、物流模块各自注册各自的增强器，互不认识也互不阻塞发版

export {};
