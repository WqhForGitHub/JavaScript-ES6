// ============================================
// 第20章：开放-封闭原则 - demo2
// 开放-封闭原则 - 中间件/插件模式
// ============================================

// ============================================
// 示例1：中间件模式
// ============================================

console.log('=== 示例1：中间件模式 ===');

var App = function() {
  this.middlewares = [];
};

// 开放扩展：通过 use 方法添加中间件
App.prototype.use = function(middleware) {
  this.middlewares.push(middleware);
  return this;
};

// 封闭修改：run 方法不需要因为新增中间件而改变
App.prototype.run = function(data) {
  var result = data;
  for (var i = 0; i < this.middlewares.length; i++) {
    result = this.middlewares[i](result);
  }
  return result;
};

// 定义各种中间件插件
var authMiddleware = function(data) {
  console.log('[Auth] 验证用户: ' + data.user);
  data.authenticated = true;
  return data;
};

var logMiddleware = function(data) {
  console.log('[Log] 记录请求: ' + data.action);
  return data;
};

var validateMiddleware = function(data) {
  console.log('[Validate] 校验参数');
  data.valid = true;
  return data;
};

var transformMiddleware = function(data) {
  console.log('[Transform] 转换数据格式');
  data.transformed = true;
  return data;
};

// 组装应用：按需添加中间件，无需修改 App 类
var app = new App();
app.use(authMiddleware)
   .use(logMiddleware)
   .use(validateMiddleware);

var requestData = { user: '张三', action: 'getProfile' };
var result = app.run(requestData);

console.log('处理结果:', JSON.stringify(result));
console.log('');

// 新增中间件不影响 App 类
app.use(transformMiddleware);
var result2 = app.run({ user: '李四', action: 'updateProfile' });
console.log('处理结果:', JSON.stringify(result2));
console.log('');

// ============================================
// 示例2：策略模式 - 支付处理器
// ============================================

console.log('=== 示例2：策略模式 - 支付处理器 ===');

// 反例：违反开放-封闭原则的支付处理器
var PaymentProcessorBad = function() {};

PaymentProcessorBad.prototype.pay = function(type, amount) {
  if (type === 'stripe') {
    console.log('[Stripe] 支付 $' + amount + ', 手续费: $' + (amount * 0.029 + 0.3).toFixed(2));
  } else if (type === 'paypal') {
    console.log('[PayPal] 支付 $' + amount + ', 手续费: $' + (amount * 0.034 + 0.35).toFixed(2));
  } else if (type === 'alipay') {
    console.log('[Alipay] 支付 ¥' + amount + ', 手续费: ¥' + (amount * 0.006).toFixed(2));
  }
  // 新增支付方式必须修改此函数
};

console.log('--- 反例：if-else 判断支付方式 ---');
var badProcessor = new PaymentProcessorBad();
badProcessor.pay('stripe', 100);
badProcessor.pay('paypal', 100);
badProcessor.pay('alipay', 600);
console.log('问题: 新增支付方式必须修改 pay 方法');
console.log('');

// 修复：策略模式
var PaymentProcessor = function() {
  this.strategies = {};
};

// 开放扩展：注册新的支付策略
PaymentProcessor.prototype.register = function(type, strategy) {
  this.strategies[type] = strategy;
  return this;
};

// 封闭修改：pay 方法不因新增支付方式而改变
PaymentProcessor.prototype.pay = function(type, amount) {
  var strategy = this.strategies[type];
  if (!strategy) {
    throw new Error('不支持的支付方式: ' + type);
  }
  strategy(amount);
};

// 定义各支付策略
var stripeStrategy = function(amount) {
  var fee = amount * 0.029 + 0.3;
  console.log('[Stripe] 支付 $' + amount + ', 手续费: $' + fee.toFixed(2));
};

var payPalStrategy = function(amount) {
  var fee = amount * 0.034 + 0.35;
  console.log('[PayPal] 支付 $' + amount + ', 手续费: $' + fee.toFixed(2));
};

var alipayStrategy = function(amount) {
  var fee = amount * 0.006;
  console.log('[Alipay] 支付 ¥' + amount + ', 手续费: ¥' + fee.toFixed(2));
};

// 组装支付处理器：注册策略，无需修改 PaymentProcessor
var processor = new PaymentProcessor();
processor.register('stripe', stripeStrategy);
processor.register('paypal', payPalStrategy);
processor.register('alipay', alipayStrategy);

console.log('--- 修复：策略模式，新增支付方式无需修改 pay 方法 ---');
processor.pay('stripe', 100);
processor.pay('paypal', 100);
processor.pay('alipay', 600);
console.log('');

// 新增支付方式：只需注册新策略
var wechatPayStrategy = function(amount) {
  var fee = amount * 0.006;
  console.log('[WeChatPay] 支付 ¥' + amount + ', 手续费: ¥' + fee.toFixed(2));
};

processor.register('wechat', wechatPayStrategy);
processor.pay('wechat', 800);
console.log('');

// ============================================
// 示例3：插件化的数据过滤器
// ============================================

console.log('=== 示例3：插件化的数据过滤器 ===');

var DataFilter = function() {
  this.filters = [];
};

DataFilter.prototype.addFilter = function(filter) {
  this.filters.push(filter);
  return this;
};

DataFilter.prototype.process = function(data) {
  var result = data;
  for (var i = 0; i < this.filters.length; i++) {
    result = this.filters[i](result);
  }
  return result;
};

// 定义过滤器插件
var removeNulls = function(data) {
  var filtered = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i] !== null && data[i] !== undefined) {
      filtered.push(data[i]);
    }
  }
  console.log('[Filter] 移除空值: ' + data.length + ' -> ' + filtered.length + ' 条');
  return filtered;
};

var deduplicate = function(data) {
  var seen = {};
  var unique = [];
  for (var i = 0; i < data.length; i++) {
    if (!seen[data[i]]) {
      seen[data[i]] = true;
      unique.push(data[i]);
    }
  }
  console.log('[Filter] 去重: ' + data.length + ' -> ' + unique.length + ' 条');
  return unique;
};

var sortAscending = function(data) {
  var sorted = data.slice().sort(function(a, b) { return a - b; });
  console.log('[Filter] 升序排序');
  return sorted;
};

// 组装过滤器
var filter = new DataFilter();
filter.addFilter(removeNulls)
      .addFilter(deduplicate)
      .addFilter(sortAscending);

var rawData = [5, null, 3, 2, 5, undefined, 1, 3, 4];
console.log('原始数据: ' + JSON.stringify(rawData));

var filtered = filter.process(rawData);
console.log('过滤结果: ' + JSON.stringify(filtered));
console.log('');

// ============================================
// 总结
// ============================================

console.log('=== 开放-封闭原则总结 ===');
console.log('1. 中间件模式：通过 use() 添加插件，核心逻辑 run() 不需修改');
console.log('2. 策略模式：通过 register() 注册策略，核心方法 pay() 不需修改');
console.log('3. 插件模式：通过 addFilter() 添加过滤器，process() 不需修改');
console.log('4. 共同点：对扩展开放（新增插件/策略），对修改封闭（核心逻辑不变）');
