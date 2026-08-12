const inp = document.getElementById("in");
function parseJSX(src) {
  const ast = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] === "<" && /[A-Za-z]/.test(src[i + 1])) {
      const m = src.slice(i).match(/^<([A-Za-z][\w-]*)\s*([^>]*?)\/?>/);
      if (m) {
        const tag = m[1]; i += m[0].length;
        ast.push({ type: "JSXElement", tag, props: parseProps(m[2]) });
      } else i++;
    } else { i++; }
  }
  return ast;
}
function parseProps(s) {
  const props = {};
  const re = /(\w+)=\{([^}]+)\}|(\w+)="([^"]+)"/g; let m;
  while (m = re.exec(s)) { if (m[1]) props[m[1]] = "EXPR:" + m[2]; else props[m[3]] = m[4]; }
  return props;
}
function toCode(ast) {
  return ast.map(n => `h(${JSON.stringify(n.tag)}, ${JSON.stringify(n.props)})`).join(", ");
}
function run() {
  const src = inp.value;
  const ast = parseJSX(src);
  document.getElementById("ast").textContent = JSON.stringify(ast, null, 2);
  document.getElementById("out").textContent = src.replace(/<([A-Za-z][\w-]*)\s*([^>]*?)\/?>/g, (_, t, p) => `h(${JSON.stringify(t)}, {${p}})`);
}
inp.oninput = run; run();