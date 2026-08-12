const responses = [
  ["你好|hi|hello", ["你好！", "Hi，有什么我能帮你的吗？"]],
  ["天气", ["我无法联网查天气，建议用天气预报应用。", "今天的天气还是看 app 吧 ~"]],
  ["时间|几点", () => "现在是 " + new Date().toLocaleTimeString("zh-CN")],
  ["谁是你|你是谁", ["我是一个本地模拟的 AI 聊天机器人，用纯前端实现。"]],
  ["学|js|javascript", ["推荐看看 MDN 文档和动手写些小项目，进步最快。"]],
  ["谢谢", ["不客气！", "客气啦~"]],
  ["再见|拜拜", ["再见！期待下次见。", "Bye！"]]
];
function reply(text) {
  text = text.toLowerCase();
  for (const [k, v] of responses) if (k.split("|").some(w => text.includes(w))) return Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v();
  return ["嗯，能再详细一点吗？", "我没完全理解，能换个说法吗？", "这是个有意思的问题……（本地模拟回复）"][Math.floor(Math.random() * 3)];
}
function append(t, cls) { const d = document.createElement("div"); d.className = "b " + cls; d.textContent = t; document.getElementById("msg").appendChild(d); document.querySelector(".msg").scrollTop = 9999; }
append("你好！我是模拟 AI 助手，有什么可以帮你？", "ai");
function send() {
  const v = document.getElementById("inp").value.trim(); if (!v) return;
  append(v, "user"); document.getElementById("inp").value = "";
  setTimeout(() => append(reply(v), "ai"), 500);
}
document.getElementById("send").onclick = send;
document.getElementById("inp").addEventListener("keydown", e => { if (e.key === "Enter") send(); });