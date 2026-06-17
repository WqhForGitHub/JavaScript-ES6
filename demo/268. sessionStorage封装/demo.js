// 268. sessionStorage封装

function createSessionStore(prefix = "session:") {
  return {
    set(key, value) {
      sessionStorage.setItem(prefix + key, JSON.stringify(value));
    },
    get(key) {
      const v = sessionStorage.getItem(prefix + key);
      return v ? JSON.parse(v) : null;
    },
  };
}
console.log("createSessionStore ready");
