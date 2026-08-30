// 改前：系统一启动就初始化重型报表对象，用户不看报表也照样付出 3 秒代价
class HeavyReport {
  constructor() {
    console.log('初始化报表：加载 10 万行数据，耗时 3 秒...');
  }

  render() {
    console.log('渲染报表');
  }
}

// 系统启动，立即创建重型对象
const report = new HeavyReport(); // 启动就卡 3 秒
console.log('系统启动完成');

// 用户可能根本不点报表，刚才的初始化全白费了
// report.render();

export {};
