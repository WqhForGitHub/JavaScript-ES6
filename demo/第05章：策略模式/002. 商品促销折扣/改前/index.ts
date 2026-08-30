// 改前：促销类型全靠 switch 硬编码，每上一次新活动就要改一次结算函数

// 优惠券：type 决定优惠方式，不同类型参数含义还不一样
interface Coupon {
  type: 'FULL_REDUCE' | 'DISCOUNT' | 'CASH'; // 满减 / 折扣 / 直减
  threshold?: number; // 满减门槛，如满 300
  reduce?: number; // 满减金额，如减 40
  rate?: number; // 折扣率，如 0.8 表示 8 折
  cash?: number; // 直减金额，如减 10
}

function settle(price: number, coupon: Coupon): number {
  let finalPrice = price;

  switch (coupon.type) {
    case 'FULL_REDUCE': // 满 threshold 减 reduce
      if (price >= (coupon.threshold ?? 0)) {
        finalPrice = price - (coupon.reduce ?? 0);
      }
      break;
    case 'DISCOUNT': // 打 rate 折
      finalPrice = price * (coupon.rate ?? 1);
      break;
    case 'CASH': // 无条件直减
      finalPrice = price - (coupon.cash ?? 0);
      break;
  }

  return Math.max(finalPrice, 0); // 不能减成负数
}

console.log('满300减40：', settle(350, { type: 'FULL_REDUCE', threshold: 300, reduce: 40 })); // 310
console.log('全场8折：', settle(350, { type: 'DISCOUNT', rate: 0.8 })); // 280
console.log('直减10元：', settle(350, { type: 'CASH', cash: 10 })); // 340

// 问题：
// 1. 运营想上"第二件半价"？只能挤进 switch，分支继续膨胀
// 2. 各分支的参数含义不同（threshold/reduce/rate/cash），调用方容易传错
// 3. 结算逻辑和促销算法耦合，没法对单个促销写单元测试

export {};
