// 66. 错误处理函数封装

function safeRun(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
console.log(safeRun(() => JSON.parse('{"ok":true}')));
console.log(safeRun(() => JSON.parse('{bad}')));
