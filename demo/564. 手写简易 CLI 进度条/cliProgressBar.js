/**
 * 手写简易 CLI 进度条
 *
 * 功能：在终端原地渲染进度条，支持百分比、自定义宽度与字符
 * 实现思路：
 *   1. 根据当前值/总数计算百分比与已填充长度
 *   2. 用 complete 字符与 incomplete 字符拼接进度条
 *   3. 使用 stream 的 clearLine/cursorTo 配合 \r 实现原地刷新
 *   4. 完成后输出换行；支持自定义格式模板
 */
class ProgressBar {
  constructor(total, options = {}) {
    this.total = total;
    this.current = 0;
    this.width = options.width || 30;
    this.complete = options.complete || "=";
    this.incomplete = options.incomplete || "-";
    this.stream = options.stream || process.stdout;
    this.format = options.format || "[{bar}] {percent}% ({current}/{total})";
    this.startTime = null;
    this.finished = false;
  }

  /** 计算并渲染当前状态 */
  render() {
    const ratio = this.total > 0 ? this.current / this.total : 1;
    const percent = Math.min(100, Math.max(0, Math.floor(ratio * 100)));
    const filled = Math.min(this.width, Math.floor(ratio * this.width));
    const bar =
      this.complete.repeat(filled) +
      this.incomplete.repeat(this.width - filled);

    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const rate =
      elapsed > 0 && this.current > 0
        ? (this.current / elapsed).toFixed(1)
        : "0.0";
    const eta =
      this.current > 0 && ratio < 1
        ? ((elapsed / this.current) * (this.total - this.current)).toFixed(1)
        : "0.0";

    const line = this.format
      .replace("{bar}", bar)
      .replace("{percent}", String(percent))
      .replace("{current}", String(this.current))
      .replace("{total}", String(this.total))
      .replace("{elapsed}", elapsed.toFixed(1))
      .replace("{rate}", rate)
      .replace("{eta}", eta);

    if (this.stream.clearLine && this.stream.cursorTo) {
      this.stream.clearLine();
      this.stream.cursorTo(0);
    } else {
      this.stream.write("\r");
    }
    this.stream.write(line);
  }

  /** 设置到指定进度 */
  update(current) {
    if (this.startTime === null) this.startTime = Date.now();
    this.current = Math.min(current, this.total);
    this.render();
    if (this.current >= this.total && !this.finished) this.finish();
  }

  /** 步进 n 个单位 */
  tick(n = 1) {
    this.update(this.current + n);
  }

  /** 完成：换行 */
  finish() {
    this.finished = true;
    this.stream.write("\n");
  }
}

/** 同步遍历演示用的简易进度条函数 */
function withProgress(items, onEach, options = {}) {
  const bar = new ProgressBar(items.length, options);
  const results = [];
  for (let i = 0; i < items.length; i++) {
    results.push(onEach(items[i], i));
    bar.tick();
  }
  return results;
}

// ===== 测试（使用 mock 流，避免真实终端闪烁） =====
console.log("=== CLI 进度条演示 ===");

// mock 流：捕获输出便于查看
function mockStream() {
  const s = {
    lines: [],
    last: "",
    // 模拟真实终端：clearLine 清空当前行内容
    clearLine() {
      s.last = "";
    },
    cursorTo() {},
    write(str) {
      // \n 表示本帧结束，存入 lines；\r 表示回到行首覆盖
      if (str === "\n") {
        s.lines.push(s.last);
        s.last = "";
      } else if (str.startsWith("\r")) {
        s.last = str.slice(1);
      } else {
        s.last += str;
      }
    },
  };
  return s;
}

// 1) 基本进度条
const s1 = mockStream();
const bar1 = new ProgressBar(10, { stream: s1, width: 20 });
for (let i = 1; i <= 10; i++) bar1.tick();
console.log("基本进度条最终帧:", s1.lines[s1.lines.length - 1]);
// [========] 100% (10/10) 形式

// 2) 自定义字符与宽度
const s2 = mockStream();
const bar2 = new ProgressBar(5, {
  stream: s2,
  width: 10,
  complete: "#",
  incomplete: ".",
});
for (let i = 1; i <= 5; i++) bar2.tick();
console.log("自定义字符:", s2.lines[s2.lines.length - 1]);

// 3) 自定义格式（含 rate/eta）
const s3 = mockStream();
const bar3 = new ProgressBar(4, {
  stream: s3,
  format:
    "下载中 {bar} {percent}% | {current}/{total} | 速度:{rate} | 剩余:{eta}s",
  width: 15,
});
for (let i = 1; i <= 4; i++) bar3.tick();
console.log("自定义格式:", s3.lines[s3.lines.length - 1]);

// 4) withProgress 辅助函数
const s4 = mockStream();
const items = [1, 2, 3, 4, 5];
const doubled = withProgress(items, (x) => x * 2, { stream: s4, width: 10 });
console.log("withProgress 结果:", doubled); // [2,4,6,8,10]
console.log("withProgress 最终帧:", s4.lines[s4.lines.length - 1]);

// 5) 中途状态快照（50%）
const s5 = mockStream();
const bar5 = new ProgressBar(8, { stream: s5, width: 16 });
bar5.update(4);
console.log("50% 快照:", s5.last); // 进度条一半填充
