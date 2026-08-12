const modal = document.getElementById("modal");
function openModal(msg, title = "温馨提示") {
  modal.querySelector("h2").textContent = title;
  modal.querySelector("p").textContent = msg;
  modal.classList.add("show");
}
function closeModal() { modal.classList.remove("show"); }
document.getElementById("open").onclick = () => openModal("这是一个 Modal 弹窗组件 Demo，点击遮罩或关闭按钮即可关闭。");
document.getElementById("openCustom").onclick = () => openModal("你可以传入任意文案和标题展示。", "自定义弹窗");
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
modal.querySelector(".cancel").onclick = closeModal;
modal.querySelector(".actions .primary").onclick = () => { closeModal(); alert("已确认"); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });