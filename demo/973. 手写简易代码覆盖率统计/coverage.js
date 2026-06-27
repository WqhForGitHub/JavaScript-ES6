/**
 * 手写简易代码覆盖率统计
 *
 * 通过对函数源代码进行"插桩"（instrumentation），
 * 在每条可执行语句前插入计数器调用，从而统计：
 * - 哪些行被执行过
 * - 每行执行次数
 * - 哪些行未被覆盖
 *
 * 实现思路（无 AST，简化版）：
 * 1. 用 Function.prototype.toString() 获取函数源码
 * 2. 提取函数体，按行分割
 * 3. 在可执行行前注入 __cover(lineNum) 调用
 * 4. 用 new Function 构造器重新生成函数，通过参数注入 __cover
 *
 * 局限（简化版）：
 * - 不支持闭包变量（new Function 在全局作用域创建）
 * - 不支持递归（原函数名在新作用域不可见）
 * - 行级统计，非真正的语句/分支级覆盖
 * 真实工具（Istanbul / nyc / c8）使用 AST 解析实现精确覆盖。
 */

/**
 * 覆盖率跟踪器：记录每行的执行次数
 */
class CoverageTracker {
  constructor(name) {
    this.name = name;
    /** @type {Map<number, number>} 行号 -> 执行次数 */
    this.lineHits = new Map();
    this.totalLines = 0;
    /** @type {Map<number, string>} 行号 -> 源码内容 */
    this.lineSources = new Map();
  }

  /** 记录某行被执行一次 */
  hit(lineNumber) {
    this.lineHits.set(lineNumber, (this.lineHits.get(lineNumber) || 0) + 1);
  }

  /** 设置总行数 */
  setTotalLines(n) {
    this.totalLines = n;
  }

  /** 记录某行的源码 */
  setLineSource(lineNumber, source) {
    this.lineSources.set(lineNumber, source);
  }

  /** 生成覆盖率报告 */
  report() {
    const covered = this.lineHits.size;
    const total = this.totalLines;
    const percentage =
      total > 0 ? ((covered / total) * 100).toFixed(2) : "0.00";

    const uncoveredLines = [];
    for (let i = 1; i <= total; i++) {
      if (!this.lineHits.has(i)) {
        uncoveredLines.push(i);
      }
    }

    return {
      name: this.name,
      totalLines: total,
      coveredLines: covered,
      uncoveredLines,
      percentage: parseFloat(percentage),
      lineHits: Object.fromEntries(this.lineHits),
    };
  }

  /** 打印覆盖率报告 */
  printReport() {
    const r = this.report();
    console.log(`\n=== 覆盖率报告: ${r.name} ===`);
    console.log(`总行数:       ${r.totalLines}`);
    console.log(`已覆盖行数:   ${r.coveredLines}`);
    console.log(
      `未覆盖行数:   ${r.uncoveredLines.length} -> ${JSON.stringify(r.uncoveredLines)}`,
    );
    console.log(`覆盖率:       ${r.percentage}%`);
    console.log("各可执行行执行次数:");
    for (const [line, count] of Object.entries(r.lineHits)) {
      const src = this.lineSources.get(Number(line)) || "";
      console.log(`  行 ${line.padStart(2)}: ${count} 次  | ${src}`);
    }
    if (r.uncoveredLines.length > 0) {
      console.log("未覆盖行源码:");
      for (const line of r.uncoveredLines) {
        const src = this.lineSources.get(line) || "";
        console.log(`  行 ${line}: ${src}`);
      }
    }
  }
}

// 跟踪器注册表
const trackers = new Map();

/**
 * 对函数进行插桩
 * @param {Function} fn - 原始函数
 * @param {string} [name] - 函数名
 * @returns {Function} 插桩后的新函数（附带 .tracker）
 */
function instrument(fn, name) {
  const fnName = name || fn.name || "anonymous";
  const tracker = new CoverageTracker(fnName);
  trackers.set(fnName, tracker);

  const source = fn.toString();

  // 提取参数列表
  const argMatch = source.match(/function\s*\w*\s*\(([^)]*)\)/);
  const originalArgs = argMatch
    ? argMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // 提取函数体 { ... }
  const bodyStart = source.indexOf("{");
  const bodyEnd = source.lastIndexOf("}");
  const body = source.slice(bodyStart + 1, bodyEnd);

  // 按行分割并插桩
  const bodyLines = body.split("\n");
  tracker.setTotalLines(bodyLines.length);

  const instrumentedLines = bodyLines.map((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // 记录行源码（去除首尾空白）
    if (trimmed) {
      tracker.setLineSource(lineNum, trimmed);
    }

    // 跳过：空行、注释行、单独的 { 或 }
    if (
      trimmed === "" ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed === "{" ||
      trimmed === "}"
    ) {
      return line;
    }

    // 注入计数器调用
    const indent = line.match(/^\s*/)[0];
    return `${indent}__cover(${lineNum}); ${trimmed}`;
  });

  const instrumentedBody = instrumentedLines.join("\n");

  // 用 Function 构造器重新生成函数，__cover 作为第一个参数注入
  const newFn = new Function("__cover", ...originalArgs, instrumentedBody);

  // 包装函数：绑定 __cover 到当前 tracker
  const wrapped = function (...callArgs) {
    const cover = (line) => tracker.hit(line);
    return newFn.call(this, cover, ...callArgs);
  };

  wrapped.tracker = tracker;
  wrapped.name = fnName;
  return wrapped;
}

/** 获取指定函数的覆盖率报告 */
function getCoverageReport(name) {
  const tracker = trackers.get(name);
  return tracker ? tracker.report() : null;
}

/** 打印所有已跟踪函数的覆盖率报告 */
function printAllReports() {
  for (const tracker of trackers.values()) {
    tracker.printReport();
  }
}

// ===================== 测试用例 =====================

console.log("========== 代码覆盖率统计测试 ==========\n");

// --- 被测函数 1：根据分数返回等级（包含 if/else 分支） ---
function getGrade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 60) {
    return "C";
  } else {
    return "F";
  }
}

// 插桩
const instrumentedGetGrade = instrument(getGrade, "getGrade");

console.log("--- 调用 1: 分数 95（走 A 分支） ---");
console.log("结果:", instrumentedGetGrade(95));

console.log("\n--- 调用 2: 分数 75（走 C 分支） ---");
console.log("结果:", instrumentedGetGrade(75));

// 注意：B 和 F 分支未被覆盖
instrumentedGetGrade.tracker.printReport();

// --- 被测函数 2：判断奇偶 ---
function isEven(n) {
  if (n % 2 === 0) {
    return true;
  }
  return false;
}

const instrumentedIsEven = instrument(isEven, "isEven");
console.log("\n--- 完全覆盖示例: isEven ---");
console.log("isEven(2) =", instrumentedIsEven(2));
console.log("isEven(3) =", instrumentedIsEven(3));
instrumentedIsEven.tracker.printReport();

// --- 被测函数 3：含循环 ---
function sumArray(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

const instrumentedSum = instrument(sumArray, "sumArray");
console.log("\n--- 循环覆盖示例: sumArray ---");
console.log("sumArray([1,2,3,4]) =", instrumentedSum([1, 2, 3, 4]));
instrumentedSum.tracker.printReport();

// --- 汇总所有覆盖率 ---
console.log("\n--- 所有函数覆盖率汇总 ---");
for (const tracker of trackers.values()) {
  const r = tracker.report();
  console.log(
    `${r.name}: ${r.percentage}% (${r.coveredLines}/${r.totalLines} 行)`,
  );
}
