/**
 * 手写 FileReader 封装
 *
 * FileReader 作用：
 *   - 异步读取 File/Blob 为 text / ArrayBuffer / DataURL
 *   - 提供 onload / onerror / onprogress / onabort 事件
 *
 * 封装目标：
 *   1. Promise 化四种读取方式
 *   2. 支持进度回调
 *   3. 支持中止读取（AbortSignal）
 *   4. 批量读取多个文件
 *   5. Node 环境：实现 mock FileReader
 */

function ensureFileReader() {
  if (typeof FileReader !== "undefined") return;
  // Node mock FileReader
  global.FileReader = class MockFileReader {
    constructor() {
      this.result = null;
      this.error = null;
      this.readyState = 0; // 0 EMPTY, 1 LOADING, 2 DONE
      this.onload = null;
      this.onerror = null;
      this.onprogress = null;
      this.onabort = null;
      this.onloadstart = null;
      this.onloadend = null;
      this._aborted = false;
    }
    _read(blob, kind) {
      this.readyState = 1;
      this.onloadstart && this.onloadstart({ loaded: 0, total: blob.size });
      setTimeout(() => {
        if (this._aborted) {
          this.onerror && this.onerror(new Error("读取已中止"));
          this.onloadend && this.onloadend();
          return;
        }
        this.onprogress &&
          this.onprogress({ loaded: blob.size, total: blob.size });
        const text = typeof blob === "string" ? blob : blob.text ? null : null;
        // 简化：mock blob 有 _parts 或直接用 text()
        const getContent = async () => {
          if (blob.text) return await blob.text();
          return String(blob);
        };
        getContent().then((content) => {
          if (kind === "text") this.result = content;
          else if (kind === "dataURL") {
            const base64 = Buffer.from(content, "utf8").toString("base64");
            this.result = `data:${blob.type || "text/plain"};base64,${base64}`;
          } else if (kind === "arrayBuffer") {
            const buf = Buffer.from(content, "utf8");
            this.result = buf.buffer.slice(
              buf.byteOffset,
              buf.byteOffset + buf.byteLength,
            );
          }
          this.readyState = 2;
          this.onload && this.onload({ target: this });
          this.onloadend && this.onloadend();
        });
      }, 0);
    }
    readAsText(blob) {
      this._read(blob, "text");
    }
    readAsDataURL(blob) {
      this._read(blob, "dataURL");
    }
    readAsArrayBuffer(blob) {
      this._read(blob, "arrayBuffer");
    }
    readAsBinaryString(blob) {
      this._read(blob, "text");
    }
    abort() {
      this._aborted = true;
      this.onabort && this.onabort();
    }
    static EMPTY = 0;
    static LOADING = 1;
    static DONE = 2;
  };
  if (typeof Blob === "undefined") {
    global.Blob = class {
      constructor(parts, o = {}) {
        this._parts = parts;
        this.type = o.type || "";
        this.size = parts.reduce((s, p) => s + (p.length || 0), 0);
      }
      async text() {
        return this._parts.map(String).join("");
      }
    };
  }
  if (typeof File === "undefined") {
    global.File = class extends global.Blob {
      constructor(parts, name, o = {}) {
        super(parts, o);
        this.name = name;
        this.lastModified = o.lastModified || Date.now();
      }
    };
  }
}

class FileReaderWrapper {
  // 读取为文本
  static readAsText(blob, { onProgress, signal } = {}) {
    return this._read(blob, "readAsText", { onProgress, signal });
  }

  // 读取为 DataURL
  static readAsDataURL(blob, { onProgress, signal } = {}) {
    return this._read(blob, "readAsDataURL", { onProgress, signal });
  }

  // 读取为 ArrayBuffer
  static readAsArrayBuffer(blob, { onProgress, signal } = {}) {
    return this._read(blob, "readAsArrayBuffer", { onProgress, signal });
  }

  // 通用读取
  static _read(blob, method, { onProgress, signal } = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      if (onProgress) reader.onprogress = (e) => onProgress(e.loaded, e.total);

      // 中止支持
      if (signal) {
        if (signal.aborted) {
          reader.abort();
          reject(new Error("已中止"));
          return;
        }
        signal.addEventListener("abort", () => reader.abort());
      }

      reader[method](blob);
    });
  }

  // 批量读取多个文件为文本
  static async readAllAsText(files, onEach) {
    const results = [];
    for (const file of files) {
      const text = await this.readAsText(file);
      results.push({ name: file.name, text });
      if (onEach) onEach(file, text);
    }
    return results;
  }

  // 批量读取为 DataURL（常用于图片预览）
  static async readAllAsDataURL(files) {
    const results = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        dataURL: await this.readAsDataURL(file),
      })),
    );
    return results;
  }
}

// ===== 测试 =====
(async () => {
  ensureFileReader();

  const file1 = new File(["line1\nline2\nline3"], "a.txt", {
    type: "text/plain",
  });
  const file2 = new File(["<svg></svg>"], "icon.svg", {
    type: "image/svg+xml",
  });

  // --- 读文本带进度 ---
  const text = await FileReaderWrapper.readAsText(file1, {
    onProgress: (loaded, total) => console.log(`进度: ${loaded}/${total}`),
  });
  console.log("文本:", JSON.stringify(text)); // "line1\nline2\nline3"

  // --- 读 DataURL ---
  const dataURL = await FileReaderWrapper.readAsDataURL(file1);
  console.log("DataURL 前缀:", dataURL.slice(0, 30)); // "data:text/plain;base64,..."

  // --- 读 ArrayBuffer ---
  const buf = await FileReaderWrapper.readAsArrayBuffer(file2);
  console.log("ArrayBuffer 字节:", buf.byteLength); // 13

  // --- 批量读取 ---
  const all = await FileReaderWrapper.readAllAsText([file1, file2]);
  console.log("批量结果数量:", all.length); // 2
  console.log(all[0].name, all[1].name); // a.txt icon.svg

  // --- 批量 DataURL（图片预览） ---
  const previews = await FileReaderWrapper.readAllAsDataURL([file1, file2]);
  console.log("预览数量:", previews.length); // 2

  console.log("FileReader 封装演示完成");
})();
