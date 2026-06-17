// 270. token存储系统

const tokenStore = {
  key: "access_token",
  set(token) {
    localStorage.setItem(this.key, token);
  },
  get() {
    return localStorage.getItem(this.key);
  },
  clear() {
    localStorage.removeItem(this.key);
  },
};
console.log("tokenStore ready");
