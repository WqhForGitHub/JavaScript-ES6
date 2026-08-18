// 第04章：单例模式 - 基础单例模式

// 单例模式的定义：保证一个类仅有一个实例，并提供一个访问它的全局访问点。

// ========== 最初的实现：使用类的静态属性 ==========
console.log('===== 最初的实现：使用类的静态属性 =====');

const Singleton = function (name) {
  this.name = name;
};

// 使用静态属性 instance 来保存唯一实例
Singleton.instance = null;

Singleton.prototype.getName = function () {
  console.log(this.name);
};

// 通过 getInstance 方法获取唯一实例
Singleton.getInstance = function (name) {
  if (!this.instance) {
    this.instance = new Singleton(name);
  }
  return this.instance;
};

const a = Singleton.getInstance('sven1');
const b = Singleton.getInstance('sven2');

console.log('a === b：', a === b); // true
console.log('a.name：', a.name); // sven1（第一次创建的实例）
console.log('b.name：', b.name); // sven1（返回的是同一个实例）

// 问题：
// 1. Singleton.instance 暴露在外，可以被随意修改
// 2. 使用者必须知道 Singleton 是单例类，必须调用 getInstance 而非 new
// 3. 不够"透明"，增加了使用者的心智负担
