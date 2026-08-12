function format(src) {
  let out = "", depth = 0, i = 0, str = false, lineStart = true;
  const indent = () => "  ".repeat(depth);
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") { if (str === c) str = false; else if (!str) str = c; out += c; lineStart = false; i++; continue; }
    if (str) { out += c; lineStart = false; i++; continue; }
    if (c === " " && lineStart) { i++; continue; }
    if (c === "\n") { out += "\n"; lineStart = true; i++; continue; }
    if (lineStart) { out += indent(); lineStart = false; }
    if (c === "{" || c === "[" || c === "(") { out += c; depth++; out += "\n"; lineStart = true; i++; continue; }
    if (c === "}" || c === "]" || c === ")") { depth = Math.max(0, depth - 1); out = out.replace(/\s+$/, "\n"); out += indent() + c; i++; lineStart = false; if (src[i] === ";" || src[i] === ",") { out += src[i]; i++; } out += "\n"; lineStart = true; continue; }
    if (c === ";") { out += c; if (src[i + 1] !== "\n") { out += "\n"; lineStart = true; } i++; continue; }
    out += c; i++;
  }
  return out.replace(/\n{3,}/g, "\n\n").replace(/^[ \t]+$/gm, "").trim() + "\n";
}
document.getElementById("go").onclick = () => document.getElementById("out").value = format(document.getElementById("in").value);
document.getElementById("go").click();