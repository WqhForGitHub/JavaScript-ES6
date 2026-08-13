// 249. sessionStorage工具

const sessionStore = {
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const v = sessionStorage.getItem(key);
    return v && JSON.parse(v);
  },
  clear() {
    sessionStorage.clear();
  },
};
console.log('sessionStore ready');
