const html = document.getElementById("html"), css = document.getElementById("css"), js = document.getElementById("js");
const cons = document.getElementById("console");
document.getElementById("run").onclick = () => {
  const out = document.getElementById("out");
  const code = `(function(){${js.value.replace(/console\.log\(([^)]*)\)/g, 'parent.postMessage({t:"log", v:arguments[0]}, "*")')}})()`;
  if (document.getElementById("mode").value === "alert") {
    out.srcdoc = `<!doctype html><html><head><style>${css.value}</style></head><body>${html.value}<script>try{${js.value}}catch(e){alert("Error: "+e.message)}<\/script></body></html>`;
  } else {
    out.srcdoc = `<!doctype html><html><head><style>${css.value}</style></head><body>${html.value}<script>const _log=console.log;console.log=function(...a){parent.postMessage({t:'log',v:a.map(x=>typeof x==='object'?JSON.stringify(x):x).join(' ')},'*');_log.apply(console,a)};try{${js.value}}catch(e){parent.postMessage({t:'log',v:'Error: '+e.message},'*')}<\/script></body></html>`;
  }
};
addEventListener("message", e => { if (e.data?.t === "log") { const d = document.createElement("div"); d.textContent = "> " + e.data.v; cons.appendChild(d); cons.scrollTop = cons.scrollHeight; } });
document.getElementById("run").click();