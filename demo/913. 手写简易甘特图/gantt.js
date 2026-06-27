/**
 * 手写简易甘特图（ASCII 渲染）
 *
 * 输入：任务数组 [{name, start, duration}]，其中 start 为开始时间单位，
 * duration 为持续时长单位。
 *
 * 输出：在控制台打印 ASCII 甘特图：
 *   - 顶部为时间轴（每若干单位标一个刻度）。
 *   - 左侧为任务名（右对齐）。
 *   - 右侧用 '=' 字符组成条形，表示任务在时间轴上的起止区间。
 *   - 开始处用 '['，结束处用 ']'，中间用 '=' 填充。
 */

/**
 * @typedef {Object} Task
 * @property {string} name - 任务名称。
 * @property {number} start - 开始时间。
 * @property {number} duration - 持续时长（必须 > 0）。
 */

/**
 * 渲染甘特图。
 * @param {Task[]} tasks - 任务列表。
 * @param {number} [tickStep=2] - 时间轴刻度间隔。
 * @returns {string} ASCII 甘特图字符串。
 */
function renderGantt(tasks, tickStep = 2) {
  if (tasks.length === 0) return "(没有任务)";

  // 校验并计算时间轴范围
  let minStart = Infinity;
  let maxEnd = -Infinity;
  for (const t of tasks) {
    if (t.duration <= 0)
      throw new Error(`任务 "${t.name}" 的 duration 必须 > 0`);
    minStart = Math.min(minStart, t.start);
    maxEnd = Math.max(maxEnd, t.start + t.duration);
  }
  // 时间轴从 0 开始更直观；至少从 minStart（可能为负）开始
  const axisStart = Math.min(0, minStart);
  const axisEnd = maxEnd;
  const axisLen = axisEnd - axisStart; // 列数

  // 任务名最大宽度，用于左侧对齐
  const nameWidth = Math.max(...tasks.map((t) => t.name.length), 4);
  // 名字列与时间轴之间的间隔
  const gap = "  ";

  const lines = [];

  // ---- 顶部时间轴 ----
  // 第一行：刻度数字
  const rulerNum = Array(axisLen).fill(" ");
  for (let t = 0; t <= axisLen; t += tickStep) {
    const label = String(axisStart + t);
    for (let i = 0; i < label.length; i++) {
      if (t + i < axisLen) rulerNum[t + i] = label[i];
    }
  }
  // 第二行：刻度线
  const rulerLine = Array(axisLen).fill(" ");
  for (let t = 0; t <= axisLen; t += tickStep) {
    rulerLine[t] = "|";
  }
  for (let t = 0; t < axisLen; t++) {
    if (rulerLine[t] === " ") rulerLine[t] = "-";
  }

  lines.push(" ".repeat(nameWidth) + gap + rulerNum.join(""));
  lines.push(" ".repeat(nameWidth) + gap + rulerLine.join(""));

  // ---- 每个任务一行 ----
  for (const t of tasks) {
    const name = t.name.padStart(nameWidth);
    const bar = Array(axisLen).fill(" ");
    const s = t.start - axisStart; // 在轴中的起始列
    const e = s + t.duration; // 结束列（不含）
    for (let i = s; i < e && i < axisLen; i++) {
      bar[i] = "=";
    }
    // 起止标记
    if (s === e - 1) {
      // 单格任务（duration=1）：用 '|' 表示一个里程碑点
      if (s >= 0 && s < axisLen) bar[s] = "|";
    } else {
      if (s >= 0 && s < axisLen) bar[s] = "[";
      if (e - 1 >= 0 && e - 1 < axisLen) bar[e - 1] = "]";
    }
    lines.push(name + gap + bar.join(""));
  }

  return lines.join("\n");
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：项目开发任务甘特图 =====");
const project = [
  { name: "需求分析", start: 0, duration: 3 },
  { name: "设计", start: 2, duration: 4 },
  { name: "开发", start: 5, duration: 8 },
  { name: "测试", start: 11, duration: 4 },
  { name: "部署", start: 14, duration: 2 },
];
console.log(renderGantt(project, 2));

console.log("\n===== 测试 2：单人日程（刻度间隔=1） =====");
const daily = [
  { name: "晨会", start: 1, duration: 1 },
  { name: "编码", start: 2, duration: 5 },
  { name: "午休", start: 7, duration: 2 },
  { name: "评审", start: 9, duration: 2 },
  { name: "总结", start: 11, duration: 1 },
];
console.log(renderGantt(daily, 1));

console.log("\n===== 测试 3：空任务列表 =====");
console.log(renderGantt([]));

console.log("\n===== 测试 4：duration=1 的瞬时任务 =====");
const instant = [
  { name: "A", start: 0, duration: 1 },
  { name: "B", start: 3, duration: 1 },
  { name: "C", start: 5, duration: 1 },
];
console.log(renderGantt(instant, 1));

console.log("\n===== 测试 5：包含负起始时间 =====");
const negTasks = [
  { name: "准备", start: -2, duration: 3 },
  { name: "执行", start: 1, duration: 5 },
];
console.log(renderGantt(negTasks, 2));
