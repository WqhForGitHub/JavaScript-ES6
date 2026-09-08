const len = document.getElementById("len");
len.oninput = () => document.getElementById("lenv").textContent = len.value;
function gen() {
  const sets = [];
  if (document.getElementById("lo").checked) sets.push("abcdefghijklmnopqrstuvwxyz");
  if (document.getElementById("up").checked) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (document.getElementById("num").checked) sets.push("0123456789");
  if (document.getElementById("sym").checked) sets.push("!@#$%^&*()-_=+[]{}<>?");
  if (!sets.length) { alert("至少选择一种字符类型"); return; }
  const all = sets.join("");
  const n = parseInt(len.value);
  let pwd = "";
  const crypto = window.crypto || window.msCrypto;
  const arr = new Uint32Array(n);
  (crypto ? crypto.getRandomValues(arr) : null);
  for (let i = 0; i < n; i++) {
    const r = crypto ? arr[i] / 0xffffffff : Math.random();
    pwd += all[Math.floor(r * all.length)];
  }
  document.getElementById("pwd").value = pwd;
}
document.getElementById("gen").onclick = gen;
document.getElementById("copy").onclick = () => navigator.clipboard && navigator.clipboard.writeText(document.getElementById("pwd").value);
gen();