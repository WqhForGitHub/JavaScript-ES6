class Config {
  private static instance: Config;
  private data: Record<string, string> = {};

  private constructor() {
    console.log('reading config file from disk... (only once)');
    this.data = { dbUrl: 'localhost', port: '3306' };
  }

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }

  get(key: string) { return this.data[key]; }
}

const c1 = Config.getInstance();
const c2 = Config.getInstance(); // 不会再读磁盘
export { };