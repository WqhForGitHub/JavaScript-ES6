// 267. localStorage封装

function createLocalStore(prefix = "app:") {
  return {
    set(key, value) {
      localStorage.setItem(prefix + key, JSON.stringify(value));
    },
    get(key) {
      const v = localStorage.getItem(prefix + key);
      return v ? JSON.parse(v) : null;
    },
  };
}
console.log("createLocalStore ready");
