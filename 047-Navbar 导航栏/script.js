const burger = document.getElementById("burger"), menu = document.getElementById("menu");
burger.onclick = () => menu.classList.toggle("open");
menu.querySelectorAll("a").forEach(a => a.onclick = e => {
  e.preventDefault();
  menu.querySelectorAll("a").forEach(x => x.classList.remove("active"));
  a.classList.add("active");
  if (window.innerWidth <= 600) menu.classList.remove("open");
});