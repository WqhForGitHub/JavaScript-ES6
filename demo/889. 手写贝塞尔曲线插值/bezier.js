/**
 * 贝塞尔曲线插值 (Bezier Curve Interpolation)
 *
 * 二次贝塞尔曲线 (3 控制点 P0, P1, P2):
 *   B(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
 *
 * 三次贝塞尔曲线 (4 控制点 P0, P1, P2, P3):
 *   B(t) = (1-t)³·P0 + 3(1-t)²t·P1 + 3(1-t)t²·P2 + t³·P3
 *
 * 控制点 P 为 [x, y] 二维数组。t ∈ [0, 1]。
 */

/**
 * 二次贝塞尔曲线: 返回参数 t 处的点
 * @param {[number,number]} p0 起点控制点
 * @param {[number,number]} p1 控制点
 * @param {[number,number]} p2 终点控制点
 * @param {number} t 参数 ∈ [0,1]
 * @returns {[number,number]} 曲线上的点
 */
function quadraticBezier(p0, p1, p2, t) {
  const mt = 1 - t;
  const a = mt * mt; // (1-t)²
  const b = 2 * mt * t; // 2(1-t)t
  const c = t * t; // t²
  return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]];
}

/**
 * 三次贝塞尔曲线: 返回参数 t 处的点
 * @param {[number,number]} p0 起点控制点
 * @param {[number,number]} p1 控制点1
 * @param {[number,number]} p2 控制点2
 * @param {[number,number]} p3 终点控制点
 * @param {number} t 参数 ∈ [0,1]
 * @returns {[number,number]} 曲线上的点
 */
function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const a = mt * mt * mt; // (1-t)³
  const b = 3 * mt * mt * t; // 3(1-t)²t
  const c = 3 * mt * t * t; // 3(1-t)t²
  const d = t * t * t; // t³
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

/**
 * 沿贝塞尔曲线均匀采样 N 个点 (按参数 t 等分)
 * @param {Function} bezierFn  quadraticBezier 或 cubicBezier
 * @param {Array[]} controlPoints 控制点数组
 * @param {number} N 采样数 (含端点)
 * @returns {Array[]} 采样点数组
 */
function sampleBezier(bezierFn, controlPoints, N) {
  const points = [];
  for (let i = 0; i < N; i++) {
    const t = N === 1 ? 0 : i / (N - 1);
    points.push(bezierFn(...controlPoints, t));
  }
  return points;
}

/**
 * 将二维采样点打印为 ASCII 散点图 (横轴 x, 纵轴 y)
 * @param {Array[]} points  采样点 [[x,y],...]
 * @param {string} title    图标题
 * @param {number} width    图宽 (字符列)
 * @param {number} height   图高 (字符行)
 */
function plotAscii(points, title, width = 60, height = 20) {
  // 计算坐标范围
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  // 建立网格, 用 Set 记录被点亮的格子
  const grid = new Set();
  for (const [x, y] of points) {
    const col = Math.round(((x - minX) / spanX) * width);
    const row = Math.round(((maxY - y) / spanY) * height); // y 轴上正下负
    grid.add(`${row},${col}`);
  }

  console.log(
    `\n${title}  (x∈[${minX.toFixed(2)},${maxX.toFixed(2)}], y∈[${minY.toFixed(2)},${maxY.toFixed(2)}])`,
  );
  for (let row = 0; row <= height; row++) {
    let line = "";
    for (let col = 0; col <= width; col++) {
      line += grid.has(`${row},${col}`) ? "*" : " ";
    }
    console.log(line);
  }
}

// ---- 测试 ----

console.log("=== 二次贝塞尔曲线 ===");
const qP0 = [0, 0],
  qP1 = [0.5, 1],
  qP2 = [1, 0];
