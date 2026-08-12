const txt = document.getElementById("txt"), res = document.getElementById("res");
document.getElementById("copy").onclick = async () => {
  try {
    if (navigator.clipboard) await navigator.clipboard.writeText(txt.value);
    else { txt.select(); document.execCommand("copy"); }
    res.textContent = "✓ 已复制：" + txt.value.slice(0, 50);
  } catch (e) { res.textContent = "复制失败：" + e.message; }
};
document.getElementById("paste").onclick = async () => {
  try {
    const text = await navigator.clipboard.readText();
    txt.value = text; res.textContent = "✓ 已粘贴剪贴板内容";
  } catch (e) { res.textContent = "粘贴失败（需 HTTPS 或 localhost 与授权）：" + e.message; }
};