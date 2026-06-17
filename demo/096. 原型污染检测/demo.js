// 96. 原型污染检测

function isDangerousKey(key) {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}
["name", "__proto__", "constructor"].forEach((key) =>
  console.log(key, isDangerousKey(key)),
);
