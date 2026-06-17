// 269. cookie解析器

function parseCookie(text) {
  return text.split("; ").reduce((res, item) => {
    const [k, v] = item.split("=");
    res[k] = decodeURIComponent(v || "");
    return res;
  }, {});
}
console.log(parseCookie("token=abc; theme=dark"));
