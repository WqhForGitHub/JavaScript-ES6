document.getElementById("tb").addEventListener("click", e => {
  const btn = e.target.closest("button"); if (!btn) return;
  document.execCommand(btn.dataset.c, false, btn.dataset.v || null);
  document.querySelector(".editor").focus();
});