// 215. appendChild操作

if (typeof document !== "undefined") {
  const ul = document.createElement("ul");
  ["A", "B", "C"].forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  console.log(ul.outerHTML);
}
