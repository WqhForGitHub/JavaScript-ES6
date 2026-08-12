document.getElementById("go").onclick = async () => {
  const sub = document.getElementById("sub").value.trim() || "all";
  document.getElementById("list").innerHTML = "<li>加载中...</li>";
  try {
    const data = await fetch(`https://www.reddit.com/r/${sub}/.json?limit=20`).then(r => r.json());
    document.getElementById("list").innerHTML = data.data.children.map(c => `<li><a href="https://reddit.com${c.data.permalink}" target="_blank">${c.data.title}</a><small>by u/${c.data.author} · ⬆ ${c.data.score} · 💬 ${c.data.num_comments}</small></li>`).join("");
  } catch (e) { document.getElementById("list").innerHTML = `<li>失败：${e.message}</li>`; }
};
document.getElementById("go").click();