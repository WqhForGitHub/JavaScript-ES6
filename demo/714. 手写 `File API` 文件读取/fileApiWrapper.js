/**
 * 手写 File API 文件读取
 *
 * File API 作用：
 *   - 通过 <input type="file"> 或拖放获取 File 对象
 *   - File 继承自 Blob，提供 name/size/type/lastModified
 *   - 配合 FileReader 或 Blob.text()/arrayBuffer() 读取内容
 *
 * 封装目标：
 *   1. 统一获取 input 选中的文件列表
 *   2. 文件信息提取（大小格式化、类型判断）
 *   3. Promise 化读取（文本/ArrayBuffer/DataURL）
 *   4. Node 环境：用 Buffer 构造 Mock File/Blob 演示
 */

// 跨环境 Blob/File mock
function ensureFileAPI() {
  if (typeof Blob !== "undefined") return;
  // Node mock
  global.Blob = class MockBlob {
    constructor(parts, options = {}) {
      this._parts = parts;
      this.type = options.type || "";
      this.size = parts.reduce(
        (s, p) => s + (p.length || p.byteLength || p.size || 0),
        0,
      );
    }
    async text() {
      return this._parts
        .map((p) => (typeof p === "string" ? p : p.toString("utf8")))
        .join("");
    }
    async arrayBuffer() {
      const text = await this.text();
      const buf = Buffer.from(text, "utf8");
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
  };
  global.File = class MockFile extends global.Blob {
    constructor(parts, name, options = {}) {
      super(parts, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

class FileApiWrapper {
  // 从 input 元素获取文件列表
  static getFiles(input) {
    if (!input || !input.files) return [];
    return Array.from(input.files);
  }

  // 格式化文件大小
  static formatSize(bytes) {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  }

  // 判断是否为图片
  static isImage(file) {
    return file.type.startsWith("image/");
  }

  // 判断是否为视频
  static isVideo(file) {
    return file.type.startsWith("video/");
  }

  // 读取为文本
  static readAsText(file) {
    if (file.text) return file.text();
    return this._readWithFileReader(file, "readAsText");
  }

  // 读取为 ArrayBuffer
  static readAsArrayBuffer(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return this._readWithFileReader(file, "readAsArrayBuffer");
  }

  // 读取为 DataURL（base64）
  static readAsDataURL(file) {
    return this._readWithFileReader(file, "readAsDataURL");
  }

  static _readWithFileReader(file, method) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader[method](file);
    });
  }

  // 提取文件信息摘要
  static getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      sizeText: this.formatSize(file.size),
      type: file.type || "unknown",
      lastModified: new Date(file.lastModified).toLocaleString(),
      isImage: this.isImage(file),
      isVideo: this.isVideo(file),
    };
  }
}

// ===== 测试 =====
(() => {
  ensureFileAPI();

  // --- 构造 mock 文件 ---
  const txtFile = new File(["Hello, File API!", "\n第二行内容"], "readme.txt", {
    type: "text/plain",
  });
  const imgFile = new File(["<fake-png-bytes>"], "photo.png", {
    type: "image/png",
  });
  const bigFile = new File([new Array(1024 * 1024 + 1).join("x")], "big.bin", {
    type: "application/octet-stream",
  });

  // --- 文件信息 ---
  console.log(FileApiWrapper.getFileInfo(txtFile));
  // { name: 'readme.txt', size: 24, sizeText: '24 B', type: 'text/plain', ... isImage: false }

  console.log(FileApiWrapper.getFileInfo(imgFile).isImage); // true
  console.log(FileApiWrapper.getFileInfo(bigFile).sizeText); // "1.00 MB"

  // --- 大小格式化 ---
  console.log(FileApiWrapper.formatSize(0)); // "0 B"
  console.log(FileApiWrapper.formatSize(1024)); // "1.00 KB"
  console.log(FileApiWrapper.formatSize(1048576)); // "1.00 MB"
  console.log(FileApiWrapper.formatSize(1610612736)); // "1.50 GB"

  // --- 类型判断 ---
  console.log(FileApiWrapper.isImage(imgFile), FileApiWrapper.isVideo(imgFile)); // true false

  // --- 异步读取 ---
  (async () => {
    const text = await FileApiWrapper.readAsText(txtFile);
    console.log("文本内容:", JSON.stringify(text)); // "Hello, File API!\n第二行内容"

    const buf = await FileApiWrapper.readAsArrayBuffer(txtFile);
    console.log("ArrayBuffer 字节数:", buf.byteLength); // 24

    console.log("File API 演示完成");
  })();
})();
