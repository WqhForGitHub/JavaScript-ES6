const dd = document.getElementById("dd");
dd.querySelector(".dd-btn").onclick = e => { e.stopPropagation(); dd.classList.toggle("open"); };
document.addEventListener("click", () => dd.classList.remove("open"));
dd.querySelectorAll(".dd-menu a").forEach(a => a.onclick = () => { dd.classList.remove("open"); dd.querySelector(".dd-btn").textContent = a.textContent + " ▾"; });