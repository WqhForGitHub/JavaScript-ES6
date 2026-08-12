let items = ["写文档", "回复邮件", "开会讨论", "更新代码", "整理 WiKi", "复习笔记"];
const list = document.getElementById("list");
let dragSrc = null;
function render() {
  list.innerHTML = "";
  items.forEach((t, i) => {
    const li = document.createElement("li"); li.draggable = true;
    li.innerHTML = `<span>${t}</span><span class="grip">⋮⋮</span>`;
    li.addEventListener("dragstart", () => { dragSrc = i; li.classList.add("dragging"); });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    li.addEventListener("dragover", e => { e.preventDefault(); li.classList.add("over"); });
    li.addEventListener("dragleave", () => li.classList.remove("over"));
    li.addEventListener("drop", e => {
      e.preventDefault(); li.classList.remove("over");
      const moved = items[dragSrc]; items.splice(dragSrc, 1); items.splice(i, 0, moved);
      render();
    });
    list.appendChild(li);
  });
}
render();