const nodes = ["输入", "转大写", "逆序", "输出"];
const fns = [
  v => "hello",
  v => v.toUpperCase(),
  v => [...v].reverse().join(""),
  v => v
];
document.getElementById("run").onclick = async () => {
  const ns = [...document.querySelectorAll(".node")];
  const log = document.getElementById("log"); log.innerHTML = "";
  let data = "";
  for (let i = 0; i < fns.length; i++) {
    ns.forEach(n => n.classList.remove("running"));
    ns[i].classList.add("running");
    data = fns[i](data);
    log.innerHTML += `<div>步骤 ${nodes[i]} 处理完成 → ${JSON.stringify(data)}</div>`;
    ns[i].querySelector(".preview").textContent = "→ " + JSON.stringify(data);
    log.scrollTop = log.scrollHeight;
    await new Promise(r => setTimeout(r, 600));
  }
  log.innerHTML += `<div>✓ 工作流执行完成。最终输出：${JSON.stringify(data)}</div>`;
};