document.getElementById("d2b").onclick = () => {
  const n = document.getElementById("dec").value.trim();
  if (!/^-?\d+$/.test(n)) return alert("请输入整数");
  const b = BigInt(n);
  document.getElementById("bin").value = b < 0n ? "-" + (-b).toString(2) : b.toString(2);
};
document.getElementById("b2d").onclick = () => {
  const s = document.getElementById("bin").value.trim();
  if (!/^-?[01]+$/.test(s)) return alert("请输入有效的二进制字符串");
  const neg = s.startsWith("-");
  const b = BigInt(neg ? s.slice(1) : s);
  document.getElementById("dec").value = (neg ? -b : b).toString();
};