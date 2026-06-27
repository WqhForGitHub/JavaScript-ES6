/**
 * 手写 MobX observable
 *
 * MobX 的核心理念：通过 observable 包装数据，使得数据的读取可以被追踪（依赖收集），
 * 数据的修改可以通知所有观察者（响应式更新）。
 *
 * 实现方式：使用 ES6 Proxy 拦截对象的 get / set 操作
 * - get：如果当前有正在追踪的观察者（currentObserver），记录它对该属性的依赖
 * - set：修改值后，通知所有依赖该属性的观察者
 *
 * 本文件实现基础的 observable 与简易 observe，演示响应式机制。
 * （autorun 的自动依赖收集在下一个文件实现）
 */

/**
 * 全局变量：当前正在追踪的观察者函数
 * 在读取 observable 属性时，会把它登记为该属性的依赖
 */
let currentObserver = null;

/**
 * observable：将普通对象转换为可观察对象
 * @param {Object} target - 目标对象
 * @returns {Proxy} 可观察的代理对象
 */
function observable(target) {
  // observers：记录每个属性被哪些观察者依赖
  // 结构：Map<key, Set<observer>>
  const observers = new Map();

  return new Proxy(target, {
    // 读取属性：收集依赖
    get(obj, key) {
      if (currentObserver) {
        if (!observers.has(key)) {
          observers.set(key, new Set());
        }
        observers.get(key).add(currentObserver);
      }
      return obj[key];
    },
    // 修改属性：通知观察者
    set(obj, key, value) {
      // 值未变化则跳过通知
      if (obj[key] === value) return true;
      obj[key] = value;
      // 通知所有依赖该属性的观察者
      if (observers.has(key)) {
        observers.get(key).forEach((observer) => observer());
      }
      return true;
    },
  });
}

/**
 * observe：简易观察函数，注册对某对象某属性的监听
 * 通过设置 currentObserver 并读取属性来建立依赖关系。
 * 注意：这是基础版，依赖在注册时收集一次，不随执行动态更新。
 * （动态依赖收集由 autorun 实现，见下一个文件）
 * @param {Object} obj - 可观察对象
 * @param {string} key - 要观察的属性
 * @param {Function} callback - 属性变化时的回调
 */
function observe(obj, key, callback) {
  currentObserver = callback;
  obj[key]; // 触发 get，建立依赖
  currentObserver = null;
}

// ===== 测试用例 =====

console.log("===== MobX observable 测试 =====\n");

// 1. 创建可观察对象
const state = observable({
  name: "Alice",
  age: 25,
  email: "alice@example.com",
});

// 2. 注册观察
console.log("--- 注册观察 ---");
observe(state, "name", () => console.log("[观察 name] name 变了:", state.name));
observe(state, "age", () => console.log("[观察 age] age 变了:", state.age));

// 3. 修改属性触发回调
console.log("\n--- 修改 name ---");
state.name = "Bob"; // 触发 name 的观察者

console.log("\n--- 修改 age ---");
state.age = 26; // 触发 age 的观察者

// 4. 修改未观察的属性不会触发任何回调
console.log("\n--- 修改未观察的 email ---");
state.email = "bob@example.com";
console.log("（上面无输出，说明 email 变化不影响其他观察者）");

// 5. 同一属性可以有多个观察者
console.log("\n--- 多个观察者观察同一属性 ---");
observe(state, "age", () =>
  console.log("[另一个 age 观察者] age 现在是:", state.age),
);

console.log("修改 age=30，两个观察者都应触发:");
state.age = 30;

// 6. 设置相同值不会触发回调
console.log("\n--- 设置相同值不触发 ---");
console.log("再次设置 age=30（值未变化）:");
state.age = 30;
console.log("（上面无输出，值未变化被跳过）");

console.log("\n当前状态:", {
  name: state.name,
  age: state.age,
  email: state.email,
});

console.log("\n说明：本实现为基础版，支持浅层对象属性的追踪。");
console.log("嵌套对象需要递归调用 observable，此处从略。");
console.log("自动依赖收集与响应式重运行由 autorun 实现，见下一个文件。");
