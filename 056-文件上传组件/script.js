let files = [];
document.getElementById("file").onchange = e => {
  files = [...e.target.files];
  document.getElementById("list").innerHTML = files.map((f, i) => `<div class="file" data-i="${i}"><div class="name">${f.name}</div><div class="size">${(f.size / 1024).toFixed(1)} KB</div><div class="bar"><div></div></div></div>`).join("");
};
document.getElementById("upload").onclick = async () => {
  const items = document.querySelectorAll(".file");
  for (let i = 0; i < files.length; i++) {
    const bar = items[i].querySelector(".bar div");
    await fakeUpload(bar);
    document.getElementById("log").innerHTML = `✓ ${files[i].name} 上传完成`;
  }
  document.getElementById("log").innerHTML += "<br>🎉 全部上传完成";
};
function fakeUpload(bar) {
  return new Promise(res => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) { p = 100; clearInterval(t); res(); }
      bar.style.width = p + "%";
    }, 100);
  });
}