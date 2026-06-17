// 53. 防抖函数实现

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const log = debounce((v) => console.log(v), 100);
log(1);
log(2);
log(3);
