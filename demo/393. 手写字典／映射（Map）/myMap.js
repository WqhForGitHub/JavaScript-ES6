/**
 * 手写字典/映射（Map）
 *
 * 字典（Map）是以键值对形式存储的数据结构，键唯一。
 * 本实现使用对象存储，将键转为字符串作为内部 key，并单独保存原始键值数组以便遍历。
 * 支持 set / get / has / delete / clear / keys / values / entries / forEach。
 */

class MyMap {
  constructor() {
    this.items = Object.create(null); // 存储键值
    this.keysArr = []; // 保存原始键，维持插入顺序
  }

  // 将任意键转换为字符串标识
  _stringifyKey(key) {
    if (key === null) return "NULL";
    if (key === undefined) return "UNDEFINED";
    if (typeof key === "object" || typeof key === "function") {
      return "@@" + key.toString();
    }
    return typeof key + ":" + String(key);
  }

  set(key, value) {
    const strKey = this._stringifyKey(key);
    if (!this.has(key)) {
      this.keysArr.push(key);
    }
    this.items[strKey] = value;
    return this;
  }

  get(key) {
    return this.items[this._stringifyKey(key)];
  }

  has(key) {
    return this._stringifyKey(key) in this.items;
  }

  delete(key) {
    const strKey = this._stringifyKey(key);
    if (strKey in this.items) {
      delete this.items[strKey];
      const idx = this.keysArr.findIndex(
        (k) => this._stringifyKey(k) === strKey,
      );
      if (idx !== -1) this.keysArr.splice(idx, 1);
      return true;
    }
    return false;
  }

  clear() {
    this.items = Object.create(null);
    this.keysArr = [];
  }

  get size() {
    return this.keysArr.length;
  }

  keys() {
    return [...this.keysArr];
  }

  values() {
    return this.keysArr.map((k) => this.get(k));
  }

  entries() {
    return this.keysArr.map((k) => [k, this.get(k)]);
  }

  forEach(callback, thisArg) {
    this.keysArr.forEach((k) => {
      callback.call(thisArg, this.get(k), k, this);
    });
  }
}

// 测试
const map = new MyMap();
map.set("name", "Tom").set("age", 20).set(1, "number key");
console.log(map.size); // 3
console.log(map.get("name")); // Tom
console.log(map.get(1)); // number key
console.log(map.has("age")); // true

map.set("name", "Jerry"); // 覆盖
console.log(map.get("name")); // Jerry
console.log(map.size); // 3

console.log(map.keys()); // ['name', 'age', 1]
console.log(map.values()); // ['Jerry', 20, 'number key']

map.forEach((value, key) => {
  console.log(key + " => " + value);
});

map.delete("age");
console.log(map.has("age")); // false
console.log(map.size); // 2