console.log("控制点:", qP0, qP1, qP2);
for (const t of [0, 0.25, 0.5, 0.75, 1]) {
  console.log(
    `  t=${t}: [${quadraticBezier(qP0, qP1, qP2, t)
      .map((v) => v.toFixed(4))
      .join(", ")}]`,
  );
}
// t=0 -> P0=[0,0]; t=1 -> P2=[1,0]; t=0.5 -> [0.5, 0.5]

console.log("\n=== 三次贝塞尔曲线 ===");
const cP0 = [0, 0],
  cP1 = [0, 1],
  cP2 = [1, 1],
  cP3 = [1, 0];
console.log("控制点:", cP0, cP1, cP2, cP3);
for (const t of [0, 0.25, 0.5, 0.75, 1]) {
  console.log(
    `  t=${t}: [${cubicBezier(cP0, cP1, cP2, cP3, t)
      .map((v) => v.toFixed(4))
      .join(", ")}]`,
  );
}
// t=0 -> [0,0]; t=1 -> [1,0]; t=0.5 -> [0.5, 0.75]

console.log("\n=== 端点验证 ===");
console.log(
  "二次 t=0:",
  quadraticBezier(qP0, qP1, qP2, 0),
  "== P0",
  qP0,
  "?",
  JSON.stringify(quadraticBezier(qP0, qP1, qP2, 0)) === JSON.stringify(qP0),
);
console.log(
  "二次 t=1:",
  quadraticBezier(qP0, qP1, qP2, 1),
  "== P2",
  qP2,
  "?",
  JSON.stringify(quadraticBezier(qP0, qP1, qP2, 1)) === JSON.stringify(qP2),
);
console.log(
  "三次 t=0:",
  cubicBezier(cP0, cP1, cP2, cP3, 0),
  "== P0",
  cP0,
  "?",
  JSON.stringify(cubicBezier(cP0, cP1, cP2, cP3, 0)) === JSON.stringify(cP0),
);
console.log(
  "三次 t=1:",
  cubicBezier(cP0, cP1, cP2, cP3, 1),
  "== P3",
  cP3,
  "?",
  JSON.stringify(cubicBezier(cP0, cP1, cP2, cP3, 1)) === JSON.stringify(cP3),
);

console.log("\n=== 采样 6 个点 (二次) ===");
const samples = sampleBezier(quadraticBezier, [qP0, qP1, qP2], 6);
samples.forEach((p, i) =>
  console.log(`  点 ${i}: [${p.map((v) => v.toFixed(4)).join(", ")}]`),
);

console.log("\n=== 采样 6 个点 (三次) ===");
const samplesC = sampleBezier(cubicBezier, [cP0, cP1, cP2, cP3], 6);
samplesC.forEach((p, i) =>
  console.log(`  点 ${i}: [${p.map((v) => v.toFixed(4)).join(", ")}]`),
);

// ---- ASCII 曲线图 ----
console.log("\n===== ASCII 曲线可视化 =====");

// 二次贝塞尔: 拱形 (控制点向上)
const qPoints = sampleBezier(quadraticBezier, [qP0, qP1, qP2], 80);
plotAscii(qPoints, "二次贝塞尔曲线 (P0=[0,0] P1=[0.5,1] P2=[1,0])");

// 三次贝塞尔: S 形 (控制点在两侧上方)
const cPoints = sampleBezier(cubicBezier, [cP0, cP1, cP2, cP3], 80);
plotAscii(cPoints, "三次贝塞尔曲线 (P0=[0,0] P1=[0,1] P2=[1,1] P3=[1,0])");

// 另一条三次贝塞尔: 缓动曲线形 (CSS ease 风格)
const eP0 = [0, 0],
  eP1 = [0.25, 0.1],
  eP2 = [0.25, 1],
  eP3 = [1, 1];
const ePoints = sampleBezier(cubicBezier, [eP0, eP1, eP2, eP3], 80);
plotAscii(ePoints, "三次贝塞尔 (CSS ease 风格)");
