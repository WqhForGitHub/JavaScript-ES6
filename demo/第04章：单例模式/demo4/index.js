// 第04章：单例模式 - 命名空间与模块模式

// 单例模式的核心思想：确保只有一个实例，并提供全局访问点
// 在 JavaScript 中，命名空间和模块模式本质上也是单例模式的应用

// ========== 对象字面量命名空间 ==========
console.log('===== 对象字面量命名空间 =====');

// 最简单的命名空间：用一个对象字面量来组织代码
const namespace1 = {
  a: function () {
    console.log('namespace1.a 执行');
  },
  b: function () {
    console.log('namespace1.b 执行');
  },
};

namespace1.a(); // namespace1.a 执行
namespace1.b(); // namespace1.b 执行

// 优势：避免全局变量污染
// 问题：对象字面量的所有成员都是公开的，无法拥有私有变量

// ========== 动态创建命名空间 ==========
console.log('\n===== 动态创建命名空间 =====');

const MyApp = {};

// 通用的命名空间方法：逐层创建命名空间
MyApp.namespace = function (name) {
  const parts = name.split('.');
  let current = MyApp;
  for (let i = 0; i < parts.length; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
};

// 创建多层命名空间
MyApp.namespace('event');
MyApp.namespace('dom.style');

console.log('MyApp.event：', MyApp.event);
console.log('MyApp.dom.style：', MyApp.dom.style);

// MyApp.dom.style 等价于：
// MyApp.dom = MyApp.dom || {};
// MyApp.dom.style = MyApp.dom.style || {};

// ========== 模块模式：使用闭包封装私有变量 ==========
console.log('\n===== 模块模式：使用闭包封装私有变量 =====');

// 模块模式通过 IIFE 创建闭包，将私有变量隐藏在闭包中
// 只暴露需要公开的接口，本质上就是一个单例

const user = (function () {
  // 私有变量，外部无法直接访问
  let __name = 'sven';
  let __age = 29;

  return {
    // 公有方法，可以访问私有变量
    getUserInfo: function () {
      return __name + ' - ' + __age;
    },
    setName: function (name) {
      __name = name;
    },
    setAge: function (age) {
      __age = age;
    },
  };
})();

console.log('用户信息：', user.getUserInfo()); // sven - 29

user.setName('李四');
user.setAge(30);
console.log('修改后用户信息：', user.getUserInfo()); // 李四 - 30

// 无法直接访问私有变量
console.log('user.__name：', user.__name); // undefined

// ========== 模块模式扩展 ==========
console.log('\n===== 模块模式扩展 =====');

const config = (function () {
  const __config = {
    maxWidth: 100,
    maxHeight: 200,
  };

  return {
    get: function (key) {
      return __config[key];
    },
    set: function (key, value) {
      if (__config.hasOwnProperty(key)) {
        __config[key] = value;
      }
    },
  };
})();

console.log('maxWidth：', config.get('maxWidth')); // 100
config.set('maxWidth', 300);
console.log('修改后 maxWidth：', config.get('maxWidth')); // 300

// 优势总结：
// 1. 命名空间避免全局变量污染，减少命名冲突
// 2. 模块模式通过闭包封装私有状态，实现信息隐藏
// 3. 命名空间和模块模式本质上都是单例模式的应用
