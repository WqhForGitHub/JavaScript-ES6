function compileTemplate(tpl) {
  let code = "let __s = '';\n";
  let i = 0, txt = "";
  function emitTxt(t) { if (t) code += `__s += ${JSON.stringify(t)};\n`; }
  while (i < tpl.length) {
    if (tpl[i] === "<" && tpl.substr(i, 2) === "<%") {
      emitTxt(txt); txt = "";
      const end = tpl.indexOf("%>", i + 2); const seg = tpl.slice(i + 2, end);
      if (seg.trim().startsWith("=")) code += `__s += String(${seg.trim().slice(1)});\n`;
      else code += seg + "\n";
      i = end + 2;
    } else if (tpl[i] === "{" && tpl[i + 1] === "{") {
      emitTxt(txt); txt = "";
      const end = tpl.indexOf("}}", i + 2);
      code += `__s += String(${tpl.slice(i + 2, end)});\n`; i = end + 2;
    } else txt += tpl[i++];
  }
  emitTxt(txt); code += "return __s;";
  return new Function("data", "with(data){" + code + "}");
}
document.getElementById("go").onclick = () => {
  const fn = compileTemplate(document.getElementById("tpl").value);
  const out = fn({ title: "示例列表", list: ["苹果", "香蕉", "葡萄"], count: 3 });
  document.getElementById("out").innerHTML = out;
};
document.getElementById("go").click();