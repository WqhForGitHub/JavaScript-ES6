// 212. querySelector测试

if (typeof document !== "undefined") {
  const title = document.querySelector("h1");
  const item = document.querySelector(".item");
  console.log(title && title.textContent, item);
} else {
  console.log("querySelector 需要浏览器 DOM 环境");
}
