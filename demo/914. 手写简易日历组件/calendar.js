/**
 * 手写简易日历组件（ASCII 渲染）
 *
 * 功能：
 * 1. 输入年份和月份（1-12），生成该月的日历网格。
 * 2. 计算该月第一天是星期几，以及该月总天数。
 * 3. 按星期日(Su)开头排列 7 列网格。
 * 4. 支持高亮指定某一天（用方括号 [dd] 标记）。
 * 5. 支持显示农历占位（这里仅做结构演示）。
 *
 * 关键算法：求某年某月某日是星期几。
 * 使用 Zeller 公式或直接用已知基准日推算。这里用"日期差 + 基准星期"法：
 *   已知 1970-01-01 是星期四，计算目标日期与该基准日的差值天数，再对 7 取模。
 */

/**
 * 判断是否为闰年。
 * @param {number} year - 年份。
 * @returns {boolean} 是否闰年。
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 获取某年某月的天数。
 * @param {number} year - 年份。
 * @param {number} month - 月份（1-12）。
 * @returns {number} 该月天数。
 */
function daysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

/**
 * 计算某年某月某日是星期几（0=星期日, 1=星期一, ..., 6=星期六）。
 * 基准：1970-01-01 是星期四。
 * @param {number} year - 年份。
 * @param {number} month - 月份（1-12）。
 * @param {number} day - 日。
 * @returns {number} 星期几（0-6）。
 */
function dayOfWeek(year, month, day) {
  // 计算从 1970-01-01 到 (year-month-day) 的总天数
  let totalDays = 0;
  // 累加完整年份
  for (let y = 1970; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  // 累加当年完整月份
  for (let m = 1; m < month; m++) {
    totalDays += daysInMonth(year, m);
  }
  // 加上当月天数
  totalDays += day - 1; // 1 号对应差 0 天
  // 1970-01-01 是星期四（4）
  return (totalDays + 4) % 7;
}

/**
 * 生成 ASCII 日历。
 * @param {number} year - 年份。
 * @param {number} month - 月份（1-12）。
 * @param {number} [highlightDay=0] - 要高亮的日期（0 表示不高亮）。
 * @returns {string} ASCII 日历字符串。
 */
function renderCalendar(year, month, highlightDay = 0) {
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  const weekHeader = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const totalDays = daysInMonth(year, month);
  const firstWeekday = dayOfWeek(year, month, 1);

  // 收集格子：前面补空格
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }
  // 补齐最后一行
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const lines = [];
  // 标题
  const title = `${year} 年 ${monthNames[month - 1]}`;
  lines.push(center(title, 7 * 4 - 1));
  lines.push("-".repeat(7 * 4 - 1));
  // 星期表头
  lines.push(weekHeader.map((w) => w.padStart(2)).join("  "));
  lines.push("-".repeat(7 * 4 - 1));
  // 日期行
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7).map((d) => {
      if (d === null) return "   ";
      if (d === highlightDay) return `[${String(d).padStart(2, "0")}]`;
      return ` ${String(d).padStart(2, " ")} `;
    });
    lines.push(row.join(" "));
  }
  return lines.join("\n");
}

/**
 * 把字符串居中到指定宽度。
 * @param {string} str - 原字符串。
 * @param {number} width - 目标宽度。
 * @returns {string} 居中后的字符串。
 */
function center(str, width) {
  const pad = Math.max(0, width - str.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return " ".repeat(left) + str + " ".repeat(right);
}

// ============================================================
// 测试用例
// ============================================================

console.log("===== 测试 1：2024 年 2 月（闰年，高亮 29 号） =====");
console.log(renderCalendar(2024, 2, 29));

console.log("\n===== 测试 2：2026 年 6 月（高亮 27 号） =====");
console.log(renderCalendar(2026, 6, 27));

console.log("\n===== 测试 3：2000 年 1 月（闰年） =====");
console.log(renderCalendar(2000, 1, 1));

console.log("\n===== 测试 4：2023 年 12 月（不高亮） =====");
console.log(renderCalendar(2023, 12));

console.log("\n===== 测试 5：验证星期计算 =====");
// 1970-01-01 应为星期四(4)
console.log("1970-01-01 星期:", dayOfWeek(1970, 1, 1), "(期望 4=星期四)");
// 2000-01-01 是星期六(6)
console.log("2000-01-01 星期:", dayOfWeek(2000, 1, 1), "(期望 6=星期六)");
// 2024-02-29 是星期四(4)
console.log("2024-02-29 星期:", dayOfWeek(2024, 2, 29), "(期望 4=星期四)");
// 2026-06-27 是星期六(6)
console.log("2026-06-27 星期:", dayOfWeek(2026, 6, 27), "(期望 6=星期六)");

console.log("\n===== 测试 6：闰年判断 =====");
console.log("2000 闰年?", isLeapYear(2000), "(期望 true)");
console.log("1900 闰年?", isLeapYear(1900), "(期望 false)");
console.log("2024 闰年?", isLeapYear(2024), "(期望 true)");
console.log("2023 闰年?", isLeapYear(2023), "(期望 false)");
