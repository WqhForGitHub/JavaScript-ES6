let books = JSON.parse(localStorage.getItem("books") || "[]");
function save() { localStorage.setItem("books", JSON.stringify(books)); }
function render() {
  const kw = document.getElementById("search").value.toLowerCase();
  const body = document.getElementById("body"); body.innerHTML = "";
  books.filter(b => (b.title + b.author).toLowerCase().includes(kw)).forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${b.title}</td><td>${b.author}</td><td>${b.year}</td><td class="${b.borrowed ? "out" : "in"}">${b.borrowed ? "已借出" : "在馆"}</td><td class="act"></td>`;
    const btn = document.createElement("button"); btn.textContent = b.borrowed ? "归还" : "借出";
    btn.onclick = () => { b.borrowed = !b.borrowed; save(); render(); };
    const rm = document.createElement("button"); rm.className = "rm"; rm.textContent = "删除";
    rm.onclick = () => { books = books.filter(x => x.id !== b.id); save(); render(); };
    tr.querySelector(".act").append(btn, rm);
    body.appendChild(tr);
  });
}
document.getElementById("add").onclick = () => {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const year = parseInt(document.getElementById("year").value) || new Date().getFullYear();
  if (!title) return;
  books.push({ id: Date.now(), title, author, year, borrowed: false });
  ["title", "author", "year"].forEach(i => document.getElementById(i).value = "");
  save(); render();
};
document.getElementById("search").oninput = render;
render();