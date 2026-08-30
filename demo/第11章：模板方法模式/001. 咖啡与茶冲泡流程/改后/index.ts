// 改后：模板方法模式 -- 父类固定冲泡骨架，子类只填差异步骤，钩子控制可选步骤

// ========== 抽象父类：流程骨架只写这一处 ==========
abstract class Beverage {
  // 模板方法：算法骨架在此定死，子类只实现步骤，不许重排流程
  prepare(): void {
    this.boilWater();
    this.brew();
    this.pourInCup();
    // 钩子：顾客不要调料就跳过这一步
    if (this.customerWantsCondiments()) {
      this.addCondiments();
    }
  }

  // 公共步骤：所有饮料共用同一份实现
  private boilWater(): void {
    console.log('把水煮沸');
  }

  // 抽象步骤：必须由子类实现的差异点
  protected abstract brew(): void;

  protected abstract pourInCup(): void;

  protected abstract addCondiments(): void;

  // 钩子方法：给子类一个影响流程的可选开关，默认加调料
  protected customerWantsCondiments(): boolean {
    return true;
  }
}

// ========== 子类：只填空，不碰流程 ==========
class Coffee extends Beverage {
  protected brew(): void {
    console.log('用沸水冲泡咖啡粉');
  }

  protected pourInCup(): void {
    console.log('把咖啡倒进杯子');
  }

  protected addCondiments(): void {
    console.log('加糖和牛奶');
  }
}

class Tea extends Beverage {
  protected brew(): void {
    console.log('用沸水浸泡茶叶');
  }

  protected pourInCup(): void {
    console.log('把茶倒进杯子');
  }

  protected addCondiments(): void {
    console.log('加柠檬');
  }
}

// 覆写钩子的子类：纯茶不加任何调料
class PureTea extends Beverage {
  protected brew(): void {
    console.log('用沸水浸泡普洱茶饼');
  }

  protected pourInCup(): void {
    console.log('把茶倒进杯子');
  }

  protected addCondiments(): void {
    // 空实现：钩子已关掉加调料分支，这一步不会被走到
  }

  // 钩子覆写：不加调料
  protected customerWantsCondiments(): boolean {
    return false;
  }
}

console.log('--- 制作咖啡 ---');
new Coffee().prepare();

console.log('--- 制作茶 ---');
new Tea().prepare();

console.log('--- 制作纯茶（钩子关掉调料步骤）---');
new PureTea().prepare();

// 优势：
// 1. 流程骨架只在 prepare() 一处，调整顺序只改一行，所有饮料自动生效
// 2. 子类只填差异步骤，新增饮料零复制，公共步骤（烧水）天然复用
// 3. 钩子方法让子类「可选」影响流程（要不要加调料），不必强行实现全部开关逻辑

export {};
