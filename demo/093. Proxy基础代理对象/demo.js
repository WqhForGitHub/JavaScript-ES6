// 93. Proxy基础代理对象

const proxy = new Proxy(
  { count: 0 },
  {
    get(target, key) {
      console.log('get', key);
      return target[key];
    },
    set(target, key, value) {
      console.log('set', key, value);
      target[key] = value;
      return true;
    },
  }
);
proxy.count += 1;
console.log(proxy.count);
