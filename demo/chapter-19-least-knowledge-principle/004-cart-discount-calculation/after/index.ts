// 改后：最少知识原则 -- 结算页只问购物车"本单优惠多少"，券在哪、怎么叠、要不要封顶全是购物车自己的事

// ========== 优惠券 ==========
class Coupon {
  constructor(private amount: number) {}

  getDiscount(): number {
    return this.amount;
  }
}

// ========== 营销活动：自己会报优惠额，不再外泄优惠券 ==========
class Promotion {
  constructor(private coupon: Coupon) {}

  getDiscountAmount(): number {
    return this.coupon.getDiscount();
  }
}

// ========== 购物车：对外只回答"本单优惠多少" ==========
class ShoppingCart {
  private promotion?: Promotion;

  usePromotion(promotion: Promotion): void {
    this.promotion = promotion;
  }

  getDiscountAmount(): number {
    // 没参加活动时优惠为 0，这个边界也由购物车自己消化
    return this.promotion ? this.promotion.getDiscountAmount() : 0;
  }
}

// ========== 结算页：只跟购物车要一个数字 ==========
function renderCheckout(cart: ShoppingCart): void {
  console.log(`结算页展示：本单优惠 ${cart.getDiscountAmount()} 元`);
}

const cart = new ShoppingCart();
renderCheckout(cart); // 结算页展示：本单优惠 0 元（没参加活动也不再空引用崩溃）

cart.usePromotion(new Promotion(new Coupon(30)));
renderCheckout(cart); // 结算页展示：本单优惠 30 元

// ========== 扩展：营销升级为"多张券叠加且封顶 50 元"，只改 Promotion 内部，结算页零修改 ==========
// class Promotion {
//   private coupons: Coupon[]; // 单张券悄悄换成券列表
//
//   getDiscountAmount(): number {
//     const total = this.coupons.reduce((sum, coupon) => sum + coupon.getDiscount(), 0);
//     return Math.min(total, 50); // 叠加与封顶规则锁在活动内部
//   }
// }

// 优势：
// 1. 结算页只依赖购物车的一个方法，活动、优惠券从它的世界里彻底消失
// 2. 券从单张变多张、加封顶规则，都只改 Promotion/ShoppingCart 内部，调用方无感
// 3. "没参加活动优惠为 0"这类边界处理被购物车收编，调用方不再写满判空
// 4. 优惠计算逻辑有了唯一归宿，跟财务对账、做回归测试都有据可查

export {};
