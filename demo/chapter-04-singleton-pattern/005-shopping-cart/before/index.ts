// 改前：每个页面/组件各自 new 购物车，加购数据互不相通
class ShoppingCart {
  items: string[] = [];

  add(item: string) {
    this.items.push(item);
  }

  getCount() {
    return this.items.length;
  }
}

// 商品列表页：用户加购一本书
const cartInListPage = new ShoppingCart();
cartInListPage.add('《JavaScript 设计模式》');

// 顶部导航栏：❌ 又 new 了一个购物车，里面是空的
const cartInNavbar = new ShoppingCart();

console.log('列表页购物车数量：', cartInListPage.getCount()); // 1
console.log('导航栏角标数量：', cartInNavbar.getCount()); // 0 ❌ 明明加购了，角标却不显示

export {};
