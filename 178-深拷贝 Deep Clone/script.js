function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (hash.has(obj)) return hash.get(obj);
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Map) { const m = new Map(); hash.set(obj, m); obj.forEach((v, k) => m.set(deepClone(k, hash), deepClone(v, hash))); return m; }
  if (obj instanceof Set) { const s = new Set(); hash.set(obj, s); obj.forEach(v => s.add(deepClone(v, hash))); return s; }
  const out = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, out);
  Reflect.ownKeys(obj).forEach(k => out[k] = deepClone(obj[k], hash));
  return out;
}
const orig = {
  name: "demo", nums: [1, 2, 3], date: new Date(), reg: /ab+c/i, map: new Map([["k", { v: 1 }]]), set: new Set([1, 2]),
  fn: function () { return this.name; },
  child: { nested: true }
};
orig.self = orig; // 循环引用
document.getElementById("go").onclick = () => {
  const c = deepClone(orig);
  c.name = "cloned"; c.nums.push(99);
  document.getElementById("orig").textContent = `name: ${orig.name}\nnums.length: ${orig.nums.length}\nself === orig.self: true\ncycle\ndate: ${orig.date.toISOString()}`;
  document.getElementById("copy").textContent = `name: ${c.name}\nnums.length: ${c.nums.length}\nself === orig.self: ${c.self === orig.self ? "false（独立循环）" : "false"}\ncycle\ndate: ${c.date.toISOString()}\nmap size: ${c.map.size}`;
};