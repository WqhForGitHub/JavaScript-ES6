/**
 * 手写单例模式函数
 *
 * 作用：
 *   - 保证一个类 / 函数只产生一个实例，全局共享
 *   - 典型场景：全局状态管理、数据库连接、日志器、配置中心
 *
 * 实现方式：
 *   1. 闭包版：用闭包保存唯一实例
 *   2. 静态属性版：在构造函数上挂载 instance
 *   3. 代理版：用 Proxy 拦截 new，强制返回同一实例
 *   4. 通用工厂：getSingle(fn) 包装任意构造器
 */

// 方式1：闭包版（透明单例）
function Singleton(fn) {
  let instance = null;
  return function (...args) {
    if (!instance) {
      instance = fn(...args);
    }
    return instance;
  };
}

// 方式2：构造函数静态属性
function Logger(name) {
  if (Logger.instance) {
    return Logger.instance;
  }
  this.name = name;
  this.logs = [];
  Logger.instance = this;
}
Logger.instance = null;

// 方式3：通用工厂 getSingle
function getSingle(fn) {
  let instance;
  return function (...args) {
    if (!instance) {
      instance = new fn(...args);
    }
    return instance;
  };
}

// 方式4：Proxy 拦截构造
function singletonProxy(Constructor) {
  let instance;
  return new Proxy(Constructor, {
    construct(target, args, newTarget) {
      if (!instance) {
        instance = Reflect.construct(target, args, newTarget);
      }
      return instance;
    },
  });
}

// ===== 测试 =====

// 方式1：闭包单例
const createDb = Singleton(function (config) {
  return { config, query: (sql) => `result of ${sql}` };
});
const db1 = createDb({ host: "localhost" });
const db2 = createDb({ host: "other" }); // 已有实例，忽略参数
console.log("闭包单例:", db1 === db2); // true
console.log(db2.config.host); // 'localhost'（第一次的配置）

// 方式2：静态属性
const log1 = new Logger("app");
const log2 = new Logger("other");
console.log("静态属性单例:", log1 === log2); // true
console.log(log2.name); // 'app'

// 方式3：通用工厂
class Config {
  constructor(env) {
    this.env = env;
  }
}
const getConfig = getSingle(Config);
const c1 = getConfig("prod");
const c2 = getConfig("dev");
console.log("工厂单例:", c1 === c2); // true
console.log(c2.env); // 'prod'

// 方式4：Proxy 单例
const SingleStore = singletonProxy(
  class {
    constructor(state = {}) {
      this.state = state;
    }
  },
);
const s1 = new SingleStore({ count: 0 });
const s2 = new SingleStore({ count: 999 });
console.log("Proxy 单例:", s1 === s2); // true
console.log(s2.state.count); // 0

// 应用：全局状态管理
const createStore = getSingle(
  class {
    constructor() {
      this.state = {};
      this.listeners = [];
    }
    set(key, value) {
      this.state[key] = value;
      this.listeners.forEach((fn) => fn(this.state));
    }
    subscribe(fn) {
      this.listeners.push(fn);
    }
  },
);
const storeA = createStore();
const storeB = createStore();
storeA.set("user", "Tom");
console.log("共享状态:", storeB.state.user); // 'Tom'
console.log("同一实例:", storeA === storeB); // true

// 应用：单例弹窗（只创建一次 DOM）
let createCount = 0;
const getModal = getSingle(function () {
  createCount++;
  return { show: () => "modal shown", id: Date.now() };
});
getModal();
getModal();
getModal();
console.log("弹窗创建次数:", createCount); // 1
