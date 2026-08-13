// 181. async／await基础测试

async function load() {
  const value = await Promise.resolve('data');
  return value.toUpperCase();
}
load().then(console.log);
