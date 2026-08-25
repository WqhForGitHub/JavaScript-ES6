// 第11章：模板方法模式 - 钩子方法与高阶函数实现

// ========================================================
// 第一部分：钩子方法（基于原型继承）
// ========================================================

console.log('=== 第一部分：钩子方法 ===');

const Beverage = function () {};

Beverage.prototype.boilWater = function () {
  console.log('把水煮沸');
};

Beverage.prototype.brew = function () {
  throw new Error('子类必须重写 brew 方法');
};

Beverage.prototype.pourInCup = function () {
  throw new Error('子类必须重写 pourInCup 方法');
};

Beverage.prototype.addCondiments = function () {
  throw new Error('子类必须重写 addCondiments 方法');
};

// 钩子方法，默认返回 true
Beverage.prototype.customerWantsCondiments = function () {
  return true;
};

// 模板方法，使用钩子决定是否添加调料
Beverage.prototype.init = function () {
  this.boilWater();
  this.brew();
  this.pourInCup();
  if (this.customerWantsCondiments()) {
    this.addCondiments();
  }
};

// ==================== CoffeeWithHook ====================

const CoffeeWithHook = function () {};

CoffeeWithHook.prototype = new Beverage();

CoffeeWithHook.prototype.brew = function () {
  console.log('用沸水冲泡咖啡');
};

CoffeeWithHook.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子');
};

CoffeeWithHook.prototype.addCondiments = function () {
  console.log('加糖和牛奶');
};

// 重写钩子方法，假设顾客不加调料
CoffeeWithHook.prototype.customerWantsCondiments = function () {
  return false;
};

console.log('\n--- 带钩子的咖啡（不加调料）---');
const coffeeWithHook = new CoffeeWithHook();
coffeeWithHook.init();

console.log('\n--- 普通咖啡（加调料）---');
const CoffeeNormal = function () {};
CoffeeNormal.prototype = new Beverage();
CoffeeNormal.prototype.brew = function () {
  console.log('用沸水冲泡咖啡');
};
CoffeeNormal.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子');
};
CoffeeNormal.prototype.addCondiments = function () {
  console.log('加糖和牛奶');
};
// 不重写钩子方法，默认返回 true

const coffeeNormal = new CoffeeNormal();
coffeeNormal.init();

// ========================================================
// 第二部分：高阶函数实现（不使用继承）
// ========================================================

console.log('\n=== 第二部分：高阶函数实现 ===');

const BeverageWithParam = function (param) {
  const boilWater = function () {
    console.log('把水煮沸');
  };

  const brew =
    param.brew ||
    function () {
      throw new Error('必须传递 brew 方法');
    };

  const pourInCup =
    param.pourInCup ||
    function () {
      throw new Error('必须传递 pourInCup 方法');
    };

  const addCondiments =
    param.addCondiments ||
    function () {
      throw new Error('必须传递 addCondiments 方法');
    };

  const customerWantsCondiments =
    param.customerWantsCondiments ||
    function () {
      return true;
    };

  const F = function () {};

  F.prototype.init = function () {
    boilWater();
    brew();
    pourInCup();
    if (customerWantsCondiments()) {
      addCondiments();
    }
  };

  return new F();
};

console.log('\n--- 高阶函数实现：茶（加柠檬）---');
const teaWithParam = BeverageWithParam({
  brew: function () {
    console.log('用沸水浸泡茶叶');
  },
  pourInCup: function () {
    console.log('把茶倒进杯子');
  },
  addCondiments: function () {
    console.log('加柠檬');
  },
});
teaWithParam.init();

console.log('\n--- 高阶函数实现：咖啡（不加调料）---');
const coffeeWithParam = BeverageWithParam({
  brew: function () {
    console.log('用沸水冲泡咖啡');
  },
  pourInCup: function () {
    console.log('把咖啡倒进杯子');
  },
  addCondiments: function () {
    console.log('加糖和牛奶');
  },
  customerWantsCondiments: function () {
    return false;
  },
});
coffeeWithParam.init();

// ========================================================
// 对比总结
// ========================================================

console.log('\n=== 对比总结 ===');
console.log('原型继承方式：通过子类重写父类方法实现差异化');
console.log('高阶函数方式：通过传参实现差异化，无需继承链');
console.log('两种方式都可以实现模板方法模式的核心思想');
