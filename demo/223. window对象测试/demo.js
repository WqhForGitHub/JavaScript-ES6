// 223. window对象测试

if (typeof window !== "undefined") {
  console.log(window.innerWidth);
  console.log(window.navigator.userAgent);
  console.log(window.location.href);
} else {
  console.log("当前不是浏览器 window 环境");
}
