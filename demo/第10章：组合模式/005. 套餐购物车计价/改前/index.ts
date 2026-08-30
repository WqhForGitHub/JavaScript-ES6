// 改前：购物车里单品和套餐混着放，计价函数靠 if-else 区分类型、自己递归
interface CartEntry {
  type: 'product' | 'combo';
  price?: number; // 单品价格
  comboPrice?: number; // 套餐价
  items?: CartEntry[]; // 套餐内容
}

const cart: CartEntry[] = [
  { type: 'product', price: 29 },
  {
    type: 'combo',
    comboPrice: 45,
    items: [
      { type: 'product', price: 25 },
      {
        type: 'combo', // 套餐里还嵌着套餐
        comboPrice: 30,
        items: [
          { type: 'product', price: 12 },
          { type: 'product', price: 22 },
        ],
      },
    ],
  },
];

function calcTotal(entries: CartEntry[]): number {
  let total = 0;
  for (const entry of entries) {
    if (entry.type === 'product') {
      total += entry.price ?? 0;
    } else if (entry.type === 'combo') {
      total += entry.comboPrice ?? 0; // 套餐按一口价收费
    }
  }
  return total;
}

console.log('应付金额：', calcTotal(cart)); // 74

// 问题：
// 1. 计价规则全部挤在一个函数里，靠 if-else 区分单品和套餐
// 2. 想算"原价合计"（划线价）？套餐要把里面的内容递归求和，又得写一个
//    几乎一样、但 if-else 分支逻辑不同的函数
// 3. 新增"满减凑单品"类型，计价函数又要回来改

export {};
