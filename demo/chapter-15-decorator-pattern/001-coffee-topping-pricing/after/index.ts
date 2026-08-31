// 改后：装饰者模式 -- 加料是"包在咖啡外面的装饰者"，层层包裹、自由组合，3 个类组合出 8 种咖啡

// ========== 组件接口：咖啡和加料装饰者暴露同一套 API，调用方无感知 ==========
interface Coffee {
  cost(): number;
  desc(): string;
}

// ========== 被装饰的具体组件：原味咖啡 ==========
class PlainCoffee implements Coffee {
  cost(): number {
    return 15;
  }

  desc(): string {
    return '原味咖啡';
  }
}

// ========== 抽象装饰者：持有一杯咖啡，默认把行为委托给它 ==========
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}

  cost(): number {
    return this.coffee.cost();
  }

  desc(): string {
    return this.coffee.desc();
  }
}

// ========== 具体装饰者：每个类只负责一种加料 ==========
class Milk extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 3; // "牛奶 +3 元"只写这一处
  }

  desc(): string {
    return this.coffee.desc() + '+牛奶';
  }
}

class Sugar extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 1;
  }

  desc(): string {
    return this.coffee.desc() + '+糖';
  }
}

class Mocha extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 5;
  }

  desc(): string {
    return this.coffee.desc() + '+摩卡';
  }
}

// ========== 收银台：用户勾选什么就包什么，组合发生在运行时 ==========
function order(coffee: Coffee): void {
  console.log(`${coffee.desc()} = ${coffee.cost()} 元`);
}

order(new PlainCoffee()); // 原味咖啡 = 15 元
order(new Milk(new PlainCoffee())); // 原味咖啡+牛奶 = 18 元
order(new Sugar(new Milk(new PlainCoffee()))); // 原味咖啡+牛奶+糖 = 19 元
order(new Mocha(new Sugar(new Milk(new PlainCoffee())))); // 原味咖啡+牛奶+糖+摩卡 = 24 元

// ========== 扩展：新增"椰乳"加料，已有类零修改 ==========
class CoconutMilk extends CoffeeDecorator {
  cost(): number {
    return this.coffee.cost() + 4;
  }

  desc(): string {
    return this.coffee.desc() + '+椰乳';
  }
}

order(new CoconutMilk(new PlainCoffee())); // 原味咖啡+椰乳 = 19 元

// 优势：
// 1. 3 个装饰者类即可组合出 8 种咖啡，N 种加料只需 N 个类，不再 2^N 爆炸
// 2. 每种加料的定价规则只写一处：牛奶涨价只改 Milk 类
// 3. 组合发生在运行时：new Sugar(new Milk(...)) 跟着用户勾选走，天然支持动态下单
// 4. 装饰者与组件实现同一接口，收银台拿到的是"被包了一层又一层的咖啡"却毫无感知

export {};
