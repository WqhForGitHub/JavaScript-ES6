// 改后：迭代器模式 -- 集合实现 Symbol.iterator 统一协议，外界只用 for...of

interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductCollection {
  // 内部换成 Map，外界毫无感知（这就是统一协议的价值）
  private products = new Map<string, Product>();

  add(product: Product): void {
    this.products.set(product.id, product);
  }

  // 实现迭代协议：外界从此可以 for...of / 展开 / Array.from
  *[Symbol.iterator](): Iterator<Product> {
    yield* this.products.values();
  }
}

const collection = new ProductCollection();
collection.add({ id: 'p1', name: '手机', price: 4999 });
collection.add({ id: 'p2', name: '耳机', price: 399 });
collection.add({ id: 'p3', name: '充电器', price: 99 });

// 调用方 A：不用关心内部怎么存，for...of 一把梭
for (const product of collection) {
  console.log('商品：', product.name, product.price);
}

// 调用方 B：展开成数组，数组的能力全部免费获得
const total = [...collection].reduce((sum, p) => sum + p.price, 0);
console.log('总价：', total); // 5497

// 调用方 C：找到第一个上千的商品就停
for (const product of collection) {
  if (product.price > 1000) {
    console.log('找到高价商品：', product.name); // 手机
    break; // 随时可中断
  }
}

// 优势：
// 1. 内部是数组、对象还是 Map，外界不知道也不需要知道
// 2. 更换内部实现零成本，所有调用方一行不用改（开放-封闭原则）
// 3. private 数据不再裸奔，外部改不了
// 4. for...of / 展开运算符 / Array.from 全部白拿

export {};
