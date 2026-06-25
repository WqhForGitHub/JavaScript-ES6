/**
 * 手写 Notification 通知
 *
 * Notification API 作用：
 *   - 在系统层面显示桌面通知（需用户授权）
 *   - 流程：请求权限 -> new Notification(title, options) -> 监听事件
 *
 * 封装目标：
 *   1. Promise 化请求权限
 *   2. 统一创建通知，绑定点击/关闭事件
 *   3. 权限被拒绝时降级为 console 提示
 *   4. Node 环境：用 Mock 演示完整流程
 */

// 跨环境 Notification mock
function getNotification() {
  if (typeof Notification !== "undefined") return Notification;
  // Node mock
  let _permission = "default";
  class MockNotification {
    constructor(title, options = {}) {
      this.title = title;
      this.options = options;
      this.onclick = null;
      this.onclose = null;
      this.onerror = null;
      this.onshow = null;
      console.log(`[Mock通知] "${title}" - ${options.body || ""}`);
      setTimeout(() => {
        this.onshow && this.onshow();
        // 自动关闭触发 close
        setTimeout(() => this.onclose && this.onclose(), 50);
      }, 0);
    }
    close() {
      this.onclose && this.onclose();
    }
    static requestPermission(callback) {
      _permission = "granted";
      if (callback) callback(_permission);
      return Promise.resolve(_permission);
    }
    static get permission() {
      return _permission;
    }
  }
  return MockNotification;
}

class NotificationWrapper {
  constructor() {
    this.N = getNotification();
  }

  // 请求权限
  async requestPermission() {
    if (!("requestPermission" in this.N)) return "granted";
    const result = await this.N.requestPermission();
    return result;
  }

  get permission() {
    return this.N.permission;
  }

  /**
   * 显示通知
   * @param {string} title
   * @param {object} options { body, icon, tag, data, ... }
   * @param {object} handlers { onclick, onclose, onerror }
   */
  async show(title, options = {}, handlers = {}) {
    const permission = await this.requestPermission();
    if (permission !== "granted") {
      console.warn(
        `[通知] 权限被拒绝，降级显示: ${title} - ${options.body || ""}`,
      );
      return null;
    }
    const n = new this.N(title, options);
    if (handlers.onclick) n.onclick = () => handlers.onclick(n);
    if (handlers.onclose) n.onclose = () => handlers.onclose(n);
    if (handlers.onerror) n.onerror = () => handlers.onerror(n);
    return n;
  }

  // 点击通知跳转/聚焦窗口
  async showWithFocus(title, body, url) {
    return this.show(
      title,
      { body },
      {
        onclick: () => {
          window?.focus?.();
          if (url) window?.open?.(url, "_self");
          console.log(`[通知点击] 跳转: ${url}`);
        },
      },
    );
  }
}

// ===== 测试 =====
(async () => {
  const nw = new NotificationWrapper();

  // --- 权限请求 ---
  const perm = await nw.requestPermission();
  console.log("权限:", perm); // "granted"

  // --- 基本通知 ---
  await nw.show("新消息", { body: "你收到一条新消息", tag: "msg-1" });
  // 输出: [Mock通知] "新消息" - 你收到一条新消息

  // --- 带事件处理 ---
  const events = [];
  await nw.show(
    "下载完成",
    { body: "文件已下载", icon: "/icon.png" },
    {
      onclick: () => events.push("clicked"),
      onclose: () => events.push("closed"),
    },
  );

  // 等待 mock 自动关闭
  await new Promise((r) => setTimeout(r, 100));
  console.log("通知事件:", events); // ['closed']

  // --- 多通知 ---
  await Promise.all([
    nw.show("提醒1", { body: "A" }),
    nw.show("提醒2", { body: "B", tag: "group" }),
  ]);

  console.log("Notification 演示完成");
})();
