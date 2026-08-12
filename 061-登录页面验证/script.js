function err(input, msg) {
  input.classList.toggle("invalid", !!msg);
  input.parentElement.querySelector(".err").textContent = msg || "";
}
document.getElementById("u").oninput = e => err(e.target, e.target.value.length < 3 ? "至少 3 个字符" : "");
document.getElementById("p").oninput = e => err(e.target, e.target.value.length < 6 ? "密码至少 6 位" : "");
document.getElementById("form").onsubmit = e => {
  e.preventDefault();
  const u = document.getElementById("u"), p = document.getElementById("p");
  let ok = true;
  if (u.value.trim().length < 3) { err(u, "用户名至少 3 个字符"); ok = false; }
  if (p.value.length < 6) { err(p, "密码至少 6 位"); ok = false; }
  if (ok) { alert("登录成功（演示）用户：" + u.value); }
};