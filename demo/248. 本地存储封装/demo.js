// 248. 本地存储封装

const storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key, def = null) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};
console.log("storage ready");
