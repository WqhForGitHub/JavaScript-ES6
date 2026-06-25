/**
 * 手写 Canvas 绘图封装
 *
 * Canvas 2D API 作用：
 *   - 在 <canvas> 上用 2D 上下文绘制图形、文本、图像
 *   - 基本图元：矩形、路径、圆弧、文本、渐变
 *
 * 封装目标：
 *   1. Canvas 类封装常用绘图方法
 *   2. 链式 API（fill/stroke 等）
 *   3. 渐变、阴影、变换支持
 *   4. Node 环境：用 mock ctx 记录指令，验证调用序列
 */

// 跨环境 mock canvas
function createMockCanvas(width = 300, height = 150) {
  const calls = [];
  const ctx = new Proxy(
    {
      canvas: { width, height },
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      font: "10px sans-serif",
      textAlign: "left",
      shadowColor: "transparent",
      shadowBlur: 0,
      globalAlpha: 1,
    },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        // 方法记录到 calls
        return (...args) => {
          calls.push({ method: prop, args });
          return ctx;
        };
      },
      set(target, prop, value) {
        target[prop] = value;
        calls.push({ set: prop, value });
        return true;
      },
    },
  );
  const canvas = {
    width,
    height,
    getContext: () => ctx,
    toDataURL: () => "data:image/png;base64,mock",
    _calls: calls,
  };
  return canvas;
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

class CanvasWrapper {
  constructor(width = 300, height = 150) {
    this.canvas = getCanvas(width, height);
    this.width = width;
    this.height = height;
    this.ctx = this.canvas.getContext("2d");
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    return this;
  }

  // 设置填充色
  fillStyle(color) {
    this.ctx.fillStyle = color;
    return this;
  }

  strokeStyle(color) {
    this.ctx.strokeStyle = color;
    return this;
  }

  lineWidth(w) {
    this.ctx.lineWidth = w;
    return this;
  }

  // 矩形
  fillRect(x, y, w, h) {
    this.ctx.fillRect(x, y, w, h);
    return this;
  }

  strokeRect(x, y, w, h) {
    this.ctx.strokeRect(x, y, w, h);
    return this;
  }

  // 圆
  fillCircle(cx, cy, r) {
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
    return this;
  }

  strokeCircle(cx, cy, r) {
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.stroke();
    return this;
  }

  // 直线
  line(x1, y1, x2, y2) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    return this;
  }

  // 折线
  polyline(points, close = false) {
    if (!points.length) return this;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0], points[i][1]);
    }
    if (close) this.ctx.closePath();
    this.ctx.stroke();
    return this;
  }

  // 文本
  fillText(text, x, y, maxWidth) {
    this.ctx.fillText(text, x, y, maxWidth);
    return this;
  }

  // 线性渐变
  linearGradient(x0, y0, x1, y1, stops) {
    const grad = this.ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([offset, color]) => grad.addColorStop(offset, color));
    return grad;
  }

  // 阴影
  shadow(color, blur, ox = 0, oy = 0) {
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowOffsetX = ox;
    this.ctx.shadowOffsetY = oy;
    return this;
  }

  // 保存/恢复状态
  save() {
    this.ctx.save();
    return this;
  }
  restore() {
    this.ctx.restore();
    return this;
  }

  // 平移
  translate(x, y) {
    this.ctx.translate(x, y);
    return this;
  }
  rotate(rad) {
    this.ctx.rotate(rad);
    return this;
  }
  scale(sx, sy) {
    this.ctx.scale(sx, sy);
    return this;
  }

  toDataURL() {
    return this.canvas.toDataURL();
  }
}

// ===== 测试 =====
(() => {
  const cv = new CanvasWrapper(400, 300);

  // 链式绘制：背景 + 圆 + 文本
  cv.clear()
    .fillStyle("#f0f0f0")
    .fillRect(0, 0, 400, 300)
    .shadow("rgba(0,0,0,0.3)", 10)
    .fillStyle("steelblue")
    .fillCircle(200, 150, 50)
    .shadow("transparent", 0)
    .fillStyle("#333")
    .fillText("Hello Canvas", 160, 230);

  // 渐变填充
  const grad = cv.linearGradient(0, 0, 400, 0, [
    [0, "red"],
    [0.5, "yellow"],
    [1, "green"],
  ]);
  cv.fillStyle(grad).fillRect(0, 270, 400, 30);

  // 折线
  cv.strokeStyle("#00f")
    .lineWidth(2)
    .polyline([
      [10, 10],
      [100, 50],
      [200, 20],
      [300, 80],
    ]);

  // 变换：旋转矩形
  cv.save()
    .translate(50, 50)
    .rotate(Math.PI / 6)
    .fillStyle("orange")
    .fillRect(-20, -20, 40, 40)
    .restore();

  // 输出指令记录（mock 环境）
  if (cv.canvas._calls) {
    const methods = cv.canvas._calls
      .filter((c) => c.method)
      .map((c) => c.method);
    console.log("绘制方法序列:", methods);
    console.log("方法调用总数:", methods.length); // > 10
  }

  console.log("toDataURL:", cv.toDataURL().slice(0, 30)); // "data:image/png;base64,mock"
  console.log("Canvas 绘图封装演示完成");
})();
