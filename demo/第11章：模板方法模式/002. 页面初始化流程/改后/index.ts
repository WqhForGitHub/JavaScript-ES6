// 改后：模板方法模式 -- Page 基类统一「校验 -> 拉数据 -> 渲染 -> 埋点」骨架，页面只填差异

// 模拟登录态（真实项目里读 cookie / localStorage）
let token: string | null = 'token-abc';

// ========== 抽象基类：页面初始化骨架 ==========
abstract class Page {
  // 模板方法：所有页面的初始化流程只有这一份
  show(): void {
    if (!this.checkLogin()) return;
    this.render(this.fetchData());
    this.report();
  }

  // 公共步骤：登录校验只写一遍，想改拦截逻辑只动这里
  private checkLogin(): boolean {
    if (!token) {
      console.log('未登录，跳转登录页');
      return false;
    }
    return true;
  }

  // 差异步骤：每个页面自己拉自己的数据
  protected abstract fetchData(): string[];

  // 差异步骤：每个页面自己渲染自己
  protected abstract render(items: string[]): void;

  // 公共步骤：埋点上报，页面名由子类提供
  private report(): void {
    console.log(`上报埋点：page_view = ${this.pageName}`);
  }

  protected abstract pageName: string;
}

// ========== 子类：只填数据和渲染方式 ==========
class OrderPage extends Page {
  protected pageName = 'order_page';

  protected fetchData(): string[] {
    return ['订单 O-1001（199 元）', '订单 O-1002（59 元）'];
  }

  protected render(items: string[]): void {
    console.log(`渲染订单列表：${items.join('；')}`);
  }
}

class ProductPage extends Page {
  protected pageName = 'product_page';

  protected fetchData(): string[] {
    return ['商品 P-01（29 元）', '商品 P-02（45 元）'];
  }

  protected render(items: string[]): void {
    console.log(`渲染商品列表：${items.join('；')}`);
  }
}

console.log('--- 打开订单页 ---');
new OrderPage().show();

console.log('--- 打开商品页 ---');
new ProductPage().show();

// 公共流程自动拦截：token 失效后，子类不用写一行校验代码就被拦下
token = null;
console.log('--- token 失效后打开订单页 ---');
new OrderPage().show();

// 优势：
// 1. 登录校验、埋点等公共步骤只在骨架里出现一次，升级一处全部页面生效
// 2. 子类只填「拉什么数据 + 怎么渲染」，新增页面零复制
// 3. 流程顺序由基类统一保证，不可能出现某个页面漏校验、漏埋点

export {};
