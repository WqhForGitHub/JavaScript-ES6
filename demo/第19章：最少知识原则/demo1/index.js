// ============================================
// 第19章：最少知识原则 - demo1
// 最少知识原则（迪米特法则）
// ============================================

// ============================================
// 反例1：过深的链式调用
// ============================================

console.log('=== 反例1：过深的属性链式访问 ===');

const company = {
  name: 'ABC公司',
  department: {
    engineering: {
      team: {
        lead: {
          name: '张三',
          contact: {
            email: 'zhangsan@abc.com',
          },
        },
      },
    },
  },
};

// 违反最少知识原则：需要了解 company -> department -> engineering -> team -> lead -> contact -> email
console.log('违反原则: company.department.engineering.team.lead.contact.email');
console.log('结果: ' + company.department.engineering.team.lead.contact.email);
console.log('问题: 调用者需要了解整条链上的结构，任何中间环节变化都会导致代码出错');
console.log('');

// ============================================
// 修复1：在对象上添加方法来封装内部结构
// ============================================

const company2 = {
  name: 'ABC公司',
  department: {
    engineering: {
      team: {
        lead: {
          name: '张三',
          contact: {
            email: 'zhangsan@abc.com',
          },
        },
      },
    },
  },
  // 添加方法封装内部结构
  getEngineeringLeadEmail: function () {
    return this.department.engineering.team.lead.contact.email;
  },
};

console.log('=== 修复1：添加方法封装内部结构 ===');
console.log('符合原则: company2.getEngineeringLeadEmail()');
console.log('结果: ' + company2.getEngineeringLeadEmail());
console.log('好处: 调用者只需知道 getEngineeringLeadEmail 方法，不需要了解内部结构');
console.log('');

// ============================================
// 反例2：方法链返回内部对象
// ============================================

console.log('=== 反例2：方法链返回内部对象 ===');

const Order = function (total, currency) {
  this._total = total;
  this._currency = currency;
};

Order.prototype.getTotal = function () {
  return this._total;
};

Order.prototype.getCurrency = function () {
  return this._currency;
};

const Customer = function (name) {
  this._name = name;
  this._lastOrder = null;
};

Customer.prototype.getName = function () {
  return this._name;
};

Customer.prototype.setLastOrder = function (order) {
  this._lastOrder = order;
};

Customer.prototype.getLastOrder = function () {
  return this._lastOrder;
};

const customer = new Customer('李四');
customer.setLastOrder(new Order(299.99, 'CNY'));

// 违反最少知识原则：调用者需要了解 Customer -> Order -> currency 的结构
console.log('违反原则: customer.getLastOrder().getCurrency()');
console.log('结果: ' + customer.getLastOrder().getCurrency());
console.log('问题: 调用者获取了 Order 对象的引用，了解了 Customer 的内部结构');
console.log('');

// ============================================
// 修复2：在 Customer 上添加委托方法
// ============================================

const Customer2 = function (name) {
  this._name = name;
  this._lastOrder = null;
};

Customer2.prototype.getName = function () {
  return this._name;
};

Customer2.prototype.setLastOrder = function (order) {
  this._lastOrder = order;
};

// 添加委托方法，不暴露内部 Order 对象
Customer2.prototype.getLastOrderTotal = function () {
  return this._lastOrder ? this._lastOrder.getTotal() : 0;
};

Customer2.prototype.getLastOrderCurrency = function () {
  return this._lastOrder ? this._lastOrder.getCurrency() : 'N/A';
};

const customer2 = new Customer2('李四');
customer2.setLastOrder(new Order(299.99, 'CNY'));

console.log('=== 修复2：添加委托方法，不暴露内部对象 ===');
console.log('符合原则: customer2.getLastOrderCurrency()');
console.log('结果: ' + customer2.getLastOrderCurrency());
console.log('好处: 调用者不需要知道 Order 对象的存在');
console.log('');

// ============================================
// 反例3：DOM 操作中的深链式访问
// ============================================

console.log('=== 反例3：DOM 操作中的深链式访问 ===');
console.log(
  '违反原则: document.querySelector("div.container").children[0].children[2].style.color = "red"',
);
console.log('问题: 对 DOM 结构依赖过深，任何层级变化都会导致代码失效');
console.log('');

console.log('=== 修复3：使用 getElementById 直接获取目标元素 ===');
console.log('符合原则: document.getElementById("targetElement").style.color = "red"');
console.log('好处: 只需要知道目标元素的 id，不需要了解 DOM 层级结构');
console.log('');

// ============================================
// 反例4：对象之间直接交互，耦合过深
// ============================================

console.log('=== 反例4：对象之间直接交互 ===');

const Engine = function () {
  this.temperature = 90;
};

const Car = function () {
  this.engine = new Engine();
};

const Driver = function (name) {
  this.name = name;
};

// 驾驶员直接操作引擎，了解 Car 的内部结构
const myCar = new Car();
const driver = new Driver('王五');

console.log('违反原则: driver 直接访问 myCar.engine.temperature');
console.log('结果: 引擎温度 = ' + myCar.engine.temperature);
console.log('问题: Driver 需要知道 Car 内部有 Engine，Engine 有 temperature');
console.log('');

// ============================================
// 修复4：使用中介者模式减少对象间的知识
// ============================================

console.log('=== 修复4：使用中介者模式 ===');

const Engine2 = function () {
  this.temperature = 90;
};

Engine2.prototype.getTemperature = function () {
  return this.temperature;
};

const Car2 = function () {
  this.engine = new Engine2();
};

// Car 提供方法，不暴露 Engine
Car2.prototype.getEngineTemperature = function () {
  return this.engine.getTemperature();
};

Car2.prototype.isOverheating = function () {
  return this.engine.getTemperature() > 100;
};

// 中介者：Dashboard 只与 Car 交互，不直接访问 Engine
const Dashboard = function (car) {
  this.car = car;
};

Dashboard.prototype.displayStatus = function () {
  const temp = this.car.getEngineTemperature();
  const status = this.car.isOverheating() ? '过热!' : '正常';
  console.log('[Dashboard] 引擎温度: ' + temp + '°C, 状态: ' + status);
};

// Driver 只与 Dashboard 交互
const Driver2 = function (name, dashboard) {
  this.name = name;
  this.dashboard = dashboard;
};

Driver2.prototype.checkCar = function () {
  console.log('[Driver] ' + this.name + ' 检查车辆状态:');
  this.dashboard.displayStatus();
};

const myCar2 = new Car2();
const dashboard = new Dashboard(myCar2);
const driver2 = new Driver2('王五', dashboard);

driver2.checkCar();
console.log('');

// ============================================
// 总结
// ============================================

console.log('=== 最少知识原则总结 ===');
console.log('1. 尽量减少对象之间的交互，只与直接的朋友通信');
console.log('2. 不要通过方法链深入访问对象内部结构');
console.log('3. 在对象上添加委托方法来封装内部导航');
console.log('4. 使用中介者模式减少对象之间的直接依赖');
console.log('5. DOM 操作中优先使用 getElementById 而非深层遍历');
