/**
 * 手写下载文件
 *
 * 浏览器端文件下载常见方式：
 *   1. URL 直链：a[href][download]
 *   2. Blob 流下载：把数据转 Blob，生成 objectURL 触发 a 标签
 *   3. 大文件流式下载（streamSaver 等）
 *
 * 这里实现：
 *   - downloadByBlob(content, filename, mime)：内存数据转 Blob 下载
 *   - downloadByUrl(url, filename)：直链下载
 *   - requestAndDownload(url, filename)：fetch 拿 blob 再下载（带鉴权头）
 *
 * 实现思路：
 *   1. 创建 <a> 标签，设置 href 与 download
 *   2. append 到 body，click()，再移除
 *   3. URL.createObjectURL 用完 revokeObjectURL 释放
 */

function downloadByBlob(content, filename, mime = "text/plain") {
  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else if (typeof content === "string") {
    blob = new Blob([content], { type: mime });
  } else {
    // 对象转 JSON
    blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
  }

  if (typeof document === "undefined") {
    // Node 环境：直接写文件演示
    console.log(`[Node 模拟] 下载文件 ${filename}，大小 ${blob.size} 字节`);
    return;
  }

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadByUrl(url, filename) {
  if (typeof document === "undefined") {
    console.log(`[Node 模拟] 直链下载 ${filename} <- ${url}`);
    return;
  }
  triggerDownload(url, filename);
}

async function requestAndDownload(url, filename, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  downloadByBlob(blob, filename);
}

function triggerDownload(href, filename) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ===== 测试（Node 环境走模拟分支） =====
downloadByBlob("hello file content", "hello.txt", "text/plain");
// [Node 模拟] 下载文件 hello.txt，大小 18 字节

downloadByBlob({ name: "report", items: [1, 2, 3] }, "report.json");
// [Node 模拟] 下载文件 report.json，大小 33 字节 左右

downloadByUrl("https://example.com/static/data.csv", "data.csv");
// [Node 模拟] 直链下载 data.csv <- https://example.com/static/data.csv

// 构造 Blob 大小验证
const b = new Blob(["abc"]);
console.log("Blob 大小:", b.size); // Blob 大小: 3

// 文件名生成工具
function buildTimestampFilename(prefix, ext) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `${prefix}_${stamp}.${ext}`;
}
console.log("生成文件名:", buildTimestampFilename("export", "csv")); // 生成文件名: export_YYYYMMDD_HHMMSS.csv
