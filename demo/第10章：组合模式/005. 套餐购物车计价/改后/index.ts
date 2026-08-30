// 改后：组合模式 -- 单品和套餐实现同一接口，套餐价与原价各自计算

// ========== 组件接口：购物车节点 ==========
interface CartNode {
  getPrice(): number; // 应付价
  getOriginalPrice(): number; // 原价（划线价）
}

// ========== 叶子：单品 ==========
class Product implements CartNode {
  constructor(
    private name: string,
    private price: number,
  ) {}

  getPrice(): number {
    return this.price;
  }

  getOriginalPrice(): number {
    return this.price;
  }
}

// ========== 容器：套餐（里面可以再嵌套餐） ==========
class Combo implements CartNode {
  private items: CartNode[] = [];

  constructor(
    private name: string,
    private comboPrice: number,
  ) {}

  add(item: CartNode): void {
    this.items.push(item);
  }

  // 应付价 = 套餐一口价
  getPrice(): number {
    return this.comboPrice;
  }

  // 原价 = 里面所有单品/子套餐的原价之和
  getOriginalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.getOriginalPrice(), 0);
  }
}

// ========== 组装购物车：单品和套餐一视同仁 ==========
const snackCombo = new Combo('小食套餐', 30);
snackCombo.add(new Product('薯条', 12));
snackCombo.add(new Product('可乐', 22));

const burgerCombo = new Combo('汉堡套餐', 45); // 套餐里嵌套套餐
burgerCombo.add(new Product('汉堡', 25));
burgerCombo.add(snackCombo);

const cart: CartNode[] = [new Product('蛋糕', 29), burgerCombo];

const payable = cart.reduce((sum, item) => sum + item.getPrice(), 0);
const original = cart.reduce((sum, item) => sum + item.getOriginalPrice(), 0);

console.log(`原价合计：${original} 元`); // 88
console.log(`应付金额：${payable} 元`); // 74
console.log(`共节省：${original - payable} 元`); // 14

// 优势：
// 1. 计价规则跟着节点类型走：单品直接返回价格，套餐自己知道怎么算，不再 if-else
// 2. 套餐嵌套餐天然支持，原价递归求和自动展开
// 3. 购物车里单品、套餐用法完全一致，结账代码不感知商品形态

export {};
