let file;
document.getElementById("f").onchange = e => {
  file = e.target.files[0]; if (!file) return;
  document.getElementById("n").textContent = file.name;
  document.getElementById("s").textContent = (file.size / 1024).toFixed(2) + " KB";
  document.getElementById("t").textContent = file.type || "(未知)";
  document.getElementById("l").textContent = new Date(file.lastModified).toLocaleString();
};
function read(method, fn) {
  if (!file) return alert("请先选择文件");
  const r = new FileReader(); r.onload = () => fn(r.result); r[method](file);
}
document.getElementById("text").onclick = () => read("readAsText", t => document.getElementById("res").textContent = t.slice(0, 2000));
document.getElementById("data").onclick = () => read("readAsDataURL", u => document.getElementById("res").textContent = file.type.startsWith("image/") ? `<img src="${u}" style="max-width:100%">` : u.slice(0, 2000));
document.getElementById("bin").onclick = () => read("readAsArrayBuffer", b => document.getElementById("res").textContent = [...new Uint8Array(b)].slice(0, 200).map(x => x.toString(16).padStart(2, "0")).join(" "));