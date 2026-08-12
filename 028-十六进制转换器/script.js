document.getElementById("d2h").onclick = () => {
  const n = document.getElementById("dec").value.trim();
  if (!/^-?\d+$/.test(n)) return alert("请输入整数");
  const b = BigInt(n);
  const h = (b < 0n ? -b : b).toString(16).toUpperCase();
  document.getElementById("hex").value = (b < 0n ? "-" : "") + h;
};
document.getElementById("h2d").onclick = () => {
  const s = document.getElementById("hex").value.trim();
  if (!/^-?[0-9a-fA-F]+$/.test(s)) return alert("非法十六进制");
  const neg = s.startsWith("-");
  const b = BigInt("0x" + (neg ? s.slice(1) : s));
  document.getElementById("dec").value = (neg ? -b : b).toString();
};
document.getElementById("h2s").onclick = () => {
  const s = document.getElementById("bytes").value.trim();
  const hex = s.replace(/0x/g, "").split(/[\s,]+/).filter(Boolean).join("");
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2) return alert("字节格式错误");
  let str = "";
  for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  document.getElementById("bytes").value = str;
};