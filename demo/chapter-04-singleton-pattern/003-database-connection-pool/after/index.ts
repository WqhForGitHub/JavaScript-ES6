// 改后：连接池单例 -- 全局只有一个池子，连接创建后被反复复用
class ConnectionPool {
  private static instance: ConnectionPool | null = null;
  private connections: string[] = [];

  private constructor(size: number) {
    console.log(`【初始化连接池】预创建 ${size} 条连接（只此一次）`);
    for (let i = 1; i <= size; i++) {
      this.connections.push(`conn-${i}`);
    }
  }

  static getInstance(size = 5): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(size);
    }
    return ConnectionPool.instance;
  }

  // 模拟：借出连接 -> 执行 -> 归还，而不是用完就扔
  query(sql: string) {
    const conn = this.connections.shift() as string;
    console.log(`借用 ${conn} 执行 SQL：${sql}`);
    this.connections.push(conn); // 用完放回池子，下次接着用
  }
}

// 3 个请求并发进来
for (let i = 1; i <= 3; i++) {
  ConnectionPool.getInstance().query(`SELECT * FROM orders WHERE user_id = ${i}`);
}
// 连接池只初始化一次，所有请求共享池里的连接

export {};
