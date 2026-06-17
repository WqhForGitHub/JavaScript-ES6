// 250. cookie管理器

const cookieManager = {
  set(name, value, days = 1) {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/`;
  },
  get(name) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  },
};
console.log("cookieManager ready");
