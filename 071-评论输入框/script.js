let id = 0;
const c = document.getElementById("c"), info = document.getElementById("info"), send = document.getElementById("send");
function upd() {
  const n = c.value.length;
  info.textContent = `${n}/200`;
  info.classList.toggle("over", n > 200);
  send.disabled = !c.value.trim() || n > 200;
}
c.oninput = upd;
send.onclick = () => {
  if (send.disabled) return;
  id++;
  const li = document.createElement("li");
  li.innerHTML = `<div class="meta"><span class="av">U</span>游客 · ${new Date().toLocaleTimeString("zh-CN")}</div><div class="txt"></div>`;
  li.querySelector(".txt").textContent = c.value.trim();
  document.getElementById("list").prepend(li);
  c.value = ""; upd();
};
upd();