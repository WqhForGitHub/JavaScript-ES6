// 第04章：单例模式 - 透明单例与代理单例

// ========== 透明单例：用 new 也能创建单例 ==========
console.log('===== 透明单例：用 new 也能创建单例 =====');

// 之前的方式需要使用者调用 Singleton.getInstance()
// "透明"单例让使用者可以像普通类一样使用 new，但始终返回同一个实例

var CreateDiv = (function() {
  var instance;

  var CreateDiv = function(html) {
    if (instance) {
      return instance; // 如果实例已存在，直接返回
    }
    this.html = html;
    this.init();
    return (instance = this); // 保存实例并返回
  };

  CreateDiv.prototype.init = function() {
    var div = document.createElement('div');
    div.innerHTML = this.html;
    document.body.appendChild(div);
  };

  return CreateDiv;
})();

var a = new CreateDiv('sven1');
var b = new CreateDiv('sven2');

console.log('a === b：', a === b); // true
console.log('a.html：', a.html); // sven1

// 问题：
// 1. CreateDiv 违反了单一职责原则 —— 它既负责创建对象，又负责管理单例
// 2. 如果某天不需要单例了，必须重写整个构造函数
// 3. 构造函数的返回值比较诡异（返回 this 而非默认行为）

// ========== 代理单例：使用代理实现单例 ==========
console.log('\n===== 代理单例：使用代理实现单例 =====');

// 将"创建对象"和"管理单例"这两个职责分离

// 1. 负责创建对象的构造函数（纯粹的创建逻辑）
var CreateDiv2 = function(html) {
  this.html = html;
  this.init();
};

CreateDiv2.prototype.init = function() {
  var div = document.createElement('div');
  div.innerHTML = this.html;
  document.body.appendChild(div);
};

// 2. 代理函数：负责管理单例
var ProxySingletonCreateDiv = (function() {
  var instance;
  return function(html) {
    if (!instance) {
      instance = new CreateDiv2(html);
    }
    return instance;
  };
})();

var c = new ProxySingletonCreateDiv('sven3');
var d = new ProxySingletonCreateDiv('sven4');

console.log('c === d：', c === d); // true
console.log('c.html：', c.html); // sven3

// 优势：
// 1. CreateDiv2 只负责创建对象，符合单一职责原则
// 2. ProxySingletonCreateDiv 只负责管理单例
// 3. 如果不需要单例了，直接 new CreateDiv2 即可
// 4. 两个类可以独立变化，互不影响
