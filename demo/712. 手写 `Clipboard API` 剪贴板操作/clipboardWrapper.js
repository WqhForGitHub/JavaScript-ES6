/**
 * 手写 Clipboard API 剪贴板操作
 *
 * Clipboard API 作用：
 *   - 读写系统剪贴板（文本、图片）
 *   - navigator.clipboard.writeText / readText
 *   - 需 HTTPS 与用户激活（部分操作需权限）
 *
 * 封装目标：
 *   1. Promise 化的 copy / paste
 *   2. 降级方案：Clipboard API 不可用时用 document.execCommand
 *   3. 富文本与 HTML 读写
 *   4. Node 环境：用内存变量模拟剪贴板
 */

// 跨环境剪贴板 mock
function getClipboard() {
  if (typeof navigator !== "undefined" && navigator.clipboard)
    return navigator.clipboard;
  // Node mock
  let _text = "";
  let _items = [];
  return {
    async writeText(text) {
      _text = text;
      _items = [{ type: "text/plain", data: text }];
    },
    async readText() {
      return _text;
    },
    async write(items) {
      _items = items;
    },
    async read() {
      return _items.map((it) => ({
        type: it.type,
        getType: async () => new Blob([it.data], { type: it.type }),
      }));
    },
  };
}

class ClipboardWrapper {
  constructor() {
    this.clipboard = getClipboard();
    this._doc = typeof document !== "undefined" ? document : null;
  }

  // 复制文本（带降级）
  async copy(text) {
    try {
      await this.clipboard.writeText(text);
      return true;
    } catch (e) {
      // 降级到 execCommand
      return this._execCopy(text);
    }
  }

  // 粘贴文本
  async paste() {
    try {
      return await this.clipboard.readText();
    } catch (e) {
      console.warn("[剪贴板] 读取失败:", e.message);
      return "";
    }
  }

  // 复制 HTML 富文本
  async copyHTML(html, plainText) {
    if (this.clipboard.write && typeof ClipboardItem !== "undefined") {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText || html, { type: "text/plain" }]),
      });
      await this.clipboard.write([item]);
      return true;
    }
    // mock 路径
    if (this.clipboard.write) {
      await this.clipboard.write([
        { type: "text/html", data: html },
        { type: "text/plain", data: plainText || html },
      ]);
      return true;
    }
    return this._execCopy(plainText || html);
  }

  // 读取剪贴板所有类型
  async readAll() {
    if (!this.clipboard.read) return [];
    const items = await this.clipboard.read();
    const result = [];
    for (const item of items) {
      const types = item.types || [item.type];
      for (const type of types) {
        const blob = await item.getType(type);
        result.push({ type, text: await blob.text() });
      }
    }
    return result;
  }

  // execCommand 降级
  _execCopy(text) {
    if (!this._doc) {
      console.warn("[剪贴板] 无 document，无法降级");
      return false;
    }
    const textarea = this._doc.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    this._doc.body.appendChild(textarea);
    textarea.select();
    const ok = this._doc.execCommand("copy");
    this._doc.body.removeChild(textarea);
    return ok;
  }
}

// ===== 测试 =====
(async () => {
  const cb = new ClipboardWrapper();

  // --- 文本复制粘贴 ---
  await cb.copy("Hello, Clipboard!");
  console.log("粘贴:", await cb.paste()); // "Hello, Clipboard!"

  // --- 覆盖写入 ---
  await cb.copy("第二条内容");
  console.log("覆盖后粘贴:", await cb.paste()); // "第二条内容"

  // --- HTML 富文本 ---
  await cb.copyHTML("<b>加粗文本</b>", "加粗文本");
  const all = await cb.readAll();
  console.log("剪贴板类型:");
  all.forEach((i) => console.log(`  ${i.type}: ${i.text}`));
  // text/html: <b>加粗文本</b>
  // text/plain: 加粗文本

  // --- 读取文本便捷方法 ---
  console.log("readText:", await cb.paste());

  console.log("Clipboard API 演示完成");
})();
