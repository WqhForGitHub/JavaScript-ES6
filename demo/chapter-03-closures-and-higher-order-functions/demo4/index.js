// ==============================
// AOP (面向切面编程)
// ==============================

console.log('=== Function.prototype.before ===');

// before: 在原函数之前执行前置函数
Function.prototype.before = function (beforefn) {
  const __self = this; // 保存原函数引用

  return function () {
    // 先执行前置函数
    beforefn.apply(this, arguments);
    // 再执行原函数
    return __self.apply(this, arguments);
  };
};

console.log('\n=== Function.prototype.after ===');

// after: 在原函数之后执行后置函数
Function.prototype.after = function (afterfn) {
  const __self = this; // 保存原函数引用

  return function () {
    // 先执行原函数
    const ret = __self.apply(this, arguments);
    // 再执行后置函数
    afterfn.apply(this, arguments);
    return ret;
  };
};

// ==============================
// 基本使用示例
// ==============================

console.log('\n=== 基本使用 ===');

let func = function () {
  console.log(2);
};

func = func
  .before(function () {
    console.log(1);
  })
  .after(function () {
    console.log(3);
  });

func(); // 输出: 1, 2, 3

// ==============================
// 实际应用：给函数添加日志
// ==============================

console.log('\n=== 给函数添加日志 ===');

let showLogin = function () {
  console.log('显示登录弹窗');
};

// 在显示登录弹窗之前，记录点击日志
showLogin = showLogin.before(function () {
  console.log('记录用户点击登录按钮的日志');
});

showLogin();
// 记录用户点击登录按钮的日志
// 显示登录弹窗

// ==============================
// 实际应用：给 ajax 请求添加 token
// ==============================

console.log('\n=== 给 ajax 请求添加 token ===');

let ajax = function (type, url, param) {
  console.log('发送 ' + type + ' 请求到 ' + url);
  console.log('参数:', JSON.stringify(param));
};

// 使用 before 在发送请求前自动添加 token
ajax = ajax.before(function (type, url, param) {
  param = param || {};
  param.token = 'xxxx-yyyy-zzzz';
  // 修改 arguments 对象
  arguments[2] = param;
  console.log('before: 已添加 token 到请求参数');
});

ajax('GET', '/api/user', { name: 'sven' });
// before: 已添加 token 到请求参数
// 发送 GET 请求到 /api/user
// 参数: {"name":"sven","token":"xxxx-yyyy-zzzz"}

// ==============================
// 实际应用：表单验证
// ==============================

console.log('\n=== 表单验证 ===');

let submitForm = function () {
  console.log('提交表单数据');
};

// 在提交前添加验证逻辑
submitForm = submitForm.before(function () {
  const username = 'test'; // 模拟获取输入值
  if (!username) {
    console.log('验证失败：用户名不能为空');
    return false;
  }
  console.log('验证通过：用户名 = ' + username);
});

submitForm();
// 验证通过：用户名 = test
// 提交表单数据

// ==============================
// 链式 AOP 示例
// ==============================

console.log('\n=== 链式 AOP ===');

let greet = function (name) {
  console.log('Hello, ' + name + '!');
};

greet = greet
  .before(function (name) {
    console.log('前置：准备问候 ' + name);
  })
  .before(function (name) {
    console.log('前置：检查 ' + name + ' 是否在线');
  })
  .after(function (name) {
    console.log('后置：记录问候 ' + name + ' 的日志');
  })
  .after(function (name) {
    console.log('后置：更新 ' + name + ' 的最后活跃时间');
  });

greet('sven');
// 前置：检查 sven 是否在线
// 前置：准备问候 sven
// Hello, sven!
// 后置：记录问候 sven 的日志
// 后置：更新 sven 的最后活跃时间
