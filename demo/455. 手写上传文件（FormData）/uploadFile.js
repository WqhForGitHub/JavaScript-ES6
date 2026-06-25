/**
 * 手写上传文件（FormData）
 *
 * 文件上传通过 FormData + XHR/fetch 实现，支持：
 *   - 单文件 / 多文件上传
 *   - 进度监听（XHR upload.onprogress）
 *   - 额外表单字段
 *   - 取消上传（AbortController）
 *
 * 实现思路：
 *   1. 将 File 对象 append 到 FormData
 *   2. 使用 XHR 以 multipart/form-data 发送（浏览器自动设置 boundary）
 *   3. 监听 upload.progress 计算百分比
 *   4. 完成/失败/取消分别处理
 */

function uploadFile(url, files, options = {}) {
  const {
    fieldName = "file",
    data = {}, // 额外表单字段
    headers = {},
    onProgress = () => {},
    signal = null,
  } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // 附加额外字段
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    // 附加文件
    const fileArr = Array.isArray(files) ? files : [files];
    if (fileArr.length > 1) {
      fileArr.forEach((file) => formData.append(fieldName, file, file.name));
    } else {
      fileArr.forEach((file) => formData.append(fieldName, file, file.name));
    }

    xhr.open("POST", url, true);

    // 不要手动设置 Content-Type，浏览器会自动加 boundary
    Object.keys(headers).forEach((key) =>
      xhr.setRequestHeader(key, headers[key]),
    );

    // 进度
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent, e);
      }
    };

    xhr.onload = function () {
      const response = safeParse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ status: xhr.status, data: response });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload network error"));

    if (signal) {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Aborted"));
      });
    }

    xhr.send(formData);
  });
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

// ===== 测试（Node 18+ 有 FormData / File / Blob / XMLHttpRequest 通过 mock） =====
// Node 18 内置 FormData / Blob，File 需构造
function makeFile(name, content) {
  if (typeof File !== "undefined") {
    return new File([content], name);
  }
  // 降级：Blob
  return new Blob([content], { type: "text/plain" });
}

// mock XMLHttpRequest
if (typeof XMLHttpRequest === "undefined") {
  global.XMLHttpRequest = function () {
    this.upload = {};
    this.open = function () {};
    this.setRequestHeader = function () {};
    this.send = function () {
      // 模拟进度
      this.upload.onprogress &&
        this.upload.onprogress({
          lengthComputable: true,
          loaded: 50,
          total: 100,
        });
      this.upload.onprogress &&
        this.upload.onprogress({
          lengthComputable: true,
          loaded: 100,
          total: 100,
        });
      this.status = 200;
      this.responseText = JSON.stringify({ url: "/files/demo.txt", size: 100 });
      this.onload && this.onload();
    };
  };
}

const file = makeFile("demo.txt", "hello world");

uploadFile("https://example.com/upload", file, {
  data: { userId: "u1" },
  onProgress: (percent) => console.log("上传进度:", percent + "%"),
})
  .then((res) => {
    console.log("上传成功:", res.data); // 上传成功: { url: '/files/demo.txt', size: 100 }
  })
  .catch((err) => console.log("上传失败:", err.message));

// 多文件
uploadFile(
  "https://example.com/upload",
  [makeFile("a.txt", "a"), makeFile("b.txt", "b")],
  {
    onProgress: () => {},
  },
)
  .then((res) => console.log("多文件上传:", res.status)) // 多文件上传: 200
  .catch((err) => console.log("err:", err.message));

console.log("FormData 是否可用:", typeof FormData !== "undefined"); // FormData 是否可用: true
