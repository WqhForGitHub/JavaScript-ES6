/**
 * 手写快照测试 (Snapshot Testing)
 * ===============================
 *
 * 概念说明:
 * 快照测试 (Snapshot Testing) 是一种测试方式: 首次运行时把被测数据序列化后保存为
 * "快照", 之后每次运行将当前输出与已存快照对比, 不一致则报告差异.
 *
 * 典型用途:
 * - 测试 UI 组件渲染结果是否发生变化
 * - 测试序列化输出 (配置、API 响应) 的稳定性
 * - 回归测试: 任何意外改动都会被快照差异捕获
 *
 * 核心流程:
 * 1. toMatchSnapshot(value): 把 value 序列化为稳定字符串
 * 2. 查找已存快照:
 *    - 不存在 -> 写入快照 (首次运行, 标记为 "created")
 *    - 存在 -> 对比: 相同则通过, 不同则报告 diff
 * 3. updateSnapshots 选项: 用当前值覆盖旧快照 (用于确认变更合法后更新)
 *
 * 本实现要点:
 * - 用 stableStringify 保证对象键顺序稳定, 避免因键顺序不同导致误报
 * - 用 in-memory Map 模拟 "快照文件"
 * - 提供 unified diff (基于 LCS) 展示行级差异
 */

"use strict";

/**
 * 稳定序列化: 对象键按字典序排序, 保证相同内容产生相同字符串
 */
function stableStringify(value, space = 2) {
  const seen = new WeakSet();
  const helper = (val) => {
    if (val === null || typeof val !== "object") {
      return JSON.stringify(val);
    }
    if (seen.has(val)) throw new Error("检测到循环引用");
    seen.add(val);
    if (Array.isArray(val)) {
      return "[" + val.map(helper).join(",") + "]";
    }
    const keys = Object.keys(val).sort();
    const pairs = keys.map((k) => JSON.stringify(k) + ": " + helper(val[k]));
    return "{" + pairs.join(", ") + "}";
  };
  return helper(value);
}

/**
 * 基于最长公共子序列 (LCS) 的行级 diff
 * @param {string} a
 * @param {string} b
 * @returns {string} 差异描述
 */
