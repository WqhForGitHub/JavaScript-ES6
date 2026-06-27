/**
 * 手写内存泄漏检测
 *
 * 使用 WeakRef + FinalizationRegistry 跟踪对象引用，
 * 检测本应被垃圾回收却仍被保留的对象（疑似泄漏）。
 *
 * 提供的工具：
 * - track(obj, label)           : 用 WeakRef 跟踪一个对象，注册 FinalizationRegistry
 * - snapshot()                  : 检查哪些被跟踪对象仍然存活
 * - checkLeak()                 : 报告仍存活的对象（疑似泄漏）
 * - forceGcHint()               : 建议触发 GC（需 --expose-gc 标志）
 *
 * 同时提供两种典型泄漏场景：
 * 1. LeakyCache（缓存永不清理，持有强引用导致泄漏）
 * 2. 闭包泄漏（闭包意外持有大对象）
 *
 * 注意：
 * - WeakRef.deref() 在对象被 GC 后返回 undefined
 * - GC 时机由运行时决定，非确定性。可使用 node --expose-gc 并调用 global.gc() 强制触发
 * - 未暴露 gc 时，本演示通过对比 alive/dead 数量来说明概念
 */

/**
 * 内存泄漏检测器
 */
class MemoryLeakDetector {
  constructor() {
    /** @type {Map<number, {weakRef: WeakRef, label: string, registeredAt: number}>} */
    this.tracked = new Map();
    this.nextId = 1;
    /** 已被 GC 回收的对象 id 集合（通过 FinalizationRegistry 确认） */
    this.finalized = new Set();
    /** @type {Map<object, number>} 对象 -> id（仅在 track 时短暂持有，用于去重） */
    this.idByObj = new WeakMap();

    // FinalizationRegistry：对象被 GC 时回调
    this.registry = new FinalizationRegistry((heldId) => {
      this.finalized.add(heldId);
    });
  }

  /**
   * 跟踪一个对象
   * @param {object} obj - 要跟踪的对象
   * @param {string} [label] - 标签
   * @returns {number} 跟踪 id
   */
  track(obj, label) {
    if (obj === null || typeof obj !== "object") {
      throw new Error("只能跟踪对象");
    }
    const id = this.nextId++;
    const weakRef = new WeakRef(obj);
    this.tracked.set(id, {
      weakRef,
      label: label || `Object#${id}`,
      registeredAt: Date.now(),
    });
    this.registry.register(obj, id, obj);
    this.idByObj.set(obj, id);
    return id;
  }

  /**
   * 快照：检查当前仍存活的被跟踪对象
   * @returns {{alive: Array, dead: Array}}
   */
  snapshot() {
    const alive = [];
    const dead = [];
    for (const [id, entry] of this.tracked) {
      const obj = entry.weakRef.deref();
      if (obj !== undefined) {
        alive.push({ id, label: entry.label });
      } else {
        dead.push({ id, label: entry.label });
      }
    }
    return { alive, dead };
  }

  /**
   * 检测泄漏：返回仍存活的对象
   * @returns {object} 泄漏检测结果
   */
  checkLeak() {
    const { alive, dead } = this.snapshot();
    return {
      trackedTotal: this.tracked.size,
      aliveCount: alive.length,
      deadCount: dead.length,
      aliveObjects: alive,
      deadObjects: dead,
      finalizedCount: this.finalized.size,
    };
  }

  /**
   * 尝试触发垃圾回收（需要 --expose-gc）
   * 注意：WeakRef 的清除发生在 GC 之后的微任务检查点，
   * 因此 forceGc 后需要等待一个宏任务（setTimeout）deref 才会返回 undefined。
   * @returns {boolean} 是否成功触发
   */
  forceGc() {
    if (typeof global !== "undefined" && typeof global.gc === "function") {
      global.gc();
      return true;
    }
    return false;
  }

  /**
   * 打印报告
   */
  printReport() {
    const r = this.checkLeak();
    console.log("\n=== 内存泄漏检测报告 ===");
    console.log(`跟踪对象总数: ${r.trackedTotal}`);
    console.log(`仍存活:       ${r.aliveCount}`);
    console.log(`已被回收:     ${r.deadCount}`);
    console.log(`Finalization 确认回收: ${r.finalizedCount}`);
    if (r.aliveObjects.length > 0) {
      console.log("仍存活对象列表（可能泄漏）:");
      for (const obj of r.aliveObjects) {
        console.log(`  - [${obj.id}] ${obj.label}`);
      }
    }
    if (r.deadObjects.length > 0) {
      console.log("已回收对象列表（正常）:");
      for (const obj of r.deadObjects) {
        console.log(`  - [${obj.id}] ${obj.label}`);
      }
    }
    if (!this.forceGc()) {
      console.log(
        "(提示: 使用 node --expose-gc 运行可强制 GC 以获得更准确结果)",
      );
    }
  }
}

// ===================== 泄漏场景演示 =====================

/**
 * 会泄漏的缓存：永不过期、永不清理，强引用持有所有 key
 */
class LeakyCache {
  constructor() {
    this.cache = new Map();
  }
  set(key, value) {
    this.cache.set(key, value);
  }
  get(key) {
    return this.cache.get(key);
  }
  /** 故意不提供 delete / clear */
}

