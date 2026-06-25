/**
 * 手写 Canvas 图表绘制（饼图）
 *
 * 功能：绘制饼图/环形图
 *   - 扇形按比例分配角度
 *   - 标签与百分比
 *   - 起始角度偏移、间隔
 *   - 动画展开
 */

function createMockCanvas(w, h) {
  const calls = [];
  const ctx = new Proxy(
    {
      canvas: { width: w, height: h },
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      font: "10px sans-serif",
      textAlign: "left",
    },
    {
      get(t, p) {
        if (p in t) return t[p];
        return (...args) => {
          calls.push({ method: p, args });
          return ctx;
        };
      },
      set(t, p, v) {
        t[p] = v;
        calls.push({ set: p, value: v });
        return true;
      },
    },
  );
  return { width: w, height: h, getContext: () => ctx, _calls: calls };
}
function getCanvas(w, h) {
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  return createMockCanvas(w, h);
}

const DEFAULT_COLORS = [
  "#4a90e2",
  "#50e3c2",
  "#f5a623",
  "#e74c3c",
  "#9b59b6",
  "#34495e",
  "#1abc9c",
  "#f1c40f",
];

class PieChart {
  constructor(widthOrCanvas, heightOrOptions, options) {
    // 兼容 (width, height, options) / (width, options) / (canvas, options)
    let canvas, opts;
    if (typeof widthOrCanvas === "number") {
      const h = typeof heightOrOptions === "number" ? heightOrOptions : 300;
      canvas = getCanvas(widthOrCanvas, h);
      opts =
        typeof heightOrOptions === "object" && heightOrOptions !== null
          ? heightOrOptions
          : options || {};
    } else {
      canvas = widthOrCanvas;
      opts = heightOrOptions || {};
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.options = {
      colors: DEFAULT_COLORS,
      donut: false, // 环形图
      innerRadius: 0.5, // 环形内半径比例
      startAngle: -Math.PI / 2, // 12 点方向开始
      gap: 0.02, // 扇形间隔弧度
      showLabel: true,
      animate: true,
      duration: 700,
      ...options,
    };
  }

  // 计算每个扇形的角度
  _computeAngles(data) {
    const total = data.reduce((s, v) => s + v, 0) || 1;
    let cursor = this.options.startAngle;
    return data.map((value) => {
      const angle = (value / total) * Math.PI * 2;
      const start = cursor + this.options.gap / 2;
      const end = cursor + angle - this.options.gap / 2;
      cursor += angle;
      return { value, start, end, percent: value / total };
    });
  }

  _drawSlice(cx, cy, r, innerR, slice, color) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(slice.start) * innerR,
      cy + Math.sin(slice.start) * innerR,
    );
    ctx.arc(cx, cy, r, slice.start, slice.end);
    if (this.options.donut) {
      ctx.arc(cx, cy, innerR, slice.end, slice.start, true);
    } else {
      ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawLabels(cx, cy, r, slices, labels) {
    const { ctx } = this;
    ctx.fillStyle = "#333";
    ctx.font = "12px sans-serif";
    slices.forEach((slice, i) => {
      const mid = (slice.start + slice.end) / 2;
      const lx = cx + Math.cos(mid) * (r + 18);
      const ly = cy + Math.sin(mid) * (r + 18);
      ctx.textAlign = Math.cos(mid) >= 0 ? "left" : "right";
      const text = labels[i]
        ? `${labels[i]} ${(slice.percent * 100).toFixed(1)}%`
        : `${(slice.percent * 100).toFixed(1)}%`;
      ctx.fillText(text, lx, ly);
    });
  }

  draw(data, labels = []) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = Math.min(this.width, this.height) / 2 - 40;
    const innerR = this.options.donut ? r * this.options.innerRadius : 0;
    const slices = this._computeAngles(data);

    if (!this.options.animate) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      slices.forEach((s, i) =>
        this._drawSlice(
          cx,
          cy,
          r,
          innerR,
          s,
          this.options.colors[i % this.options.colors.length],
        ),
      );
      if (this.options.showLabel) this._drawLabels(cx, cy, r, slices, labels);
      return;
    }

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / this.options.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.ctx.clearRect(0, 0, this.width, this.height);
      // 按进度缩短每个扇形结束角度
      const animSlices = slices.map((s) => ({
        ...s,
        end: s.start + (s.end - s.start) * eased,
      }));
      animSlices.forEach((s, i) =>
        this._drawSlice(
          cx,
          cy,
          r,
          innerR,
          s,
          this.options.colors[i % this.options.colors.length],
        ),
      );
      if (progress > 0.9 && this.options.showLabel)
        this._drawLabels(cx, cy, r, slices, labels);
      if (progress < 1)
        (typeof requestAnimationFrame !== "undefined"
          ? requestAnimationFrame
          : setTimeout)(tick);
    };
    tick();
  }
}

// ===== 测试 =====
(() => {
  // --- 普通饼图 ---
  const pie = new PieChart(400, 400, { animate: false });
  pie.draw([30, 20, 15, 35], ["苹果", "香蕉", "橙子", "葡萄"]);

  if (pie.canvas._calls) {
    const arcCount = pie.canvas._calls.filter((c) => c.method === "arc").length;
    console.log("arc 调用数（扇形数）:", arcCount); // 4
    // 验证角度分配
    const angles = pie._computeAngles([30, 20, 15, 35]);
    const percents = angles.map((a) => +(a.percent * 100).toFixed(1));
    console.log("百分比:", percents); // [30, 20, 15, 35]
    console.log(
      "角度总和:",
      +angles.reduce((s, a) => s + (a.end - a.start), 0).toFixed(2),
      "≈ 2π（含间隙略小）",
    ); // ≈ 6.2
  }

  // --- 环形图 ---
  const donut = new PieChart(400, 400, {
    animate: false,
    donut: true,
    innerRadius: 0.6,
  });
  donut.draw([10, 20, 30, 40], ["Q1", "Q2", "Q3", "Q4"]);
  console.log("环形图绘制完成");

  // --- 动画版本 ---
  const animated = new PieChart(400, 400, { animate: true, duration: 100 });
  animated.draw([5, 5, 5], ["A", "B", "C"]);
  setTimeout(() => console.log("动画饼图完成"), 120);

  console.log("Canvas 饼图演示完成");
})();
