// 改后：开放-封闭原则 -- 排序函数只做"查表分发"，每种排序是一个独立比较器，新增排序只注册不修改

// ========== 商品数据 ==========
interface Product {
  name: string;
  price: number;
  sales: number;
  createdAt: string; // 上架日期
}

// ========== 比较器注册表：排序方式 -> 比较函数 ==========
type Comparator = (a: Product, b: Product) => number;

const comparatorRegistry = new Map<string, Comparator>();

function registerComparator(sortBy: string, comparator: Comparator): void {
  comparatorRegistry.set(sortBy, comparator);
}

// ========== 核心函数：查表分发，此后不再因新排序方式而修改 ==========
function sortProducts(products: Product[], sortBy: string): Product[] {
  const comparator = comparatorRegistry.get(sortBy);
  if (!comparator) {
    throw new Error(`不支持的排序方式: ${sortBy}`);
  }
  return [...products].sort(comparator);
}

// ========== 注册既有排序：每个比较器都是独立的纯函数 ==========
registerComparator('sales', (a, b) => b.sales - a.sales); // 销量从高到低
registerComparator('priceAsc', (a, b) => a.price - b.price); // 价格从低到高
registerComparator('newest', (a, b) => b.createdAt.localeCompare(a.createdAt)); // 最新上架在前

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

// ========== 扩展：新需求"价格从高到低"，只新增一行注册，sortProducts 一行未改 ==========
registerComparator('priceDesc', (a, b) => b.price - a.price);

console.log(
  '按价格从高到低：',
  sortProducts(products, 'priceDesc').map((p) => p.name),
);

// ========== 再扩展："综合排序"这类组合规则也只是新增一条注册，写在它自己的比较器里 ==========
registerComparator('comprehensive', (a, b) => {
  // 销量优先，销量相同再比上架时间，新品在前
  return b.sales - a.sales || b.createdAt.localeCompare(a.createdAt);
});

console.log(
  '按综合排序：',
  sortProducts(products, 'comprehensive').map((p) => p.name),
);

// 优势：
// 1. 新排序 = 一条新注册，核心分发函数和既有比较器零修改，回归范围锁死在新增代码
// 2. 比较器是纯函数，"价格从高到低"与"价格从低到高"各自独立，改一个不影响另一个
// 3. "综合排序"的组合规则只写在它自己的比较器里，不再把 switch 撑成大杂烩
// 4. 想测试某种排序直接调用它的比较器即可，不必构造整个列表跑一遍分发函数

export {};
