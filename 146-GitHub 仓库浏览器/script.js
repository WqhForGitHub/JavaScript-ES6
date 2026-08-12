document.getElementById("go").onclick = async () => {
  const u = document.getElementById("user").value.trim(); if (!u) return;
  const list = document.getElementById("list"); list.innerHTML = "<li>加载中...</li>";
  try {
    const repos = await fetch(`https://api.github.com/users/${u}/repos?sort=updated`).then(r => r.json());
    if (repos.message) throw new Error(repos.message);
    document.getElementById("info").textContent = `共 ${repos.length} 个最近更新仓库`;
    list.innerHTML = repos.map(r => `<li><div class="t"><a href="${r.html_url}" target="_blank">${r.name}</a>${r.language ? `<span class="lang">${r.language}</span>` : ""} ⭐${r.stargazers_count}</div><div class="d">${r.description || "(无描述)"}</div><div class="m">更新于 ${new Date(r.updated_at).toLocaleDateString()}</div></li>`).join("");
  } catch (e) { list.innerHTML = `<li>失败：${e.message}</li>`; }
};