// ============================================
// 第21章：接口和面向接口编程 - demo1
// 鸭式辨型与面向接口编程
// ============================================

// ============================================
// 1. 鸭式辨型（Duck Typing）
// ============================================

console.log('=== 1. 鸭式辨型 ===');
console.log('如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子');
console.log('');

// 接口检查函数：验证对象是否满足 Logger 接口
const implementsLogger = function (obj) {
  return (
    obj &&
    typeof obj.log === 'function' &&
    typeof obj.warn === 'function' &&
    typeof obj.error === 'function'
  );
};

// 一个使用 Logger 接口的函数
const logSomething = function (logger, message) {
  // 鸭式辨型：检查对象是否拥有 log 方法
  if (typeof logger.log !== 'function') {
    throw new Error('logger 必须提供 log 方法');
  }
  logger.log(message);
};

// ============================================
// 2. 不同的 Logger 实现，都满足相同接口
// ============================================

console.log('=== 2. 不同的 Logger 实现 ===');

// ConsoleLogger：输出到控制台
const consoleLogger = {
  log: function (msg) {
    console.log('[ConsoleLogger] LOG: ' + msg);
  },
  warn: function (msg) {
    console.log('[ConsoleLogger] WARN: ' + msg);
  },
  error: function (msg) {
    console.log('[ConsoleLogger] ERROR: ' + msg);
  },
};

// FileLogger：模拟输出到文件
const fileLogger = {
  log: function (msg) {
    console.log('[FileLogger] 写入文件 app.log: ' + msg);
  },
  warn: function (msg) {
    console.log('[FileLogger] 写入文件 warn.log: ' + msg);
  },
  error: function (msg) {
    console.log('[FileLogger] 写入文件 error.log: ' + msg);
  },
};

// RemoteLogger：模拟发送到远程服务器
const remoteLogger = {
  log: function (msg) {
    console.log('[RemoteLogger] 发送日志到 http://log-server/api/log: ' + msg);
  },
  warn: function (msg) {
    console.log('[RemoteLogger] 发送警告到 http://log-server/api/warn: ' + msg);
  },
  error: function (msg) {
    console.log(
      '[RemoteLogger] 发送错误到 http://log-server/api/error: ' + msg
    );
  },
};

// 验证所有 Logger 都满足接口
console.log(
  'consoleLogger 满足 Logger 接口: ' + implementsLogger(consoleLogger)
);
console.log('fileLogger 满足 Logger 接口: ' + implementsLogger(fileLogger));
console.log('remoteLogger 满足 Logger 接口: ' + implementsLogger(remoteLogger));
console.log('');

// 使用同一个函数，传入不同的 Logger
console.log('--- 同一个函数，不同实现 ---');
logSomething(consoleLogger, '你好，控制台!');
logSomething(fileLogger, '你好，文件!');
logSomething(remoteLogger, '你好，远程服务器!');
console.log('');

// 一个不满足接口的对象
const badLogger = {
  log: function (msg) {
    console.log(msg);
  },
  // 缺少 warn 和 error 方法
};

console.log('badLogger 满足 Logger 接口: ' + implementsLogger(badLogger));
console.log('');

// ============================================
// 3. 面向接口编程 - 依赖注入
// ============================================

console.log('=== 3. 面向接口编程 - 依赖注入 ===');

// OrderProcessor 不依赖具体的支付实现，只依赖"有 charge 方法的对象"
const OrderProcessor = function (paymentGateway) {
  // 接口检查：依赖的对象必须有 charge 方法
  if (typeof paymentGateway.charge !== 'function') {
    throw new Error('paymentGateway 必须提供 charge 方法');
  }
  this.paymentGateway = paymentGateway;
};

OrderProcessor.prototype.processOrder = function (order) {
  console.log(
    '[OrderProcessor] 处理订单 #' + order.id + ', 金额: $' + order.amount
  );
  const result = this.paymentGateway.charge(order.amount, order.currency);
  if (result.success) {
    console.log('[OrderProcessor] 订单 #' + order.id + ' 支付成功');
  } else {
    console.log('[OrderProcessor] 订单 #' + order.id + ' 支付失败');
  }
  return result;
};

// ============================================
// 4. 不同的支付网关实现
// ============================================

console.log('=== 4. 不同的支付网关实现 ===');

