// 214. DOM节点创建器

function createNode(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => el.setAttribute(k, v));
  children.forEach((c) => el.append(c));
  return el;
}
if (typeof document !== "undefined")
  console.log(createNode("div", { class: "card" }, ["hello"]).outerHTML);
