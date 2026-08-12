let compUrl = null;
const q = document.getElementById("q");
q.oninput = () => document.getElementById("qv").textContent = q.value + "%";
function fmt(b) { return b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(2) + " MB" : (b / 1024).toFixed(1) + " KB"; }
document.getElementById("file").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f);
  document.getElementById("orig").src = url;
  document.getElementById("origSize").textContent = fmt(f.size);
  compress(f);
};
function compress(f) {
  const img = new Image(); img.src = URL.createObjectURL(f);
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    c.toBlob(blob => {
      if (compUrl) URL.revokeObjectURL(compUrl);
      compUrl = URL.createObjectURL(blob);
      document.getElementById("comp").src = compUrl;
      document.getElementById("compSize").textContent = fmt(blob.size);
    }, "image/jpeg", parseInt(q.value) / 100);
  };
}
document.getElementById("dl").onclick = () => { if (!compUrl) return; const a = document.createElement("a"); a.href = compUrl; a.download = "compressed.jpg"; a.click(); };