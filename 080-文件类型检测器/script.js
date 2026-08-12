const extMap = { jpg: "JPEG 图像", jpeg: "JPEG 图像", png: "PNG 图像", gif: "GIF 图像", mp4: "MP4 视频", mp3: "MP3 音频", pdf: "PDF 文档", zip: "ZIP 压缩", txt: "文本", js: "JavaScript 代码", json: "JSON 数据" };
const magic = [["ffd8ff", ["jpg", "jpeg"]], ["89504e47", "png"], ["47494638", "gif"], ["25504446", "pdf"], ["504b0304", "zip"], ["494433", "mp3"], ["252046526f6d", "ps"]];
document.getElementById("f").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const ext = f.name.split(".").pop().toLowerCase();
  const byExt = extMap[ext] || "未知类型（按扩展名）";
  let byMagic = "未识别";
  const buf = new Uint8Array(await f.slice(0, 16).arrayBuffer());
  const hex = [...buf].map(b => b.toString(16).padStart(2, "0")).join("");
  for (const [m, t] of magic) { if (hex.startsWith(m)) { byMagic = Array.isArray(t) ? t.map(x => extMap[x]).join("/") : extMap[t] || t; break; } }
  document.getElementById("info").innerHTML = `
    文件名：<b>${f.name}</b><br>
    大小：${(f.size / 1024).toFixed(2)} KB<br>
    浏览器 MIME：<b>${f.type || "无"}</b><br>
    扩展名判断：<b>${byExt}</b> <span class="tag">.${ext}</span><br>
    Magic Number 判断：<b>${byMagic}</b><br>
    文件头（Hex）：<code>${hex.slice(0, 16)}</code>`;
};