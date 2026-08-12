const src = document.getElementById("worker-src").textContent;
const blob = new Blob([src], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));
document.getElementById("run").onclick = () => {
  const n = parseInt(document.getElementById("n").value) || 1000;
  document.getElementById("out").textContent = "计算中...";
  worker.postMessage(n);
};
worker.onmessage = e => { const v = e.value || e.data; document.getElementById("out").textContent = "1+2+...+n = " + v; };
worker.onerror = e => document.getElementById("out").textContent = "错误：" + e.message;