const langs = { auto: "自动检测", en: "英语", zh: "中文", ja: "日语", ko: "韩语", fr: "法语", de: "德语", es: "西班牙语", ru: "俄语" };
const from = document.getElementById("from"), to = document.getElementById("to");
Object.entries(langs).forEach(([k, v]) => { from.add(new Option(v, k)); to.add(new Option(v, k)); });
from.value = "auto"; to.value = "zh";
document.getElementById("go").onclick = async () => {
  const src = document.getElementById("src").value.trim(); if (!src) return;
  document.getElementById("res").value = "翻译中...";
  try {
    // 使用公开 MyMemory API（无 key）
    const data = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(src)}&langpair=${from.value === "auto" ? "en" : from.value}|${to.value}`).then(r => r.json());
    document.getElementById("res").value = data.responseData.translatedText;
  } catch (e) { document.getElementById("res").value = "翻译失败：" + e.message; }
};