// 239. 表单双向绑定

function bindInput(input, state, key) {
  let value = state[key] || '';
  input.value = value;
  input.addEventListener('input', () => (state[key] = input.value));
  Object.defineProperty(state, key, {
    get() {
      return value;
    },
    set(v) {
      value = v;
      input.value = v;
    },
  });
}
console.log('bindInput ready');
