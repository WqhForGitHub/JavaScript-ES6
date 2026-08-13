// 240. input事件监听

function listenInput(input, callback) {
  const handler = (e) => callback(e.target.value);
  input.addEventListener('input', handler);
  return () => input.removeEventListener('input', handler);
}
console.log('listenInput ready');
