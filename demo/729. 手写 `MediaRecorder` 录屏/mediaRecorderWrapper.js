/**
 * 手写 MediaRecorder 录屏
 *
 * MediaRecorder 作用：
 *   - 录制 MediaStream（来自 getUserMedia / canvas.captureStream / 屏幕共享）
 *   - 产出 Blob（webm/mp4），可下载或上传
 *
 * 实现思路：
 *   1. 录制器封装：start/stop/pause/resume
 *   2. 收集 dataavailable 的 Blob 片段
 *   3. stop 时合并为完整 Blob
 *   4. 支持录制 canvas 流（录屏动画）
 *   5. Node 环境：mock MediaRecorder 验证流程
 */

function getMediaRecorderClass() {
  if (typeof MediaRecorder !== "undefined") return MediaRecorder;
  // Node mock
  return class MockMediaRecorder {
    constructor(stream, options = {}) {
      this.stream = stream;
      this.mimeType = options.mimeType || "video/webm";
      this.state = "inactive";
      this._chunks = [];
      this._ondataavailable = null;
      this._onstop = null;
      this._onstart = null;
      this._timer = null;
    }
    set ondataavailable(fn) {
      this._ondataavailable = fn;
    }
    set onstop(fn) {
      this._onstop = fn;
    }
    set onstart(fn) {
      this._onstart = fn;
    }
    start(timeslice) {
      this.state = "recording";
      this._onstart && this._onstart();
      // 模拟定时产生数据块（用 Blob 模拟真实事件，Blob 有 size 属性）
      this._timer = setInterval(() => {
        const chunk = new Blob([new Uint8Array(1024)], { type: this.mimeType });
        this._chunks.push(chunk);
        this._ondataavailable && this._ondataavailable({ data: chunk });
      }, timeslice || 250);
    }
    stop() {
      this.state = "inactive";
      if (this._timer) clearInterval(this._timer);
      this._onstop && this._onstop();
    }
    pause() {
      this.state = "paused";
    }
    resume() {
      this.state = "recording";
    }
    requestData() {}
    static isTypeSupported(type) {
      return type.startsWith("video/webm") || type.startsWith("video/mp4");
    }
    _getChunks() {
      return this._chunks;
    }
  };
}

class Recorder {
  constructor(stream, options = {}) {
    const MR = getMediaRecorderClass();
    this.mimeType = options.mimeType || "video/webm";
    this.recorder = new MR(stream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: options.videoBitsPerSecond,
    });
    this.chunks = [];
    this._bindEvents();
  }

  _bindEvents() {
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      const blob = this.getBlob();
      this._onComplete && this._onComplete(blob);
    };
  }

  start(timeslice = 1000) {
    if (this.recorder.state !== "inactive") return;
    this.chunks = [];
    this.recorder.start(timeslice);
  }

  stop() {
    if (this.recorder.state === "inactive") return;
    this.recorder.stop();
  }

  pause() {
    this.recorder.pause();
  }
  resume() {
    this.recorder.resume();
  }

  getBlob() {
    return new Blob(this.chunks, { type: this.mimeType });
  }

  onComplete(fn) {
    this._onComplete = fn;
    return this;
  }

  // 下载录制结果
  download(filename = "recording.webm") {
    const blob = this.getBlob();
    if (typeof URL === "undefined") return blob;
    const url = URL.createObjectURL(blob);
    if (typeof document !== "undefined") {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    }
    return { url, size: blob.size, type: blob.type };
  }
}

// 录制 canvas 动画的便捷函数
function recordCanvas(canvas, duration = 3000) {
  const stream = canvas.captureStream
    ? canvas.captureStream(30)
    : { _mock: true };
  const recorder = new Recorder(stream, { mimeType: "video/webm" });
  recorder.start(500);
  setTimeout(() => recorder.stop(), duration);
  return recorder;
}

// ===== 测试 =====
(() => {
  const MR = getMediaRecorderClass();

  // --- 类型支持检测 ---
  console.log("支持 webm:", MR.isTypeSupported("video/webm")); // true
  console.log("支持 mp4:", MR.isTypeSupported("video/mp4")); // true
  console.log("支持 xyz:", MR.isTypeSupported("video/xyz")); // false

  // --- 录制流程 ---
  const stream = { id: "mock-stream" };
  const recorder = new Recorder(stream, { mimeType: "video/webm" });

  let resultBlob = null;
  recorder.onComplete((blob) => {
    resultBlob = blob;
    console.log("录制完成, blob 大小:", blob.size, "类型:", blob.type);
  });

  recorder.start(100);
  console.log("录制状态:", recorder.recorder.state); // recording

  // 等待收集几块数据
  setTimeout(() => {
    console.log("已收集块数:", recorder.chunks.length); // > 0
    recorder.stop();
    console.log("停止后状态:", recorder.recorder.state); // inactive

    setTimeout(() => {
      console.log("最终 blob:", resultBlob && resultBlob.size > 0); // true

      // --- 下载（Node 无 URL/document，返回 blob）---
      const dl = recorder.download("test.webm");
      console.log("下载信息:", { type: dl.type, size: dl.size }); // { type: 'video/webm', size: >0 }

      // --- 录制 canvas ---
      const fakeCanvas = { captureStream: () => ({ _mock: true }) };
      const cvRecorder = recordCanvas(fakeCanvas, 200);
      setTimeout(() => {
        console.log("canvas 录制 blob:", cvRecorder.getBlob().size >= 0); // true
        cvRecorder.stop();
        console.log("MediaRecorder 录屏演示完成");
      }, 300);
    }, 50);
  }, 350);
})();
