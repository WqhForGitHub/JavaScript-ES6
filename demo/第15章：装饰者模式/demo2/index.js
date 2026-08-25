// ==============================
// 第15章：AOP 装饰函数应用
// ==============================

Function.prototype.before = function (beforefn) {
  const __self = this;
  return function () {
    if (beforefn.apply(this, arguments) === false) {
      return;
    }
    return __self.apply(this, arguments);
  };
};

Function.prototype.after = function (afterfn) {
  const __self = this;
  return function () {
    const ret = __self.apply(this, arguments);
    if (ret === false) {
      return false;
    }
    afterfn.apply(this, arguments);
    return ret;
  };
};

console.log('========== 1. 数据上报分离 ==========');

let showLogin = function () {
  console.log('打开登录浮层');
};

const log = function () {
  console.log('上报登录日志');
};

showLogin = showLogin.after(log);

showLogin();

console.log('');
console.log('========== 2. 动态修改函数参数（注入 Token）==========');

let ajax = function (type, url, param) {
  console.log(
    '发送 ajax 请求：type=' +
      type +
      ', url=' +
      url +
      ', param=' +
      JSON.stringify(param)
  );
};

const getToken = function () {
  return 'token-abc123';
};

ajax = ajax.before(function (type, url, param) {
  param.token = getToken();
});

ajax('GET', 'http://www.example.com/api', { name: 'test' });

console.log('');
console.log('========== 3. 插件式表单验证 ==========');

let formSubmit = function () {
  console.log('提交表单');
};

const validata = function () {
  const username = 'test';
  if (username === '') {
    console.log('验证失败：用户名不能为空');
    return false;
  }
  console.log('验证通过');
  return true;
};

formSubmit = formSubmit.before(validata);

formSubmit();

console.log('');
console.log('--- 模拟验证失败的情况 ---');

let formSubmit2 = function () {
  console.log('提交表单');
};

const validataFail = function () {
  const username = '';
  if (username === '') {
    console.log('验证失败：用户名不能为空');
    return false;
  }
  console.log('验证通过');
  return true;
};

formSubmit2 = formSubmit2.before(validataFail);

formSubmit2();
