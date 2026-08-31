// 改前：商品排序函数用 switch 区分排序方式，每加一种排序都要改动这份被列表页、搜索页、收藏页共用的核心代码

// ========== 商品数据 ==========
interface Product {
  name: string;
  price: number;
  sales: number;
  createdAt: string; // 上架日期
}

// ========== 排序函数：新排序方式 = 回到这里加 case ==========
function sortProducts(products: Product[], sortBy: string): Product[] {
  const list = [...products];
  switch (sortBy) {
    case 'sales':
      return list.sort((a, b) => b.sales - a.sales); // 销量从高到低
    case 'priceAsc':
      return list.sort((a, b) => a.price - b.price); // 价格从低到高
    case 'newest':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // 最新上架在前
    // 产品经理要加"价格从高到低""综合排序"时，只能继续往这个 switch 里塞 case
    default:
      throw new Error(`不支持的排序方式: ${sortBy}`);
  }
}

const products: Product[] = [
  { name: '机械键盘', price: 399, sales: 1200, createdAt: '2024-05-01' },
  { name: '蓝牙耳机', price: 199, sales: 3500, createdAt: '2024-06-15' },
  { name: '显示器支架', price: 129, sales: 800, createdAt: '2024-07-20' },
];

console.log(
  '按销量：',
  sortProducts(products, 'sales').map((p) => p.name),
);
console.log(
  '按价格从低到高：',
  sortProducts(products, 'priceAsc').map((p) => p.name),
);
console.log(
  '按最新上架：',
  sortProducts(products, 'newest').map((p) => p.name),
);

// 问题：
// 1. 新增一种排序就要修改 sortProducts，列表页、搜索页、收藏页共用的核心函数被迫反复动刀
// 2. switch 越长越怕手滑：改"综合排序"时不小心碰坏"销量排序"，全站列表一起出错
// 3. "综合排序 = 销量优先、同销量看新品"这类组合规则塞进 case 后，单个分支越来越臃肿
// 4. 排序逻辑没有独立单元，想单独测试"价格从高到低"只能连整个 switch 一起跑

export {};
