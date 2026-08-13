// 211. DOM选择器工具

const domSelector = {
  one: (s, r = document) => r.querySelector(s),
  all: (s, r = document) => Array.from(r.querySelectorAll(s)),
};
if (typeof document !== 'undefined') {
  console.log(domSelector.one('body'));
  console.log(domSelector.all('div').length);
} else {
  console.log('请在浏览器中运行');
}
