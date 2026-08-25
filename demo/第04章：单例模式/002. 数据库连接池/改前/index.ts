class DBPool {
  connections: any[] = [];
  constructor(size: number) {
    for (let i = 0; i < size; i++) this.connections.push(`conn-${i}`);
  }
  query(sql: string) { console.log('query:', sql); }
}

// 每个模块各自建池 → 连接数爆炸
const pool1 = new DBPool(10);
const pool2 = new DBPool(10); // 又开了 10 个连接