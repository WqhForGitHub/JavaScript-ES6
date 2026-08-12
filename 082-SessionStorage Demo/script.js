function load() {
  const v = sessionStorage.getItem("demo");
  document.getElementById("box").textContent = v ? `已保存：${v}（在 ${sessionStorage.getItem("t")} 时刻）` : "（暂无数据）";
}
document.getElementById("set").onclick = () => {
  const v = document.getElementById("v").value;
  if (!v) return;
  sessionStorage.setItem("demo", v);
  sessionStorage.setItem("t", new Date().toLocaleTimeString());
  load();
};
document.getElementById("open").onclick = e => { e.preventDefault(); window.open(location.href, "_blank"); };
load();