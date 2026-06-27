/**
 * 手写 MobX computed
 *
 * computed（计算属性）：从 observable 派生的值，具有缓存特性。
 * - 只有当依赖的 observable 变化时才重新计算
 * - 多次读取若依赖未变，直接返回缓存值（不重复计算）
 *
 * computed 既是"观察者"也是"被观察者"：
 * - 作为观察者：它依赖若干 observable，依赖变化时标记为脏（dirty）
 * - 作为被观察者：其他 autorun 可以依赖它，它变脏时通知它们重新运行
 *
 * 实现：
 * - dirty 标志：标记缓存是否过期
 * - subscribers：依赖此 computed 的 reactions 集合
 * - computedObserver：当依赖变化时被触发，标记 dirty 并通知 subscribers
 */

let currentObserver = null;
let currentCleaners = null;

/**
 * observable：可观察对象
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
        observers.get(key).forEach((observer) => observer());
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
 * computed：创建带缓存的计算属性
 * @param {Function} getter - 计算函数，返回派生值
 * @returns {{ get value(): * }} 包含 value getter 的对象
 */
function computed(getter) {
  let cachedValue; // 缓存的值
  let dirty = true; // 是否需要重新计算
  const subscribers = new Set(); // 依赖此 computed 的 reactions
  let cleaners = []; // computed 自身依赖的清理函数

  /**
   * computedObserver：当依赖的 observable 变化时被触发
   * 标记为脏，并通知所有订阅者
   */
  const computedObserver = () => {
    if (!dirty) {
      dirty = true;
      subscribers.forEach((fn) => fn());
    }
  };

  /**
   * 重新计算：清理旧依赖，重新收集，执行 getter
   */
  function recompute() {
    // 清理上次依赖
    cleaners.forEach((c) => c());
    cleaners = [];

    // 切换观察者为 computedObserver，收集 getter 的依赖
    const prevObserver = currentObserver;
    const prevCleaners = currentCleaners;
    currentObserver = computedObserver;
    currentCleaners = cleaners;
    try {
      cachedValue = getter();
    } finally {
      currentObserver = prevObserver;
      currentCleaners = prevCleaners;
    }
    dirty = false;
  }

  return {
    /**
     * 读取计算属性值
     * - 若有外部观察者（currentObserver），将其登记为订阅者
     * - 若缓存过期（dirty），重新计算
     */
    get value() {
      // 外部观察者订阅此 computed
      if (currentObserver) {
        subscribers.add(currentObserver);
        if (currentCleaners) {
          currentCleaners.push(() => subscribers.delete(currentObserver));
        }
      }
      // 缓存过期则重新计算
      if (dirty) {
        recompute();
      }
      return cachedValue;
    },
  };
}

// ===== 测试用例 =====

console.log("===== MobX computed 测试 =====\n");

// 可观察对象
const person = observable({
  firstName: "张",
  lastName: "三",
  age: 20,
});

// 用于统计计算次数
let computeCount = 0;

// 计算属性：fullName 由 firstName + lastName 派生
const fullName = computed(() => {
  computeCount++;
  console.log(`  [computed 内部] 正在计算 fullName... (第 ${computeCount} 次)`);
  return `${person.firstName} ${person.lastName}`;
});

console.log("--- 1. autorun 依赖 computed ---");
autorun(() => {
  console.log("[autorun] 全名:", fullName.value);
});
// 输出：[computed 内部] 正在计算...  [autorun] 全名: 张 三

console.log("\n--- 2. 修改 firstName，computed 重新计算 ---");
person.firstName = "李";
// 输出：[computed 内部] 正在计算...  [autorun] 全名: 李 三

console.log("\n--- 3. 修改 lastName，computed 重新计算 ---");
person.lastName = "四";
// 输出：[computed 内部] 正在计算...  [autorun] 全名: 李 四

console.log("\n--- 4. 修改非依赖属性 age，computed 不重新计算 ---");
person.age = 21;
console.log("（修改 age，computed 不依赖它，不重新计算，autorun 也不执行）");

console.log("\n--- 5. 缓存验证：多次读取 fullName.value 不重复计算 ---");
console.log("读取 1:", fullName.value);
console.log("读取 2:", fullName.value);
console.log("读取 3:", fullName.value);
console.log(
  `总计算次数: ${computeCount}（上面三次读取未增加计算次数，使用缓存）`,
);

console.log("\n--- 6. 链式 computed：computed 依赖另一个 computed ---");
let computeCount2 = 0;
const greeting = computed(() => {
  computeCount2++;
  console.log(
    `  [computed 内部] 正在计算 greeting... (第 ${computeCount2} 次)`,
  );
  return `Hello, ${fullName.value}!`;
});

autorun(() => {
  console.log("[autorun2] 问候:", greeting.value);
});

console.log("\n修改 firstName，两个 computed 都重新计算:");
person.firstName = "王";
// fullName 重新计算 -> greeting 重新计算 -> autorun2 执行

console.log("\n--- 7. 多个 autorun 依赖同一 computed ---");
autorun(() => {
  console.log("[autorun3] 全名长度:", fullName.value.length);
});

console.log("\n再次修改 lastName:");
person.lastName = "五";
// fullName 重新计算一次，通知 autorun、autorun2、autorun3
console.log(`\nfullName 计算总次数: ${computeCount}`);
console.log(`greeting 计算总次数: ${computeCount2}`);
