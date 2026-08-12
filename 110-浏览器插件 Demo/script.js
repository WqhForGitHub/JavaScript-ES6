const demo = {
  "manifest.json": JSON.stringify({
    manifest_version: 3, name: "Demo Extension", version: "1.0",
    description: "最小 Manifest V3 插件", action: { default_popup: "popup.html" },
    permissions: ["storage"]
  }, null, 2),
  "popup.html": "<!DOCTYPE html><html><body style='width:200px;padding:14px;font-family:sans-serif'><h3>Hello</h3><button onclick=chrome.storage.local.get('n',r=>{r.n=(r.n||0)+1;chrome.storage.local.set(r);document.body.querySelector('span').textContent=r.n})>点击 <span>0</span> 次</button></body></html>"
};
document.getElementById("code").textContent = demo["manifest.json"] + "\n\n// popup.html\n" + demo["popup.html"];
document.getElementById("dl").onclick = () => {
  const blob = new Blob([Object.entries(demo).map(([k, v]) => `// == ${k} ==\n${v}`).join("\n\n")], { type: "text/plain" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "extension-demo.txt"; a.click();
};