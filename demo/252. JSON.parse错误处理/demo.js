// 252. JSON.parse错误处理

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("JSON parse error:", error.message);
    return fallback;
  }
}
console.log(safeJsonParse('{"ok":true}'));
console.log(safeJsonParse("{bad}", {}));
