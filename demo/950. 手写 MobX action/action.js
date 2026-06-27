/**
 * 手写 MobX action
 *
 * MobX 的 action 用于批处理多个 observable 的修改（事务/transaction），
 * 使得所有相关的 reaction（如 autorun）在 action 结束后只运行一次，
 * 而不是每次修改都运行一次。这能避免中间状态的冗余计算。
 *
 * 实现原理：
 * - 维护全局的 batching 状态和待执行的 reactions 集合
 * - 在 action 内修改 observable 时，不立即执行 reaction，而是加入待执行集合
 * - action 结束时，统一执行所有待执行的 reactions（用 Set 去重，保证每个 reaction 只运行一次）
 *
 * 对比：
 * - 不用 action：a=1; b=2; -> autorun 运行两次
 * - 用 action：  action(() => { a=1; b=2; })() -> autorun 只运行一次
 */

let currentObserver = null;
let currentCleaners = null;

/**
 * batching 状态
 */
let isBatching = false;
const pendingReactions = new Set();

/**
 * observable：可观察对象（支持 batching）
 */
function observable(target) {
  const observers = new Map();
  return new Proxy(target, {
    get(obj, key) {
      if (currentObserver) {
        if (!observers.has(key)) observers.set(key, new Set());
        const set = observers.get(key);
        set.add(currentObserver);
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
        observers.get(key).forEach((observer) => {
          if (isBatching) {
            // 批处理中：暂存 reaction，稍后统一执行
            pendingReactions.add(observer);
          } else {
            // 非批处理：立即执行
            observer();
          }
        });
      }
      return true;
    },
  });
}

/**
 * autorun：自动追踪依赖
 */
function autorun(fn) {
  let isRunning = true;
  let cleaners = [];
  const reaction = () => {
    if (!isRunning) return;
    cleaners.forEach((c) => c());
    cleaners = [];
    currentObserver = reaction;
    currentCleaners = cleaners;
    try {
      fn();
    } finally {
      currentObserver = null;
      currentCleaners = null;
    }
  };
  reaction();
  return () => {
    isRunning = false;
    cleaners.forEach((c) => c());
    cleaners = [];
  };
}

/**
 * action：批处理包装器
 * 将多个 observable 修改合并为一个事务，reaction 只在事务结束后运行一次
 * @param {Function} fn - 包含多个修改操作的函数
 * @returns {Function} 包装后的函数
 */
function action(fn) {
  return function (...args) {
    startBatch();
    try {
      return fn.apply(this, args);
    } finally {
      endBatch();
    }
  };
}

/**
 * 开始批处理
 */
function startBatch() {
  isBatching = true;
}

/**
 * 结束批处理：执行所有暂存的 reactions
 */
function endBatch() {
  isBatching = false;
  // 复制后清空，防止 reaction 执行过程中又触发新的修改造成无限循环
  const reactions = [...pendingReactions];
  pendingReactions.clear();
  reactions.forEach((reaction) => reaction());
}

/**
 * runInAction：直接运行一段批处理代码（无需预先定义 action）
 * @param {Function} fn - 要批处理执行的函数
 */
function runInAction(fn) {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

// ===== 测试用例 =====

console.log("===== MobX action 测试 =====\n");

const store = observable({
  firstName: "张",
  lastName: "三",
  age: 20,
});

// 统计 autorun 运行次数
let runCount = 0;

autorun(() => {
  runCount++;
  console.log(
    `[autorun 运行 #${runCount}] ${store.firstName}${store.lastName}, 年龄 ${store.age}`,
  );
});
// 输出运行 #1

console.log("\n--- 1. 不使用 action，逐个修改 ---");
console.log("修改 firstName, lastName, age 三个属性:");
store.firstName = "李";
store.lastName = "四";
store.age = 21;
console.log(`autorun 总共运行 ${runCount} 次（每次修改都触发，共触发 3 次）`);

console.log("\n--- 2. 使用 action，批量修改 ---");
const beforeCount = runCount;

const updatePerson = action(() => {
  store.firstName = "王";
  store.lastName = "五";
  store.age = 22;
});

console.log("调用 action 同时修改三个属性:");
updatePerson();
console.log(
  `autorun 在 action 期间只运行了 ${runCount - beforeCount} 次（批量合并为一次）`,
);

console.log("\n--- 3. action 内部可包含逻辑 ---");
const beforeCount2 = runCount;

const birthdayAndRename = action((newName) => {
  store.age = store.age + 1; // 先读取再修改（读取在批处理中也正常收集依赖）
  store.firstName = newName;
  store.lastName = "六";
});

birthdayAndRename("赵");
console.log(`action 后 autorun 运行 ${runCount - beforeCount2} 次（仅一次）`);

console.log("\n--- 4. runInAction：内联批处理 ---");
const beforeCount3 = runCount;
runInAction(() => {
  store.firstName = "钱";
  store.lastName = "七";
  store.age = 30;
});
console.log(
  `runInAction 后 autorun 运行 ${runCount - beforeCount3} 次（仅一次）`,
);

console.log("\n--- 5. action 中间状态不被 reaction 观察 ---");
// 没有 action 时，中间状态会触发 reaction；有 action 时只看到最终状态
const beforeCount4 = runCount;
runInAction(() => {
  store.age = 100; // 中间状态
  store.age = 200; // 中间状态
  store.age = 250; // 最终状态
});
console.log(`多次修改同一属性，autorun 只运行 ${runCount - beforeCount4} 次`);
console.log("最终年龄:", store.age, "(只观察到最终值 250)");

console.log("\n--- 6. 验证 action 外的修改仍立即触发 ---");
const beforeCount5 = runCount;
store.age = 40;
console.log(`action 外单次修改触发 ${runCount - beforeCount5} 次`);

console.log(`\nautorun 总运行次数: ${runCount}`);
console.log("\n结论：action 通过批处理避免了中间状态的冗余 reaction，");
console.log("在批量更新场景下显著提升性能。");
