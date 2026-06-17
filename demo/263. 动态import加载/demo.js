// 263. 动态import加载

async function dynamicLoad() {
  const source = "export default function hello(name){return `hello ${name}`;}";
  const url = `data:text/javascript,${encodeURIComponent(source)}`;
  const mod = await import(url);
  return mod.default("JavaScript");
}
dynamicLoad().then(console.log).catch(console.log);
