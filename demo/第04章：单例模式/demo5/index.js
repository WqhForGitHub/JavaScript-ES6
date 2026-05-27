// 第04章：单例模式 - 通用的 getSingle 高阶函数

// ========== 问题：重复的单例管理代码 ==========
console.log('===== 问题：重复的单例管理代码 =====');

// 之前的单例实现中，每次都要写类似的 if (!instance) 判断逻辑
// 比如创建登录浮窗、创建 iframe 等，管理单例的代码重复且耦合

// 创建登录浮窗的单例
var createLoginLayer = (function() {
  var div;
  return function() {
    if (!div) {
      div = document.createElement('div');
      div.innerHTML = '我是登录浮窗';
      div.style.display = 'none';
      document.body.appendChild(div);
    }
    return div;
  };
})();

// 创建 iframe 的单例
var createIframe = (function() {
  var iframe;
  return function() {
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    return iframe;
  };
})();

// 问题：创建逻辑和单例管理逻辑耦合在一起，代码重复

// ========== 解决方案：通用的 getSingle 高阶函数 ==========
console.log('\n===== 解决方案：通用的 getSingle 高阶函数 =====');

// getSingle 接收一个创建对象的函数 fn，返回一个始终返回单例的函数
// 将"管理单例"的职责抽离出来，让创建逻辑只关心创建本身

var getSingle = function(fn) {
  var result; // 用闭包保存唯一实例
  return function() {
    return result || (result = fn.apply(this, arguments));
  };
};

// ========== 应用1：创建登录浮窗 ==========
console.log('\n--- 应用1：创建登录浮窗 ---');

var createLoginLayer2 = function() {
  var div = document.createElement('div');
  div.innerHTML = '我是登录浮窗';
  div.style.display = 'none';
  document.body.appendChild(div);
  return div;
};

var createSingleLoginLayer = getSingle(createLoginLayer2);

var loginLayer1 = createSingleLoginLayer();
var loginLayer2 = createSingleLoginLayer();

console.log('loginLayer1 === loginLayer2：', loginLayer1 === loginLayer2); // true

// ========== 应用2：创建 iframe ==========
console.log('\n--- 应用2：创建 iframe ---');

var createSingleIframe = getSingle(function() {
  var iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return iframe;
});

var iframe1 = createSingleIframe();
var iframe2 = createSingleIframe();

console.log('iframe1 === iframe2：', iframe1 === iframe2); // true

// ========== 应用3：一次性事件绑定 ==========
console.log('\n--- 应用3：一次性事件绑定 ---');

// 使用 getSingle 确保某个回调函数只绑定一次
// 例如：列表渲染时，事件只需要绑定一次，即使 render 被多次调用

var bindEvent = getSingle(function() {
  console.log('事件绑定执行（只会执行一次）');
  // document.getElementById('div1').addEventListener('click', function() {
  //   console.log('click');
  // });
  return true; // 返回一个标记值
});

var render = function() {
  console.log('开始渲染列表');
  bindEvent(); // 只有第一次调用会真正执行绑定
};

render(); // 事件绑定执行（只会执行一次）
render(); // 不再绑定
render(); // 不再绑定

// ========== 总结 ==========
console.log('\n===== getSingle 的优势 =====');
console.log('1. 将管理单例的逻辑从业务代码中分离出来');
console.log('2. 任何创建对象的函数都可以通过 getSingle 变成单例');
console.log('3. 符合开放-封闭原则，新增单例无需修改 getSingle');
console.log('4. 符合单一职责原则，创建逻辑只管创建，getSingle 只管单例');
