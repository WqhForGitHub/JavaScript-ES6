/**
 * 手写 Canvas 图表绘制（折线图）
 *
 * 功能：绘制折线图，支持：
 *   - 平滑曲线（贝塞尔）/ 直线
 *   - 数据点标记
 *   - 区域填充（面积图）
 *   - 坐标轴、网格、动画
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

class LineChart {
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
      padding: { top: 30, right: 30, bottom: 40, left: 50 },
      lineColor: "#4a90e2",
      pointColor: "#fff",
      pointRadius: 4,
      fillColor: "rgba(74,144,226,0.15)",
      axisColor: "#999",
      gridColor: "#eee",
      labelColor: "#333",
      smooth: true,
      area: true,
      animate: true,
      duration: 600,
      ...options,
    };
  }

  _area() {
    const p = this.options.padding;
    return {
      x: p.left,
      y: p.top,
      w: this.width - p.left - p.right,
      h: this.height - p.top - p.bottom,
    };
  }

  _toPoints(data, maxVal, labels) {
    const area = this._area();
    const stepX = data.length > 1 ? area.w / (data.length - 1) : 0;
    return data.map((v, i) => ({
      x: area.x + stepX * i,
      y: area.y + area.h - (v / maxVal) * area.h,
      value: v,
      label: labels[i],
    }));
  }

  _drawAxis(maxVal, labels) {
    const { ctx } = this;
    const area = this._area();
    const steps = 5;
    ctx.strokeStyle = this.options.gridColor;
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
      ctx.fillText(Math.round(val), area.x - 8, y + 4);
    }
    ctx.strokeStyle = this.options.axisColor;
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + area.h);
    ctx.lineTo(area.x + area.w, area.y + area.h);
    ctx.stroke();
    ctx.textAlign = "center";
    const stepX = labels.length > 1 ? area.w / (labels.length - 1) : 0;
    labels.forEach((l, i) =>
      ctx.fillText(l, area.x + stepX * i, area.y + area.h + 20),
    );
  }

  // 贝塞尔平滑路径
  _smoothPath(points) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  _drawLine(points, progress) {
    const { ctx } = this;
    const area = this._area();
    // 按进度截取点数
    const visibleCount = Math.max(2, Math.ceil(points.length * progress));
    const visible = points.slice(0, visibleCount);

    // 区域填充
    if (this.options.area) {
      ctx.fillStyle = this.options.fillColor;
      ctx.beginPath();
      ctx.moveTo(visible[0].x, area.y + area.h);
      if (this.options.smooth) {
        this._smoothPath(visible);
      } else {
        visible.forEach((p) => ctx.lineTo(p.x, p.y));
      }
      ctx.lineTo(visible[visible.length - 1].x, area.y + area.h);
      ctx.closePath();
      ctx.fill();
    }

    // 折线
    ctx.strokeStyle = this.options.lineColor;
    ctx.lineWidth = 2;
    if (this.options.smooth) {
      this._smoothPath(visible);
      ctx.stroke();
    } else {
      ctx.beginPath();
      visible.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
      );
      ctx.stroke();
    }

    // 数据点
    if (progress > 0.9) {
      ctx.fillStyle = this.options.pointColor;
      ctx.strokeStyle = this.options.lineColor;
      visible.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.options.pointRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  }

  draw(data, labels) {
    const maxVal = Math.max(...data, 1) * 1.1;
    const points = this._toPoints(data, maxVal, labels);
    if (!this.options.animate) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this._drawAxis(maxVal, labels);
      this._drawLine(points, 1);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / this.options.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this._drawAxis(maxVal, labels);
      this._drawLine(points, eased);
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
  const chart = new LineChart(500, 300, { animate: false, smooth: true });
  const data = [10, 30, 25, 50, 45, 60, 55];
  const labels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月"];
  chart.draw(data, labels);

  if (chart.canvas._calls) {
    const beziers = chart.canvas._calls.filter(
      (c) => c.method === "bezierCurveTo",
    ).length;
    console.log("贝塞尔曲线段数:", beziers); // 12（填充路径 6 段 + 描边路径 6 段）
    console.log(
      "fill 调用:",
      chart.canvas._calls.filter((c) => c.method === "fill").length,
    ); // 8（区域填充 1 + 数据点 7）
  }

  // --- 直线版本 ---
  const chart2 = new LineChart(500, 300, {
    animate: false,
    smooth: false,
    area: false,
  });
  chart2.draw([1, 2, 3], ["A", "B", "C"]);
  if (chart2.canvas._calls) {
    console.log(
      "直线版 lineTo 数:",
      chart2.canvas._calls.filter((c) => c.method === "lineTo").length,
    );
  }

  console.log("Canvas 折线图演示完成");
})();
