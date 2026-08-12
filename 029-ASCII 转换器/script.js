const tbl = document.getElementById("tbl");
let html = "";
for (let i = 32; i < 127; i++) {
  const ch = String.fromCharCode(i);
  html += `<div><b>${i}</b><br>${ch === " " ? "␣" : ch}</div>`;
}
tbl.innerHTML = html;
document.getElementById("t2a").onclick = () => {
  const s = document.getElementById("txt").value;
  document.getElementById("asc").value = [...s].map(c => c.charCodeAt(0)).join(", ");
};
document.getElementById("a2t").onclick = () => {
  const s = document.getElementById("asc").value.split(/[\s,]+/).filter(Boolean);
  document.getElementById("txt").value = s.map(n => String.fromCharCode(parseInt(n))).join("");
};