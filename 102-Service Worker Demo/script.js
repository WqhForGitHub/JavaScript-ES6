const statusEl = document.getElementById("status");
async function check() {
  const reg = await navigator.serviceWorker.getRegistrations();
  statusEl.textContent = reg.length ? "✓ 已注册 (" + reg[0].scope + ")" : "未注册";
  document.getElementById("reg").disabled = !!reg.length;
}
document.getElementById("reg").onclick = async () => {
  if (!("serviceWorker" in navigator)) return alert("不支持 SW");
  try {
    const sw = document.getElementById("sw-src").textContent.replace(/^[\s\S]*?javascript\/sw">|<\/script>$/g, "");
    const url = "/sw.js";
    await navigator.serviceWorker.register(url);
    statusEl.textContent = "✓ 注册成功（创建 /sw.js 即可生效）";
    document.getElementById("reg").disabled = true;
    console.log("SW script content:\n" + sw);
  } catch (e) { statusEl.textContent = "注册失败：" + e.message + "（需 HTTPS/localhost 与实际 /sw.js 文件）"; }
};
document.getElementById("unreg").onclick = async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) await r.unregister();
  check();
};
check();