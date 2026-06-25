/**
 * 手写 Proxy 实现对象私有属性
 *
 * 作用：
 *   - 用 Proxy 拦截对象属性的读取、设置、遍历等操作
 *   - 约定以 '_' 开头的属性为私有属性，外部不可直接访问
 *   - 类似一些语言（Python 约定、Java private）的私有成员机制
 *
 * 实现思路：
 *   - get 拦截器：访问 '_' 开头的属性时返回 undefined 或抛错
 *   - set 拦截器：设置 '_' 开头属性时拦截
 *   - has 拦截器：in 操作符对私有属性返回 false
 *   - ownKeys / getOwnPropertyDescriptor：遍历时隐藏私有属性
 *
 * 常见约定：
 *   - '_' 前缀表示私有（如 _secret）
 *   - '#' 前缀是 ES 真正的私有字段语法（class 内 #field）
 */

// 方式1：创建私有代理工厂函数
function createPrivateObject(target, { prefix = "_", strict = false } = {}) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        if (strict) {
          throw new Error(`Cannot access private property '${key}'`);
        }
        return undefined;
      }
      return Reflect.get(obj, key, receiver);
    },

    set(obj, key, value, receiver) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        if (strict) {
          throw new Error(`Cannot set private property '${key}'`);
        }
        // 静默忽略（或允许内部设置）
        return true;
      }
      return Reflect.set(obj, key, value, receiver);
    },

    has(obj, key) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        return false; // 隐藏私有属性
      }
      return Reflect.has(obj, key);
    },

    ownKeys(obj) {
      // 过滤掉私有属性，不在 Object.keys / for...in 中出现
      return Reflect.ownKeys(obj).filter(
        (k) => !(typeof k === "string" && k.startsWith(prefix)),
      );
    },

    getOwnPropertyDescriptor(obj, key) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        return undefined; // 隐藏描述符
      }
      return Reflect.getOwnPropertyDescriptor(obj, key);
    },

    deleteProperty(obj, key) {
      if (typeof key === "string" && key.startsWith(prefix)) {
        if (strict) {
          throw new Error(`Cannot delete private property '${key}'`);
        }
        return false;
      }
      return Reflect.deleteProperty(obj, key);
    },
  });
}

// 方式2：用 WeakMap 存储真正的私有数据（更安全，外部完全无法访问）
function createWithWeakMap(publicData, privateData) {
  const privateStore = new WeakMap();
  const target = { ...publicData };
  privateStore.set(target, { ...privateData });

  return new Proxy(target, {
    get(obj, key) {
      if (key === "_getPrivate") {
        // 提供受控的内部访问方法（示例）
        return () => privateStore.get(obj);
      }
      return Reflect.get(obj, key);
    },
  });
}

// ===== 测试 =====

console.log("=== 方式1：_ 前缀代理 ===");
const user = createPrivateObject({
  name: "Tom",
  age: 20,
  _password: "123456",
  _internalId: "uid-001",
});

console.log(user.name); // 'Tom'（公开属性正常访问）
console.log(user.age); // 20

// 私有属性返回 undefined
console.log(user._password); // undefined
console.log(user._internalId); // undefined

// in 操作符隐藏私有属性
console.log("name" in user); // true
console.log("_password" in user); // false

// 遍历时隐藏私有属性
console.log(Object.keys(user)); // ['name', 'age']
console.log(Object.getOwnPropertyNames(user)); // ['name', 'age']

// 设置私有属性被忽略
user._password = "hacked";
console.log(user._password); // undefined

// 设置公开属性正常
user.age = 21;
console.log(user.age); // 21

console.log("=== 严格模式 ===");
const strictUser = createPrivateObject(
  { name: "Jerry", _secret: "top" },
  { strict: true },
);
try {
  strictUser._secret;
} catch (e) {
  console.log("访问私有属性抛错:", e.message); // Cannot access private property '_secret'
}

console.log("=== 方式2：WeakMap 真私有 ===");
const secured = createWithWeakMap(
  { name: "Tom", balance: 1000 },
  { pin: "9999", token: "abc" },
);
console.log(secured.name); // 'Tom'
console.log(secured.balance); // 1000
// 外部完全无法访问 pin/token（不在对象上）
console.log(secured.pin); // undefined
console.log("_pin" in secured); // false
// 通过受控方法访问
console.log(secured._getPrivate()); // { pin: '9999', token: 'abc' }

console.log("=== 配合 class 使用 ===");
class Account {
  constructor(owner, balance) {
    this.owner = owner;
    this.balance = balance;
    this._pin = "0000"; // 约定私有
  }
  verifyPin(input) {
    return this._pin === input; // 内部可访问（通过 this）
  }
}

const rawAccount = new Account("Bob", 500);
const privateAccount = createPrivateObject(rawAccount);
console.log(privateAccount.owner); // 'Bob'
console.log(privateAccount._pin); // undefined（外部访问被拦截）
// 注意：verifyPin 内部 this 指向原始对象，仍能访问 _pin
console.log(privateAccount.verifyPin("0000")); // true
