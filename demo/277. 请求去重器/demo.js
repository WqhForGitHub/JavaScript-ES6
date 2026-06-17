// 277. 请求去重器

function dedupeRequest(fn) {
  const pending = new Map();
  return (key) => {
    if (pending.has(key)) return pending.get(key);
    const p = fn(key).finally(() => pending.delete(key));
    pending.set(key, p);
    return p;
  };
}
const load = dedupeRequest((id) => Promise.resolve(`data ${id}`));
Promise.all([load(1), load(1)]).then(console.log);
