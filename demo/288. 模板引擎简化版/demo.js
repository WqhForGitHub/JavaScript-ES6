// 288. 模板引擎简化版

function renderTemplate(template, data) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? "");
}
console.log(
  renderTemplate("Hello {{ name }}, age {{age}}", { name: "Alice", age: 20 }),
);
