function uuidv4() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
function short() {
  const arr = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}
document.getElementById("gen").onclick = () => {
  const n = Math.min(parseInt(document.getElementById("n").value) || 5, 100);
  const v = document.getElementById("ver").value;
  const out = document.getElementById("out"); out.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const id = v === "v4" ? uuidv4() : short();
    const row = document.createElement("div");
    row.innerHTML = "<span>" + id + "</span><b>复制</b>";
    row.querySelector("b").onclick = () => navigator.clipboard && navigator.clipboard.writeText(id);
    row.style.cursor = "pointer";
    out.appendChild(row);
  }
  out.dataset.all = "";
};
document.getElementById("copyAll").onclick = () => {
  const text = [...document.querySelectorAll("#out span")].map(s => s.textContent).join("\n");
  navigator.clipboard && navigator.clipboard.writeText(text);
};
document.getElementById("gen").click();