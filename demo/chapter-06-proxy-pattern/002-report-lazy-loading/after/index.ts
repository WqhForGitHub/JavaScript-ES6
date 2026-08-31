// 改后：虚拟代理（延迟初始化）-- 第一次真正使用时才创建重型对象，系统秒开
class HeavyReport {
  constructor() {
    console.log('初始化报表：加载 10 万行数据，耗时 3 秒...');
  }

  render() {
    console.log('渲染报表');
  }
}

class ReportProxy {
  private realReport: HeavyReport | null = null;

  render() {
    if (!this.realReport) {
      this.realReport = new HeavyReport(); // 首次使用才创建
    }
    this.realReport.render();
  }
}

const report = new ReportProxy();
console.log('系统启动完成（秒开，报表还没初始化）');

// 用户点击「查看报表」按钮，才真正初始化
report.render();
report.render(); // 第二次直接复用，不再初始化

export {};
