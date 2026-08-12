document.getElementById("go").onclick = async () => {
  const d = document.getElementById("domain").value.trim(); if (!d) return;
  document.getElementById("res").textContent = "查询中...";
  try {
    const data = await fetch(`https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_demoTempKey&domainName=${encodeURIComponent(d)}&outputFormat=json`).then(r => r.json());
    if (data.WhoisRecord) {
      const r = data.WhoisRecord;
      const out = `域名：${r.domainName}
注册商：${r.registrarName || "—"}
创建日期：${r.createdDate || "—"}
更新日期：${r.updatedDate || "—"}
到期日期：${r.expiresDate || "—"}
注册人：${r.registrant?.name || "—"}
邮箱：${r.registrant?.email || "—"}
国家：${r.registrant?.country || "—"}
原始数据：
${JSON.stringify(r, null, 2)}`;
      document.getElementById("res").textContent = out;
    } else throw new Error(data.ErrorMessage?.msg || "查询失败");
  } catch (e) { document.getElementById("res").textContent = "失败：" + e.message + "\n（Whois 免费 API 受限，可改用 RDAP）并尝试 https://rdap.org/domain/" + encodeURIComponent(d); }
};