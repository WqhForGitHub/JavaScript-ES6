function diff(a, b) {
  a = [...a]; b = [...b];
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) dp[i + 1][j + 1] = a[i] === b[j] ? dp[i][j] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { out.unshift({ t: " ", c: a[i - 1] }); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { out.unshift({ t: "-", c: a[--i] }); }
    else { out.unshift({ t: "+", c: b[--j] }); }
  }
  while (i > 0) out.unshift({ t: "-", c: a[--i] });
  while (j > 0) out.unshift({ t: "+", c: b[--j] });
  return out;
}
document.getElementById("go").onclick = () => {
  const a = document.getElementById("a").value, b = document.getElementById("b").value;
  const out = diff(a, b);
  document.getElementById("out").innerHTML = out.map(o => `<span class="${o.t === "+" ? "add" : o.t === "-" ? "del" : "keep"}">${o.t}${o.c === "\n" ? "↵" : o.c}</span>`).join("\n");
};