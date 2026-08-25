// 第04章：单例模式 - 闭包实现单例

// ========== 改进：使用闭包隐藏 instance ==========
console.log('===== 改进：使用闭包隐藏 instance =====');

const Singleton = function (name) {
  this.name = name;
};

Singleton.prototype.getName = function () {
  console.log(this.name);
};

// 用 IIFE 创建闭包，将 instance 变量隐藏在闭包内部
// 外部无法直接访问和修改 instance
Singleton.getInstance = (function () {
  let instance = null;
  return function (name) {
    if (!instance) {
      instance = new Singleton(name);
    }
    return instance;
  };
})();

const a = Singleton.getInstance('sven1');
const b = Singleton.getInstance('sven2');

console.log('a === b：', a === b); // true
console.log('a.name：', a.name); // sven1

// 优势：
// 1. instance 变量被封闭在闭包中，外部无法修改
// 2. 避免了 Singleton.instance 暴露带来的安全隐患

// ========== JavaScript 中的单例 ==========
console.log('\n===== JavaScript 中的单例 =====');

// 在 JavaScript 中，对象字面量本身就是单例
const singleton1 = {
  name: 'sven',
  getName: function () {
    return this.name;
  },
};

console.log('对象字面量 name：', singleton1.getName()); // sven

// 但这种方式无法延迟创建，对象在脚本加载时就已经存在
// 惰性单例：在需要的时候才创建对象

const lazySingleton = (function () {
  let instance = null;
  function init() {
    // 私有变量
    const privateVar = '我是私有变量';
    function privateMethod() {
      console.log('我是私有方法');
    }
    // 返回单例对象
    return {
      publicMethod: function () {
        console.log('我是公有方法');
        privateMethod();
      },
      publicVar: '我是公有变量',
      getPrivateVar: function () {
        return privateVar;
      },
    };
  }
  return function () {
    if (!instance) {
      instance = init();
    }
    return instance;
  };
})();

const lazyA = lazySingleton();
const lazyB = lazySingleton();

console.log('惰性单例 lazyA === lazyB：', lazyA === lazyB); // true
console.log('公有变量：', lazyA.publicVar);
lazyA.publicMethod();
console.log('访问私有变量：', lazyA.getPrivateVar());
