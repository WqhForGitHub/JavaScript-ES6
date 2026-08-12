const re = { email: /^[\w.+-]+@[\w-]+\.[\w.-]+$/, phone: /^1[3-9]\d{9}$/, url: /^https?:\/\/.+/ };
function validate(input) {
  const v = input.value.trim();
  const rules = input.dataset.rule.split("|");
  for (let r of rules) {
    let [name, arg] = r.split(":");
    if (name === "required" && !v) return "必填项";
    if (name === "email" && v && !re.email.test(v)) return "邮箱格式错误";
    if (name === "phone" && v && !re.phone.test(v)) return "手机号格式错误";
    if (name === "url" && v && !re.url.test(v)) return "网址须以 http(s):// 开头";
    if (name === "min" && v.length < +arg) return `至少 ${arg} 字符`;
    if (name === "max" && v.length > +arg) return `至多 ${arg} 字符`;
    if (name === "length") { const [a, b] = arg.split("-"); if (v.length < +a || v.length > +b) return `长度须 ${a}-${b} 位`; }
  }
  return "";
}
document.querySelectorAll("#f input").forEach(inp => {
  inp.oninput = () => { const m = validate(inp); inp.classList.toggle("invalid", !!m); inp.parentElement.querySelector(".err").textContent = m; };
});
document.getElementById("f").onsubmit = e => {
  e.preventDefault();
  let ok = true;
  document.querySelectorAll("#f input").forEach(inp => { const m = validate(inp); if (m) { ok = false; inp.classList.add("invalid"); inp.parentElement.querySelector(".err").textContent = m; } });
  document.getElementById("ok").textContent = ok ? "✓ 全部通过验证" : "";
};