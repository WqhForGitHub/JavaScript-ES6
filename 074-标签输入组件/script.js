const box = document.getElementById("box"), inp = document.getElementById("inp");
const tags = ["JavaScript", "Web"];
function render() {
  [...box.querySelectorAll(".tag")].forEach(t => t.remove());
  tags.forEach((t, i) => {
    const el = document.createElement("span"); el.className = "tag";
    el.innerHTML = `${t}<span class="x">✕</span>`;
    el.querySelector(".x").onclick = () => { tags.splice(i, 1); render(); };
    box.insertBefore(el, inp);
  });
}
inp.addEventListener("keydown", e => {
  const v = inp.value.trim();
  if (e.key === "Enter" && v) { if (!tags.includes(v)) tags.push(v); inp.value = ""; render(); }
  else if (e.key === "Backspace" && !inp.value && tags.length) { tags.pop(); render(); }
});
render();