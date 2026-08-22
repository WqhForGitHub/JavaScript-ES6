class DBPool {
  private static instance: DBPool;
  connections: string[] = [];

  private constructor(size: number) {
    for (let i = 0; i < size; i++) this.connections.push(`conn-${i}`);
  }

  static getInstance(size: number = 10): DBPool {
    if (!DBPool.instance) DBPool.instance = new DBPool(size);
    return DBPool.instance;
  }

  query(sql: string) { console.log('query:', sql); }
}

const pool = DBPool.getInstance(10); // 全局唯一连接池
export { };