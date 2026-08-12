document.getElementById("go").onclick = async () => {
  const owner = document.getElementById("owner").value.trim(), repo = document.getElementById("repo").value.trim();
  if (!owner || !repo) return;
  const list = document.getElementById("list"); list.innerHTML = "<li>加载中...</li>";
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30`).then(r => r.json());
    if (r.message) throw new Error(r.message);
    list.innerHTML = r.filter(i => !i.pull_request).map(i => `<li><div class="t"><a href="${i.html_url}" target="_blank">#${i.number} ${i.title}</a></div><div class="m">由 ${i.user.login} · ${new Date(i.created_at).toLocaleDateString()}</div><div>${i.labels.map(l => `<span class="label" style="background:#${l.color}33;color:#${l.color}">${l.name}</span>`).join("")}</div></li>`).join("");
  } catch (e) { list.innerHTML = `<li>失败：${e.message}</li>`; }
};