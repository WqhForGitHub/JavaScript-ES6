const emailRe = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
function err(input, msg) { input.classList.toggle("invalid", !!msg); input.parentElement.querySelector(".err").textContent = msg || ""; }
const em = document.getElementById("em"), u = document.getElementById("u"), p = document.getElementById("p"), p2 = document.getElementById("p2");
em.oninput = () => err(em, emailRe.test(em.value) ? "" : "邮箱格式错误");
u.oninput = () => err(u, u.value.length >= 3 ? "" : "用户名至少 3 位");
p.oninput = () => { err(p, p.value.length >= 6 ? "" : "密码至少 6 位"); if (p2.value) p2.oninput(); };
p2.oninput = () => err(p2, p2.value === p.value ? "" : "两次密码不一致");
document.getElementById("form").onsubmit = e => {
  e.preventDefault();
  let ok = true;
  if (!emailRe.test(em.value)) { err(em, "邮箱格式错误"); ok = false; }
  if (u.value.length < 3) { err(u, "用户名至少 3 位"); ok = false; }
  if (p.value.length < 6) { err(p, "密码至少 6 位"); ok = false; }
  if (p.value !== p2.value) { err(p2, "两次密码不一致"); ok = false; }
  if (!document.getElementById("ag").checked) { alert("请同意条款"); ok = false; }
  if (ok) alert("注册成功（演示）");
};