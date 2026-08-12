// 简单递归下降解析器：表达式 -> 项(+-) -> 因(*/) -> 原子(数字/括号)
function parse(src) {
  let i = 0;
  function peek() { return src[i]; }
  function skip() { while (/\s/.test(peek())) i++; }
  function num() { skip(); let s = ""; while (/[0-9.]/.test(peek())) s += src[i++]; return { type: "Num", value: parseFloat(s) }; }
  function factor() {
    skip(); if (peek() === "(") { i++; const e = expr(); skip(); if (peek() === ")") i++; return e; }
    return num();
  }
  function term() { let l = factor(); while (peek() === "*" || peek() === "/") { const op = src[i++]; const r = factor(); l = { type: "BinOp", op, left: l, right: r }; } return l; }
  function expr() { let l = term(); while (peek() === "+" || peek() === "-") { const op = src[i++]; const r = term(); l = { type: "BinOp", op, left: l, right: r }; } return l; }
  return { type: "Program", body: expr() };
}
function evalAST(n) {
  if (n.type === "Num") return n.value;
  if (n.type === "BinOp") { const l = evalAST(n.left), r = evalAST(n.right); return n.op === "+" ? l + r : n.op === "-" ? l - r : n.op === "*" ? l * r : l / r; }
}
document.getElementById("go").onclick = () => {
  const ast = parse(document.getElementById("exp").value);
  document.getElementById("ast").textContent = JSON.stringify(ast, null, 2);
  document.getElementById("val").textContent = evalAST(ast.body);
};
document.getElementById("go").click();