// 改后：策略模式 -- 每种促销是一个策略函数，统一签名 (price) => number
// 参数收在闭包里，调用方不用再关心每种券的字段含义

interface CouponContext {
  type: string;
  config: Record<string, number>;
}

// ========== 策略工厂：传入券配置，返回一个统一签名的算价函数 ==========
const promotionStrategies: Record<
  string,
  (config: Record<string, number>) => (price: number) => number
> = {
  // 满 threshold 减 reduce
  FULL_REDUCE:
    ({ threshold, reduce }) =>
    (price) =>
      price >= threshold ? price - reduce : price,

  // 打 rate 折
  DISCOUNT:
    ({ rate }) =>
    (price) =>
      price * rate,

  // 无条件直减 cash 元
  CASH:
    ({ cash }) =>
    (price) =>
      Math.max(price - cash, 0),
};

// ========== 环境类：只负责拿配置"造"出策略函数，再执行它 ==========
function settle(price: number, coupon: CouponContext): number {
  const createStrategy = promotionStrategies[coupon.type];
  if (!createStrategy) {
    throw new Error(`不支持的促销类型：${coupon.type}`);
  }
  const calc = createStrategy(coupon.config); // 造策略（配置塞进闭包）
  return Math.max(calc(price), 0); // 执行策略
}

console.log(
  '满300减40：',
  settle(350, { type: 'FULL_REDUCE', config: { threshold: 300, reduce: 40 } }),
); // 310
console.log(
  '不满门槛原价：',
  settle(250, { type: 'FULL_REDUCE', config: { threshold: 300, reduce: 40 } }),
); // 250
console.log('全场8折：', settle(350, { type: 'DISCOUNT', config: { rate: 0.8 } })); // 280
console.log('直减10元：', settle(350, { type: 'CASH', config: { cash: 10 } })); // 340

// ========== 上新活动：注册"第二件半价"策略，settle 一行不改 ==========
promotionStrategies['SECOND_HALF'] = () => (price) => price * 0.75; // 简化：均摊后 75 折

console.log('第二件半价：', settle(350, { type: 'SECOND_HALF', config: {} })); // 262.5

// 优势：
// 1. 每个促销算法独立成函数，可以单独测试、单独复用
// 2. 策略统一签名 (price) => number，结算入口完全不感知差异
// 3. 运营上新活动 = 注册一个新策略，对修改关闭

export {};
