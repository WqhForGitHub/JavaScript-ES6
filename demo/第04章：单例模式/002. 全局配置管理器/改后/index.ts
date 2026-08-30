// 改后：全局配置单例 -- 只加载一次，改一处、处处生效
class Config {
  private static instance: Config | null = null;
  private data: Record<string, string>;

  private constructor() {
    console.log('【加载配置】读取 config.json（只会执行一次）');
    this.data = { env: 'dev', apiBaseUrl: 'https://api.dev.com', timeout: '3000' };
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get(key: string): string {
    return this.data[key];
  }

  set(key: string, value: string): void {
    this.data[key] = value;
  }
}

// 模块 A：网络层
const configA = Config.getInstance();
// 模块 B：埋点 SDK（不会再读磁盘）
const configB = Config.getInstance();

// 模块 A 把环境切到生产
configA.set('env', 'production');

// 模块 B 立刻读到最新值，请求发往生产地址
console.log('模块 B 读到的环境：', configB.get('env')); // production ✅
console.log('是同一个配置对象吗：', configA === configB); // true

export {};
