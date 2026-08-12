function parseJSON(src) {
  let i = 0;
  function error() { throw new Error(`解析失败：在位置 ${i} 附近遇到 "${src[i] || "EOF"}"`); }
  function skip() { while (/\s/.test(src[i])) i++; }
  function parseStr() {
    i++; let s = "";
    while (i < src.length && src[i] !== '"') {
      if (src[i] === "\\") { i++; s += src[i] === "n" ? "\n" : src[i] === "t" ? "\t" : src[i]; i++; }
      else s += src[i++];
    }
    if (i >= src.length) error();
    i++; return s;
  }
  function parseNum() { const m = src.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/); if (!m) error(); i += m[0].length; return parseFloat(m[0]); }
  function parseKW() {
    if (src.substr(i, 4) === "true") { i += 4; return true; }
    if (src.substr(i, 5) === "false") { i += 5; return false; }
    if (src.substr(i, 4) === "null") { i += 4; return null; }
    error();
  }
  function parseArr() {
    i++; const arr = []; skip();
    if (src[i] === "]") { i++; return arr; }
    arr.push(parseVal()); skip();
    while (src[i] === ",") { i++; arr.push(parseVal()); skip(); }
    if (src[i] !== "]") error(); i++; return arr;
  }
  function parseObj() {
    i++; const o = {}; skip();
    if (src[i] === "}") { i++; return o; }
    while (true) {
      skip();
      if (src[i] !== '"') error();
      const k = parseStr(); skip();
      if (src[i] !== ":") error(); i++;
      o[k] = parseVal(); skip();
      if (src[i] === ",") { i++; continue; }
      if (src[i] === "}") { i++; break; }
      error();
    }
    return o;
  }
  function parseVal() {
    skip(); const c = src[i];
    if (c === "{") return parseObj();
    if (c === "[") return parseArr();
    if (c === '"') return parseStr();
    if (c === "-" || /[0-9]/.test(c)) return parseNum();
    return parseKW();
  }
  return parseVal();
}
function tryParse() {
  try { return JSON.stringify(parseJSON(document.getElementById("in").value), null, 2); }
  catch (e) { return "❌ " + e.message; }
}
document.getElementById("go").onclick = () => document.getElementById("out").textContent = tryParse();
document.getElementById("go").click();