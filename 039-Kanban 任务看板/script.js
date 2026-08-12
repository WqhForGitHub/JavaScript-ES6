const cols = ["待办", "进行中", "已完成"];
let cards = JSON.parse(localStorage.getItem("kanban") || "[]");
function save() { localStorage.setItem("kanban", JSON.stringify(cards)); }
function render() {
  const board = document.getElementById("board"); board.innerHTML = "";
  cols.forEach((name, ci) => {
    const col = document.createElement("div"); col.className = "col";
    const list = cards.filter(c => c.col === ci);
    col.innerHTML = `<h3>${name} <span>${list.length}</span></h3><button class="add">+ 添加</button>`;
    col.querySelector(".add").onclick = () => {
      cards.push({ id: Date.now(), text: "新任务", col: ci }); save(); render();
    };
    col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("over"); });
    col.addEventListener("dragleave", () => col.classList.remove("over"));
    col.addEventListener("drop", e => {
      e.preventDefault(); col.classList.remove("over");
      const id = parseInt(e.dataTransfer.getData("id"));
      const c = cards.find(x => x.id === id); if (c) { c.col = ci; save(); render(); }
    });
    list.forEach(c => {
      const card = document.createElement("div"); card.className = "card"; card.draggable = true;
      card.innerHTML = `<span class="del">✕</span><input>`;
      card.querySelector("input").value = c.text;
      card.querySelector("input").oninput = e => { c.text = e.target.value; save(); };
      card.querySelector(".del").onclick = () => { cards = cards.filter(x => x.id !== c.id); save(); render(); };
      card.addEventListener("dragstart", e => { e.dataTransfer.setData("id", c.id); card.classList.add("dragging"); });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      col.appendChild(card);
    });
    board.appendChild(col);
  });
}
if (!cards.length) {
  cards = [{ id: 1, text: "学习 JavaScript", col: 0 }, { id: 2, text: "写 demo", col: 1 }, { id: 3, text: "完成 30 个", col: 2 }];
  save();
}
render();