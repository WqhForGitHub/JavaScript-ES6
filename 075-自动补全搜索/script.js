const langs = ["JavaScript", "TypeScript", "Java", "Python", "Go", "Rust", "C", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala", "Perl", "Lua", "Elixir", "Haskell", "Julia"];
const inp = document.getElementById("inp"), drop = document.getElementById("drop");
function hl(s, q) { const i = s.toLowerCase().indexOf(q.toLowerCase()); if (i < 0) return s; return s.slice(0, i) + "<b>" + s.slice(i, i + q.length) + "</b>" + s.slice(i + q.length); }
inp.oninput = () => {
  const q = inp.value.trim().toLowerCase();
  if (!q) { drop.classList.remove("show"); return; }
  const m = langs.filter(l => l.toLowerCase().includes(q)).slice(0, 8);
  drop.innerHTML = m.length ? m.map(l => `<div data-v="${l}">${hl(l, q)}</div>`).join("") : "<div>无匹配</div>";
  drop.classList.add("show");
  drop.querySelectorAll("div[data-v]").forEach(d => d.onclick = () => { inp.value = d.dataset.v; drop.classList.remove("show"); });
};
document.addEventListener("click", e => { if (!e.target.closest(".wrap")) drop.classList.remove("show"); });