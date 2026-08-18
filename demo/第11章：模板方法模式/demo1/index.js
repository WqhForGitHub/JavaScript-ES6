// 第11章：模板方法模式 - 饮料制作

// ==================== Beverage 抽象父类 ====================

const Beverage = function () {};

Beverage.prototype.boilWater = function () {
  console.log('把水煮沸');
};

// 抽象方法，子类必须重写
Beverage.prototype.brew = function () {
  throw new Error('子类必须重写 brew 方法');
};

Beverage.prototype.pourInCup = function () {
  throw new Error('子类必须重写 pourInCup 方法');
};

Beverage.prototype.addCondiments = function () {
  throw new Error('子类必须重写 addCondiments 方法');
};

// 模板方法
Beverage.prototype.init = function () {
  this.boilWater();
  this.brew();
  this.pourInCup();
  this.addCondiments();
};

// ==================== Coffee 子类 ====================

const Coffee = function () {};

Coffee.prototype = new Beverage();

Coffee.prototype.brew = function () {
  console.log('用沸水冲泡咖啡');
};

Coffee.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子');
};

Coffee.prototype.addCondiments = function () {
  console.log('加糖和牛奶');
};

// ==================== Tea 子类 ====================

const Tea = function () {};

Tea.prototype = new Beverage();

Tea.prototype.brew = function () {
  console.log('用沸水浸泡茶叶');
};

Tea.prototype.pourInCup = function () {
  console.log('把茶倒进杯子');
};

Tea.prototype.addCondiments = function () {
  console.log('加柠檬');
};

// ==================== 执行演示 ====================

console.log('=== 模板方法模式 - 饮料制作 ===');

console.log('\n--- 制作咖啡 ---');
const coffee = new Coffee();
coffee.init();

console.log('\n--- 制作茶 ---');
const tea = new Tea();
tea.init();

// ==================== 测试未重写抽象方法 ====================

console.log('\n--- 测试未重写抽象方法 ---');
const BadBeverage = function () {};
BadBeverage.prototype = new Beverage();
BadBeverage.prototype.brew = function () {
  console.log('冲泡');
};
BadBeverage.prototype.pourInCup = function () {
  console.log('倒入杯子');
};
// 故意不重写 addCondiments

const badBeverage = new BadBeverage();
try {
  badBeverage.init();
} catch (e) {
  console.log('错误: ' + e.message);
}
