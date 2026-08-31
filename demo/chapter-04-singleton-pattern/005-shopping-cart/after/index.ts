// 改后：购物车单例 -- 全局共享同一份数据，一处加购、处处同步
class ShoppingCart {
  private static instance: ShoppingCart | null = null;
  private items: string[] = [];

  private constructor() {}

  static getInstance(): ShoppingCart {
    if (!ShoppingCart.instance) {
      ShoppingCart.instance = new ShoppingCart();
    }
    return ShoppingCart.instance;
  }

  add(item: string) {
    this.items.push(item);
  }

  getCount() {
    return this.items.length;
  }
}

// 商品列表页：用户加购一本书
const cartInListPage = ShoppingCart.getInstance();
cartInListPage.add('《JavaScript 设计模式》');

// 顶部导航栏：拿到的是同一个购物车
const cartInNavbar = ShoppingCart.getInstance();

console.log('列表页购物车数量：', cartInListPage.getCount()); // 1
console.log('导航栏角标数量：', cartInNavbar.getCount()); // 1 ✅ 角标实时同步
console.log('是同一个购物车吗：', cartInListPage === cartInNavbar); // true

export {};
