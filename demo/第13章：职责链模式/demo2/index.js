// 第13章：职责链模式 - demo2：AOP实现职责链

// ============================================================
// 一、AOP 方式实现职责链：Function.prototype.after
// ============================================================

Function.prototype.after = function (fn) {
  const self = this;
  return function () {
    const ret = self.apply(this, arguments);
    if (ret === 'nextSuccessor') {
      return fn.apply(this, arguments);
    }
    return ret;
  };
};

// ============================================================
// 订单处理函数
// ============================================================

const order500yuan = function (orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log('500元定金预购，得到100优惠券');
    return;
  }
  return 'nextSuccessor';
};

const order200yuan = function (orderType, pay, stock) {
  if (orderType === 2 && pay === true) {
    console.log('200元定金预购，得到50优惠券');
    return;
  }
  return 'nextSuccessor';
};

const orderNormal = function (orderType, pay, stock) {
  if (stock > 0) {
    console.log('普通购买，无优惠券');
  } else {
    console.log('手机库存不足');
  }
};

// 用 after 串联职责链
const order = order500yuan.after(order200yuan).after(orderNormal);

console.log('--- AOP 方式实现职责链 ---');
console.log('测试：orderType=1, pay=true, stock=500');
order(1, true, 500);

console.log('测试：orderType=1, pay=false, stock=500');
order(1, false, 500);

console.log('测试：orderType=2, pay=true, stock=500');
order(2, true, 500);

console.log('测试：orderType=2, pay=false, stock=500');
order(2, false, 500);

console.log('测试：orderType=3, pay=false, stock=500');
order(3, false, 500);

console.log('测试：orderType=3, pay=false, stock=0');
order(3, false, 0);
console.log('');

// ============================================================
// 二、异步职责链：Chain.prototype.next
// ============================================================

const Chain = function (fn) {
  this.fn = fn;
  this.successor = null;
};

Chain.prototype.setNextSuccessor = function (successor) {
  return (this.successor = successor);
};

Chain.prototype.passRequest = function () {
  const ret = this.fn.apply(this, arguments);
  if (ret === 'nextSuccessor') {
    return (
      this.successor &&
      this.successor.passRequest.apply(this.successor, arguments)
    );
  }
  return ret;
};

// 异步传递请求
Chain.prototype.next = function () {
  if (this.successor) {
    return this.successor.passRequest.apply(this.successor, arguments);
  }
};

// 异步节点1：500元定金
const chainAsync500 = new Chain(function (orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log('[异步] 500元定金预购，得到100优惠券');
    return;
  }
  return 'nextSuccessor';
});

// 异步节点2：200元定金（模拟异步操作）
const chainAsync200 = new Chain(function (orderType, pay, stock) {
  const self = this;
  if (orderType === 2 && pay === true) {
    // 模拟异步操作，1秒后处理
    setTimeout(function () {
      console.log('[异步] 200元定金预购，得到50优惠券');
    }, 1000);
    return;
  }
  // 如果不匹配，异步传递给下一个节点
  setTimeout(function () {
    self.next.apply(self, arguments);
  }, 1000);
  return 'nextSuccessor';
});

// 异步节点3：普通购买
const chainAsyncNormal = new Chain(function (orderType, pay, stock) {
  if (stock > 0) {
    console.log('[异步] 普通购买，无优惠券');
  } else {
    console.log('[异步] 手机库存不足');
  }
});

// 设置职责链
chainAsync500.setNextSuccessor(chainAsync200);
chainAsync200.setNextSuccessor(chainAsyncNormal);

console.log('--- 异步职责链 ---');
console.log('测试：orderType=2, pay=true, stock=500（异步1秒后输出）');
chainAsync500.passRequest(2, true, 500);

console.log('测试：orderType=3, pay=false, stock=500（异步1秒后输出）');
chainAsync500.passRequest(3, false, 500);

console.log('测试：orderType=3, pay=false, stock=0（异步1秒后输出）');
chainAsync500.passRequest(3, false, 0);

console.log('');
console.log('（请等待1秒，异步结果将陆续输出...）');
