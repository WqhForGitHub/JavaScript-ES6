/**
 * 手写拖放上传（Drag and Drop）
 *
 * Drag and Drop API 作用：
 *   - 用户拖拽文件到指定区域上传
 *   - 关键事件：dragenter / dragover / dragleave / drop
 *   - 必须在 dragover 上 preventDefault 才能触发 drop
 *
 * 封装目标：
 *   1. 一个 setupDropZone 函数绑定事件并暴露回调
 *   2. 支持文件类型/大小过滤
 *   3. 支持拖拽视觉反馈（高亮）
 *   4. Node 环境：用事件驱动 mock 模拟拖放流程
 */

// 跨环境：构造一个可派发 DragEvent 的元素 mock
function createMockElement() {
  const { EventEmitter } = require("events");
  const el = new EventEmitter();
  el.style = {};
  el.classList = {
    _set: new Set(),
    add(c) {
      this._set.add(c);
    },
    remove(c) {
      this._set.delete(c);
    },
    contains(c) {
      return this._set.has(c);
    },
  };
  el.addEventListener = (type, fn) => el.on(type, fn);
  el.removeEventListener = (type, fn) => el.off(type, fn);
  el.dispatchEvent = (event) => el.emit(event.type, event);
  return el;
}

class DropZone {
  /**
   * @param {HTMLElement} element 拖放目标元素
   * @param {object} options
   *   - accept: 允许的类型/扩展名数组
   *   - maxSize: 单文件最大字节
   *   - multiple: 是否允许多文件
   *   - onDrop / onEnter / onLeave / onInvalid
   */
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      accept: null, // ['image/*', '.png'] 或 null 表示全部
      maxSize: Infinity,
      multiple: true,
      ...options,
    };
    this.dragCounter = 0; // 处理子元素 enter/leave 抖动
    this._bind();
  }

  _bind() {
    this.el.addEventListener("dragenter", this._onDragEnter);
    this.el.addEventListener("dragover", this._onDragOver);
    this.el.addEventListener("dragleave", this._onDragLeave);
    this.el.addEventListener("drop", this._onDrop);
  }

  destroy() {
    this.el.removeEventListener("dragenter", this._onDragEnter);
    this.el.removeEventListener("dragover", this._onDragOver);
    this.el.removeEventListener("dragleave", this._onDragLeave);
    this.el.removeEventListener("drop", this._onDrop);
  }

  _onDragEnter = (e) => {
    e.preventDefault?.();
    this.dragCounter++;
    this.el.classList.add("drag-over");
    this.options.onEnter?.();
  };

  _onDragOver = (e) => {
    // 关键：必须 preventDefault 才能允许 drop
    e.preventDefault?.();
  };

  _onDragLeave = (e) => {
    e.preventDefault?.();
    this.dragCounter--;
    if (this.dragCounter <= 0) {
      this.dragCounter = 0;
      this.el.classList.remove("drag-over");
      this.options.onLeave?.();
    }
  };

  _onDrop = (e) => {
    e.preventDefault?.();
    this.dragCounter = 0;
    this.el.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    if (!this.options.multiple && files.length > 1) {
      this.options.onInvalid?.(files, "只允许单文件");
      return;
    }

    const { valid, invalid } = this._filter(files);
    if (invalid.length) this.options.onInvalid?.(invalid, "类型或大小不符");
    if (valid.length) this.options.onDrop?.(valid);
  };

  _filter(files) {
    const valid = [];
    const invalid = [];
    for (const file of files) {
      if (!this._isAccepted(file) || file.size > this.options.maxSize) {
        invalid.push(file);
      } else {
        valid.push(file);
      }
    }
    return { valid, invalid };
  }

  _isAccepted(file) {
    if (!this.options.accept) return true;
    return this.options.accept.some((rule) => {
      if (rule.startsWith("."))
        return file.name.toLowerCase().endsWith(rule.toLowerCase());
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
  }
}

// 便捷工厂
function setupDropZone(element, options) {
  return new DropZone(element, options);
}

// ===== 测试（mock 模拟拖放） =====
(() => {
  const dropEl = createMockElement();
  const droppedFiles = [];
  const invalidFiles = [];

  // mock File
  function makeFile(name, type, size) {
    return { name, type, size, lastModified: Date.now() };
  }

  const dz = setupDropZone(dropEl, {
    accept: ["image/*", ".pdf"],
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (files) => droppedFiles.push(...files),
    onInvalid: (files, reason) => invalidFiles.push({ files, reason }),
    onEnter: () => (dropEl.style.highlight = true),
    onLeave: () => (dropEl.style.highlight = false),
  });

  // 模拟拖入过程
  dropEl.dispatchEvent({ type: "dragenter", preventDefault() {} });
  console.log("拖入高亮:", dropEl.classList.contains("drag-over")); // true

  // 模拟放下：混合文件
  dropEl.dispatchEvent({
    type: "drop",
    preventDefault() {},
    dataTransfer: {
      files: [
        makeFile("a.png", "image/png", 1024),
        makeFile("b.jpg", "image/jpeg", 2 * 1024 * 1024),
        makeFile("c.txt", "text/plain", 100), // 类型不符
        makeFile("d.pdf", "application/pdf", 500),
        makeFile("e.png", "image/png", 10 * 1024 * 1024), // 超大小
      ],
    },
  });

  console.log(
    "有效文件:",
    droppedFiles.map((f) => f.name),
  ); // ['a.png', 'b.jpg', 'd.pdf']
  console.log(
    "无效文件:",
    invalidFiles[0].files.map((f) => f.name),
  ); // ['c.txt', 'e.png']
  console.log("高亮已移除:", !dropEl.classList.contains("drag-over")); // true

  // --- 单文件限制 ---
  const dropEl2 = createMockElement();
  const single = setupDropZone(dropEl2, { multiple: false });
  let invalidMsg = null;
  single.options.onInvalid = (files, reason) => (invalidMsg = reason);
  dropEl2.dispatchEvent({
    type: "drop",
    preventDefault() {},
    dataTransfer: {
      files: [
        makeFile("1.png", "image/png", 1),
        makeFile("2.png", "image/png", 1),
      ],
    },
  });
  console.log("单文件限制提示:", invalidMsg); // "只允许单文件"

  dz.destroy();
  console.log("拖放上传演示完成");
})();
