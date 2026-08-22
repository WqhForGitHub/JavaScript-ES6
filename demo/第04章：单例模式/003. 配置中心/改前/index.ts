class Config {
  private data: Record<string, string> = {};
  constructor() {
    // 每次 new 都重新读文件 —— 巨大浪费
    console.log('reading config file from disk...');
    this.data = { dbUrl: 'localhost', port: '3306' };
  }
  get(key: string) { return this.data[key]; }
}

const c1 = new Config(); // 读磁盘
const c2 = new Config(); // 又读一次