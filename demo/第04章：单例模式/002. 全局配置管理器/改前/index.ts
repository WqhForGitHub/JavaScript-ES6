// 改前：每个模块自己 new Config，配置被反复加载，改了也互不相通
class Config {
  data: Record<string, string>;

  constructor() {
    console.log('【加载配置】读取 config.json（模拟一次磁盘 IO）');
    this.data = { env: 'dev', apiBaseUrl: 'https://api.dev.com', timeout: '3000' };
  }
}

// 模块 A：网络层
const configA = new Config(); // 读一次磁盘
// 模块 B：埋点 SDK
const configB = new Config(); // ❌ 又读一次磁盘，纯属浪费

// 模块 A 在应用启动时把环境切到生产
configA.data.env = 'production';

// 模块 B 完全不知情，还在用 dev 的地址发请求
console.log('模块 B 读到的环境：', configB.data.env); // dev ❌ 各持一份，互相不同步
console.log('是同一个配置对象吗：', configA === configB); // false

export {};
