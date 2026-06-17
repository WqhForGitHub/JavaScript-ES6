// 222. DOM diff算法

function diff(oldNode, newNode) {
  const patches = [];
  if (!oldNode) patches.push({ type: "CREATE", node: newNode });
  else if (!newNode) patches.push({ type: "REMOVE" });
  else if (oldNode.tag !== newNode.tag)
    patches.push({ type: "REPLACE", node: newNode });
  else if (oldNode.text !== newNode.text)
    patches.push({ type: "TEXT", text: newNode.text });
  return patches;
}
console.log(diff({ tag: "p", text: "old" }, { tag: "p", text: "new" }));
