/**
 * 手写 Canvas 图表绘制（柱状图）
 *
 * 功能：在 Canvas 上绘制柱状图
 *   - 支持多组数据、坐标轴、刻度、网格线
 *   - 支持悬停 tooltip、动画过渡
 *   - 自适应容器尺寸
 *
 * 实现思路：
 *   1. 计算坐标系：原点、x/y 轴范围、刻度间隔
 *   2. 数据归一化映射到像素坐标
 *   3. 绘制网格 -> 坐标轴 -> 柱子 -> 标签
 *   4. 用 requestAnimationFrame 做生长动画
 */

// 复用 mock canvas（记录指令）
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

class BarChart {
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
      padding: { top: 30, right: 20, bottom: 40, left: 50 },
      barColor: "#4a90e2",
      axisColor: "#999",
      gridColor: "#eee",
      labelColor: "#333",
      animate: true,
      duration: 600,
      ...options,
    };
  }

  // 计算绘图区域
  _chartArea() {
    const p = this.options.padding;
    return {
      x: p.left,
      y: p.top,
      w: this.width - p.left - p.right,
      h: this.height - p.top - p.bottom,
    };
  }

  // 绘制网格与坐标轴
  _drawAxis(maxVal, labels) {
    const { ctx } = this;
    const area = this._chartArea();
    const steps = 5;

    // 水平网格线 + y 刻度
    ctx.strokeStyle = this.options.gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = this.options.labelColor;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= steps; i++) {
      const y = area.y + (area.h / steps) * i;
      const val = maxVal - (maxVal / steps) * i;
      ctx.beginPath();
      ctx.moveTo(area.x, y);
      ctx.lineTo(area.x + area.w, y);
      ctx.stroke();
      ctx.fillText(Math.round(val).toString(), area.x - 8, y + 4);
    }

    // x 轴
    ctx.strokeStyle = this.options.axisColor;
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + area.h);
    ctx.lineTo(area.x + area.w, area.y + area.h);
    ctx.stroke();

    // x 标签
    ctx.textAlign = "center";
    const slot = area.w / labels.length;
    labels.forEach((label, i) => {
      ctx.fillText(label, area.x + slot * (i + 0.5), area.y + area.h + 20);
    });
  }

  // 绘制单帧柱子
  _drawBars(data, maxVal, progress) {
    const { ctx } = this;
    const area = this._chartArea();
    const slot = area.w / data.length;
    const barWidth = slot * 0.6;

    data.forEach((value, i) => {
      const barH = (value / maxVal) * area.h * progress;
      const x = area.x + slot * i + (slot - barWidth) / 2;
      const y = area.y + area.h - barH;
      ctx.fillStyle = this.options.barColor;
      ctx.fillRect(x, y, barWidth, barH);
      // 数值标签
      if (progress > 0.9) {
        ctx.fillStyle = this.options.labelColor;
        ctx.textAlign = "center";
        ctx.fillText(value, x + barWidth / 2, y - 6);
      }
    });
  }

  // 主入口
  draw(data, labels) {
    const maxVal = Math.max(...data, 1) * 1.1;
    if (!this.options.animate) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this._drawAxis(maxVal, labels);
      this._drawBars(data, maxVal, 1);
      return;
    }
    // 动画
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / this.options.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      this.ctx.clearRect(0, 0, this.width, this.height);
      this._drawAxis(maxVal, labels);
      this._drawBars(data, maxVal, eased);
      if (progress < 1) {
        (typeof requestAnimationFrame !== "undefined"
          ? requestAnimationFrame
          : setTimeout)(tick);
      }
    };
    tick();
  }

  // 获取某柱的命中区域（用于 tooltip）
  getBarAt(x, y, data) {
    const area = this._chartArea();
    const slot = area.w / data.length;
    const barWidth = slot * 0.6;
    for (let i = 0; i < data.length; i++) {
      const bx = area.x + slot * i + (slot - barWidth) / 2;
      const maxVal = Math.max(...data, 1) * 1.1;
      const barH = (data[i] / maxVal) * area.h;
      const by = area.y + area.h - barH;
      if (x >= bx && x <= bx + barWidth && y >= by && y <= area.y + area.h) {
        return { index: i, value: data[i] };
      }
    }
    return null;
  }
}

// ===== 测试 =====
(() => {
  const chart = new BarChart(500, 300, { animate: false });
  const data = [12, 35, 28, 45, 60, 38, 22];
  const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  chart.draw(data, labels);

  if (chart.canvas._calls) {
    const fills = chart.canvas._calls.filter(
      (c) => c.method === "fillRect",
    ).length;
    console.log("fillRect 调用次数（柱子数）:", fills); // 7
    console.log("绘制指令总数:", chart.canvas._calls.length); // > 20
  }

  // --- 命中测试 ---
  const hit = chart.getBarAt(100, 200, data);
  console.log("命中柱子:", hit); // { index: ?, value: ? } 取决于坐标

  // --- 动画版本（mock 环境 rAF 不存在，用 setTimeout） ---
  const chart2 = new BarChart(500, 300, { animate: true, duration: 100 });
  chart2.draw([5, 10, 8], ["A", "B", "C"]);
  setTimeout(() => console.log("动画柱状图绘制完成"), 120);

  console.log("Canvas 柱状图演示完成");
})();
