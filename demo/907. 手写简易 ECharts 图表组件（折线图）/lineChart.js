/**
 * @file lineChart.js
 * @description 手写简易 ECharts 折线图组件：以 ASCII 字符绘制坐标轴、刻度、
 *              数据点 '*'，并用 '-' 连接相邻点。不依赖 DOM/Canvas。
 *
 * 算法说明：
 *   - 根据数据最大/最小值确定 y 轴范围，归一化到网格高度。
 *   - 每个数据点按索引均匀分布到 x 轴，按数值映射到 y 行。
 *   - 相邻两点用 Bresenham 风格的逐步插值填充 '-' 连线，数据点用 '*' 覆盖。
 *   - 左侧打印 y 轴刻度（最大/最小值），底部打印 x 轴标签。
 */

/**
 * 绘制 ASCII 折线图
 * @param {Array<{label:string, value:number}>} data - 数据点
 * @param {Object} [options]
 * @param {number} [options.width=60] - 图表宽度
 * @param {number} [options.height=15] - 图表高度
 * @param {string} [options.title='Line Chart'] - 标题
 */
function drawLineChart(data, options = {}) {
  const width = options.width || 60;
  const height = options.height || 15;
  const title = options.title || "Line Chart";

  console.log(`\n=== ${title} ===`);

  if (data.length === 0) {
    console.log("No data");
    return;
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // 列数：保证至少能容纳所有数据点
  const cols = Math.max(width, data.length * 4);
  const grid = Array.from({ length: height }, () => new Array(cols).fill(" "));

  // 绘制 y 轴（左侧竖线）
  for (let r = 0; r < height; r++) {
    grid[r][0] = "|";
  }
  // 绘制 x 轴（底部横线）
  for (let c = 0; c < cols; c++) {
    grid[height - 1][c] = "-";
  }
  grid[height - 1][0] = "+";

  // 计算每个数据点的 (x, y) 网格坐标
  const points = data.map((d, i) => {
    const x =
      data.length === 1
        ? Math.floor(cols / 2)
        : Math.round((i / (data.length - 1)) * (cols - 2)) + 1;
    const y = Math.round(
      height - 1 - ((d.value - minVal) / range) * (height - 2),
    );
    return { x, y, label: d.label, value: d.value };
  });

  // 连接相邻点（逐步插值，填充 '-'）
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    let cx = p1.x;
    let cy = p1.y;
    const dx = Math.sign(p2.x - p1.x);
    const dy = Math.sign(p2.y - p1.y);
    // 步进直到到达终点
    while (cx !== p2.x || cy !== p2.y) {
      if (grid[cy] && grid[cy][cx] === " ") grid[cy][cx] = "-";
      // 优先向 x 方向推进，再向 y 方向推进
      if (cx !== p2.x) {
        cx += dx;
      } else if (cy !== p2.y) {
        cy += dy;
      }
    }
  }

  // 绘制数据点（覆盖连线）
  for (const p of points) {
    if (p.y >= 0 && p.y < height && p.x >= 0 && p.x < cols) {
      grid[p.y][p.x] = "*";
    }
  }

  // 输出图表，左侧附带 y 轴刻度
  console.log(`${maxVal.toFixed(0).padStart(6)} | ${"(max)"}`);
  for (let r = 0; r < height; r++) {
    let label = "";
    if (r === 0) label = maxVal.toFixed(0);
    else if (r === height - 1) label = minVal.toFixed(0);
    else if (r === Math.floor(height / 2))
      label = ((maxVal + minVal) / 2).toFixed(0);
    console.log(`${label.padStart(6)} ${grid[r].join("")}`);
  }

  // 输出 x 轴标签
  const labelLine =
    " ".repeat(7) +
    data
      .map((d) => d.label.padStart(4))
      .join(
        " ".repeat(
          Math.max(1, Math.floor((cols - data.length * 4) / data.length)),
        ),
      );
  console.log(labelLine);
}

// ======================== 测试用例 ========================

console.log("############ Test 1: 月度销售趋势 ############");
const data1 = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 25 },
  { label: "Mar", value: 15 },
  { label: "Apr", value: 40 },
  { label: "May", value: 30 },
  { label: "Jun", value: 55 },
  { label: "Jul", value: 45 },
];
drawLineChart(data1, { title: "Monthly Sales", height: 15 });

console.log("\n\n############ Test 2: 简单趋势（小图） ############");
const data2 = [
  { label: "A", value: 1 },
  { label: "B", value: 5 },
  { label: "C", value: 3 },
  { label: "D", value: 8 },
  { label: "E", value: 2 },
];
drawLineChart(data2, { title: "Simple Trend", height: 10, width: 30 });

console.log("\n\n############ Test 3: 含负值 ############");
const data3 = [
  { label: "Q1", value: -5 },
  { label: "Q2", value: 10 },
  { label: "Q3", value: -2 },
  { label: "Q4", value: 8 },
];
drawLineChart(data3, { title: "With Negatives", height: 12, width: 40 });