function lineDiff(a, b) {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const m = aLines.length;
  const n = bLines.length;

  // 构造 LCS 表
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        aLines[i] === bLines[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // 回溯生成 diff
  const out = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (aLines[i] === bLines[j]) {
      out.push("  " + aLines[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push("- " + aLines[i]); // 旧行被删除
      i++;
    } else {
      out.push("+ " + bLines[j]); // 新行被新增
      j++;
    }
  }
  while (i < m) out.push("- " + aLines[i++]);
  while (j < n) out.push("+ " + bLines[j++]);
  return out.join("\n");
}

/**
 * 快照测试运行器
 * 通过 Map 模拟快照文件存储.
 */
class SnapshotRunner {
  /**
   * @param {object} [options]
   * @param {boolean} [options.updateSnapshots] - 是否强制更新所有快照
   */
  constructor(options = {}) {
    this.updateSnapshots = options.updateSnapshots || false;
    /** @type {Map<string, string>} 模拟快照文件: 测试名 -> 序列化值 */
    this.snapshots = new Map();
    this.results = [];
  }

  /**
   * 断言: 当前值与已存快照匹配
   * @param {string} name - 测试名 (快照键)
   * @param {*} value - 被测值
   * @returns {{passed: boolean, status: string, diff?: string}}
   */
  toMatchSnapshot(name, value) {
    const serialized = stableStringify(value);

    // 强制更新模式: 直接覆盖
    if (this.updateSnapshots) {
      const existed = this.snapshots.has(name);
      this.snapshots.set(name, serialized);
      const status = existed ? "updated" : "created";
      const result = { name, passed: true, status };
      this.results.push(result);
      return result;
    }

    // 首次运行: 创建快照
    if (!this.snapshots.has(name)) {
      this.snapshots.set(name, serialized);
      const result = { name, passed: true, status: "created" };
      this.results.push(result);
      return result;
    }

    // 后续运行: 对比
    const stored = this.snapshots.get(name);
    if (stored === serialized) {
      const result = { name, passed: true, status: "matched" };
      this.results.push(result);
      return result;
    }

    // 不匹配, 生成 diff
    const result = {
      name,
      passed: false,
      status: "mismatched",
      diff: lineDiff(stored, serialized),
    };
    this.results.push(result);
    return result;
  }

  /**
   * 打印测试总结
   */
  summary() {
    const counts = this.results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    return {
      total: this.results.length,
      passed: this.results.filter((r) => r.passed).length,
      failed: this.results.filter((r) => !r.passed).length,
      detail: counts,
    };
  }
}

// ============================================================
// 测试与演示
// ============================================================

console.log("========== 快照测试演示 ==========\n");

// ---- 场景 1: 首次运行, 创建快照 ----
console.log("--- 场景 1: 首次运行 ---");
const runner1 = new SnapshotRunner();

const userProfile = {
  id: 42,
  name: "Alice",
  email: "alice@example.com",
  roles: ["admin", "editor"],
  settings: { theme: "dark", notifications: true },
};

let r = runner1.toMatchSnapshot("userProfile", userProfile);
console.log("userProfile:", r.status, r.passed ? "PASS" : "FAIL");

r = runner1.toMatchSnapshot("simpleString", "Hello, Snapshot!");
console.log("simpleString:", r.status, r.passed ? "PASS" : "FAIL");

r = runner1.toMatchSnapshot("numberValue", 3.14159);
console.log("numberValue:", r.status, r.passed ? "PASS" : "FAIL");

console.log("快照存储条数:", runner1.snapshots.size);
console.log("总结:", runner1.summary());

// ---- 场景 2: 后续运行, 值未变, 应通过 ----
console.log("\n--- 场景 2: 第二次运行, 值未变化 ---");
const runner2 = new SnapshotRunner();
// 模拟已存在快照 (复用 runner1 的快照)
runner2.snapshots = new Map(runner1.snapshots);

const sameProfile = {
  // 键顺序故意打乱, 验证稳定序列化
  settings: { notifications: true, theme: "dark" },
  roles: ["admin", "editor"],
  email: "alice@example.com",
  name: "Alice",
  id: 42,
};

r = runner2.toMatchSnapshot("userProfile", sameProfile);
console.log("userProfile:", r.status, r.passed ? "PASS" : "FAIL");
console.log("(键顺序不同但内容相同, 仍通过)");

r = runner2.toMatchSnapshot("simpleString", "Hello, Snapshot!");
console.log("simpleString:", r.status, r.passed ? "PASS" : "FAIL");

console.log("总结:", runner2.summary());

// ---- 场景 3: 值发生变化, 应报告差异 ----
console.log("\n--- 场景 3: 值发生变化, 报告差异 ---");
const runner3 = new SnapshotRunner();
runner3.snapshots = new Map(runner1.snapshots);

const changedProfile = {
  id: 42,
  name: "Alice Cooper", // 修改了名字
  email: "alice@example.com",
  roles: ["admin", "editor", "viewer"], // 增加了角色
  settings: { theme: "light", notifications: true }, // 主题改为 light
};

r = runner3.toMatchSnapshot("userProfile", changedProfile);
console.log("userProfile:", r.status, r.passed ? "PASS" : "FAIL");
console.log("差异 (diff):");
console.log(r.diff);

console.log("\nsimpleString 改变:");
r = runner3.toMatchSnapshot("simpleString", "Hello, Changed!");
console.log(r.status, r.passed ? "PASS" : "FAIL");
console.log("差异 (diff):");
console.log(r.diff);

console.log("总结:", runner3.summary());

// ---- 场景 4: 确认变更合法, 更新快照 ----
console.log("\n--- 场景 4: 确认变更合法, 强制更新快照 ---");
const runner4 = new SnapshotRunner({ updateSnapshots: true });
runner4.snapshots = new Map(runner1.snapshots);

r = runner4.toMatchSnapshot("userProfile", changedProfile);
console.log("userProfile:", r.status, r.passed ? "PASS" : "FAIL");

// 再次以变更后的值运行 (复用更新后的快照)
const runner5 = new SnapshotRunner();
runner5.snapshots = new Map(runner4.snapshots);
r = runner5.toMatchSnapshot("userProfile", changedProfile);
console.log("更新后再运行:", r.status, r.passed ? "PASS" : "FAIL");

console.log("\n[快照测试演示完成]");
