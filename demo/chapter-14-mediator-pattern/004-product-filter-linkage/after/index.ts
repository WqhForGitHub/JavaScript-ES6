// 改后：中介者模式 -- 筛选器只上报“我改了什么”，标签栏/结果数/清空按钮由中介者统一刷新

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

// ========== 中介者统一分发的状态 ==========
interface FilterState {
  brand: string | null;
  price: string | null;
  stockOnly: boolean;
  activeTags: string[];
  resultCount: number;
}

// ========== 抽象控件：唯一的通信对象是中介者 ==========
abstract class FilterWidget {
  constructor(protected mediator: FilterMediator) {
    mediator.register(this);
  }

  abstract render(state: FilterState): void;
}

// ========== 筛选控件：品牌（单选） ==========
class BrandFilter extends FilterWidget {
  value: string | null = null;

  change(brand: string | null): void {
    this.mediator.setBrand(brand); // 只上报变化
  }

  render(state: FilterState): void {
    this.value = state.brand;
  }
}

// ========== 筛选控件：价格区间（单选） ==========
class PriceFilter extends FilterWidget {
  value: string | null = null;

  change(range: string | null): void {
    this.mediator.setPrice(range);
  }

  render(state: FilterState): void {
    this.value = state.price;
  }
}

// ========== 筛选控件：仅看有货（开关） ==========
class StockToggle extends FilterWidget {
  on = false;

  toggle(): void {
    this.mediator.setStockOnly(!this.on);
  }

  render(state: FilterState): void {
    this.on = state.stockOnly;
  }
}

// ========== 展示控件：已选条件标签栏 ==========
class ActiveTagBar extends FilterWidget {
  tags: string[] = [];

  render(state: FilterState): void {
    this.tags = state.activeTags;
  }
}

// ========== 展示控件：结果计数 ==========
class ResultCount extends FilterWidget {
  count = products.length;

  render(state: FilterState): void {
    this.count = state.resultCount;
  }
}

// ========== 展示控件：清空筛选按钮 ==========
class ClearAllButton extends FilterWidget {
  visible = false;

  click(): void {
    this.mediator.clearAll();
  }

  render(state: FilterState): void {
    this.visible = state.activeTags.length > 0;
  }
}

// ========== 中介者：筛选状态的唯一持有者 ==========
class FilterMediator {
  private widgets: FilterWidget[] = [];
  private brand: string | null = null;
  private price: string | null = null;
  private stockOnly = false;

  register(widget: FilterWidget): void {
    this.widgets.push(widget);
  }

  setBrand(brand: string | null): void {
    this.brand = brand;
    this.publish();
  }

  setPrice(price: string | null): void {
    this.price = price;
    this.publish();
  }

  setStockOnly(stockOnly: boolean): void {
    this.stockOnly = stockOnly;
    this.publish();
  }

  // 清空筛选：中介者一处重置，所有控件同步归位
  clearAll(): void {
    this.brand = null;
    this.price = null;
    this.stockOnly = false;
    this.publish();
  }

  // 重算 + 广播：只写一遍
  private publish(): void {
    const result = products.filter((p) => {
      if (this.brand !== null && p.brand !== this.brand) return false;
      if (this.price === '2000 以下' && p.price >= 2000) return false;
      if (this.price === '2000-4000' && (p.price < 2000 || p.price > 4000)) return false;
      if (this.price === '4000 以上' && p.price <= 4000) return false;
      if (this.stockOnly && !p.inStock) return false;
      return true;
    });

    const activeTags: string[] = [];
    if (this.brand) activeTags.push(`品牌：${this.brand}`);
    if (this.price) activeTags.push(`价格：${this.price}`);
    if (this.stockOnly) activeTags.push('仅看有货');

    const state: FilterState = {
      brand: this.brand,
      price: this.price,
      stockOnly: this.stockOnly,
      activeTags,
      resultCount: result.length,
    };

    this.widgets.forEach((widget) => widget.render(state));
    console.log(
      `[页面] 标签栏=[${state.activeTags.join('、') || '无'}] | 结果 ${state.resultCount} 件 | 清空按钮=${state.activeTags.length > 0 ? '显示' : '隐藏'}`,
    );
  }
}

// ========== 组装：6 个控件只认识中介者 ==========
const mediator = new FilterMediator();
const brandFilter = new BrandFilter(mediator);
const priceFilter = new PriceFilter(mediator);
const stockToggle = new StockToggle(mediator);
const clearAllBtn = new ClearAllButton(mediator);
new ActiveTagBar(mediator); // 展示控件：创建即注册，无需持有引用
new ResultCount(mediator);

brandFilter.change('小米'); // 选品牌：小米
priceFilter.change('2000 以下'); // 选价格：2000 以下
stockToggle.toggle(); // 打开“仅看有货”
clearAllBtn.click(); // 一键清空，全部归位

// 优势：
// 1. “重建标签栏、算结果数、控制清空按钮”只在 publish 写一遍
// 2. 新增筛选器（如“内存大小”）或展示控件（如“空结果提示”）只需注册，零侵入
// 3. “一键清空”由中介者统一重置状态，不会漏掉任何一个筛选器
// 4. 筛选状态只存在中介者一处，不再散落在全局变量里

export {};
