document.getElementById("file").onchange = e => {
  const grid = document.getElementById("grid"); grid.innerHTML = "";
  [...e.target.files].forEach(f => {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img"); img.className = "thumb"; img.src = url;
    img.onclick = () => { document.getElementById("big").src = url; document.getElementById("lightbox").classList.add("show"); };
    grid.appendChild(img);
  });
};
document.getElementById("close").onclick = () => document.getElementById("lightbox").classList.remove("show");
document.getElementById("lightbox").onclick = e => { if (e.target.id === "lightbox") e.currentTarget.classList.remove("show"); };
document.addEventListener("keydown", e => { if (e.key === "Escape") document.getElementById("lightbox").classList.remove("show"); });