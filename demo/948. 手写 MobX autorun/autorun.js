/**
 * 手写 MobX autorun
 *
 * autorun(fn)：自动运行 fn，并在 fn 读取的任何 observable 变化时重新运行。
 *
 * 关键机制：依赖收集 + 依赖清理
 * - 运行 fn 前，将 fn 设为 currentObserver
 * - fn 执行过程中读取 observable 属性时，自动建立依赖关系
 * - fn 执行完毕，清除 currentObserver
 * - 当依赖的属性变化时，重新运行 fn（先清理旧依赖，再重新收集）
 *
 * 依赖清理：每次重新运行前，先移除上一次收集的依赖，
 * 这样当 fn 因条件分支不再读取某属性时，该属性变化就不会再触发 fn。
 */

/**
 * 当前正在追踪的观察者
 */
let currentObserver = null;

/**
 * 当前观察者的"清理函数列表"
 * 每次 get 建立依赖时，同时记录一个清理函数，用于将来移除该依赖
 */
let currentCleaners = null;

/**
 * observable：将普通对象转换为可观察对象
 * @param {Object} target - 目标对象
 * @returns {Proxy} 可观察的代理对象
 */
function observable(target) {
  const observers = new Map();
  return new Proxy(target, {
    get(obj, key) {
      if (currentObserver) {
        if (!observers.has(key)) observers.set(key, new Set());
        const set = observers.get(key);
        set.add(currentObserver);
        // 记录清理函数：将来可从该属性的观察者集合中移除 currentObserver
        if (currentCleaners) {
          currentCleaners.push(() => set.delete(currentObserver));
        }
      }
      return obj[key];
    },
    set(obj, key, value) {
      if (obj[key] === value) return true;
      obj[key] = value;
      if (observers.has(key)) {
        observers.get(key).forEach((observer) => observer());
      }
      return true;
    },
  });
}

/**
 * autorun：自动追踪依赖并响应变化
 * @param {Function} fn - 要自动运行的函数
 * @returns {Function} 销毁函数，调用后不再响应变化
 */
function autorun(fn) {
  let isRunning = true;
  let cleaners = []; // 本次运行收集的清理函数

  // reaction 是真正的观察者回调
  const reaction = () => {
    if (!isRunning) return;

    // 1. 清理上一次的依赖（移除旧的观察者注册）
    cleaners.forEach((c) => c());
    cleaners = [];

    // 2. 设置当前观察者，开始收集新依赖
    currentObserver = reaction;
    currentCleaners = cleaners;
    try {
      fn();
    } finally {
      // 3. 收集完毕，清除当前观察者
      currentObserver = null;
      currentCleaners = null;
    }
  };

  // 首次运行，建立初始依赖
  reaction();

  // 返回销毁函数
  return () => {
    isRunning = false;
    cleaners.forEach((c) => c());
    cleaners = [];
  };
}

// ===== 测试用例 =====

console.log("===== MobX autorun 测试 =====\n");

const person = observable({
  firstName: "张",
  lastName: "三",
  age: 20,
});

console.log("--- 1. autorun 会立即执行一次 ---");
autorun(() => {
  console.log(`[autorun] 姓名: ${person.firstName}${person.lastName}`);
});
// 输出：[autorun] 姓名: 张三

console.log("\n--- 2. 修改依赖属性，autorun 重新执行 ---");
person.firstName = "李";
// 输出：[autorun] 姓名: 李三
person.lastName = "四";
// 输出：[autorun] 姓名: 李四

console.log("\n--- 3. 修改非依赖属性，autorun 不执行 ---");
person.age = 21;
console.log("（修改 age，上面无输出，因为 autorun 没读 age）");

console.log("\n--- 4. 动态依赖：条件分支 ---");
const toggle = observable({ showAge: false });
autorun(() => {
  if (toggle.showAge) {
    // 此分支读取了 person.age
    console.log(`[autorun2] 年龄: ${person.age}`);
  } else {
    console.log("[autorun2] 年龄已隐藏");
  }
});

console.log("\n切换 showAge=true:");
toggle.showAge = true;
// 输出：[autorun2] 年龄: 21

console.log("\n此时修改 age，应触发 autorun2（因为现在它依赖 age）:");
person.age = 22;
// 输出：[autorun2] 年龄: 22

console.log("\n--- 5. 销毁 autorun ---");
const disposer = autorun(() => {
  console.log(`[autorun3] age = ${person.age}`);
});
console.log("销毁 autorun3...");
disposer();
person.age = 30;
console.log("（修改 age=30，autorun3 已销毁，不再执行）");

console.log("\n--- 6. 销毁后依赖被清理 ---");
// 重新开启 showAge 让 autorun2 重新依赖 age，验证清理是否正常
console.log("当前 age =", person.age);