// Stripe 网关
const stripeGateway = {
  charge: function (amount, currency) {
    const fee = (amount * 0.029 + 0.3).toFixed(2);
    console.log(
      '[Stripe] 扣款 $' + amount + ' ' + currency + ', 手续费: $' + fee
    );
    return { success: true, transactionId: 'stripe_' + Date.now() };
  },
};

// PayPal 网关
const payPalGateway = {
  charge: function (amount, currency) {
    const fee = (amount * 0.034 + 0.35).toFixed(2);
    console.log(
      '[PayPal] 扣款 $' + amount + ' ' + currency + ', 手续费: $' + fee
    );
    return { success: true, transactionId: 'paypal_' + Date.now() };
  },
};

// 支付宝网关
const alipayGateway = {
  charge: function (amount, currency) {
    const fee = (amount * 0.006).toFixed(2);
    console.log(
      '[Alipay] 扣款 ¥' + amount + ' ' + currency + ', 手续费: ¥' + fee
    );
    return { success: true, transactionId: 'alipay_' + Date.now() };
  },
};

// 依赖注入：创建 OrderProcessor 时传入不同的支付网关
console.log('--- 使用 Stripe 支付 ---');
const stripeProcessor = new OrderProcessor(stripeGateway);
stripeProcessor.processOrder({ id: 1001, amount: 99.99, currency: 'USD' });
console.log('');

console.log('--- 使用 PayPal 支付 ---');
const paypalProcessor = new OrderProcessor(payPalGateway);
paypalProcessor.processOrder({ id: 1002, amount: 149.5, currency: 'USD' });
console.log('');

console.log('--- 使用支付宝支付 ---');
const alipayProcessor = new OrderProcessor(alipayGateway);
alipayProcessor.processOrder({ id: 1003, amount: 599.0, currency: 'CNY' });
console.log('');

// ============================================
// 5. 运行时切换实现
// ============================================

console.log('=== 5. 运行时切换实现 ===');

// OrderProcessor 也可以通过 setter 切换网关
const FlexibleOrderProcessor = function (paymentGateway) {
  if (paymentGateway) {
    this.setPaymentGateway(paymentGateway);
  }
};

FlexibleOrderProcessor.prototype.setPaymentGateway = function (paymentGateway) {
  if (typeof paymentGateway.charge !== 'function') {
    throw new Error('paymentGateway 必须提供 charge 方法');
  }
  this.paymentGateway = paymentGateway;
  console.log('[FlexibleOrderProcessor] 切换支付网关');
};

FlexibleOrderProcessor.prototype.processOrder = function (order) {
  console.log('[FlexibleOrderProcessor] 处理订单 #' + order.id);
  return this.paymentGateway.charge(order.amount, order.currency);
};

const flexibleProcessor = new FlexibleOrderProcessor(stripeGateway);
flexibleProcessor.processOrder({ id: 2001, amount: 50, currency: 'USD' });
console.log('');

// 运行时切换为支付宝
flexibleProcessor.setPaymentGateway(alipayGateway);
flexibleProcessor.processOrder({ id: 2002, amount: 300, currency: 'CNY' });
console.log('');

// ============================================
// 6. 鸭式辨型的局限性
// ============================================

console.log('=== 6. 鸭式辨型的局限性 ===');

// 一个只有 charge 方法但语义不同的对象
const fakeGateway = {
  charge: function (amount) {
    // 这其实是"充电"，不是"扣款"
    console.log('[Battery] 充电 ' + amount + ' mAh');
    return { success: true };
  },
};

// 鸭式辨型认为它满足接口，但语义不对
const badProcessor = new OrderProcessor(fakeGateway);
badProcessor.processOrder({ id: 9999, amount: 100, currency: 'USD' });
console.log('问题: 鸭式辨型只检查方法是否存在，不检查语义是否正确');
console.log('');

// ============================================
// 总结
// ============================================

console.log('=== 面向接口编程总结 ===');
console.log('1. 鸭式辨型：如果对象有所需方法，就认为它满足接口');
console.log('2. 接口检查：用 typeof 检查方法是否存在，运行时验证');
console.log('3. 依赖注入：依赖接口而非实现，通过构造函数传入');
console.log('4. 可替换性：不同实现可以互换，只需满足相同接口');
console.log('5. 运行时灵活切换：可以随时替换实现');
console.log('6. 注意局限：鸭式辨型只检查结构，不检查语义');
