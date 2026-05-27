// 第08章：发布-订阅模式 - 全局Event对象

// ========== 全局 Event 对象 ==========
console.log('===== 全局 Event 对象 =====');

var Event = (function() {
  var clientList = {};
  var listen, trigger, remove;

  listen = function(key, fn) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };

  trigger = function() {
    var key = Array.prototype.shift.call(arguments);
    var fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (var i = 0, fn; fn = fns[i++];) {
      fn.apply(this, arguments);
    }
  };

  remove = function(key, fn) {
    var fns = clientList[key];
    if (!fns) {
      return false;
    }
    if (!fn) {
      fns && (fns.length = 0);
    } else {
      for (var l = fns.length - 1; l >= 0; l--) {
        if (fns[l] === fn) {
          fns.splice(l, 1);
        }
      }
    }
  };

  return {
    listen: listen,
    trigger: trigger,
    remove: remove
  };
})();

// 使用全局 Event
Event.listen('squareMeter88', function(price) {
  console.log('全局Event - 88平米价格：' + price);
});

Event.trigger('squareMeter88', 2000000);

// ========== 命名空间支持 ==========
console.log('\n===== 命名空间支持 =====');

var Event2 = (function() {
  var global = this;
  var Event = function() {
    var clientList = {};
    var listen, trigger, remove;

    listen = function(key, fn) {
      if (!clientList[key]) {
        clientList[key] = [];
      }
      clientList[key].push(fn);
    };

    trigger = function() {
      var key = Array.prototype.shift.call(arguments);
      var fns = clientList[key];
      if (!fns || fns.length === 0) {
        return false;
      }
      for (var i = 0, fn; fn = fns[i++];) {
        fn.apply(this, arguments);
      }
    };

    remove = function(key, fn) {
      var fns = clientList[key];
      if (!fns) {
        return false;
      }
      if (!fn) {
        fns && (fns.length = 0);
      } else {
        for (var l = fns.length - 1; l >= 0; l--) {
          if (fns[l] === fn) {
            fns.splice(l, 1);
          }
        }
      }
    };

    return {
      listen: listen,
      trigger: trigger,
      remove: remove
    };
  };

  return {
    create: function(namespace) {
      var namespace = namespace || 'default';
      return Event();
    }
  };
})();

// 创建不同命名空间的事件对象
var ns1 = Event2.create('namespace1');
var ns2 = Event2.create('namespace2');

// namespace1 订阅
ns1.listen('click', function(data) {
  console.log('namespace1 收到 click：', data);
});

// namespace2 订阅
ns2.listen('click', function(data) {
  console.log('namespace2 收到 click：', data);
});

// 在 namespace1 中发布，只有 namespace1 的订阅者会收到
console.log('\n--- namespace1 发布 click ---');
ns1.trigger('click', '来自namespace1');

// 在 namespace2 中发布，只有 namespace2 的订阅者会收到
console.log('\n--- namespace2 发布 click ---');
ns2.trigger('click', '来自namespace2');

// ========== 模块间通信示例 ==========
console.log('\n===== 模块间通信示例 =====');

var headerModule = (function() {
  Event.listen('loginSuccess', function(data) {
    console.log('Header 模块：更新欢迎信息 -', data.name);
  });
  return {};
})();

var navModule = (function() {
  Event.listen('loginSuccess', function(data) {
    console.log('Nav 模块：更新用户菜单 -', data.userId);
  });
  return {};
})();

var contentModule = (function() {
  Event.listen('loginSuccess', function(data) {
    console.log('Content 模块：加载用户数据 -', data.userId);
  });
  return {};
})();

var loginModule = (function() {
  return {
    login: function(name, userId) {
      console.log('登录模块：用户登录成功');
      Event.trigger('loginSuccess', { name: name, userId: userId });
    }
  };
})();

// 用户登录，各模块自动响应
console.log('\n--- 用户登录，各模块响应 ---');
loginModule.login('张三', 1001);

// ========== 取消订阅示例 ==========
console.log('\n===== 取消订阅示例 =====');

var callback = function(data) {
  console.log('临时订阅者收到消息：', data);
};

Event.listen('tempEvent', callback);
Event.trigger('tempEvent', '第一次发布'); // 临时订阅者会收到

Event.remove('tempEvent', callback);
Event.trigger('tempEvent', '第二次发布'); // 临时订阅者不会收到
console.log('已取消订阅，第二次发布不会有临时订阅者输出');

// ========== 全局 Event 的优势 ==========
console.log('\n===== 全局 Event 的优势 =====');
console.log('1. 全局 Event 作为中间者，让任何模块都可以通信');
console.log('2. 命名空间避免不同模块之间的事件冲突');
console.log('3. IIFE 封装 clientList，外部无法直接访问');
console.log('4. remove 方法防止内存泄漏，及时清理不需要的订阅');