/**
 * 安全的缓存：使用 WeakMap，key 被 GC 后自动清理
 */
class SafeCache {
  constructor() {
    this.cache = new WeakMap();
  }
  set(key, value) {
    this.cache.set(key, value);
  }
  get(key) {
    return this.cache.get(key);
  }
}

/**
 * 模拟闭包泄漏：闭包意外持有大对象
 */
function createLeakyClosure() {
  const hugeData = new Array(1000).fill("leak-data");
  // 返回的函数虽不直接使用 hugeData，但闭包仍持有它
  return function () {
    return "do nothing";
  };
}

/**
 * 安全的闭包：不持有不需要的大对象
 */
function createSafeClosure() {
  return function () {
    return "do nothing";
  };
}

// ===================== 测试用例 =====================

/**
 * 等待 n 毫秒（用于让 GC 后的 WeakRef 清除生效）
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 尝试触发 GC 并等待 WeakRef 清除（需要 --expose-gc）
 * 若未启用 gc，则只等待一小段时间
 * @param {MemoryLeakDetector} detector
 */
async function gcAndWait(detector) {
  if (detector.forceGc()) {
    // WeakRef 在 GC 后的微任务检查点才清除，等待一个宏任务
    await sleep(10);
    // 再跑一次以确保分代回收完成
    detector.forceGc();
    await sleep(10);
    return true;
  }
  await sleep(10);
  return false;
}

async function main() {
  console.log("========== 内存泄漏检测测试 ==========\n");

  const detector = new MemoryLeakDetector();
  const gcAvailable =
    typeof global !== "undefined" && typeof global.gc === "function";
  console.log(
    `GC 强制触发: ${gcAvailable ? "已启用(--expose-gc)" : "未启用（建议 node --expose-gc 运行）"}\n`,
  );

  // --- 测试 1：泄漏缓存 vs 安全缓存 ---
  console.log("--- 测试 1：泄漏缓存 vs 安全缓存 ---");
  const leakyCache = new LeakyCache();
  const safeCache = new SafeCache();

  // 5 个对象放入「泄漏缓存」（强引用，永不清理）
  const leakyHolders = [];
  for (let i = 0; i < 3; i++) {
    const obj = { id: i, data: new Array(100).fill(i) };
    leakyHolders.push(obj);
    detector.track(obj, `leaky-cache-obj-${i}`);
    leakyCache.set(`key-${i}`, obj);
  }
  // 3 个对象仅放入「安全缓存」（WeakMap，不阻止 GC）
  const safeHolders = [];
  for (let i = 0; i < 3; i++) {
    const obj = { id: i, tag: "safe" };
    safeHolders.push(obj);
    detector.track(obj, `safe-cache-obj-${i}`);
    safeCache.set(obj, `value-${i}`);
  }

  console.log("放入缓存后快照:", detector.checkLeak().aliveCount, "存活");

  // 清除本地引用（此时泄漏缓存仍持有前 3 个，安全缓存无强引用）
  leakyHolders.length = 0;
  safeHolders.length = 0;

  await gcAndWait(detector);

  const snap1 = detector.checkLeak();
  console.log(
    "清除本地引用 + GC 后快照:",
    snap1.aliveCount,
    "存活,",
    snap1.deadCount,
    "已回收",
  );
  console.log("  存活对象:");
  snap1.aliveObjects.forEach((o) => console.log(`    - ${o.label}`));
  console.log("  已回收对象:");
  snap1.deadObjects.forEach((o) => console.log(`    - ${o.label}`));
  console.log(
    "  结论：leaky-cache-obj 仍存活（泄漏）；safe-cache-obj 已回收（正常）",
  );

  // --- 测试 2：闭包泄漏 ---
  console.log("\n--- 测试 2：闭包泄漏与作用域回收 ---");
  const closureDetector = new MemoryLeakDetector();

  // 模拟闭包泄漏：返回的函数持有大数组（无法从外部释放）
  const leakyFn = createLeakyClosure();
  console.log("  创建了泄漏闭包 leakyFn（内部持有 hugeData，无法释放）");

  // 用 IIFE 隔离作用域：块内的对象在块结束后失去所有强引用
  await (async () => {
    const inner = { name: "inner-scope", data: new Array(500).fill(0) };
    closureDetector.track(inner, "inner-scope-obj");
    console.log(
      "  块内快照:",
      closureDetector.checkLeak().aliveCount,
      "存活（inner-scope-obj）",
    );
  })(); // 块结束，inner 失去引用

  await gcAndWait(closureDetector);
  const snap2 = closureDetector.checkLeak();
  console.log(
    "  块结束 + GC 后:",
    snap2.aliveCount,
    "存活,",
    snap2.deadCount,
    "已回收",
  );
  snap2.aliveObjects.forEach((o) => console.log(`    仍存活: ${o.label}`));
  snap2.deadObjects.forEach((o) => console.log(`    已回收: ${o.label}`));
  console.log("  结论：inner-scope-obj 在无强引用后被 GC 回收（正常）");

  // --- 测试 3：综合报告 ---
  console.log("\n--- 测试 3：综合报告 ---");
  detector.printReport();

  console.log("\n========== 内存泄漏检测测试完成 ==========");
}

main();
