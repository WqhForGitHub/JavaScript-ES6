const t = document.getElementById("text");
function calc() {
  const v = t.value;
  document.getElementById("chars").textContent = v.length;
  document.getElementById("noSpace").textContent = v.replace(/\s/g, "").length;
  document.getElementById("lines").textContent = v ? v.split(/\r\n|\r|\n/).length : 0;
  document.getElementById("paras").textContent = v ? v.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  document.getElementById("bytes").textContent = new Blob([v]).size;
}
t.oninput = calc; calc();