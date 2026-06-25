/**
 * 手写 getUserMedia 摄像头调用
 *
 * getUserMedia 作用：
 *   - 请求用户授权访问摄像头/麦克风
 *   - 返回 MediaStream，可挂到 video/audio 元素或用于录制
 *
 * 实现思路：
 *   1. 权限检查与降级（navigator.mediaDevices）
 *   2. Promise 化请求（带约束：分辨率、帧率、前后置）
 *   3. 挂载到 video 元素、停止流、切换摄像头
 *   4. Node 环境：mock MediaStream 验证流程
 */

function getMediaDevices() {
  if (typeof navigator !== "undefined" && navigator.mediaDevices)
    return navigator.mediaDevices;
  // Node mock
  let _granted = true;
  return {
    async getUserMedia(constraints) {
      if (!_granted) throw new Error("PermissionDenied");
      const tracks = [];
      if (constraints.video) {
        tracks.push({
          kind: "video",
          label: "Mock Camera",
          enabled: true,
          stop() {
            this.enabled = false;
            this._stopped = true;
          },
          getSettings() {
            return {
              width: constraints.video.width?.ideal || 640,
              height: constraints.video.height?.ideal || 480,
              frameRate: constraints.video.frameRate?.ideal || 30,
              facingMode: constraints.video.facingMode || "user",
            };
          },
        });
      }
      if (constraints.audio) {
        tracks.push({
          kind: "audio",
          label: "Mock Mic",
          enabled: true,
          stop() {},
        });
      }
      return {
        id: Math.random().toString(36).slice(2),
        active: true,
        getTracks: () => tracks,
        getVideoTracks: () => tracks.filter((t) => t.kind === "video"),
        getAudioTracks: () => tracks.filter((t) => t.kind === "audio"),
        stop() {
          tracks.forEach((t) => t.stop());
          this.active = false;
        },
      };
    },
    async enumerateDevices() {
      return [
        { kind: "videoinput", label: "Front Camera", deviceId: "cam-front" },
        { kind: "videoinput", label: "Back Camera", deviceId: "cam-back" },
        { kind: "audioinput", label: "Microphone", deviceId: "mic-1" },
      ];
    },
    _setGranted(v) {
      _granted = v;
    },
  };
}

class CameraController {
  constructor() {
    this.mediaDevices = getMediaDevices();
    this.stream = null;
    this.videoEl = null;
  }

  // 检查是否支持
  isSupported() {
    return (
      !!this.mediaDevices &&
      typeof this.mediaDevices.getUserMedia === "function"
    );
  }

  // 打开摄像头
  async open(constraints = {}) {
    const defaultConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: "user",
      },
      audio: false,
    };
    const merged = {
      video: { ...defaultConstraints.video, ...constraints.video },
      audio: constraints.audio ?? defaultConstraints.audio,
    };
    try {
      this.stream = await this.mediaDevices.getUserMedia(merged);
      return this.stream;
    } catch (err) {
      // 降级：尝试基础约束
      console.warn("[Camera] 降级重试:", err.message);
      this.stream = await this.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      return this.stream;
    }
  }

  // 挂载到 video 元素
  attach(videoEl) {
    this.videoEl = videoEl;
    if (!this.stream) throw new Error("请先 open");
    if (videoEl.srcObject !== undefined) {
      videoEl.srcObject = this.stream;
    }
    return videoEl;
  }

  // 获取当前视频轨道设置
  getSettings() {
    const track = this.stream?.getVideoTracks()[0];
    return track ? track.getSettings() : null;
  }

  // 切换前后摄像头
  async switchCamera() {
    const current = this.getSettings()?.facingMode;
    const next = current === "user" ? "environment" : "user";
    this.stop();
    return this.open({ video: { facingMode: next } });
  }

  // 截图当前帧（需 video 元素 + canvas）
  captureFrame(canvas) {
    if (!this.videoEl) throw new Error("未挂载 video 元素");
    const ctx = canvas.getContext("2d");
    canvas.width = this.videoEl.videoWidth || 640;
    canvas.height = this.videoEl.videoHeight || 480;
    ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  }

  // 停止所有轨道
  stop() {
    if (this.stream) {
      this.stream.stop();
      this.stream = null;
    }
    if (this.videoEl) this.videoEl.srcObject = null;
  }

  // 列举设备
  async listDevices() {
    return this.mediaDevices.enumerateDevices();
  }
}

// ===== 测试 =====
(async () => {
  const cam = new CameraController();
  console.log("支持摄像头:", cam.isSupported()); // true

  // --- 打开 ---
  const stream = await cam.open({
    video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
  });
  console.log("流活跃:", stream.active); // true
  console.log("视频轨道数:", stream.getVideoTracks().length); // 1

  // --- 设置 ---
  const settings = cam.getSettings();
  console.log("分辨率:", settings.width, "x", settings.height); // 1920 x 1080
  console.log("帧率:", settings.frameRate); // 30
  console.log("朝向:", settings.facingMode); // user

  // --- 挂载 video（mock）---
  const videoEl = { srcObject: null, videoWidth: 1920, videoHeight: 1080 };
  cam.attach(videoEl);
  console.log("video 已绑定:", videoEl.srcObject === stream); // true

  // --- 切换摄像头 ---
  await cam.switchCamera();
  console.log("切换后朝向:", cam.getSettings().facingMode); // environment

  // --- 截图（mock canvas）---
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: () => {} }),
    toDataURL: () => "data:image/png;base64,mockFrame",
  };
  cam.videoEl = videoEl;
  const frame = cam.captureFrame(mockCanvas);
  console.log("截图:", frame.slice(0, 30)); // "data:image/png;base64,mockFrame"

  // --- 设备列表 ---
  const devices = await cam.listDevices();
  console.log("设备数:", devices.length); // 3
  console.log(
    "摄像头数:",
    devices.filter((d) => d.kind === "videoinput").length,
  ); // 2

  // --- 停止 ---
  cam.stop();
  console.log("停止后流:", cam.stream); // null

  console.log("getUserMedia 摄像头演示完成");
})();
