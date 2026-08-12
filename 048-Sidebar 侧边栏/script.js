const sb = document.getElementById("sidebar");
document.getElementById("toggle").onclick = () => sb.classList.toggle("collapsed");
document.querySelectorAll(".sidebar nav a").forEach(a => a.onclick = e => {
  e.preventDefault();
  document.querySelectorAll(".sidebar nav a").forEach(x => x.classList.remove("active"));
  a.classList.add("active");
});