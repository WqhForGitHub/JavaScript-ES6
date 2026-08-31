// 改后：中介者模式 -- 控件只向中介者上报动作，状态重算和统一刷新都由中介者负责

interface CartItem {
  name: string;
  price: number;
  checked: boolean;
}

// ========== 中介者统一计算、统一分发的页面状态 ==========
interface CartState {
  selectAll: boolean;
  goodsTotal: number;
  coupon: number;
  payable: number;
  freeShipping: boolean;
}

// ========== 抽象控件：唯一的通信对象是中介者 ==========
abstract class CartWidget {
  constructor(protected mediator: CartMediator) {
    mediator.register(this);
  }

  // 由中介者调用：根据最新状态刷新自己
  abstract render(state: CartState): void;
}

// ========== 具体控件：全选框 ==========
class SelectAllBox extends CartWidget {
  checked = true;

  click(): void {
    this.mediator.toggleSelectAll(); // 只上报动作，不关心后果
  }

  render(state: CartState): void {
    this.checked = state.selectAll;
  }
}

// ========== 具体控件：合计金额标签 ==========
class TotalLabel extends CartWidget {
  text = '';

  render(state: CartState): void {
    this.text = `￥${state.payable}（商品￥${state.goodsTotal} - 优惠￥${state.coupon}）`;
  }
}

// ========== 具体控件：包邮提示 ==========
class ShippingHint extends CartWidget {
  text = '';

  render(state: CartState): void {
    this.text = state.freeShipping ? '已满 99 元，包邮' : '未满 99 元，运费 ￥6';
  }
}

// ========== 具体控件：结算按钮 ==========
class CheckoutButton extends CartWidget {
  enabled = true;

  render(state: CartState): void {
    this.enabled = state.payable > 0;
  }
}

// ========== 中介者：所有联动逻辑集中于此 ==========
class CartMediator {
  private widgets: CartWidget[] = [];
  private coupon = 0;

  constructor(private items: CartItem[]) {}

  register(widget: CartWidget): void {
    this.widgets.push(widget);
  }

  // ---- 用户动作入口：改完状态后统一广播 ----
  toggleItem(item: CartItem): void {
    item.checked = !item.checked;
    this.publish();
  }

  toggleSelectAll(): void {
    const target = !this.items.every((item) => item.checked);
    this.items.forEach((item) => (item.checked = target));
    this.publish();
  }

  applyCoupon(amount: number): void {
    this.coupon = amount;
    this.publish();
  }

  // ---- 状态重算 + 广播：全页面只有这一处 ----
  private publish(): void {
    const goodsTotal = this.items
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.price, 0);
    const payable = Math.max(0, goodsTotal - this.coupon);

    const state: CartState = {
      selectAll: this.items.every((item) => item.checked),
      goodsTotal,
      coupon: this.coupon,
      payable,
      freeShipping: payable >= 99,
    };

    this.widgets.forEach((widget) => widget.render(state));
    console.log(
      `[页面] 全选=${state.selectAll} | 应付￥${state.payable} | ${state.freeShipping ? '包邮' : '运费￥6'} | 结算按钮=${state.payable > 0 ? '可点' : '禁用'}`,
    );
  }
}

// ========== 组装：控件只认识中介者，互相不知道对方存在 ==========
const items: CartItem[] = [
  { name: '《设计模式》', price: 79, checked: true },
  { name: '机械键盘', price: 329, checked: true },
  { name: '显示器支架', price: 159, checked: true },
];

const mediator = new CartMediator(items);
const selectAll = new SelectAllBox(mediator);
new TotalLabel(mediator); // 展示控件：创建即注册，无需持有引用
new ShippingHint(mediator);
new CheckoutButton(mediator);
mediator.applyCoupon(0); // 初始渲染

// ========== 用户操作：无论什么操作，控件刷新永远不遗漏 ==========
mediator.toggleItem(items[2]); // 取消勾选显示器支架
mediator.applyCoupon(50); // 使用 50 元优惠券
selectAll.click(); // 点击全选 -> 三件全选，应付 517
mediator.toggleItem(items[0]); // 取消《设计模式》
mediator.toggleItem(items[1]); // 取消机械键盘
mediator.toggleItem(items[2]); // 取消显示器支架 -> 应付 0，结算按钮禁用

// 优势：
// 1. “重算状态 + 广播刷新”只在中介者写一遍，任何操作都不会漏刷控件
// 2. 新增控件 = 新增一个类并注册，所有操作自动带上它，零侵入
// 3. 金额、包邮门槛等规则集中在 publish 一处，改门槛只改一行
// 4. 控件之间互不引用，可随意增删替换（换成 React 组件也只是换个 render）

export {};
