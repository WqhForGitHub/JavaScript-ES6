// 改前：每个筛选器的处理函数都要手动更新标签栏、结果数、清空按钮，三处复制粘贴

interface Product {
  name: string;
  brand: string;
  price: number;
  inStock: boolean;
}

const products: Product[] = [
  { name: '小米 14', brand: '小米', price: 3999, inStock: true },
  { name: '小米平板', brand: '小米', price: 1999, inStock: false },
  { name: '华为 Mate60', brand: '华为', price: 5999, inStock: true },
  { name: '华为 Nova', brand: '华为', price: 2499, inStock: true },
  { name: 'iPhone 15', brand: '苹果', price: 5999, inStock: true },
  { name: 'iPhone SE', brand: '苹果', price: 3499, inStock: false },
];

// ========== 筛选状态散落在三个全局变量里 ==========
let brandFilter: string | null = null; // 品牌（单选）
let priceFilter: string | null = null; // 价格区间（单选）
let stockOnly = false; // 仅看有货

// ========== 联动的三个“受害者”控件 ==========
const activeTags: string[] = []; // 已选条件标签栏
let resultCount = 0; // 结果计数
const clearAllBtn = { visible: false }; // 清空筛选按钮

function filterProducts(): Product[] {
  return products.filter((p) => {
    if (brandFilter !== null && p.brand !== brandFilter) return false;
    if (priceFilter === '2000 以下' && p.price >= 2000) return false;
    if (priceFilter === '2000-4000' && (p.price < 2000 || p.price > 4000)) return false;
    if (priceFilter === '4000 以上' && p.price <= 4000) return false;
    if (stockOnly && !p.inStock) return false;
    return true;
  });
}

// ========== 每个筛选器的 change 事件都要手动刷新三处 ==========
function onBrandChange(brand: string | null): void {
  brandFilter = brand;

  activeTags.length = 0; // 重建标签栏
  if (brandFilter) activeTags.push(`品牌：${brandFilter}`);
  if (priceFilter) activeTags.push(`价格：${priceFilter}`);
  if (stockOnly) activeTags.push('仅看有货');

  resultCount = filterProducts().length;
  clearAllBtn.visible = activeTags.length > 0;
  log();
}

function onPriceChange(range: string | null): void {
  priceFilter = range;

  activeTags.length = 0; // 同样的标签重建，再抄一遍
  if (brandFilter) activeTags.push(`品牌：${brandFilter}`);
  if (priceFilter) activeTags.push(`价格：${priceFilter}`);
  if (stockOnly) activeTags.push('仅看有货');

  resultCount = filterProducts().length;
  clearAllBtn.visible = activeTags.length > 0;
  log();
}

function onStockToggle(on: boolean): void {
  stockOnly = on;

  activeTags.length = 0; // 第三遍……
  if (brandFilter) activeTags.push(`品牌：${brandFilter}`);
  if (priceFilter) activeTags.push(`价格：${priceFilter}`);
  if (stockOnly) activeTags.push('仅看有货');

  resultCount = filterProducts().length;
  clearAllBtn.visible = activeTags.length > 0;
  log();
}

function log(): void {
  console.log(
    `[页面] 标签栏=[${activeTags.join('、') || '无'}] | 结果 ${resultCount} 件 | 清空按钮=${clearAllBtn.visible ? '显示' : '隐藏'}`,
  );
}

onBrandChange('小米');
onPriceChange('2000 以下');
onStockToggle(true);

// 问题：
// 1. “重建标签栏、算结果数、控制清空按钮”这套联动逻辑被复制了三遍
// 2. 新增一个筛选器（如“内存大小”）= 再抄一遍；新增一个联动控件 = 三处全改
// 3. 筛选状态散落在全局变量里，“清空按钮”想一键重置还得再写一遍
// 4. 筛选器之间通过全局变量隐式耦合，谁改了什么只能靠读代码推断

export {};
