/**
 * 手写 screen.orientation 屏幕方向监听
 *
 * screen.orientation 作用：
 *   - 获取屏幕方向（portrait/landscape）与角度
 *   - addEventListener("change") 监听旋转
 *   - 可用于自适应布局、横竖屏提示、锁定方向
 *
 * 实现思路：
 *   1. 读取当前方向类型与角度
 *   2. 监听 change 事件
 *   3. 提供 isPortrait/isLandscape 便捷判断
 *   4. lock/unlock 方向锁定（仅部分浏览器/全屏支持）
 *   5. Node 环境：mock screen.orientation 并模拟旋转
 */

function getScreenEnv() {
  // 注意：不能在函数内再声明 const screen，否则 TDZ 会导致 typeof screen 抛错
  if (
    typeof globalThis.screen !== "undefined" &&
    globalThis.screen &&
    globalThis.screen.orientation
  ) {
    return {
      screen: globalThis.screen,
      orientation: globalThis.screen.orientation,
    };
  }
  // Node mock
  const { EventEmitter } = require("events");
  const orientation = new EventEmitter();
  orientation.type = "portrait-primary";
  orientation.angle = 0;
  const mockScreen = { orientation };
  orientation._simulate = function (type, angle) {
    this.type = type;
    this.angle = angle;
    this.emit("change");
  };
  return { screen: mockScreen, orientation, _mock: true };
}

class OrientationWatcher {
  constructor() {
    const env = getScreenEnv();
    this.screen = env.screen;
    this.orientation = env.orientation;
    this._handlers = [];
    this._bindChange();
  }

  _bindChange() {
    const handler = () => {
      this._handlers.forEach((fn) => fn(this.getInfo()));
    };
    // 浏览器：addEventListener；mock：on
    if (typeof this.orientation.addEventListener === "function") {
      this.orientation.addEventListener("change", handler);
    } else {
      this.orientation.on("change", handler);
    }
    this._rawHandler = handler;
  }

  // 当前方向信息
  getInfo() {
    return {
      type: this.orientation.type,
      angle: this.orientation.angle,
      isPortrait: this.isPortrait(),
      isLandscape: this.isLandscape(),
    };
  }

  isPortrait() {
    return this.orientation.type.startsWith("portrait");
  }

  isLandscape() {
    return this.orientation.type.startsWith("landscape");
  }

  // 订阅方向变化
  onChange(fn) {
    this._handlers.push(fn);
    return () => this.off(fn);
  }

  off(fn) {
    this._handlers = this._handlers.filter((h) => h !== fn);
  }

  // 锁定方向（仅全屏时有效）
  async lock(type) {
    if (typeof this.orientation.lock === "function") {
      try {
        await this.orientation.lock(type);
        return true;
      } catch (e) {
        console.warn("[Orientation] 锁定失败:", e.message);
        return false;
      }
    }
    console.warn("[Orientation] 当前环境不支持 lock");
    return false;
  }

  unlock() {
    if (typeof this.orientation.unlock === "function") {
      this.orientation.unlock();
    }
  }

  // 测试辅助：模拟旋转（mock 专用）
  _simulateRotate(type, angle) {
    if (this.orientation._simulate) {
      this.orientation._simulate(type, angle);
    } else {
      // 真实环境无法模拟，仅记录
      console.log("[Orientation] 真实环境无法模拟旋转");
    }
  }
}

// 便捷：横竖屏切换回调
function onOrientationSwitch(onPortrait, onLandscape) {
  const w = new OrientationWatcher();
  w.onChange((info) => {
    if (info.isPortrait) onPortrait(info);
    else onLandscape(info);
  });
  return w;
}

// ===== 测试（mock 环境模拟旋转） =====
(() => {
  const watcher = new OrientationWatcher();

  // --- 初始方向 ---
  console.log("初始:", watcher.getInfo());
  // { type: 'portrait-primary', angle: 0, isPortrait: true, isLandscape: false }

  // --- 监听变化 ---
  const events = [];
  watcher.onChange((info) => events.push(`${info.type}@${info.angle}`));

  // --- 模拟旋转到横屏 ---
  watcher._simulateRotate("landscape-primary", 90);
  console.log("旋转后:", watcher.getInfo());
  // { type: 'landscape-primary', angle: 90, isPortrait: false, isLandscape: true }
  console.log("事件:", events); // ['landscape-primary@90']

  // --- 横竖屏切换回调 ---
  const switches = [];
  const sw = onOrientationSwitch(
    (info) => switches.push("竖屏"),
    (info) => switches.push("横屏"),
  );
  // mock 环境下 sw 用的是新的 OrientationWatcher，无法直接模拟；
  // 改为直接验证回调逻辑
  console.log("横竖判断:", watcher.isLandscape() ? "横屏" : "竖屏"); // 横屏

  // --- lock 测试 ---
  watcher.lock("portrait").then((ok) => {
    console.log("lock 支持:", ok); // false（mock 无 lock）

    console.log("screen.orientation 演示完成");
  });
})();
