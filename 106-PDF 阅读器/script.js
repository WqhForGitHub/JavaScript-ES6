pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let pdf, page = 1;
const cv = document.getElementById("cv");
async function render() {
  const p = await pdf.getPage(page);
  const viewport = p.getViewport({ scale: 1.5 });
  cv.width = viewport.width; cv.height = viewport.height;
  await p.render({ canvasContext: cv.getContext("2d"), viewport }).promise;
  document.getElementById("pg").textContent = `${page}/${pdf.numPages}`;
}
document.getElementById("f").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const buf = await f.arrayBuffer();
  pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  page = 1; render();
};
document.getElementById("prev").onclick = () => { if (pdf && page > 1) { page--; render(); } };
document.getElementById("next").onclick = () => { if (pdf && page < pdf.numPages) { page++; render(); } };