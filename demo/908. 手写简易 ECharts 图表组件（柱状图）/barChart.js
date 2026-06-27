/**
 * @file barChart.js
 * @description 手写简易 ECharts 柱状图组件：以水平 '#' 柱条按比例表示数值，
 *              并展示标签与数值。支持按值排序、自定义最大宽度。不依赖 DOM。
 *
 * 算法说明：
 *   - 找到数据最大值 maxVal，每个柱条长度 = round(value / maxVal * maxWidth)。
 *   - 标签左对齐，柱条用 '#' 填充，末尾显示数值。
 *   - 可选按值降序排序，便于对比。
 *   - 底部输出 0 / 中点 / 最大值的刻度尺。
 */

/**
 * 格式化数值显示
 * @param {number} value
 * @returns {string}
 */
function formatValue(value) {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

/**
 * 绘制水平柱状图
 * @param {Array<{label:string, value:number}>} data - 数据
 * @param {Object} [options]
 * @param {number} [options.maxWidth=40] - 柱条最大字符宽度
 * @param {string} [options.title='Bar Chart'] - 标题
 * @param {boolean} [options.sort=false] - 是否按值降序排序
 * @param {string} [options.fillChar='#'] - 柱条填充字符
 */
function drawBarChart(data, options = {}) {
  const maxWidth = options.maxWidth || 40;
  const title = options.title || "Bar Chart";
  const fillChar = options.fillChar || "#";

  console.log(`\n=== ${title} ===`);

  if (data.length === 0) {
    console.log("No data");
    return;
  }

  let items = data.slice();
  if (options.sort) {
    items.sort((a, b) => b.value - a.value);
  }

  const values = items.map((d) => d.value);
  const maxVal = Math.max(...values);
  const maxLabelLen = Math.max(...items.map((d) => d.label.length));

  console.log(
    `(max width = ${maxWidth} chars, max value = ${formatValue(maxVal)})\n`,
  );

  for (const item of items) {
    const barLen = Math.round((item.value / maxVal) * maxWidth);
    const bar = fillChar.repeat(barLen);
    const label = item.label.padEnd(maxLabelLen);
    console.log(`${label} | ${bar} ${formatValue(item.value)}`);
  }

  // 刻度尺
  const halfMax = maxVal / 2;
  const indent = " ".repeat(maxLabelLen + 2);
  const halfPos = Math.round(maxWidth / 2);
  console.log(indent + "+".padEnd(maxWidth + 2, "-"));
  console.log(
    indent +
      "0".padEnd(halfPos) +
      formatValue(halfMax).padEnd(halfPos) +
      formatValue(maxVal),
  );
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 水果销量（排序） ############");
const data1 = [
  { label: "Apple", value: 50 },
  { label: "Banana", value: 80 },
  { label: "Cherry", value: 30 },
  { label: "Date", value: 100 },
  { label: "Elderberry", value: 65 },
];
drawBarChart(data1, { title: "Fruit Sales", sort: true });

console.log("\n\n############ Test 2: 季度营收（小数） ############");
const data2 = [
  { label: "Q1", value: 12.5 },
  { label: "Q2", value: 18.3 },
  { label: "Q3", value: 9.7 },
  { label: "Q4", value: 22.1 },
];
drawBarChart(data2, { title: "Quarterly Revenue (M)", maxWidth: 30 });

console.log("\n\n############ Test 3: 编程语言流行度（不排序） ############");
const data3 = [
  { label: "JavaScript", value: 95 },
  { label: "Python", value: 88 },
  { label: "Java", value: 70 },
  { label: "C++", value: 55 },
  { label: "Go", value: 40 },
  { label: "Rust", value: 35 },
];
drawBarChart(data3, {
  title: "Language Popularity",
  maxWidth: 35,
  fillChar: "=",
});
