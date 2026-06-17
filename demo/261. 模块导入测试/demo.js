// 261. 模块导入测试

async function loadMathModule() {
  const code = "export const add=(a,b)=>a+b";
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
  const mod = await import(url);
  return mod.add(2, 3);
}
loadMathModule()
  .then(console.log)
  .catch((e) => console.log(e.message));
