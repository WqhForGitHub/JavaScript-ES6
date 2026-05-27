// 第08章：发布-订阅模式 - 自定义事件系统

// ========== 基础版：售楼处 ==========
console.log('===== 基础版：售楼处 =====');

var salesOffices = {}; // 售楼处对象

salesOffices.clientList = []; // 缓存列表，存放订阅者的回调函数

salesOffices.listen = function(fn) {
  this.clientList.push(fn); // 订阅的消息添加进缓存列表
};

salesOffices.trigger = function() {
  for (var i = 0, fn; fn = this.clientList[i++];) {
    fn.apply(this, arguments); // arguments 是发布消息时带上的参数
  }
};

// 订阅
salesOffices.listen(function(price, squareMeter) {
  console.log('订阅者A - 价格=' + price + '，面积=' + squareMeter);
});

salesOffices.listen(function(price, squareMeter) {
  console.log('订阅者B - 价格=' + price + '，面积=' + squareMeter);
});

// 发布
salesOffices.trigger(2000000, 88);
salesOffices.trigger(3000000, 110);

// 问题：所有订阅者都会收到所有消息，无法按需订阅

// ========== 改进版：基于 key 的订阅 ==========
console.log('\n===== 改进版：基于 key 的订阅 =====');

var salesOffices2 = {};

salesOffices2.clientList = {};

salesOffices2.listen = function(key, fn) {
  if (!this.clientList[key]) {
    this.clientList[key] = [];
  }
  this.clientList[key].push(fn);
};

salesOffices2.trigger = function() {
  var key = Array.prototype.shift.call(arguments);
  var fns = this.clientList[key];
  if (!fns || fns.length === 0) {
    return false;
  }
  for (var i = 0, fn; fn = fns[i++];) {
    fn.apply(this, arguments);
  }
};

// 订阅 88 平方米的消息
salesOffices2.listen('squareMeter88', function(price) {
  console.log('订阅者A（88平米）- 价格=' + price);
});

// 订阅 110 平方米的消息
salesOffices2.listen('squareMeter110', function(price) {
  console.log('订阅者B（110平米）- 价格=' + price);
});

// 发布
console.log('\n--- 发布88平米消息 ---');
salesOffices2.trigger('squareMeter88', 2000000); // 只有订阅者A收到

console.log('\n--- 发布110平米消息 ---');
salesOffices2.trigger('squareMeter110', 3000000); // 只有订阅者B收到

// ========== 通用的 installEvent 函数 ==========
console.log('\n===== 通用的 installEvent 函数 =====');

var installEvent = function(obj) {
  for (var i in event) {
    obj[i] = event[i];
  }
};

var event = {
  clientList: {},
  listen: function(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    }
    this.clientList[key].push(fn);
  },
  trigger: function() {
    var key = Array.prototype.shift.call(arguments);
    var fns = this.clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (var i = 0, fn; fn = fns[i++];) {
      fn.apply(this, arguments);
    }
  },
  remove: function(key, fn) {
    var fns = this.clientList[key];
    if (!fns) {
      return false;
    }
    if (!fn) {
      // 如果没有传入具体的回调函数，表示取消 key 对应的所有订阅
      fns && (fns.length = 0);
    } else {
      for (var l = fns.length - 1; l >= 0; l--) {
        if (fns[l] === fn) {
          fns.splice(l, 1); // 删除订阅者的回调函数
        }
      }
    }
  }
};

// 给任意对象安装发布-订阅功能
var loginModule = {};
installEvent(loginModule);

var loginSuccess = function(data) {
  console.log('登录成功，收到数据：', data);
};

// 订阅
loginModule.listen('loginSuccess', loginSuccess);

// 发布
console.log('\n--- 发布登录成功消息 ---');
loginModule.trigger('loginSuccess', { userId: 1001, name: '张三' });

// 取消订阅
console.log('\n--- 取消订阅后再发布 ---');
loginModule.remove('loginSuccess', loginSuccess);
loginModule.trigger('loginSuccess', { userId: 1002, name: '李四' }); // 无人接收

console.log('\n===== 发布-订阅模式的优势 =====');
console.log('1. 时间上的解耦：订阅者不需要关心消息何时发布');
console.log('2. 对象间的解耦：发布者和订阅者不需要知道对方的存在');
console.log('3. installEvent 让任何对象都能拥有发布-订阅能力');
console.log('4. remove 方法支持取消订阅，避免内存泄漏');
