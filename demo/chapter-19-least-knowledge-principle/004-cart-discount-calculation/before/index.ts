// 改前：结算页计算优惠时，从购物车里掏出活动对象，再从活动里掏出优惠券，再从券上读优惠额，一路掏了三层

// ========== 优惠券：真正的优惠额藏在这里 ==========
class Coupon {
  constructor(private amount: number) {}

  getDiscount(): number {
    return this.amount;
  }
}

// ========== 营销活动：内部挂着一张券 ==========
class Promotion {
  constructor(private coupon: Coupon) {}

  getCoupon(): Coupon {
    return this.coupon; // 内部对象被交了出去
  }
}

// ========== 购物车：内部挂着当前命中的活动 ==========
class ShoppingCart {
  private promotion?: Promotion;

  usePromotion(promotion: Promotion): void {
    this.promotion = promotion;
  }

  getPromotion(): Promotion {
    return this.promotion as Promotion; // 内部对象又被交了出去
  }
}

// ========== 结算页：为了一个优惠额，把购物车的"内脏"摸了个遍 ==========
function renderCheckout(cart: ShoppingCart): void {
  // 结算页被迫知道：购物车里有 promotion，promotion 里有 coupon，coupon 用 getDiscount
  const discount = cart.getPromotion().getCoupon().getDiscount();

  console.log(`结算页展示：本单优惠 ${discount} 元`);
}

const cart = new ShoppingCart();
cart.usePromotion(new Promotion(new Coupon(30)));
renderCheckout(cart);

// 隐患：用户没参加任何活动时 getPromotion() 是 undefined，火车链当场空引用崩溃：
// const emptyCart = new ShoppingCart();
// renderCheckout(emptyCart); // TypeError: Cannot read properties of undefined (reading 'getCoupon')

// 问题：
// 1. 结算页认识了购物车内部的整条对象链：活动、券、getDiscount，三层任何一层变动它都得跟着改
// 2. 营销升级为"多张券叠加"（coupon 变 coupons 数组）时，所有写火车链的页面集体报错
// 3. 没参加活动时火车链直接空引用崩溃，判空逻辑得每个调用处自己补
// 4. 优惠规则本该属于购物车域，却散落在各个页面各算各的，口径无法统一

export {};
