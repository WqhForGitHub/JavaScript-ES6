/**
 * 手写观察者模式
 *
 * 观察者模式：目标对象（Subject）维护一组观察者（Observer），
 * 状态变化时自动通知所有观察者。
 * 与发布订阅的区别：观察者模式中目标和观察者直接交互，
 * 发布订阅模式通过事件中心中转。
 *
 * 组成：
 *   - Subject（目标）：维护观察者列表，提供 attach/detach/notify
 *   - Observer（观察者）：提供 update 方法接收通知
 */

/**
 * 目标对象（被观察者）
 */
function Subject() {
  this.observers = [];
  this.state = null;
}

/**
 * 添加观察者
 * @param {Observer} observer
 */
Subject.prototype.attach = function (observer) {
  if (this.observers.indexOf(observer) === -1) {
    this.observers.push(observer);
  }
  return this;
};

/**
 * 移除观察者
 * @param {Observer} observer
 */
Subject.prototype.detach = function (observer) {
  var index = this.observers.indexOf(observer);
  if (index !== -1) {
    this.observers.splice(index, 1);
  }
  return this;
};

/**
 * 通知所有观察者
 * @param {*} [data] - 通知数据
 */
Subject.prototype.notify = function (data) {
  this.observers.slice().forEach(
    function (observer) {
      observer.update(data, this);
    }.bind(this),
  );
};

/**
 * 设置状态并通知
 * @param {*} state
 */
Subject.prototype.setState = function (state) {
  this.state = state;
  this.notify(state);
};

/**
 * 获取当前状态
 */
Subject.prototype.getState = function () {
  return this.state;
};

/**
 * 观察者基类
 * @param {string} [name] - 观察者名称
 */
function Observer(name) {
  this.name = name || "observer";
}

/**
 * 接收通知的方法
 * @param {*} data - 通知数据
 * @param {Subject} subject - 目标对象
 */
Observer.prototype.update = function (data, subject) {
  console.log("[" + this.name + "] 收到通知：", data);
};

// ===== 测试用例 =====
// 创建目标
var weatherStation = new Subject();

// 创建观察者
var phoneDisplay = new Observer("手机显示");
var windowDisplay = new Observer("窗口显示");

// 订阅
weatherStation.attach(phoneDisplay);
weatherStation.attach(windowDisplay);

// 状态变化，自动通知
weatherStation.setState({ temp: 26, humidity: 60 });
// => [手机显示] 收到通知： { temp: 26, humidity: 60 }
// => [窗口显示] 收到通知： { temp: 26, humidity: 60 }

// 移除一个观察者
weatherStation.detach(phoneDisplay);
weatherStation.setState({ temp: 28, humidity: 55 });
// => [窗口显示] 收到通知： { temp: 28, humidity: 55 }

// 自定义观察者
var loggerObserver = new Observer("日志");
loggerObserver.update = function (data, subject) {
  console.log("[日志] 记录状态变化：", JSON.stringify(data));
};
weatherStation.attach(loggerObserver);
weatherStation.setState({ temp: 30, humidity: 50 });
// => [窗口显示] 收到通知： { temp: 30, humidity: 50 }
// => [日志] 记录状态变化： {"temp":30,"humidity":50}

// 观察者数量
console.log("当前观察者数量：", weatherStation.observers.length); // => 2

// 验证重复 attach 不会添加
weatherStation.attach(windowDisplay);
console.log("重复添加后数量：", weatherStation.observers.length); // => 2
