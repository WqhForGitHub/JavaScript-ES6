// 61. 回调函数执行器

function execute(value, callback) {
  if (typeof callback !== 'function') throw new TypeError('callback required');
  callback(value);
}
execute('hello', (value) => console.log(value));
