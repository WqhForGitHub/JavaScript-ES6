// 改前：用继承实现"咖啡 + 加料"，每种组合都要定义一个子类，类数量组合爆炸

// 基类：一杯原味咖啡
class Coffee {
  cost(): number {
    return 15; // 原味咖啡 15 元
  }

  desc(): string {
    return '原味咖啡';
  }
}

// 加牛奶的咖啡
class CoffeeWithMilk extends Coffee {
  cost(): number {
    return super.cost() + 3; // 牛奶 +3 元
  }

  desc(): string {
    return super.desc() + '+牛奶';
  }
}

// 加糖的咖啡
class CoffeeWithSugar extends Coffee {
  cost(): number {
    return super.cost() + 1; // 糖 +1 元
  }

  desc(): string {
    return super.desc() + '+糖';
  }
}

// 加牛奶又加糖的咖啡 -- 只能再建一个子类
class CoffeeWithMilkAndSugar extends CoffeeWithMilk {
  cost(): number {
    return super.cost() + 1; // 又写了一遍"糖 +1 元"
  }

  desc(): string {
    return super.desc() + '+糖';
  }
}

// 加牛奶又加糖又加摩卡的咖啡 -- 只能再再建一个子类……
class CoffeeWithMilkAndSugarAndMocha extends CoffeeWithMilkAndSugar {
  cost(): number {
    return super.cost() + 5; // 摩卡 +5 元
  }

  desc(): string {
    return super.desc() + '+摩卡';
  }
}

// ========== 下单 ==========
console.log(new Coffee().desc(), '=', new Coffee().cost(), '元');
console.log(new CoffeeWithMilk().desc(), '=', new CoffeeWithMilk().cost(), '元');
console.log(new CoffeeWithSugar().desc(), '=', new CoffeeWithSugar().cost(), '元');
console.log(new CoffeeWithMilkAndSugar().desc(), '=', new CoffeeWithMilkAndSugar().cost(), '元');
console.log(
  new CoffeeWithMilkAndSugarAndMocha().desc(),
  '=',
  new CoffeeWithMilkAndSugarAndMocha().cost(),
  '元',
);

// 问题：
// 1. 3 种加料理论上有 8 种组合（含不加料），N 种加料就是 2^N 个子类，类数量爆炸
// 2. "牛奶 +3 元"这条定价规则被复制到多个子类里，牛奶涨价要改所有含牛奶的子类
// 3. 继承是静态的：编译期写死组合，收银台无法根据用户实时勾选动态组合出一杯咖啡
// 4. 子类命名越来越长（WithMilkAndSugarAndMocha...），可读性持续恶化

export {};
