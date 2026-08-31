// 改前：集合把内部存储结构暴露给外界，调用方必须"懂"它的内部实现才能遍历

interface Product {
  id: string;
  name: string;
  price: number;
}

// 商品集合：内部用对象按 id 存储
class ProductCollection {
  // 为了让外界能遍历，被迫把内部数据整个交出去
  products: Record<string, Product> = {};

  add(product: Product): void {
    this.products[product.id] = product;
  }
}

const collection = new ProductCollection();
collection.add({ id: 'p1', name: '手机', price: 4999 });
collection.add({ id: 'p2', name: '耳机', price: 399 });
collection.add({ id: 'p3', name: '充电器', price: 99 });

// 调用方 A：知道内部是对象，所以用 Object.values
for (const product of Object.values(collection.products)) {
  console.log('商品：', product.name, product.price);
}

// 调用方 B：想统计总价，又写了一遍"懂内部结构"的代码
const total = Object.values(collection.products).reduce((sum, p) => sum + p.price, 0);
console.log('总价：', total); // 5497

// 调用方 C：外部手痒直接删了内部数据，集合毫不知情
delete collection.products.p2;
console.log('商品数量：', Object.keys(collection.products).length); // 2，数据被改坏了

// 问题：
// 1. 内部结构（对象）完全暴露，外界到处写 Object.values，耦合死了
// 2. 想把内部换成数组或 Map？所有调用方的代码全部跟着改
// 3. 外部可以随意增删内部数据，封装形同虚设
// 4. 每种集合各玩各的遍历方式，没有统一协议

export {};
