let vault = JSON.parse(localStorage.getItem("vault") || "[]");
function save() { localStorage.setItem("vault", JSON.stringify(vault)); }
function render() {
  const kw = document.getElementById("search").value.toLowerCase();
  const body = document.getElementById("body"); body.innerHTML = "";
  vault.filter(v => (v.site + v.user).toLowerCase().includes(kw)).forEach(v => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td></td><td></td><td class="pass" title="点击复制">••••••••</td><td class="del">✕</td>`;
    tr.children[0].textContent = v.site;
    tr.children[1].textContent = v.user;
    tr.children[2].onclick = () => { tr.children[2].textContent = v.pass; navigator.clipboard && navigator.clipboard.writeText(v.pass); setTimeout(() => tr.children[2].textContent = "••••••••", 2000); };
    tr.children[3].onclick = () => { vault = vault.filter(x => x.id !== v.id); save(); render(); };
    body.appendChild(tr);
  });
}
document.getElementById("add").onclick = () => {
  const site = document.getElementById("site").value.trim();
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value;
  if (!site || !pass) return alert("请填写网站和密码");
  vault.push({ id: Date.now(), site, user, pass });
  ["site", "user", "pass"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
document.getElementById("search").oninput = render;
render();