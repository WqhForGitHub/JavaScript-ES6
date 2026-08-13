// 87. 数据劫持模拟器

function observe(obj, key, callback) {
  let value = obj[key];
  Object.defineProperty(obj, key, {
    get() {
      return value;
    },
    set(next) {
      value = next;
      callback(next);
    },
  });
}
const state = { count: 0 };
observe(state, 'count', (value) => console.log('changed', value));
state.count = 1;
