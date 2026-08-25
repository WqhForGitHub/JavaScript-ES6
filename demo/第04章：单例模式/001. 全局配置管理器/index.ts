// 第04章：单例模式 - 001：全局配置管理器
//
// 场景：应用里的任何模块都需要读取同一份配置（运行环境、接口地址、超时时间、功能开关等）。
// 如果每个模块都自己创建一个配置对象，就会出现配置重复加载、各持一份、互相不一致的问题。
// 用单例模式保证全局只有一份配置，改一处，处处生效。

interface AppConfig {
  env: 'development' | 'test' | 'production';
  apiBaseUrl: string;
  timeout: number;
  debug: boolean;
}

class ConfigManager {
  // 静态属性持有唯一实例
  private static instance: ConfigManager | null = null;

  private config: AppConfig;

  // 私有构造函数：禁止外部 new ConfigManager()
  private constructor() {
    // 真实项目中，这里可以从配置文件 / 环境变量 / 远程接口加载默认配置
    this.config = {
      env: 'development',
      apiBaseUrl: 'https://api.dev.example.com',
      timeout: 3000,
      debug: true,
    };
  }

  // 全局唯一的访问入口
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
  }

  merge(patch: Partial<AppConfig>): void {
    Object.assign(this.config, patch);
  }

  getAll(): Readonly<AppConfig> {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.env === 'production';
  }
}

// ============================================================
// 使用演示
// ============================================================

// 模拟两个互不相识的模块，各自获取配置
// 模块 A：网络层
const configA = ConfigManager.getInstance();
// 模块 B：业务层
const configB = ConfigManager.getInstance();

console.log('两个模块拿到的是同一个实例：', configA === configB); // true

// 模块 A 在应用启动时切到生产环境
configA.set('env', 'production');
configA.merge({ apiBaseUrl: 'https://api.example.com', debug: false });

// 模块 B 完全不知道模块 A 改过配置，但读到的就是最新的值
console.log('模块 B 读到 env：', configB.get('env')); // production
console.log('模块 B 读到 apiBaseUrl：', configB.get('apiBaseUrl'));
console.log('isProduction()：', configB.isProduction()); // true
console.log('完整配置：', configB.getAll());

// 直接 new 是不允许的，TypeScript 在编译期就会报错：
// new ConfigManager(); // ❌ error: 类 "ConfigManager" 的构造函数是私有的

export {};
