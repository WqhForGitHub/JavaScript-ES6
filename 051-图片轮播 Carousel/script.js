const slides = [
  ["linear-gradient(135deg,#667eea,#764ba2)", "紫色梦境"],
  ["linear-gradient(135deg,#f093fb,#f5576c)", "粉红日落"],
  ["linear-gradient(135deg,#4facfe,#00f2fe)", "碧空晴朗"],
  ["linear-gradient(135deg,#43e97b,#38f9d7)", "青翠森林"],
  ["linear-gradient(135deg,#fa709a,#fee140)", "暖阳橙黄"],
];
const track = document.getElementById("track");
const dots = document.getElementById("dots");
slides.forEach((s, i) => {
  const d = document.createElement("div"); d.className = "slide";
  d.style.background = s[0]; d.textContent = s[1];
  track.appendChild(d);
  const dot = document.createElement("span"); dot.onclick = () => go(i);
  dots.appendChild(dot);
});
let cur = 0;
function go(i) { cur = (i + slides.length) % slides.length; track.style.transform = `translateX(-${cur * 100}%)`; [...dots.children].forEach((d, j) => d.classList.toggle("active", j === cur)); }
document.getElementById("prev").onclick = () => go(cur - 1);
document.getElementById("next").onclick = () => go(cur + 1);
let auto = setInterval(() => go(cur + 1), 3000);
document.getElementById("carousel").onmouseenter = () => clearInterval(auto);
document.getElementById("carousel").onmouseleave = () => auto = setInterval(() => go(cur + 1), 3000);
go(0);